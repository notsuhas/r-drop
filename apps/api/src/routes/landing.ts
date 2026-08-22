import { Hono } from "hono";
import type { Env } from "../types";

// The CDN host's root is routed here (exact root only); every other path on
// that host is served straight from R2 without touching the worker.
const dropsLanding = (appBase: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ho·drive cdn</title>
<meta name="theme-color" content="rgba(13,15,20,1)">
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: rgba(13,15,20,1); color: rgba(233,236,243,1);
    font-family: ui-sans-serif, system-ui, sans-serif; }
  main { text-align: center; padding: 2rem; }
  h1 { font-size: 1.5rem; letter-spacing: -0.02em; }
  h1 span { color: rgba(255,178,86,1); }
  p { color: rgba(150,158,175,1); font-size: 0.9rem; max-width: 26rem; }
  code { font-family: ui-monospace, monospace; color: rgba(233,236,243,1); }
  a { color: rgba(255,178,86,1); }
</style>
</head>
<body>
<main>
  <h1>ho<span>·</span>drive <span style="color:rgba(150,158,175,1)">cdn</span></h1>
  <p>Public asset CDN. Objects live at <code>/&lt;folder&gt;/&lt;file&gt;</code>,
  folder manifests at <code>/_manifest/&lt;folder&gt;.json</code>.</p>
  <p><a href="${appBase}">open the drive →</a></p>
</main>
</body>
</html>`;

export const landing = new Hono<Env>().get("/", (c) => {
  const host = new URL(c.req.url).host;
  if (host === new URL(c.env.PUBLIC_BASE).host) return c.html(dropsLanding(c.env.APP_BASE));
  return c.env.ASSETS.fetch(c.req.raw);
});
