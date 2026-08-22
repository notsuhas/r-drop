import { Hono } from "hono";
import { workosConfigured } from "./auth";
import { auth } from "./routes/auth";
import { config } from "./routes/config";
import { invites } from "./routes/invites";
import { landing } from "./routes/landing";
import { manifest } from "./routes/manifest";
import { me } from "./routes/me";
import { objects } from "./routes/objects";
import { tokens } from "./routes/tokens";
import { upload } from "./routes/upload";
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
  .route("/", landing)
  .route("/api", config)
  .route("/api", objects)
  .route("/api", upload)
  .route("/api", manifest)
  .route("/api", invites)
  .route("/api", tokens);

export type AppType = typeof app;
export default app;
