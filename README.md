<h1 align="center">r·drop</h1>

<p align="center">
  <strong>Drop a file, get a permanent public URL.</strong><br />
  A self-hosted asset CDN with a gated dashboard, built entirely on Cloudflare — Workers, R2, D1.
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/license-MIT.svg?variant=secondary&amp;size=sm&amp;mode=dark" />
    <img alt="License: MIT" src="https://shieldcn.dev/badge/license-MIT.svg?variant=secondary&amp;size=sm&amp;mode=light" height="22" />
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/runs%20on-Cloudflare%20Workers.svg?variant=secondary&amp;size=sm&amp;logo=cloudflare&amp;mode=dark" />
    <img alt="Runs on Cloudflare Workers" src="https://shieldcn.dev/badge/runs%20on-Cloudflare%20Workers.svg?variant=secondary&amp;size=sm&amp;logo=cloudflare&amp;mode=light" height="22" />
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/types-TypeScript.svg?variant=secondary&amp;size=sm&amp;logo=typescript&amp;mode=dark" />
    <img alt="Written in TypeScript" src="https://shieldcn.dev/badge/types-TypeScript.svg?variant=secondary&amp;size=sm&amp;logo=typescript&amp;mode=light" height="22" />
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/ui-React%2019.svg?variant=secondary&amp;size=sm&amp;logo=react&amp;mode=dark" />
    <img alt="UI in React 19" src="https://shieldcn.dev/badge/ui-React%2019.svg?variant=secondary&amp;size=sm&amp;logo=react&amp;mode=light" height="22" />
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/runtime-Bun.svg?variant=secondary&amp;size=sm&amp;logo=bun&amp;mode=dark" />
    <img alt="Runtime: Bun" src="https://shieldcn.dev/badge/runtime-Bun.svg?variant=secondary&amp;size=sm&amp;logo=bun&amp;mode=light" height="22" />
  </picture>
</p>

---

The name is literal: it's a drop box on top of R2. Upload throwaway dev assets — Figma
exports, videos, Rive animations — get permanent public URLs, and hand your coding agents a
token so they can upload for you.

## Why this exists

Building UI with coding agents means constantly moving binary assets into code. Committing them bloats the repo; pasting 30 CDN URLs into a prompt is worse. r-drop gives you:

- **Public, immutable asset URLs** served straight off an R2 custom domain — reads never touch a Worker, so they're free-tier CDN reads. Immutable is literal: a key is written once. Uploading over an existing key is a `409`, because the old bytes would keep being served from every edge that already cached them.
- **Folder manifests**: every folder publishes `/_manifest/<folder>.json` (camelCase name → URL), regenerated on every write. Agents fetch one URL instead of being fed thirty. Names that camelCase alike (`logo-dark.png`, `logo_dark.svg`) are disambiguated by extension rather than overwriting each other.
- **Agent-first uploads**: bearer tokens + a one-click "copy setup prompt" that teaches any agent to install r-drop as a permanent skill.
- **A dashboard that behaves like a real file manager**: drag-drop (files *and* folders), live upload progress, grid and list views, click/⌘-click/shift-click selection, full keyboard navigation, right-click menus, and copy-as (`URLs` / `JSON` / `TypeScript const` / manifest URL).

## The dashboard

Dark-mode file browser built to file-manager conventions, so nothing has to be learned:

| | |
|---|---|
| **Select** | Click selects one · ⌘/Ctrl-click adds or removes · Shift-click extends a range · checkboxes always add (so "select all, then untick a few" works) |
| **Navigate** | Arrow keys move a cursor through the grid or list · <kbd>Home</kbd>/<kbd>End</kbd> jump to the ends · <kbd>Enter</kbd> opens details · <kbd>Space</kbd> toggles |
| **Act** | Right-click anything for the full menu · <kbd>⌘A</kbd> select all · <kbd>Esc</kbd> clear · <kbd>Del</kbd> asks before deleting · <kbd>/</kbd> jumps to the filter |
| **Upload** | Drop files or whole folders anywhere in the window, or use Upload · folder structure is preserved · per-file progress, cancellable |

The breadcrumb is the point of the product made visible: a folder in r-drop *is* a public CDN
path, so the path bar renders that path in mono, and the folder and manifest URLs are one click
away from it.

## Architecture

| Piece | Tech | Notes |
|---|---|---|
| `apps/api` | Cloudflare Worker, Hono | API + auth + serves the dashboard build via the `assets` binding. One deploy. |
| `apps/dashboard` | Vite, React 19, Tailwind v4, TanStack Query | Talks to the API through Hono RPC (`hc<AppType>`) — response/request types are inferred, not hand-written. |
| Storage | R2 | Public reads via an R2 custom domain. The Worker only handles writes. |
| Database | D1 + drizzle | Two tables: `invites`, `api_tokens`. Users live in WorkOS. |
| Auth | WorkOS AuthKit | Google sign-in with WorkOS-managed OAuth credentials — **no Google Cloud project needed**. Sealed-session cookie with transparent refresh. |

Two hostnames, two concerns:

