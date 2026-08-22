// Folder manifests: public JSON indexes at _manifest/<folder>.json, regenerated on every write.
import type { Bindings } from "../bindings";
import { camelCase, RESERVED_PREFIX } from "./keys";

export async function listAll(bucket: R2Bucket, options: R2ListOptions) {
  const objects: R2Object[] = [];
  const delimitedPrefixes: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ ...options, cursor });
    objects.push(...page.objects);
    delimitedPrefixes.push(...(page.delimitedPrefixes ?? []));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return { objects, delimitedPrefixes };
}

export function buildManifest(publicBase: string, folder: string, objects: R2Object[]) {
  const assets: Record<string, string> = {};
  for (const o of objects) {
    if (o.key.endsWith("/")) continue;
    const name = o.key.slice(folder.length + 1);
    assets[camelCase(name.replace(/\.[^.]+$/, ""))] = `${publicBase}/${o.key}`;
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
