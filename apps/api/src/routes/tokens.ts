// Bearer-token CRUD. Only the sha256 hash is stored; the token is shown once.

import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";
import { Hono } from "hono";
import { sha256 } from "hono/utils/crypto";
import { z } from "zod";
import * as schema from "@/db/schema";
import { requireAuth } from "@/middleware/auth";
import type { Env } from "@/types";

const sessionActor = (c: Context<Env>) => {
  const actor = c.get("actor");
  return actor.type === "user" ? actor : null;
};

/** Tokens are only ever visible to their owner. */
const ownedToken = (id: string, userId: string) =>
  and(eq(schema.apiTokens.id, id), eq(schema.apiTokens.userId, userId));

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

  .post(
    "/tokens",
    requireAuth(),
    zValidator(
      "json",
      z.object({
        name: z.string().trim().min(1).max(64),
        scope: z.string().optional(),
        // Omitted means no expiry, which is what the dashboard's default is.
        expiresInDays: z.number().int().min(1).max(365).optional(),
      }),
    ),
    async (c) => {
      const actor = sessionActor(c);
      if (!actor) return c.json({ error: "session required" }, 403);
      const { name, scope: rawScope, expiresInDays } = c.req.valid("json");
      const scope = rawScope === "read" ? "read" : "write";
      const expiresAt = expiresInDays ? Date.now() + expiresInDays * 86_400_000 : null;

      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const token = `rd_${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;

      const db = drizzle(c.env.DB, { schema });
      await db.insert(schema.apiTokens).values({
        id: crypto.randomUUID(),
        name,
        hash: (await sha256(token)) ?? "",
        userId: actor.userId,
        // Stored so every request can re-check the owner is still permitted.
        userEmail: actor.email.toLowerCase(),
        prefix: token.slice(0, 8),
        scope,
        createdAt: Date.now(),
        expiresAt,
      });
      return c.json({ token, name, scope, expiresAt }, 201);
    },
  )

  .patch(
    "/tokens/:id",
    requireAuth(),
    zValidator("json", z.object({ name: z.string().trim().min(1).max(64) })),
    async (c) => {
      const actor = sessionActor(c);
      if (!actor) return c.json({ error: "session required" }, 403);
      const { name } = c.req.valid("json");
      const db = drizzle(c.env.DB, { schema });
      const res = await db
        .update(schema.apiTokens)
        .set({ name })
        .where(ownedToken(c.req.param("id"), actor.userId));
      if (res.meta.changes === 0) return c.json({ error: "token not found" }, 404);
      return c.json({ id: c.req.param("id"), name });
    },
  )

  .delete("/tokens/:id", requireAuth(), async (c) => {
    const actor = sessionActor(c);
    if (!actor) return c.json({ error: "session required" }, 403);
    const db = drizzle(c.env.DB, { schema });
    const res = await db
      .delete(schema.apiTokens)
      .where(ownedToken(c.req.param("id"), actor.userId));
    if (res.meta.changes === 0) return c.json({ error: "token not found" }, 404);
    return c.json({ deleted: c.req.param("id") });
  });
