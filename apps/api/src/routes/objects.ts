// Object listing, delete, and rename (R2 has no rename, so it's copy + delete).
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { cleanFolder, folderOf, isReservedKey, RESERVED_PREFIX } from "../lib/keys";
import { listAll, regenerateManifest } from "../lib/manifest";
import { resolveRenameTarget } from "../lib/rename";
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

  .post(
    "/objects/rename",
    requireAuth("write"),
    zValidator("json", z.object({ key: z.string(), newKey: z.string() })),
    async (c) => {
      const { key, newKey: rawNew } = c.req.valid("json");
      const target = resolveRenameTarget(key, rawNew);
      if (!target.ok) return c.json({ error: target.error }, target.status);
      if (target.newKey === key) return c.json({ key, url: `${c.env.PUBLIC_BASE}/${key}` });

      const obj = await c.env.BUCKET.get(key);
      if (!obj) return c.json({ error: "not found" }, 404);
      await c.env.BUCKET.put(target.newKey, await obj.arrayBuffer(), {
        httpMetadata: obj.httpMetadata,
      });
      await c.env.BUCKET.delete(key);

      if (target.oldFolder) await regenerateManifest(c.env, target.oldFolder);
      if (target.newFolder !== target.oldFolder) await regenerateManifest(c.env, target.newFolder);
      return c.json({ key: target.newKey, url: `${c.env.PUBLIC_BASE}/${target.newKey}` });
    },
  )

  .delete("/objects/:key{.+}", requireAuth("write"), async (c) => {
    const key = c.req.param("key");
    if (isReservedKey(key)) return c.json({ error: "manifests are managed automatically" }, 400);
    await c.env.BUCKET.delete(key);
    const folder = folderOf(key);
    if (folder) await regenerateManifest(c.env, folder);
    return c.json({ deleted: key });
  });
