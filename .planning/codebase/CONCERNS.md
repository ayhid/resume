# Codebase Concerns

**Analysis Date:** 2026-08-19

## Tech Debt

**Monolithic single file:**
- Issue: The entire site — meta tags, JSON-LD, ~880 lines of CSS-in-attribute markup, and the behaviour script — lives in one 96KB / 1054-line file. 494 inline `style="..."` attributes carry the visual design; there are no classes for most layout, so a token change means hand-editing dozens of attributes.
- Files: `index.html`
- Impact: Any edit risks touching unrelated sections; diffs are unreviewable (the current uncommitted change is 1662 deletions / 1036 insertions in one file); design tokens in `:root` are bypassed by hardcoded inline values.
- Fix approach: Promote repeated inline style blocks (`.btn-ink`, `.link-stitch`, card and row patterns already have class hooks) into the `<style>` block, keeping the no-build constraint.

**Duplicated FR/EN content trees:**
- Issue: French and English content are two near-identical DOM subtrees (`data-lang-block="fr"` at line 120, `data-lang-block="en"` at line 551), each with its own copy of every section, CTA, and resume entry.
- Files: `index.html:120`, `index.html:551`
- Impact: Every content change must be applied twice; drift between languages is silent. Page weight is doubled for all visitors, who only ever see one language.
- Fix approach: Either accept the duplication and add a checklist/diff step for content edits, or move copy into a JS data object rendered per language.

**No build tooling, linting, or formatting:**
- Issue: No `package.json`, no HTML/CSS validator, no formatter. Deployment is a raw upload of the repo root.
- Files: `.github/workflows/deploy.yml`
- Impact: Broken markup, dead links, or invalid JSON-LD ship unnoticed; images are never optimised.
- Fix approach: Add a CI step running an HTML validator, a link checker, and Lighthouse CI before `actions/deploy-pages`.

**Uncommitted rewrite in working tree:**
- Issue: `index.html` and `README.md` contain a large unpushed rewrite (Mixpanel removed, PostHog commented-in placeholder added). The deployed site is still the HEAD version.
- Files: `index.html`, `README.md`
- Impact: The repo state and the live site disagree; documentation (`README.md`) describes the working-tree analytics setup, not what is deployed.
- Fix approach: Commit or discard before further work.

**Untracked directories not ignored:**
- Issue: `.claude/` and `.playwright-mcp/` (contains `og-image.png` artefact) are untracked but absent from `.gitignore`. `.gitignore` also has a malformed final line — `*.temp.claude/settings.local.json` is one concatenated pattern rather than two entries.
- Files: `.gitignore`
- Impact: Tool artefacts can be committed accidentally; the intended `*.temp` and settings ignores do not apply.
- Fix approach: Split the last line and add `.claude/`, `.playwright-mcp/`.

## Known Bugs

**`/en/` URL does not exist:**
- Symptoms: `hreflang` alternate points at `https://ayoub-hidri.dev/en/` (`index.html:11`) and in-page links use `href="/en/"` (`index.html:135`, `index.html:547`), but no `/en/` directory or file exists in the repo, so GitHub Pages serves a 404 for that path. Clicks work only because the JS handler calls `preventDefault` for `setEn`; direct navigation, crawlers, shared links, and no-JS visitors get the 404.
- Files: `index.html:11`, `index.html:135`, `index.html:547`, `index.html:1041`
- Trigger: Open `https://ayoub-hidri.dev/en/` directly, or follow the EN link with JS disabled.
- Workaround: The `?lang=en` deep link works. A permanent fix is an `en/index.html` copy or redirect stub.

**Language toggle leaves no history entry / shareable URL:**
- Symptoms: `setLang` (`index.html:999`) mutates the DOM and scrolls to top but never updates `location`, so the URL stays `/` after switching to English; refresh or copy-paste returns the visitor to French.
- Files: `index.html:999`
- Trigger: Click EN, then reload.
- Workaround: None in page; use `?lang=en`.

**Analytics is disabled and its events are dead code:**
- Symptoms: The PostHog snippet is inside an HTML comment (`index.html:71-76`), so `window.posthog` never exists and `track()` (`index.html:994`) silently no-ops. Every `data-act="track*"` handler is inert.
- Files: `index.html:71`, `index.html:994`
- Trigger: Any CTA click — no event is recorded.
- Workaround: Replace the two placeholders and uncomment.

