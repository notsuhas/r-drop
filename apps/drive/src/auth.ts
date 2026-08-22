import { WorkOS } from "@workos-inc/node/worker";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Bindings } from "./bindings";
import type { Env } from "./types";

export const SESSION_COOKIE = "hod_session";

export const isAdminEmail = (env: Bindings, email: string) =>
  env.ADMIN_EMAILS.toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .includes(email.toLowerCase());

export const workosConfigured = (env: Bindings) =>
  Boolean(env.WORKOS_API_KEY && env.WORKOS_CLIENT_ID);

export const getWorkos = (env: Bindings) =>
  new WorkOS(env.WORKOS_API_KEY, { clientId: env.WORKOS_CLIENT_ID });

export function setSessionCookie(c: Context<Env>, sealed: string) {
  setCookie(c, SESSION_COOKIE, sealed, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(c: Context<Env>) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export async function getSessionUser(c: Context<Env>) {
  const sealed = getCookie(c, SESSION_COOKIE);
  if (!sealed || !workosConfigured(c.env)) return null;
  const session = getWorkos(c.env).userManagement.loadSealedSession({
    sessionData: sealed,
    cookiePassword: c.env.WORKOS_COOKIE_PASSWORD,
  });
  const auth = await session.authenticate();
  if (auth.authenticated) return { user: auth.user, sessionId: auth.sessionId };
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
