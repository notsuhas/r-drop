import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import * as schema from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";
import { getWorkos, workosConfigured } from "@/lib/workos";
import { requireAdmin, requireAuth } from "@/middleware/auth";
import type { Env } from "@/types";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface IProfile {
  name: string | null;
  picture: string | null;
}

/** email (lowercased) -> WorkOS profile, empty when WorkOS is unavailable. */
async function loadProfiles(env: Env["Bindings"]): Promise<Map<string, IProfile>> {
  const profiles = new Map<string, IProfile>();
  if (!workosConfigured(env)) return profiles;

  const users = await getWorkos(env)
    .userManagement.listUsers({ limit: 100 })
    .catch(() => null);

  for (const user of users?.data ?? []) {
    profiles.set(user.email.toLowerCase(), {
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      picture: user.profilePictureUrl ?? null,
    });
  }
  return profiles;
}

export const invites = new Hono<Env>()
  .use("/invites/*", requireAuth(), requireAdmin)
  .use("/invites", requireAuth(), requireAdmin)

  // Invites only store an email; the display name and avatar live in WorkOS.
  // One listUsers call enriches the whole page, and the list still renders
  // (without faces) if WorkOS is unconfigured or unreachable.
  .get("/invites", async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const rows = await db.query.invites.findMany();
    const profiles = await loadProfiles(c.env);

    return c.json(
      rows.map((row) => {
        const profile = profiles.get(row.email.toLowerCase());
        return {
          ...row,
          name: profile?.name ?? null,
          picture: profile?.picture ?? null,
        };
      }),
    );
  })

  .post("/invites", zValidator("json", z.object({ email: z.string() })), async (c) => {
    const email = c.req.valid("json").email.trim().toLowerCase();
    if (!EMAIL_FORMAT.test(email)) return c.json({ error: "invalid email" }, 400);
    const db = drizzle(c.env.DB, { schema });
    const actor = c.get("actor");
    await db
      .insert(schema.invites)
      .values({ email, createdBy: actor.userId, createdAt: Date.now() })
      .onConflictDoNothing();
    return c.json({ email }, 201);
  })

  // Deleting an invite fully removes the person: their WorkOS user (which
  // revokes sessions) and their API tokens go with it.
  .delete("/invites/:email", async (c) => {
    const email = c.req.param("email").toLowerCase();
    if (isAdminEmail(c.env, email)) return c.json({ error: "cannot remove an admin" }, 400);
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.invites).where(eq(schema.invites.email, email));

    if (workosConfigured(c.env)) {
      const workos = getWorkos(c.env);
      const users = await workos.userManagement.listUsers({ email }).catch(() => null);
      for (const user of users?.data ?? []) {
        await db.delete(schema.apiTokens).where(eq(schema.apiTokens.userId, user.id));
        await workos.userManagement.deleteUser(user.id).catch(() => {});
      }
    }
    return c.json({ deleted: email });
  });
