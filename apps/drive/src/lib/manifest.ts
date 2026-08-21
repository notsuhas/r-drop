import { camelCase } from "./keys";
import type { Bindings } from "../bindings";

export async function regenerateManifest(env: Bindings, folder: string) {
  const listed = await env.BUCKET.list({ prefix: `${folder}/`, limit: 1000 });
  const assets = Object.fromEntries(
    listed.objects
      .filter((o) => !o.key.endsWith("/"))
      .map((o) => {
        const name = o.key.slice(folder.length + 1);
        return [camelCase(name.replace(/\.[^.]+$/, "")), `${env.PUBLIC_BASE}/${o.key}`];
      }),
  );
  const body = JSON.stringify({ folder, count: Object.keys(assets).length, assets }, null, 2);
  await env.BUCKET.put(`_manifest/${folder}.json`, body, {
    httpMetadata: { contentType: "application/json", cacheControl: "no-cache" },
  });
}
