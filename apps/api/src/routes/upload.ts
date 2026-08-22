// Multipart upload; objects are immutable and CDN-cached for a year.
import { Hono } from "hono";
import { RESERVED_PREFIX } from "../lib/keys";
import { regenerateManifest } from "../lib/manifest";
import { resolveUpload } from "../lib/upload-input";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

export const upload = new Hono<Env>().post("/upload", requireAuth("write"), async (c) => {
  const form = await c.req.formData().catch(() => null);
  if (!form) return c.json({ error: "expected multipart form data" }, 400);
  const input = resolveUpload(form);
  if (!input.ok) return c.json({ error: input.error }, input.status);

  const { file, folder, key } = input;
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