## Security Considerations

**Analytics token committed to git history:**
- Risk: A Mixpanel project token was committed in plain text and is still reachable in history (commit `0650811`, "Update Mixpanel token", `index.html:39` at that revision). Even though the working tree removed Mixpanel, the value remains in every clone of what is a public repository.
- Files: git history for `index.html`
- Current mitigation: Mixpanel removed from the working tree.
- Recommendations: Rotate/disable the Mixpanel project so the historic token is worthless. Client-side analytics tokens are inherently public, but leaving a live one in history invites event spoofing into the project. Prefer the self-hosted PostHog path already documented.

**Personal contact data published as structured data:**
- Risk: The JSON-LD graph exposes a personal email and a mobile phone number in machine-readable form (`index.html:43-44`, `index.html:64`), which scrapers harvest trivially.
- Files: `index.html:43`, `index.html:44`, `index.html:64`
- Current mitigation: None.
- Recommendations: This may be intentional for a consulting site; if not, drop `telephone` and route contact through the Calendly link and a role address.

**Third-party assets loaded without integrity pinning:**
- Risk: Google Fonts CSS is loaded from `fonts.googleapis.com` (`index.html:30`) with no `integrity` and no local fallback file; the (commented) analytics script would load from a remote host the same way. No Content-Security-Policy is declared, and GitHub Pages cannot set response headers.
- Files: `index.html:28-30`, `index.html:74`
- Current mitigation: `rel="noopener"` is applied consistently to all `target="_blank"` links — good.
- Recommendations: Self-host the two font families to remove the third-party dependency (and the EU data-transfer question), then add a `<meta http-equiv="Content-Security-Policy">` restricting `script-src` to `'self'` plus the analytics host.

## Performance Bottlenecks

**660KB committed OG image:**
- Problem: `og-image.png` is 660KB for a 1200x630 RGB PNG, stored uncompressed in the repo.
- Files: `og-image.png`, generated from `og-image.html`
- Cause: PNG export of a text-heavy card with no palette reduction or compression pass.
- Improvement path: Re-export as PNG-8 or run through `oxipng`/`pngquant` (expect <100KB), or serve a JPEG/WebP alongside. It is fetched by every crawler and link unfurler.

**Whole-page payload includes the unseen language:**
- Problem: Both language trees ship on every request; roughly half the 96KB HTML is never rendered for a given visitor.
- Files: `index.html:120`, `index.html:551`
- Cause: Client-side toggle over duplicated markup.
- Improvement path: Acceptable at this size over a compressed connection; revisit only if the page grows. Building a real `/en/` page would fix this and the 404 together.

**Render-blocking font stylesheet:**
- Problem: The Google Fonts `<link rel="stylesheet">` (`index.html:30`) blocks first paint on a third-party round trip, despite the `preconnect` hints.
- Files: `index.html:28-30`
- Cause: Remote variable-font CSS in `<head>`.
- Improvement path: Self-host with `font-display:swap` in a local `@font-face`.

## Fragile Areas

**Delegated `data-act` click dispatcher:**
- Files: `index.html:1021-1039`
- Why fragile: Behaviour is bound by string keys in the `actions` map. A typo in a `data-act` attribute fails silently (`if (!fn) return;`), and the `PREVENT_DEFAULT` allowlist is a second place to keep in sync. There is no console warning for an unmatched action.
- Safe modification: Add the handler to `actions` first, then the attribute; grep for the action name in both places after any rename.
- Test coverage: None.

**Accordion state and print interaction:**
- Files: `index.html:1011` (`toggle`), `index.html:1046` (`beforeprint`)
- Why fragile: `toggle` mutates `aria-expanded`, the panel's `hidden`, and the textContent of the first `[aria-hidden="true"]` child (the +/- sign) by position. Adding another decorative span before the sign silently moves the +/- to the wrong element. The `beforeprint` handler force-opens `[data-cv-panel]` elements but never restores `aria-expanded`, so after printing the buttons claim collapsed while panels are open.
- Safe modification: Give the sign its own `data-sign` hook; sync `aria-expanded` in the print handler.
- Test coverage: None.

