import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../types";

export const me = new Hono<Env>().get("/me", requireAuth(), (c) => {
  const actor = c.get("actor");
  return c.json({
    actor,
    isAdmin: actor.type === "user" && actor.email === c.env.ADMIN_EMAIL,
  });
});
