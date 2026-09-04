# External Integrations

**Analysis Date:** 2026-08-19

## APIs & External Services

**Fonts / CDN:**
- Google Fonts — serves the two typefaces used by the live page.
  - SDK/Client: plain `<link rel="stylesheet">` at `index.html:30`, with preconnects at `index.html:28-29`.
  - Auth: none (public CDN).
  - Second, unrelated request in the OG generator: `og-image.html:5` (Sora + Plus Jakarta Sans).

**Scheduling:**
- Calendly — the primary conversion path. Three CTAs link to `https://calendly.com/schedule-ayoub-hidri` (`index.html:221`, `index.html:530` in the FR block; `index.html:651`, `index.html:960` in the EN block), each `target="_blank" rel="noopener"` and tagged `data-act="trackCalendly"`.
  - SDK/Client: none — plain outbound anchors, no embed widget, no API call.
  - Auth: none.

**Analytics:**
- PostHog (self-hosted) — **wired but disabled**. The loader tag lives inside an HTML comment at `index.html:72-77` with unreplaced placeholders `[POSTHOG_KEY]` and `[POSTHOG_HOST]`.
  - Client-side call site: the `track()` helper at `index.html:993-996` reads `window.posthog` defensively and no-ops when the script is absent, so the page is safe in the disabled state.
  - Events already instrumented (see the `actions` map, `index.html:1021-1029`): `cta_calendly`, `cta_mailto`, `track_card` (payload `{ track: 'ia' | 'tech' }`), `download_pdf`. Every event also carries `{ lang }`.
  - The recent commit "Update Mixpanel token" notwithstanding, there is no Mixpanel code anywhere in the tree — PostHog is the only analytics integration.

**Outbound profile links (no integration, link-only):**
- LinkedIn `linkedin.com/in/ayoub-hidri`, GitHub `github.com/ayhid` and `github.com/opkod-france`, Medium `medium.com/@ayhidr`. Referenced both as visible anchors and in the JSON-LD `sameAs` arrays (`index.html:46-49`, `index.html:65`).

## Data Storage

**Databases:**
- None. The site holds no data and issues no queries.

**File Storage:**
- Repository files served by GitHub Pages. `og-image.png` (660 KB) is committed at the repo root; a duplicate sits in `.playwright-mcp/og-image.png`.

**Caching:**
- None beyond GitHub Pages' and the font CDN's own HTTP caching.

## Authentication & Identity

**Auth Provider:**
- None. The site is fully public with no login, session, cookie, or `localStorage` usage. Language state is held in a closure variable (`index.html:989`) and, for deep links, read from the URL.

## Monitoring & Observability

**Error Tracking:**
- None.

**Logs:**
- None client-side. GitHub Actions run logs are the only operational log surface.

## CI/CD & Deployment

**Hosting:**
- GitHub Pages on the custom domain in `CNAME` (`ayoub-hidri.dev`), HTTPS.

**CI Pipeline:**
- `.github/workflows/deploy.yml`, job `deploy` on `ubuntu-latest`.
  - Triggers: `push` and `pull_request` on `main`.
  - Permissions: `contents: read`, `pages: write`, `id-token: write` (OIDC-based deploy, no long-lived token).
  - Steps: `actions/checkout@v4` → `actions/configure-pages@v4` → `actions/upload-pages-artifact@v3` with `path: '.'` → `actions/deploy-pages@v4`.
  - Environment: `github-pages`, URL taken from the deploy step output.
  - No lint, test, or link-check gate — a push to `main` publishes directly.

## Environment Configuration

**Required env vars:**
- None. Nothing is read from the environment at build or run time.

**Secrets location:**
- No secrets in the repo and none referenced in the workflow; deployment authenticates via GitHub OIDC (`id-token: write`).
- Personal contact data is intentionally public in the JSON-LD block: email `ayoub.hidri@gmail.com` and phone `+33605604105` (`index.html:42-43`), plus `mailto:` anchors throughout.

## Webhooks & Callbacks

**Incoming:**
- None. A static host cannot receive them.

**Outgoing:**
- None. The page makes no `fetch`/`XMLHttpRequest` calls; all outbound traffic is user-initiated navigation or the font stylesheet request.

---

*Integration audit: 2026-08-19*
