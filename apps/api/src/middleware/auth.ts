import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";
import { sha256 } from "hono/utils/crypto";
import { getSessionUser, isAdminEmail } from "../auth";
import * as schema from "../db/schema";
import type { Env } from "../types";

const TOKEN_FORMAT = /^hod_[a-f0-9]{32}$/;

export const requireAuth = (scope: "read" | "write" = "read") =>
  createMiddleware<Env>(async (c, next) => {
    const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer) {
      if (!TOKEN_FORMAT.test(bearer)) return c.json({ error: "invalid token" }, 401);
      const db = drizzle(c.env.DB, { schema });
      const hash = (await sha256(bearer)) ?? "";
      const token = await db.query.apiTokens.findFirst({
        where: eq(schema.apiTokens.hash, hash),
      });
      if (!token) return c.json({ error: "invalid token" }, 401);
      if (scope === "write" && token.scope !== "write")
        return c.json({ error: "insufficient scope" }, 403);
      c.executionCtx.waitUntil(
        db
          .update(schema.apiTokens)
          .set({ lastUsedAt: Date.now() })
          .where(eq(schema.apiTokens.id, token.id))
          .run(),
      );
      c.set("actor", { type: "token", userId: token.userId, tokenId: token.id });
      return next();
    }
    const session = await getSessionUser(c);
    if (!session) return c.json({ error: "unauthorized" }, 401);
    const { user } = session;
    c.set("actor", {
      type: "user",
      userId: user.id,
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
      picture: user.profilePictureUrl ?? null,
    });
    return next();
  });

export const requireAdmin = createMiddleware<Env>(async (c, next) => {
  const actor = c.get("actor");
  if (actor.type !== "user" || !isAdminEmail(c.env, actor.email))
    return c.json({ error: "admin only" }, 403);
  return next();
});
