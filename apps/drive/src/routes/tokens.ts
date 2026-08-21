import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { sha256 } from "../lib/crypto";
import * as schema from "../db/schema";
import type { Env } from "../types";

export const tokens = new Hono<Env>()
  .get("/tokens", requireAuth(), async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const actor = c.get("actor");
    return c.json(
      await db.query.apiTokens.findMany({
        where: eq(schema.apiTokens.userId, actor.userId),
        columns: { hash: false },
      }),
    );
  })

  .post("/tokens", requireAuth(), async (c) => {
    const actor = c.get("actor");
    if (actor.type !== "user") return c.json({ error: "session required" }, 403);
    const { name, scope = "write" } = await c.req.json<{ name: string; scope?: string }>();
    if (!name) return c.json({ error: "name required" }, 400);
    const token = `hod_${crypto.randomUUID().replaceAll("-", "")}`;
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.apiTokens).values({
      id: crypto.randomUUID(),
      name,
      hash: await sha256(token),
      userId: actor.userId,
      prefix: token.slice(0, 8),
      scope: scope === "read" ? "read" : "write",
      createdAt: Date.now(),
    });
    return c.json({ token, name });
  })

  .delete("/tokens/:id", requireAuth(), async (c) => {
    const actor = c.get("actor");
    if (actor.type !== "user") return c.json({ error: "session required" }, 403);
    const db = drizzle(c.env.DB, { schema });
    await db
      .delete(schema.apiTokens)
      .where(
        and(eq(schema.apiTokens.id, c.req.param("id")), eq(schema.apiTokens.userId, actor.userId)),
      );
    return c.json({ deleted: c.req.param("id") });
  });
