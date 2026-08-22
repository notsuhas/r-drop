// Who am I: actor identity plus admin flag for the dashboard.
import { Hono } from "hono";
import { isAdminEmail } from "../lib/admin";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

export const me = new Hono<Env>().get("/me", requireAuth(), (c) => {
  const actor = c.get("actor");
  return c.json({
    actor,
    isAdmin: actor.type === "user" && isAdminEmail(c.env, actor.email),
  });
});
