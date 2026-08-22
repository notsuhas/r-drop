import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Env } from "@/types";
import { getWorkos, workosConfigured } from "./workos";

const SESSION_COOKIE = "rdrop_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function setSessionCookie(c: Context<Env>, sealed: string) {
  setCookie(c, SESSION_COOKIE, sealed, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(c: Context<Env>) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

/**
 * Resolve the WorkOS sealed-session cookie to a user, transparently rotating
 * the cookie when the access token has expired but the refresh token hasn't.
 */
export async function getSessionUser(c: Context<Env>) {
  const sealed = getCookie(c, SESSION_COOKIE);
  if (!sealed || !workosConfigured(c.env)) {
    return null;
  }

  const session = getWorkos(c.env).userManagement.loadSealedSession({
    sessionData: sealed,
    cookiePassword: c.env.WORKOS_COOKIE_PASSWORD,
  });

  const auth = await session.authenticate();
  if (auth.authenticated) {
    return { user: auth.user, sessionId: auth.sessionId };
  }

  const refreshed = await session
    .refresh({ cookiePassword: c.env.WORKOS_COOKIE_PASSWORD })
    .catch(() => null);
  if (refreshed?.authenticated && refreshed.sealedSession) {
    setSessionCookie(c, refreshed.sealedSession);
    return { user: refreshed.user, sessionId: refreshed.sessionId };
  }

  clearSessionCookie(c);
  return null;
}
