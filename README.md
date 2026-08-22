# r·drop

**R2 drop** — a self-hosted asset CDN with a gated dashboard, built almost entirely on Cloudflare infrastructure (Workers, R2, D1). Upload throwaway dev assets (Figma exports, videos, Rive animations), get permanent public URLs, and hand your coding agents a token so they can upload for you.

The name is literal: it's a drop box on top of R2.

## Why this exists

Building UI with coding agents means constantly moving binary assets into code. Committing them bloats the repo; pasting 30 CDN URLs into a prompt is worse. r-drop gives you:

- **Public, immutable asset URLs** served straight off an R2 custom domain — reads never touch a Worker, so they're free-tier CDN reads.
- **Folder manifests**: every folder publishes `/_manifest/<folder>.json` (camelCase name → URL), regenerated on every write. Agents fetch one URL instead of being fed thirty.
- **Agent-first uploads**: bearer tokens + a one-click "copy setup prompt" that teaches any agent to install r-drop as a permanent skill.
- **A Google-Drive-ish dashboard**: drag-drop (files *and* folders), live upload progress, grid/list views, marquee selection, rename/move, copy-links-as (`urls` / `json` / `ts const` / manifest URL).

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
- Agents authenticate with bearer tokens (`rd_` + 32 hex). Only the sha256 hash is stored; the token is shown once. Tokens are scoped (`read`/`write`), renameable, and revocable.
- Removing an active invite cascades: WorkOS user deleted (revokes sessions), their tokens deleted.

## Agent usage

```bash
curl -X POST https://<your-app-domain>/api/upload \
  -H "Authorization: Bearer $R_DROP_TOKEN" \
  -F "folder=checkout-v2" \
  -F "file=@./hero-banner.png"
# → { "key", "url", "manifestUrl", "size", "contentType" }
```

Public manifest (no token): `https://<your-cdn-domain>/_manifest/checkout-v2.json`

Or skip the docs entirely: the dashboard's **API tokens → "Create token + copy prompt"** produces a paste-into-any-agent prompt that installs r-drop as a skill with the token baked in. All agent-facing copy lives in one auditable file: `apps/dashboard/src/lib/agent-content.ts`.

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

Sign in with an email listed in `ADMIN_EMAILS` — you're the admin; invite everyone else from the Invites tab.

## Development

```bash
bun install
bun run build        # dashboard → dist (the worker serves it via the assets binding)
bun run db:migrate   # apply migrations to the local D1
bun run dev          # wrangler dev with local D1/R2
```

`wrangler.jsonc` and `.dev.vars` live at the repo root (both gitignored); `wrangler.example.jsonc` and `.dev.vars.example` are the committed templates.

Quality gates (all must pass — CI is just these four commands):

`bun run clean` wipes everything gitignored (node_modules, caches, builds) except the instance files `wrangler.jsonc` / `.dev.vars`.

```bash
bunx biome check .        # lint + format
bunx tsc --noEmit -p apps/api && (cd apps/dashboard && bunx tsc -b)
bun test                  # run inside apps/api and apps/dashboard
bunx fallow               # dead code, duplication, complexity — kept at zero findings
```

Conventions: atoms/molecules composition in the dashboard (`components/ui` → `components/<domain>` → pages compose), one-concern-per-file routes in the API, `@/` path aliases (no `../..` imports), pure logic extracted into unit-tested `lib/` functions.

## License

[MIT](./LICENSE)
