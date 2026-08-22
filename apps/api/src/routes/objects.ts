import { Hono } from "hono";
import { readJson } from "../lib/json";
import { cleanFolder, isReservedKey, RESERVED_PREFIX, slugify } from "../lib/keys";
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

  .post("/objects/rename", requireAuth("write"), async (c) => {
    const body = await readJson<{ key?: string; newKey?: string }>(c);
    const key = body?.key;
    if (!key || isReservedKey(key)) return c.json({ error: "invalid key" }, 400);

    const rawNew = body?.newKey ?? "";
    const slash = rawNew.lastIndexOf("/");
    const folder = cleanFolder(slash > 0 ? rawNew.slice(0, slash) : "");
    const name = slugify(slash >= 0 ? rawNew.slice(slash + 1) : rawNew);
    if (!folder || !name) return c.json({ error: "invalid new key" }, 400);
    const newKey = `${folder}/${name}`;
    if (isReservedKey(newKey)) return c.json({ error: "reserved folder name" }, 400);
    if (newKey === key) return c.json({ key, url: `${c.env.PUBLIC_BASE}/${key}` });

    const obj = await c.env.BUCKET.get(key);
    if (!obj) return c.json({ error: "not found" }, 404);
    await c.env.BUCKET.put(newKey, await obj.arrayBuffer(), { httpMetadata: obj.httpMetadata });
    await c.env.BUCKET.delete(key);

    const oldFolder = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";
    if (oldFolder) await regenerateManifest(c.env, oldFolder);
    if (folder !== oldFolder) await regenerateManifest(c.env, folder);
    return c.json({ key: newKey, url: `${c.env.PUBLIC_BASE}/${newKey}` });
  })

  .delete("/objects/:key{.+}", requireAuth("write"), async (c) => {
    const key = c.req.param("key");
    if (isReservedKey(key)) return c.json({ error: "manifests are managed automatically" }, 400);
    await c.env.BUCKET.delete(key);
    const folder = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";
    if (folder) await regenerateManifest(c.env, folder);
    return c.json({ deleted: key });
  });
