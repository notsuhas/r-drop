import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";
import { Hono } from "hono";
import { sha256 } from "hono/utils/crypto";
import * as schema from "../db/schema";
import { readJson } from "../lib/json";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

const sessionActor = (c: Context<Env>) => {
  const actor = c.get("actor");
  return actor.type === "user" ? actor : null;
};

export const tokens = new Hono<Env>()
  .get("/tokens", requireAuth(), async (c) => {
    const actor = sessionActor(c);
    if (!actor) return c.json({ error: "session required" }, 403);
    const db = drizzle(c.env.DB, { schema });
    return c.json(
      await db.query.apiTokens.findMany({
        where: eq(schema.apiTokens.userId, actor.userId),
        columns: { hash: false },
      }),
    );
  })

  .post("/tokens", requireAuth(), async (c) => {
    const actor = sessionActor(c);
    if (!actor) return c.json({ error: "session required" }, 403);
    const body = await readJson<{ name?: string; scope?: string }>(c);
    const name = body?.name?.trim();
    if (!name || name.length > 64) return c.json({ error: "name required (max 64 chars)" }, 400);
    const scope = body?.scope === "read" ? "read" : "write";

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const token = `hod_${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;

    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.apiTokens).values({
      id: crypto.randomUUID(),
      name,
      hash: (await sha256(token)) ?? "",
      userId: actor.userId,
      prefix: token.slice(0, 8),
      scope,
      createdAt: Date.now(),
    });
    return c.json({ token, name, scope }, 201);
  })

  .delete("/tokens/:id", requireAuth(), async (c) => {
    const actor = sessionActor(c);
    if (!actor) return c.json({ error: "session required" }, 403);
    const db = drizzle(c.env.DB, { schema });
    const res = await db
      .delete(schema.apiTokens)
      .where(
        and(eq(schema.apiTokens.id, c.req.param("id")), eq(schema.apiTokens.userId, actor.userId)),
      );
    if (res.meta.changes === 0) return c.json({ error: "token not found" }, 404);
    return c.json({ deleted: c.req.param("id") });
  });
