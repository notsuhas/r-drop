import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "../db/schema";
import { readJson } from "../lib/json";
import { requireAdmin, requireAuth } from "../middleware/auth";
import type { Env } from "../types";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const invites = new Hono<Env>()
  .use("/invites/*", requireAuth(), requireAdmin)
  .use("/invites", requireAuth(), requireAdmin)

  .get("/invites", async (c) => {
    const db = drizzle(c.env.DB, { schema });
    return c.json(await db.query.invites.findMany());
  })

  .post("/invites", async (c) => {
    const body = await readJson<{ email?: string }>(c);
    const email = body?.email?.trim().toLowerCase();
    if (!email || !EMAIL_FORMAT.test(email)) return c.json({ error: "invalid email" }, 400);
    const db = drizzle(c.env.DB, { schema });
    const actor = c.get("actor");
    await db
      .insert(schema.invites)
      .values({ email, createdBy: actor.userId, createdAt: Date.now() })
      .onConflictDoNothing();
    return c.json({ email }, 201);
  })

  .delete("/invites/:email", async (c) => {
    const email = c.req.param("email").toLowerCase();
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.invites).where(eq(schema.invites.email, email));
    return c.json({ deleted: email });
  });
