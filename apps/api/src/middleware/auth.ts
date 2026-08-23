// Two ways in: bearer token (agents) or WorkOS sealed-session cookie (humans).
import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";
import { sha256 } from "hono/utils/crypto";
import type { Bindings } from "@/bindings";
import * as schema from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";
import { getSessionUser } from "@/lib/session";
import type { Actor, Env } from "@/types";

const TOKEN_FORMAT = /^rd_[a-f0-9]{32}$/;

type BearerResult =
  | { actor: Actor; touch: () => Promise<unknown> }
  | { error: string; status: 401 | 403 };

/**
 * A token is only as valid as its owner still is.
 *
 * Revoking an invite deletes that person's tokens, but that is a single point
 * of failure. Re-checking the owner on each request means an owner who is no
 * longer admin or invited cannot keep uploading with a token that survived.
 * Tokens issued before user_email existed carry null and are grandfathered —
 * re-issue one to get the check.
 */
async function ownerStillPermitted(
  env: Bindings,
  db: DrizzleD1Database<typeof schema>,
  userEmail: string | null,
) {
  if (!userEmail) return true;
  if (isAdminEmail(env, userEmail)) return true;
  const invite = await db.query.invites.findFirst({
    where: eq(schema.invites.email, userEmail.toLowerCase()),
  });
  return Boolean(invite);
}

async function authenticateBearer(
  env: Bindings,
  bearer: string,
  scope: "read" | "write",
): Promise<BearerResult> {
  if (!TOKEN_FORMAT.test(bearer)) return { error: "invalid token", status: 401 };
  const db = drizzle(env.DB, { schema });
  const hash = (await sha256(bearer)) ?? "";
  const token = await db.query.apiTokens.findFirst({ where: eq(schema.apiTokens.hash, hash) });
  if (!token) return { error: "invalid token", status: 401 };
  if (token.expiresAt !== null && token.expiresAt <= Date.now())
    return { error: "token expired", status: 401 };
  if (scope === "write" && token.scope !== "write")
    return { error: "insufficient scope", status: 403 };
  if (!(await ownerStillPermitted(env, db, token.userEmail)))
    return { error: "token owner is no longer permitted", status: 403 };
  return {
    actor: { type: "token", userId: token.userId, tokenId: token.id },
    touch: () =>
      db
        .update(schema.apiTokens)
        .set({ lastUsedAt: Date.now() })
        .where(eq(schema.apiTokens.id, token.id))
        .run(),
  };
}

export const requireAuth = (scope: "read" | "write" = "read") =>
  createMiddleware<Env>(async (c, next) => {
    const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer) {
      const result = await authenticateBearer(c.env, bearer, scope);
      if ("error" in result) return c.json({ error: result.error }, result.status);
      c.executionCtx.waitUntil(result.touch());
      c.set("actor", result.actor);
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
