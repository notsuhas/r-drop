// Folder manifests: public JSON indexes at _manifest/<folder>.json, regenerated on every write.
import type { Bindings } from "@/bindings";
import { camelCase, RESERVED_PREFIX } from "./keys";

export async function listAll(bucket: R2Bucket, options: R2ListOptions) {
  const objects: R2Object[] = [];
  const delimitedPrefixes: string[] = [];
  let cursor: string | undefined;
  do {
    // httpMetadata is only returned when explicitly included.
    const page = await bucket.list({ ...options, cursor, include: ["httpMetadata"] });
    objects.push(...page.objects);
    delimitedPrefixes.push(...(page.delimitedPrefixes ?? []));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return { objects, delimitedPrefixes };
}

/**
 * camelCase asset name for a folder-relative filename, disambiguated when it
 * collides with a name already in the manifest.
 *
 * "logo-dark.png", "logo_dark.svg" and "logoDark.jpg" all camelCase to
 * "logoDark". They used to overwrite each other, so a folder of three real
 * objects published a manifest of one and said count: 1 about it. The
 * extension is the first tiebreak because it is what actually differs;
 * a numeric suffix covers the rest.
 */
function manifestName(taken: Record<string, string>, filename: string) {
  const dot = filename.lastIndexOf(".");
  const [base, ext] = dot > 0 ? [filename.slice(0, dot), filename.slice(dot + 1)] : [filename, ""];
  const plain = camelCase(base);
  if (!(plain in taken)) return plain;
  const qualified = camelCase(`${base}-${ext}`);
  if (ext && !(qualified in taken)) return qualified;
  let n = 2;
  while (`${plain}${n}` in taken) n += 1;
  return `${plain}${n}`;
}

export function buildManifest(publicBase: string, folder: string, objects: R2Object[]) {
  const assets: Record<string, string> = {};
  for (const o of objects) {
    if (o.key.endsWith("/")) continue;
    const name = o.key.slice(folder.length + 1);
    assets[manifestName(assets, name)] = `${publicBase}/${o.key}`;
  }
  return { folder, count: Object.keys(assets).length, assets };
}

export async function regenerateManifest(env: Bindings, folder: string) {
  const { objects } = await listAll(env.BUCKET, { prefix: `${folder}/` });
  const manifest = buildManifest(env.PUBLIC_BASE, folder, objects);
  const key = `${RESERVED_PREFIX}/${folder}.json`;
  if (manifest.count === 0) {
    await env.BUCKET.delete(key);
    return manifest;
  }
  await env.BUCKET.put(key, JSON.stringify(manifest, null, 2), {
    httpMetadata: { contentType: "application/json", cacheControl: "no-cache" },
  });
  return manifest;
}
