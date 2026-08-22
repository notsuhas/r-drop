import { Hono } from "hono";
import { cleanFolder, isReservedKey, RESERVED_PREFIX } from "../lib/keys";
import { listAll, regenerateManifest } from "../lib/manifest";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

export const objects = new Hono<Env>()
  .get("/objects", requireAuth(), async (c) => {
    const prefix = cleanFolder(c.req.query("prefix") ?? "");
    const listed = await listAll(c.env.BUCKET, {
      prefix: prefix ? `${prefix}/` : "",
      delimiter: "/",
    });
    return c.json({
      folders: listed.delimitedPrefixes
        .map((p) => p.replace(/\/$/, ""))
        .filter((p) => p !== RESERVED_PREFIX),
      objects: listed.objects
        .filter((o) => !isReservedKey(o.key))
        .map((o) => ({
          key: o.key,
          size: o.size,
          uploaded: o.uploaded.toISOString(),
          contentType: o.httpMetadata?.contentType ?? "",
          url: `${c.env.PUBLIC_BASE}/${o.key}`,
        })),
    });
  })

  .delete("/objects/:key{.+}", requireAuth("write"), async (c) => {
    const key = c.req.param("key");
    if (isReservedKey(key)) return c.json({ error: "manifests are managed automatically" }, 400);
    await c.env.BUCKET.delete(key);
    const folder = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";
    if (folder) await regenerateManifest(c.env, folder);
    return c.json({ deleted: key });
  });
