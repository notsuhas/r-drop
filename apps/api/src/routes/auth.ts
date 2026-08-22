// WorkOS OAuth flow. The callback enforces the invite gate before any session is issued.
import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as schema from "../db/schema";
import { isAdminEmail } from "../lib/admin";
import { clearSessionCookie, getSessionUser, setSessionCookie } from "../lib/session";
import { getWorkos } from "../lib/workos";
import type { Env } from "../types";

export const auth = new Hono<Env>()
  .get("/auth/login", (c) => {
    const url = getWorkos(c.env).userManagement.getAuthorizationUrl({
      provider: "GoogleOAuth",
      clientId: c.env.WORKOS_CLIENT_ID,
      redirectUri: `${c.env.APP_BASE}/api/auth/callback`,
    });
    return c.redirect(url);
  })

  .get("/auth/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) return c.redirect("/?error=auth_failed");

    const workos = getWorkos(c.env);
    let result: Awaited<ReturnType<typeof workos.userManagement.authenticateWithCode>>;
    try {
      result = await workos.userManagement.authenticateWithCode({
        code,
        clientId: c.env.WORKOS_CLIENT_ID,
        session: { sealSession: true, cookiePassword: c.env.WORKOS_COOKIE_PASSWORD },
      });
    } catch (err) {
      console.error("authenticateWithCode failed:", err);
      return c.redirect("/?error=auth_failed");
    }

    const email = result.user.email.toLowerCase();
    if (!isAdminEmail(c.env, email)) {
      const db = drizzle(c.env.DB, { schema });
      const invite = await db.query.invites.findFirst({
        where: eq(schema.invites.email, email),
      });
      if (!invite) {
        c.executionCtx.waitUntil(workos.userManagement.deleteUser(result.user.id).catch(() => {}));
        return c.redirect("/?error=not_invited");
      }
      c.executionCtx.waitUntil(
        db
          .update(schema.invites)
          .set({ usedAt: Date.now() })
          .where(and(eq(schema.invites.email, email), isNull(schema.invites.usedAt)))
          .run(),
      );
    }

    if (!result.sealedSession) return c.redirect("/?error=auth_failed");
    setSessionCookie(c, result.sealedSession);
    return c.redirect("/");
  })

  .get("/auth/logout", async (c) => {
    const session = await getSessionUser(c);
    clearSessionCookie(c);
    if (session) {
      try {
        const logoutUrl = getWorkos(c.env).userManagement.getLogoutUrl({
          sessionId: session.sessionId,
          returnTo: c.env.APP_BASE,
        });
        return c.redirect(logoutUrl);
      } catch (err) {
        console.error("getLogoutUrl failed:", err);
      }
    }
    return c.redirect("/");
  });
