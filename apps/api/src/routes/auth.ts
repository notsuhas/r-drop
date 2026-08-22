// WorkOS OAuth flow. The callback enforces the invite gate before any session is issued.
import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import * as schema from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";
import { clearSessionCookie, getSessionUser, setSessionCookie } from "@/lib/session";
import { getWorkos } from "@/lib/workos";
import type { Env } from "@/types";

// Short-lived CSRF state for the OAuth round-trip; scoped to the auth routes.
const STATE_COOKIE = "rdrop_oauth_state";

export const auth = new Hono<Env>()
  .get("/auth/login", (c) => {
    const state = crypto.randomUUID();
    setCookie(c, STATE_COOKIE, state, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/api/auth",
      maxAge: 600,
    });
    const url = getWorkos(c.env).userManagement.getAuthorizationUrl({
      provider: "GoogleOAuth",
      clientId: c.env.WORKOS_CLIENT_ID,
      redirectUri: `${c.env.APP_BASE}/api/auth/callback`,
      state,
    });
    return c.redirect(url);
  })

  .get("/auth/callback", async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, STATE_COOKIE);
    deleteCookie(c, STATE_COOKIE, { path: "/api/auth" });
    if (!code || !state || !expectedState || state !== expectedState)
      return c.redirect("/?error=auth_failed");

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

  .post("/auth/logout", async (c) => {
    const session = await getSessionUser(c);
    clearSessionCookie(c);
    let logoutUrl: string | null = null;
    if (session) {
      try {
        logoutUrl = getWorkos(c.env).userManagement.getLogoutUrl({
          sessionId: session.sessionId,
          returnTo: c.env.APP_BASE,
        });
      } catch (err) {
        console.error("getLogoutUrl failed:", err);
      }
    }
    return c.json({ logoutUrl });
  });
