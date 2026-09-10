# Technology Stack

**Analysis Date:** 2026-08-19

## Languages

**Primary:**
- HTML5 — the entire site is one document, `index.html` (1054 lines). Content, styles and behaviour all live in this file.
- CSS3 — one inline `<style>` block at `index.html:78-115` (design tokens, resets, print/reduced-motion media queries) plus per-element inline `style` attributes on nearly every node.
- JavaScript (ES5-flavoured, browser-native) — one inline IIFE at `index.html:982-1052`. No modules, no transpilation, no framework.

**Secondary:**
- JSON-LD (`application/ld+json`) — Schema.org structured data at `index.html:31-70`.
- XML — `sitemap.xml`.
- YAML — GitHub Actions workflow, `.github/workflows/deploy.yml`.
- HTML/CSS asset generator — `og-image.html` (304 lines), a standalone page rendered to `og-image.png` for social cards.

## Runtime

**Environment:**
- The browser. No server-side runtime, no Node.js, no SSR.

**Package Manager:**
- None. There is no `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, or `pyproject.toml`.
- Lockfile: missing (not applicable).
- `.gitignore` pre-emptively ignores `node_modules/` and `npm-debug.log*` even though no build tooling is present.

## Frameworks

**Core:**
- None. Vanilla HTML/CSS/JS by design — `README.md` states "One HTML file, no build step, no runtime dependency".

**Testing:**
- None. No test runner, no test files, no assertions.

**Build/Dev:**
- No build step. The repository root is published verbatim.
- Playwright MCP appears to have been used ad hoc to screenshot `og-image.html` → `.playwright-mcp/og-image.png`; it is not wired into any script or workflow.

## Key Dependencies

**Critical:**
- Google Fonts (`fonts.googleapis.com`) — the only runtime third-party asset on the live page.
  - `index.html:30` loads `Archivo` (variable, `wdth 62..125`, `wght 400..800`) and `IBM Plex Mono` (400, 500), with `display=swap`.
  - Preconnect hints at `index.html:28-29` for `fonts.googleapis.com` and `fonts.gstatic.com`.
  - Fallback stacks are declared in the token block (`--sans`, `--mono`) at `index.html:83-84`, so the page degrades cleanly if the CDN is unreachable.
- `og-image.html:5` loads a different pair — `Sora` (400/600/700/800) and `Plus Jakarta Sans` (400/500/600). This asset generator does not share the site's type system.

**Infrastructure:**
- GitHub Actions (`actions/checkout@v4`, `actions/configure-pages@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`) — see `.github/workflows/deploy.yml`.

**Not present:**
- No JS libraries or CDN `<script src>` tags load on the live page. The only external `<script src>` in the file is the Umami snippet, which is inside an HTML comment (`index.html:72-77`).

## Configuration

**Environment:**
- No `.env` file, no runtime configuration, no secrets. Everything is static and public.
- Two deployment-time placeholders exist as literal text inside the commented analytics block at `index.html:74`: `[UMAMI_HOST]` and `[UMAMI_WEBSITE_ID]`.

**Build:**
- `.github/workflows/deploy.yml` — the only build/deploy config.
- `CNAME` — contains `ayoub-hidri.dev`, binds the custom domain to GitHub Pages.
- `robots.txt` — allows all crawlers, points at the sitemap.
- `sitemap.xml` — single URL entry, `lastmod` 2026-01-26.
- `.claude/settings.local.json` — local agent tool permissions, not part of the site.
- No linter, formatter, `tsconfig.json`, `.editorconfig`, or `.nvmrc`.

## Platform Requirements

**Development:**
- A text editor and a browser. Opening `index.html` from disk is a complete dev loop.
- Modern browser APIs relied on: `Element.closest`, `URLSearchParams`, `NodeList.forEach`, `hidden` attribute, `beforeprint` event, CSS `clamp()`, CSS custom properties, `text-wrap: pretty`. This rules out IE and very old mobile browsers.

**Production:**
- GitHub Pages, custom domain `ayoub-hidri.dev` over HTTPS.
- Deploys on push and pull request to `main`; concurrency group `pages` with `cancel-in-progress: false`; the whole repo root (`path: '.'`) is uploaded as the artifact, so `og-image.html` and `README.md` ship to production too.

---

*Stack analysis: 2026-08-19*
