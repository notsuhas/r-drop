import { Hono } from "hono";
import type { Env } from "@/types";

// The CDN host's root is routed here (exact root only); every other path on
// that host is served straight from R2 without touching the worker.
const dropsLanding = (appBase: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>r·drop cdn</title>
<meta name="description" content="Public asset CDN for r·drop.">
<meta name="theme-color" content="#0d0e10">
<link rel="icon" type="image/svg+xml" href="${appBase}/favicon.svg">
<style>
  :root {
    --bg: #0d0e10; --surface: #161719; --ink: #f3f3f5;
    --ink-2: #babcc0; --ink-3: #979a9f; --accent: #6aabff;
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased;
    font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif; }
  main { padding: 2rem; max-width: 34rem; }
  h1 { font-size: 1.375rem; letter-spacing: -0.02em; margin: 0 0 0.5rem;
    display: flex; align-items: center; gap: 0.5rem; }
  h1 .dot { width: 6px; height: 6px; border-radius: 999px; background: #0061ff; }
  h1 .sub { color: var(--ink-3); font-weight: 400; }
  p { color: var(--ink-2); font-size: 0.875rem; line-height: 1.6; }
  code { font-family: "Spline Sans Mono", ui-monospace, monospace; font-size: 0.8125rem;
    background: var(--surface); padding: 0.15em 0.4em; border-radius: 4px; color: var(--ink); }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<main>
  <h1>r<span class="dot"></span>drop <span class="sub">cdn</span></h1>
  <p>Public asset CDN. Objects live at <code>/&lt;folder&gt;/&lt;file&gt;</code>,
  folder manifests at <code>/_manifest/&lt;folder&gt;.json</code>.</p>
  <p><a href="${appBase}">Open the drive &rarr;</a></p>
</main>
</body>
</html>`;

export const landing = new Hono<Env>().get("/", (c) => {
  const host = new URL(c.req.url).host;
  if (host === new URL(c.env.PUBLIC_BASE).host) return c.html(dropsLanding(c.env.APP_BASE));
  return c.env.ASSETS.fetch(c.req.raw);
});
