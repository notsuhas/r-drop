import { Hono } from "hono";
import { cleanFolder, isReservedKey, RESERVED_PREFIX, slugify } from "../lib/keys";
import { regenerateManifest } from "../lib/manifest";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const upload = new Hono<Env>().post("/upload", requireAuth("write"), async (c) => {
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
});