- **CDN domain** (`PUBLIC_BASE`) — R2 custom domain. Direct object reads, CDN-cached, immutable. The exact root `/` is routed to the Worker for a small landing page; every other path bypasses it.
- **App domain** (`APP_BASE`) — the Worker: dashboard + API, gated by session or bearer token.

### Auth model

- Google sign-in only. The OAuth callback enforces an **email-pinned invite gate**: unless the email is in `ADMIN_EMAILS` or on the `invites` table, no session is issued and the WorkOS user is deleted again. No invite links — inviting an email *is* the invite.
- Agents authenticate with bearer tokens (`rd_` + 32 hex). Only the sha256 hash is stored; the token is shown once. Tokens are scoped (`read`/`write`), renameable, revocable, and optionally expiring. Every request re-checks that the token's owner is still an admin or still holds an invite, so revocation does not depend on the cascade below succeeding.
- Removing an active invite cascades: their tokens are deleted locally first, then the WorkOS user is deleted (which revokes live sessions). If WorkOS is unreachable the tokens are still gone and the endpoint answers `502` saying the browser session may outlive the removal — it does not report a clean removal it did not make.

Uploads are capped at 50MB and refuse `text/html`, `application/xhtml+xml`, and any SVG carrying active content (script, event handlers, `javascript:` URLs). Nothing sits in the read path to add a CSP header, so an executable document on the CDN origin would be stored XSS.

## Agent usage

```bash
curl -X POST https://<your-app-domain>/api/upload \
  -H "Authorization: Bearer $R_DROP_TOKEN" \
  -F "folder=checkout-v2" \
  -F "file=@./hero-banner.png"
# → { "key", "url", "manifestUrl", "size", "contentType" }
```

Public manifest (no token): `https://<your-cdn-domain>/_manifest/checkout-v2.json`

Or skip the docs entirely: the dashboard's **API tokens → "Create token and copy prompt"** produces a paste-into-any-agent prompt that installs r-drop as a skill with the token baked in. All agent-facing copy lives in one auditable file: `apps/dashboard/src/lib/agent-content.ts`.

## Self-hosting

Prereqs: a Cloudflare account with a zone, a free [WorkOS](https://workos.com) account, [bun](https://bun.sh).

```bash
bun install

# 1. Cloudflare resources (from the repo root)
cp wrangler.example.jsonc wrangler.jsonc         # fill in your domains/emails
bunx wrangler r2 bucket create r-drop-cdn
bunx wrangler r2 bucket domain add r-drop-cdn --domain <cdn-domain> --zone-id <zone-id>
bunx wrangler d1 create r-drop-db                # paste the id into wrangler.jsonc
bunx wrangler d1 migrations apply r-drop-db --remote

# 2. WorkOS (dashboard.workos.com, Staging environment)
#    - Redirects → redirect URI: https://<app-domain>/api/auth/callback
#    - Redirects → app homepage + logout: https://<app-domain>
#    - Authentication → Google enabled (default, WorkOS-managed credentials)
bunx wrangler secret put WORKOS_API_KEY
bunx wrangler secret put WORKOS_CLIENT_ID
openssl rand -hex 32 | bunx wrangler secret put WORKOS_COOKIE_PASSWORD

# 3. Ship it
bun run deploy
```

Sign in with an email listed in `ADMIN_EMAILS` — you're the admin; invite everyone else from the **People** tab.

## Development

```bash
bun install
bun run build        # dashboard → dist (the worker serves it via the assets binding)
bun run db:migrate   # apply migrations to the local D1
bun run dev          # wrangler dev with local D1/R2
```

`wrangler.jsonc` and `.dev.vars` live at the repo root (both gitignored); `wrangler.example.jsonc` and `.dev.vars.example` are the committed templates.

Quality gates — CI runs exactly these, and all of them must pass:

```bash
bunx biome check .                    # lint + format
bunx tsc --noEmit -p apps/api         # typecheck the worker
(cd apps/dashboard && bunx tsc -b)    # typecheck the dashboard
bun run test                          # unit + worker integration tests
(cd apps/dashboard && bun run build)  # the build the worker serves
bunx fallow                           # dead code, duplication, complexity
```

`fallow` is kept at zero findings; unit tests run on bun, and the worker integration suite
runs on `vitest-pool-workers`.

`bun run clean` wipes everything gitignored (node_modules, caches, builds) except the instance
files `wrangler.jsonc` / `.dev.vars`.

Pushes to `main` auto-deploy: the CI `deploy` job materializes `wrangler.jsonc` from the `WRANGLER_CONFIG` repo secret and runs `wrangler deploy` with `CLOUDFLARE_API_TOKEN` (create one from the "Edit Cloudflare Workers" template).

Integration tests run the real worker on Miniflare with in-memory R2 + D1 (`apps/api/wrangler.test.jsonc`), covering the full bearer-token path: auth matrix, uploads, manifests, rename/move, deletes. CI (`.github/workflows/ci.yml`) runs all of the above on every push.

Conventions: atoms/molecules composition in the dashboard (`components/ui` → `components/<domain>` → pages compose), one-concern-per-file routes in the API, `@/` path aliases (no `../..` imports), pure logic extracted into unit-tested `lib/` functions.

## License

[MIT](./LICENSE)
