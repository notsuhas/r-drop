import { Hono } from "hono";
import { createAuth } from "./auth";
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
  .on(["POST", "GET"], ["/api/auth/*"], async (c) => {
    if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET)
      return c.json({ error: "google oauth not configured" }, 503);
    return createAuth(c.env).handler(c.req.raw);
  })
  .route("/api", me)
  .route("/api", objects)
  .route("/api", invites)
  .route("/api", tokens);

export type AppType = typeof app;
export default app;
