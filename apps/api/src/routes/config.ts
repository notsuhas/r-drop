import { Hono } from "hono";
import type { Env } from "../types";

// Public, unauthenticated: the CDN base is public knowledge and the login
// page needs it before any session exists.
export const config = new Hono<Env>().get("/config", (c) =>
  c.json({ publicBase: c.env.PUBLIC_BASE }),
);
