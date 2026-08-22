// Authenticated manifest read; regenerates before returning so it is never stale.
import { Hono } from "hono";
import { cleanFolder, isReservedKey } from "../lib/keys";
import { regenerateManifest } from "../lib/manifest";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

export const manifest = new Hono<Env>().get("/manifest/:folder{.+}", requireAuth(), async (c) => {
  const folder = cleanFolder(c.req.param("folder"));
  if (!folder || isReservedKey(folder)) return c.json({ error: "invalid folder" }, 400);
  return c.json(await regenerateManifest(c.env, folder));
});
