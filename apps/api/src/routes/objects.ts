// Object listing, delete, and rename (R2 has no rename, so it's copy + delete).
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { cleanFolder, folderOf, isReservedKey } from "@/lib/keys";
import { listAll, regenerateManifest } from "@/lib/manifest";
import { resolveRenameTarget } from "@/lib/rename";
import { requireAuth } from "@/middleware/auth";
import type { Env } from "@/types";

export const objects = new Hono<Env>()
  .get("/objects", requireAuth(), async (c) => {
    const prefix = cleanFolder(c.req.query("prefix") ?? "");
    const basePrefix = prefix ? `${prefix}/` : "";
    // One undelimited pass covers direct objects, child folders, and their
    // recursive sizes without a listing per folder.
    const listed = await listAll(c.env.BUCKET, { prefix: basePrefix });

    const objects = [];
    const folderSizes = new Map<string, number>();
    let totalSize = 0;
    for (const o of listed.objects) {
      if (isReservedKey(o.key)) continue;
      totalSize += o.size;
      const rest = o.key.slice(basePrefix.length);
      const slash = rest.indexOf("/");
      if (slash === -1) {
        objects.push({
          key: o.key,
          size: o.size,
          uploaded: o.uploaded.toISOString(),
          contentType: o.httpMetadata?.contentType ?? "",
          url: `${c.env.PUBLIC_BASE}/${o.key}`,
        });
      } else {
        const child = `${basePrefix}${rest.slice(0, slash)}`;
        folderSizes.set(child, (folderSizes.get(child) ?? 0) + o.size);
      }
    }

    return c.json({
      folders: [...folderSizes.entries()]
        .map(([name, size]) => ({ name, size }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      objects,
      totalSize,
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
