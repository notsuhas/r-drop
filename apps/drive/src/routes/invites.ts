import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";
import * as schema from "../db/schema";
import type { Env } from "../types";

export const invites = new Hono<Env>()
  .get("/invites", requireAuth(), requireAdmin, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    return c.json(await db.query.invites.findMany());
  })

  .post("/invites", requireAuth(), requireAdmin, async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    if (!email?.includes("@")) return c.json({ error: "invalid email" }, 400);
    const db = drizzle(c.env.DB, { schema });
    const actor = c.get("actor");
    await db
      .insert(schema.invites)
      .values({ email: email.toLowerCase(), createdBy: actor.userId, createdAt: Date.now() })
      .onConflictDoNothing();
    return c.json({ email: email.toLowerCase() });
  })

  .delete("/invites/:email", requireAuth(), requireAdmin, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.invites).where(eq(schema.invites.email, c.req.param("email")));
    return c.json({ deleted: c.req.param("email") });
  });
