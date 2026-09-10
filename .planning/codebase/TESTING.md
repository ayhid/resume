# Testing Patterns

**Analysis Date:** 2026-08-19

## Current State: No Automated Tests

This repository has **zero automated tests and no test tooling**. Verified absent:

- No `package.json`, so no test script and no dev dependencies
- No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`
- No `*.test.*` or `*.spec.*` files anywhere in the tree
- No `tests/`, `__tests__/`, `e2e/`, or `spec/` directory
- No linter, HTML validator, or link checker in CI

The tracked source is two hand-written HTML files (`index.html`, `og-image.html`)
plus static assets (`og-image.png`, `robots.txt`, `sitemap.xml`, `CNAME`).

## Test Framework

**Runner:** None.
**Assertion Library:** None.
**Run Commands:** None. There is nothing to run.

## What Exists Instead

### 1. GitHub Pages deploy workflow

`.github/workflows/deploy.yml` runs on push and pull request to `main`:

```
Checkout (actions/checkout@v4)
  → Setup Pages (actions/configure-pages@v4)
  → Upload artifact (actions/upload-pages-artifact@v3, path: '.')
  → Deploy (actions/deploy-pages@v4)
```

This is a **pure publish pipeline with no verification step**. It uploads the repo
root verbatim. Nothing can fail the build except an infrastructure error, so a
broken page, a malformed `<script>`, or invalid JSON-LD deploys silently. It also
runs on `pull_request`, meaning PR events attempt a live deploy rather than a
preview check.

### 2. Playwright MCP artifacts

`.playwright-mcp/` contains a single file, `og-image.png` — a browser screenshot
captured through the Playwright MCP tool while iterating on `og-image.html`. This
is an ad-hoc, interactive capture, not a suite: there is no spec file, no
assertion, and no baseline comparison. `.playwright-mcp/` is not listed in
`.gitignore`, so these scratch captures are committable by accident.

The one real workflow it supports: render `og-image.html` at 1200x630 in a
browser, screenshot it, and copy the result to the repo-root `og-image.png` that
`og:image` / `twitter:image` point at.

### 3. Manual browser checks

The de facto verification loop, inferable from the commit history (a run of
commits fixing ASCII-art console alignment, then removing it) and from the
site's feature set:

- Open `index.html` directly from disk or via a local static server
- Toggle FR/EN with the header links and confirm both blocks swap, that
  `document.documentElement.lang` and `document.title` update
- Load `?lang=en` and `/en/` to confirm the deep-link branch
- Expand and collapse the resume accordions, watch `aria-expanded` and the `+`/`-` sign
- Print preview (Cmd-P) to confirm `data-noprint` elements disappear and every
  `data-cv-panel` is force-expanded via the `beforeprint` handler
- Resize the window to confirm the `clamp()` fluid scale, since there are no
  media-query breakpoints to fall back on
- Toggle OS "reduce motion" to confirm the hero animation is suppressed
- After deploy, re-check the live URL at https://ayoub-hidri.dev/

## Test File Organization

Not applicable — no test files exist. If tests are added, the natural layout for
a zero-build static site is:

```
tests/
  smoke.spec.ts        # Playwright, drives the built page
playwright.config.ts   # webServer: npx serve .
```

Adding this introduces the repo's first `package.json` and its first dependency,
which conflicts with the stated "no build step, no runtime dependency" goal in
`README.md`. Keep dev tooling out of the deployed artifact path.

## Mocking

Not applicable. The page has no network calls of its own and no injectable
seams. The only external runtime is the Umami analytics script, which is
commented out in `index.html:71-77` and already guarded:

```js
function track(name, data) {
  var u = window.umami;
  if (u && typeof u.track === 'function') u.track(name, data);
}
```

To assert analytics behavior in a future test, set `window.umami = { track: spy }`
before interacting — no mocking library is needed.

## Fixtures and Factories

None. All content is hard-coded twice in the page, once per language block.

## Coverage

**Requirements:** None enforced, none measured.

## Test Coverage Gaps

Highest-value gaps, ordered by risk. Each is cheap to close and each maps to a
behavior that currently ships unverified.

**HTML / JSON-LD validity (High):**
The structured-data `@graph` at `index.html:31-70` and the meta tag set are
hand-maintained and consumed by Google, LinkedIn, and Twitter. A trailing comma
or a stale URL degrades search and preview rendering with no visible symptom on
the page. Add an HTML validator and a JSON-LD parse step to CI.

**FR/EN content parity (High):**
Every string, id, and section exists twice. Nothing checks that the `en` block has
the same sections as `fr`, that `-en` ids exist for every `-fr` id, or that
`TITLES.en` matches the English block's heading. Drift is invisible until a
reader switches language. A script comparing the section id sets across the two
`[data-lang-block]` wrappers catches this.

**Language toggle and deep links (Medium):**
`setLang`, the `?lang=en` query branch, and the `/^\/en\/?$/` path branch are
untested. Note that `/en/` is advertised in `hreflang` and `<link rel="alternate">`
but no `en/` directory exists in the repo, so GitHub Pages serves a 404 for that
canonical URL — a test hitting the deployed alternates would have caught it.

**Accordion and print behavior (Medium):**
`toggle()` and the `beforeprint` handler drive the PDF export, the site's primary
resume deliverable. Neither `aria-expanded` state nor the print-expanded panels
are asserted anywhere.

**Accessibility regressions (Medium):**
Skip link, `aria-labelledby` on every section, `aria-hidden` on decorative glyphs,
and focus outlines are all applied by hand across ~1000 lines. An axe-core pass
over both language states would lock them in.

**Visual regression of `og-image.html` (Low):**
The committed `og-image.png` and the source HTML can diverge with no signal.
A scripted screenshot-and-compare replaces the current manual capture.

**Link integrity (Low):**
Internal anchors (`#ia`, `#tech`, `#cv`, `#contact`, `#main-fr`/`#main-en`) and
external links (Calendly, mailto, LinkedIn, GitHub, Medium) are unchecked. A link
checker in CI is a few lines.

## Recommended Minimum

If exactly one thing is added, make it a CI job that fails the build:

1. HTML validation of `index.html` and `og-image.html`
2. `JSON.parse` on the `application/ld+json` block
3. Internal anchor resolution

These need no `package.json` in the deployed tree — run them in a workflow step
with `npx`, and gate `deploy.yml` behind them so a broken page cannot publish.

---

*Testing analysis: 2026-08-19*
