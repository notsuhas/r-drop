import { Hono } from "hono";
import { workosConfigured } from "./auth";
import { auth } from "./routes/auth";
import { invites } from "./routes/invites";
import { me } from "./routes/me";
import { objects } from "./routes/objects";
import { tokens } from "./routes/tokens";
import type { Env } from "./types";

const app = new Hono<Env>()
  .onError((err, c) => {
    console.error(`${c.req.method} ${c.req.path}:`, err);
    return c.json({ error: "internal error" }, 500);
  })
  .notFound((c) =>
    c.req.path.startsWith("/api/") ? c.json({ error: "not found" }, 404) : c.text("not found", 404),
  )
  .get("/api/health", (c) => c.json({ ok: true }))
  .use("/api/auth/*", async (c, next) => {
    if (!workosConfigured(c.env)) return c.json({ error: "workos not configured" }, 503);
    return next();
  })
  .route("/api", auth)
  .route("/api", me)
  .route("/api", objects)
  .route("/api", invites)
  .route("/api", tokens);

export type AppType = typeof app;
export default app;
