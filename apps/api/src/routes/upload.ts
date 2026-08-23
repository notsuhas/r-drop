// Multipart upload; objects are immutable and CDN-cached for a year.
import { Hono } from "hono";
import { RESERVED_PREFIX } from "@/lib/keys";
import { regenerateManifest } from "@/lib/manifest";
import { isSvgContentType, svgHasActiveContent } from "@/lib/svg-guard";
import { MAX_UPLOAD_BYTES, resolveUpload } from "@/lib/upload-input";
import { requireAuth } from "@/middleware/auth";
import type { Env } from "@/types";

// Multipart boundaries, part headers and the filename ride along with the
// bytes, so the declared length is always a little over the file itself.
const MULTIPART_SLACK_BYTES = 64 * 1024;

export const upload = new Hono<Env>().post("/upload", requireAuth("write"), async (c) => {
  // Before formData(), not after: the size check used to live past the parse,
  // so a multi-gigabyte body was fully buffered into the worker to earn a 413.
  const declared = Number(c.req.header("content-length"));
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES + MULTIPART_SLACK_BYTES)
    return c.json({ error: `file exceeds ${MAX_UPLOAD_BYTES / 1048576}MB limit` }, 413);

  const form = await c.req.formData().catch(() => null);
  if (!form) return c.json({ error: "expected multipart form data" }, 400);
  const input = resolveUpload(form);
  if (!input.ok) return c.json({ error: input.error }, input.status);

  const { file, folder, key } = input;

  if (isSvgContentType(file.type) && svgHasActiveContent(await file.text()))
    return c.json(
      { error: "svg contains active content (script, event handlers, or javascript: urls)" },
      400,
    );

  // Objects are served immutable for a year, so a silent replace would be
  // served stale from every edge that already saw the old bytes — with no
  // revalidation, because that is what immutable means. Refuse instead.
  if (await c.env.BUCKET.head(key))
    return c.json({ error: `${key} already exists — rename or delete it first`, key }, 409);

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