**ID naming convention across language blocks:**
- Files: `index.html` (`cv-fr-*`, `cv-en-*`, `*-title-fr`, `*-title-en`)
- Why fragile: Uniqueness relies on a manual `-fr` / `-en` suffix on every id and every matching `aria-controls`/`aria-labelledby`. No duplicate ids exist today, but a copy-paste between blocks would wire an English button to a French panel with no visible error.
- Safe modification: When cloning a section, rewrite every id and aria reference; verify with a duplicate-id check.
- Test coverage: None.

## Scaling Limits

**Single-file editing ceiling:**
- Current capacity: ~1050 lines, two languages, five resume entries.
- Limit: A third language or a blog section makes the duplicate-tree approach unmanageable and pushes the payload past the point where shipping unseen content is defensible.
- Scaling path: Move to per-language static pages (`/`, `/en/`) generated from a shared template, keeping the zero-runtime-dependency property.

## Dependencies at Risk

**Google Fonts (Archivo, IBM Plex Mono):**
- Risk: External availability and EU data-protection exposure; the site is otherwise dependency-free, so this is the only runtime third party.
- Impact: Font outage degrades to the declared fallbacks (`Helvetica`/`ui-monospace`) — visual only, not fatal.
- Migration plan: Self-host the two families under `assets/fonts/`.

**PostHog (planned, unconfigured):**
- Risk: Placeholders `[POSTHOG_KEY]` / `[POSTHOG_HOST]` have never been filled; the self-hosted instance is an operational dependency that does not yet exist.
- Impact: No analytics at all today.
- Migration plan: Stand up the instance or delete the commented block and the four dead track handlers.

## Missing Critical Features

**No `/en/` page:**
- Problem: The English URL advertised in `hreflang`, in-page links, and README is not served.
- Blocks: English-language search indexing, shared English links, no-JS access to English content.

**No 404 page:**
- Problem: No `404.html`; GitHub Pages serves its generic page for `/en/` and every mistyped path.
- Blocks: Recovering a visitor who lands on a bad URL.

**SEO metadata inconsistency:**
- Problem: `sitemap.xml` lists only `https://ayoub-hidri.dev/` with `lastmod` 2026-01-26, while `hreflang` declares an `/en/` alternate that is neither in the sitemap nor served. `robots.txt` and `CNAME` (`ayoub-hidri.dev`) are consistent with each other and with the canonical tag.
- Blocks: Correct bilingual indexing. `lastmod` is also stale relative to the pending content rewrite.
- Files: `sitemap.xml`, `robots.txt`, `CNAME`, `index.html:9-12`

**Accessibility gaps:**
- Problem: Two `<h1>` elements exist (one per language block) — benign while the inactive tree is `hidden`, but it breaks if `hidden` is ever removed. Language switching updates `document.documentElement.lang` and `document.title` but announces nothing to assistive tech. Decorative `✕` glyphs are correctly `aria-hidden`, accordions carry `aria-expanded`/`aria-controls`, and `:focus-visible` styling is defined — the foundations are sound. Colour contrast of `--ink-60` (#5C5C58) on `--paper` (#F7F6F2) is roughly 6.5:1 and passes; the `--work-blue` (#2B44D8) on paper is around 7:1 and passes.
- Blocks: WCAG conformance claims; screen-reader users get no confirmation the language changed.
- Files: `index.html:999`, `index.html:118`

## Test Coverage Gaps

**No tests of any kind:**
- What's not tested: Language toggle and `?lang=en` deep link, accordion open/close and its aria state, print expansion, the `data-act` dispatcher, JSON-LD validity, link integrity, meta/sitemap consistency.
- Files: entire repo — no test directory, no test runner, no CI check beyond deploy.
- Risk: Every regression reaches production, since `.github/workflows/deploy.yml` publishes on push to `main` with no gate.
- Priority: Medium — a link checker plus a structured-data validator in CI would cover the highest-value failures (the `/en/` 404 would have been caught).

**No deploy gate:**
- What's not tested: The `pull_request` trigger in `.github/workflows/deploy.yml` runs the same deploy job as `push`, so PRs are not validated differently and there is no build/verify stage.
- Files: `.github/workflows/deploy.yml`
- Risk: Broken HTML ships immediately.
- Priority: Medium.

---

*Concerns audit: 2026-08-19*
