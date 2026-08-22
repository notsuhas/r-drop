/*
 * Regenerates the PNG app icons from the same geometry as public/favicon.svg.
 *
 * Run manually after changing the mark; the output is committed, so this is not
 * part of the build and Playwright is not a project dependency:
 *
 *   cd apps/dashboard && npx playwright@1 install chromium && node scripts/make-icons.mjs
 *
 * favicon.svg keeps its own rounded corners. The maskable variants are
 * full-bleed with the glyph inset to ~72%, because Android crops icons to an
 * arbitrary shape and anything near the edge gets cut.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const ACCENT = "#0061ff";
const glyph = (strokeWidth) => `
  <g fill="none" stroke="#fff" stroke-width="${strokeWidth}"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 13v18"/>
    <path d="M22.5 26.5 32 36l9.5-9.5"/>
    <path d="M20 47h24"/>
  </g>`;

const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${ACCENT}"/>${glyph(5.5)}
</svg>`;

const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${ACCENT}"/>
  <g transform="translate(32 32) scale(0.72) translate(-32 -32)">${glyph(4.5)}</g>
</svg>`;

const jobs = [
  { svg: rounded, out: "apple-touch-icon.png", size: 180 },
  { svg: maskable, out: "icon-192.png", size: 192 },
  { svg: maskable, out: "icon-512.png", size: 512 },
];

const browser = await chromium.launch();
for (const { svg, out, size } of jobs) {
  const ctx = await browser.newContext({ viewport: { width: size, height: size } });
  const page = await ctx.newPage();
  await page.setContent(
    `<body style="margin:0">${svg.replace("<svg", `<svg width="${size}" height="${size}"`)}</body>`,
  );
  await page.screenshot({ path: join(PUBLIC_DIR, out) });
  await ctx.close();
  console.log("wrote", out, `${size}x${size}`);
}
await browser.close();
