# ho·drops

Personal asset CDN. Upload throwaway feature-dev assets (Figma exports etc.), reference public URLs in app code instead of bundling.

| Host | Purpose | Gated |
|---|---|---|
| `ho-drops.theclau.de` | R2 custom domain — public object reads, CDN-cached, immutable | no |
| `ho-drive.theclau.de` | Worker — dashboard + API | yes (Google session or bearer token) |

## Layout

- `apps/drive` — Cloudflare Worker. Hono API + serves the dashboard build via the `assets` binding. WorkOS AuthKit sessions; invites + api tokens on D1 via drizzle.
- `apps/web` — Vite + React dashboard. Built into `apps/web/dist`, deployed with the worker.

## Auth model

- Google sign-in only, via WorkOS AuthKit (WorkOS supplies managed Google OAuth credentials — no Google Cloud project needed). The callback rejects any email that isn't `ADMIN_EMAIL` or on the `invites` table (the WorkOS user is deleted again). No invite links — admin invites an email, that Google account can then sign in.
- Sessions are WorkOS sealed sessions in an httpOnly cookie, refreshed transparently.
- Agents use bearer tokens minted in the dashboard (sha256 stored, shown once).

## Agent upload

```bash
curl -X POST https://ho-drive.theclau.de/api/upload \
  -H "Authorization: Bearer $HO_DROPS_TOKEN" \
  -F "folder=checkout-v2" \
  -F "file=@./hero-banner.png"
# → { "key", "url", "manifestUrl", "size", "contentType" }
```

Folder manifest (public, no token, regenerated on every upload/delete):

```
https://ho-drops.theclau.de/_manifest/<folder>.json
# { "folder", "count", "assets": { "heroBanner": "https://ho-drops.theclau.de/..." } }
```

## Dev

```bash
bun install
cd apps/web && bun run build        # dashboard → dist
cd ../drive && bun run dev          # wrangler dev (local D1/R2)
bun run db:migrate                  # apply migrations locally
```

Deploy: `bun run deploy` from the repo root.

Secrets (via `wrangler secret put` in apps/drive): `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_COOKIE_PASSWORD`.
WorkOS dashboard setup: enable the Google provider, set redirect URI `https://ho-drive.theclau.de/api/auth/callback`, app homepage/logout return `https://ho-drive.theclau.de`.
