import { Hono } from "hono";
import { createAuth } from "./auth";
import { me } from "./routes/me";
import { objects } from "./routes/objects";
import { invites } from "./routes/invites";
import { tokens } from "./routes/tokens";
import type { Env } from "./types";

const app = new Hono<Env>()
  .get("/api/health", (c) => c.json({ ok: true }))
  .on(["POST", "GET"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw))
  .route("/api", me)
  .route("/api", objects)
  .route("/api", invites)
  .route("/api", tokens);

export type AppType = typeof app;
export default app;
