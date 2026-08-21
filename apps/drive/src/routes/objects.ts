import { Hono } from "hono";
import { cleanFolder, isReservedKey, RESERVED_PREFIX, slugify } from "../lib/keys";
import { listAll, regenerateManifest } from "../lib/manifest";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

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

  .post("/upload", requireAuth("write"), async (c) => {
    const form = await c.req.formData().catch(() => null);
    if (!form) return c.json({ error: "expected multipart form data" }, 400);
    const file = form.get("file");
    if (!(file instanceof File)) return c.json({ error: "no file field" }, 400);
    if (file.size === 0) return c.json({ error: "empty file" }, 400);
    if (file.size > MAX_UPLOAD_BYTES)
      return c.json({ error: `file exceeds ${MAX_UPLOAD_BYTES / 1048576}MB limit` }, 413);

    const rawFolder = typeof form.get("folder") === "string" ? (form.get("folder") as string) : "";
    const folder = cleanFolder(rawFolder) || "scratch";
    if (isReservedKey(folder)) return c.json({ error: "reserved folder name" }, 400);

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
      manifestUrl: `${c.env.PUBLIC_BASE}/${RESERVED_PREFIX}/${folder}.json`,
      size: file.size,
      contentType: file.type,
    });
  })

  .delete("/objects/:key{.+}", requireAuth("write"), async (c) => {
    const key = c.req.param("key");
    if (isReservedKey(key)) return c.json({ error: "manifests are managed automatically" }, 400);
    await c.env.BUCKET.delete(key);
    const folder = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";
    if (folder) await regenerateManifest(c.env, folder);
    return c.json({ deleted: key });
  })

  .get("/manifest/:folder{.+}", requireAuth(), async (c) => {
    const folder = cleanFolder(c.req.param("folder"));
    if (!folder || isReservedKey(folder)) return c.json({ error: "invalid folder" }, 400);
    return c.json(await regenerateManifest(c.env, folder));
  });
