import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { slugify, cleanFolder } from "../lib/keys";
import { regenerateManifest } from "../lib/manifest";
import type { Env } from "../types";

export const objects = new Hono<Env>()
  .get("/objects", requireAuth(), async (c) => {
    const prefix = cleanFolder(c.req.query("prefix") ?? "");
    const listed = await c.env.BUCKET.list({
      prefix: prefix ? `${prefix}/` : "",
      delimiter: "/",
      limit: 1000,
    });
    return c.json({
      folders: listed.delimitedPrefixes.map((p) => p.replace(/\/$/, "")),
      objects: listed.objects.map((o) => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded.toISOString(),
        contentType: o.httpMetadata?.contentType ?? "",
        url: `${c.env.PUBLIC_BASE}/${o.key}`,
      })),
    });
  })

  .post("/upload", requireAuth("write"), async (c) => {
    const form = await c.req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return c.json({ error: "no file" }, 400);
    const folder = cleanFolder((form.get("folder") as string) || "scratch") || "scratch";
    const key = `${folder}/${slugify(file.name)}`;
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    await regenerateManifest(c.env, folder);
    return c.json({
      key,
      url: `${c.env.PUBLIC_BASE}/${key}`,
      manifestUrl: `${c.env.PUBLIC_BASE}/_manifest/${folder}.json`,
      size: file.size,
      contentType: file.type,
    });
  })

  .delete("/objects/:key{.+}", requireAuth("write"), async (c) => {
    const key = c.req.param("key");
    await c.env.BUCKET.delete(key);
    const folder = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";
    if (folder && !folder.startsWith("_manifest")) await regenerateManifest(c.env, folder);
    return c.json({ deleted: key });
  })

  .get("/manifest/:folder{.+}", requireAuth(), async (c) => {
    const folder = cleanFolder(c.req.param("folder"));
    await regenerateManifest(c.env, folder);
    const obj = await c.env.BUCKET.get(`_manifest/${folder}.json`);
    return c.json(await obj!.json());
  });
