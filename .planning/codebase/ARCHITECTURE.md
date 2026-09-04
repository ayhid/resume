<!-- refreshed: 2026-08-19 -->
# Architecture

**Analysis Date:** 2026-08-19

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Static hosting (GitHub Pages)             │
│   repo root served verbatim · custom domain via `CNAME`      │
├──────────────────┬──────────────────┬───────────────────────┤
│   Page document  │   Social card    │    Crawler surface    │
│  `index.html`    │ `og-image.html`  │ `sitemap.xml`         │
│                  │ → `og-image.png` │ `robots.txt`          │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              index.html internal layers                      │
│  head (L1-116): meta · hreflang · OG · JSON-LD · <style>     │
│  body (L117-980): [data-lang-block="fr"] + [="en"] trees     │
│  tail (L982-1052): single IIFE controller                    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Browser runtime: DOM `hidden` toggles, `window.print()`,    │
│  optional `window.posthog.capture()` (analytics, commented out)  │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Document head | Title, description, canonical, hreflang, OG/Twitter cards, font preconnects | `index.html` L1-30 |
| Structured data | `Person` + `ProfessionalService` JSON-LD `@graph` | `index.html` L31-70 |
| Analytics stub | Commented PostHog snippet with `[POSTHOG_KEY]` / `[POSTHOG_HOST]` placeholders | `index.html` L71-76 |
| Design tokens + global CSS | `:root` custom properties, resets, print and reduced-motion rules, `.link-*`/`.btn-*`/`.card-hover` interaction states | `index.html` L78-115 |
| FR content tree | Full French page: header, main, footer | `index.html` L121-552 (`[data-lang-block="fr"]`) |
| EN content tree | Full English mirror of the FR tree | `index.html` L553-980 (`[data-lang-block="en"]`) |
| Behaviour controller | Language switch, accordions, analytics events, print hook | `index.html` L982-1052 |
| OG card generator | Standalone 1200×630 artboard rendered to `og-image.png` | `og-image.html` |
| Deploy pipeline | Uploads repo root as a Pages artifact on push to `main` | `.github/workflows/deploy.yml` |

## Pattern Overview

**Overall:** Single-file static document with a duplicated-content i18n model and one delegated-event controller.

**Key Characteristics:**
- No build step, no bundler, no runtime dependency; the deployed artifact is the source.
- Both languages ship in the same document; switching is a `hidden` attribute flip, never a fetch or a route change.
- Styling is inline `style="…"` per element, resolved through `:root` design tokens; the `<style>` block holds only resets, keyframes, media queries and pseudo-class states that inline styles cannot express.
- All interactivity is declared in markup via `data-act` and resolved by a single document-level click listener.

## Layers

**Presentation (markup + inline styles):**
- Purpose: Renders every section for both locales.
- Location: `index.html` L117-980
- Contains: Two sibling `[data-lang-block]` trees, each with `<header>`, `<main>`, `<footer>`.
- Depends on: `:root` tokens in the `<style>` block.
- Used by: The controller, through `data-*` attribute selectors only.

**Global style layer:**
- Purpose: Tokens, resets, print stylesheet, `prefers-reduced-motion` overrides, hover/focus states.
- Location: `index.html` L78-115
- Depends on: Google Fonts (`Archivo`, `IBM Plex Mono`).
- Used by: Every inline `style` attribute via `var(--…)`.

**Behaviour layer:**
- Purpose: Language state, accordion state, analytics dispatch, print preparation.
- Location: `index.html` L982-1052 (one IIFE, no globals exported).
- Depends on: `window.posthog` if present; degrades silently if absent.

**Metadata layer:**
- Purpose: SEO and social discovery.
- Location: `index.html` L1-76, `sitemap.xml`, `robots.txt`, `og-image.png`.

## Data Flow

### Page load

1. Browser parses `index.html`; both language blocks are in the DOM, `fr` visible (`index.html:121`).
2. Fonts preconnect and load from Google Fonts (`index.html:28-30`).
3. The IIFE indexes `[data-lang-block]` elements into `blocks` and sets `lang = 'fr'` (`index.html:987-992`).
4. Deep-link check: `?lang=en` or a `/en/` path calls `setLang('en')` (`index.html:1043-1044`).

### User interaction (delegated)

1. Any click bubbles to the document listener (`index.html:1033`).
2. `event.target.closest('[data-act]')` resolves the nearest actionable element.
3. The `data-act` value keys into the `actions` map (`index.html:1023-1032`).
4. `setFr` / `setEn` additionally call `preventDefault()` via the `PREVENT_DEFAULT` allowlist (`index.html:1031`).

### Language switch

1. `setLang(next)` returns early if the language is unchanged (`index.html:1000`).
2. Every block's `hidden` is set to `key !== lang`.
3. `document.documentElement.lang` and `document.title` are updated from the `TITLES` map (`index.html:984-987`).
4. The page scrolls to top.

### Accordion toggle

1. `toggle(button)` reads `aria-expanded`, inverts it (`index.html:1010`).
2. The panel resolved from `aria-controls` has `hidden` flipped.
3. The `[aria-hidden="true"]` glyph inside the button switches between `+` and `-`.

### Print / PDF export

1. `downloadPdf` emits `download_pdf` then calls `window.print()` (`index.html:1030`).
2. The `beforeprint` handler expands every `[data-cv-panel]` inside the *active* language block only (`index.html:1047-1051`).
3. The print stylesheet hides `[data-noprint]` and forces `[data-cv-panel]` visible (`index.html:107-111`).

**State Management:**
- Three pieces of state: the module-scoped `lang` variable, each button's `aria-expanded`, and each panel's `hidden`. Nothing is persisted; a reload resets to French unless a deep link says otherwise.

## Key Abstractions

**Language block:**
- Purpose: A complete locale-scoped copy of the page.
- Examples: `index.html:120` (`fr`), `index.html:553` (`en`).
- Pattern: Sibling wrappers toggled by `hidden`; every id inside is suffixed with the locale (`cv-fr-salomon`, `cv-en-salomon`).

**`data-act` action map:**
- Purpose: Declarative binding from markup to behaviour without inline handlers.
- Examples: 40 occurrences across `index.html`; handlers at `index.html:1023-1032`.
- Pattern: Command lookup table keyed by string; unknown values are ignored.

**Accordion pair:**
- Purpose: Collapsible resume entry.
- Examples: `index.html:366` (button) and `index.html:373` (`[data-cv-panel]`).
- Pattern: `button[aria-expanded][aria-controls]` + `div[id][data-cv-panel][hidden]`, 8 entries per locale.

**Design tokens:**
- Purpose: Single source of colour, spacing and typography values.
- Examples: `index.html:79-84` (`--paper`, `--ink`, `--work-blue`, `--s1`…`--s7`, `--mono`, `--sans`).

## Entry Points

**`index.html`:**
- Location: repo root, served as `/` by GitHub Pages.
- Triggers: Any request to `https://ayoub-hidri.dev/`.
- Responsibilities: Everything the visitor sees.

**`og-image.html`:**
- Location: repo root.
- Triggers: Manual screenshot at 1200×630 (a Playwright capture lives in `.playwright-mcp/og-image.png`).
- Responsibilities: Produces `og-image.png`; not linked from the site and not part of the visitor path.

**`.github/workflows/deploy.yml`:**
- Location: `.github/workflows/deploy.yml`
- Triggers: `push` and `pull_request` on `main`.
- Responsibilities: `configure-pages` → `upload-pages-artifact` with `path: '.'` → `deploy-pages`.

## Architectural Constraints

- **No build step:** The committed file is the deployed file. Anything requiring compilation, bundling or templating is out of scope.
- **Content duplication:** Every copy edit must be applied twice, once per `[data-lang-block]`. Ids, `aria-controls` and `aria-labelledby` must stay locale-suffixed and unique across the whole document.
- **Single script scope:** All JS lives in one IIFE at `index.html:982`. Nothing is exported; there is no module system.
- **Whole-repo deploy:** `upload-pages-artifact` uses `path: '.'`, so every committed file at the root is published — including `og-image.html`. Do not commit anything that should stay private.
- **Custom domain:** `CNAME` contains `ayoub-hidri.dev` and must survive every deploy; deleting it breaks the domain.
- **Absolute URLs are hardcoded:** Canonical, hreflang, OG and JSON-LD all hardcode `https://ayoub-hidri.dev/`; a domain change is a multi-site-wide find/replace.
- **`/en/` route does not exist:** `hreflang` and the header link point at `/en/`, but Pages serves no such path; only the `?lang=en` query and the client-side toggle actually work.

## Anti-Patterns

### Adding a `<script src>` or a framework

**What happens:** Introducing an external script or a build-produced bundle.
**Why it's wrong:** The whole design is "one file, zero dependencies, zero build". A bundle breaks the deploy workflow's assumption that the repo root is the artifact.
**Do this instead:** Extend the `actions` map in the existing IIFE (`index.html:1023`).

### Inline `onclick` handlers

**What happens:** Wiring behaviour with `onclick="…"` on an element.
**Why it's wrong:** It bypasses the delegated listener, duplicates logic and defeats the single-controller model.
**Do this instead:** Add `data-act="yourAction"` to the element and a matching function in `actions` (`index.html:1023-1032`).

### Hardcoded colours or spacing in inline styles

**What happens:** Writing `color:#2B44D8` or `padding:24px` directly.
**Why it's wrong:** Bypasses the token layer, so a palette change misses the element.
**Do this instead:** Use `var(--work-blue)`, `var(--s4)` etc. from `:root` (`index.html:79-84`).

### Editing one language block only

**What happens:** A section is updated in FR but not EN (or vice versa).
**Why it's wrong:** The blocks are mirrors; drift is invisible until someone toggles the language.
**Do this instead:** Apply every structural or content change to both `index.html:120` and `index.html:553`, keeping ids suffixed `-fr` / `-en`.

### Showing new UI without print/reduced-motion handling

**What happens:** A new nav or decorative element renders in the PDF export.
**Why it's wrong:** The print stylesheet is the PDF pipeline; chrome must be excluded.
**Do this instead:** Mark chrome with `data-noprint="true"` and collapsible content with `data-cv-panel="true"`.

## Error Handling

**Strategy:** Defensive no-ops. There is no error surface and nothing to fail loudly.

**Patterns:**
- Analytics is feature-detected: `track()` calls `window.posthog.capture` only when it exists (`index.html:994-997`).
- Unknown `data-act` values return silently (`index.html:1039`).
- A missing `aria-controls` target is skipped rather than throwing (`index.html:1013`).

## Cross-Cutting Concerns

**Logging:** None. No `console` output, no error reporting.
**Validation:** None — there are no forms or user inputs; contact is `mailto:` and Calendly links.
**Authentication:** Not applicable; fully public static content.
**Analytics:** PostHog, self-hosted, currently commented out in the head (`index.html:71-76`). Events emitted: `cta_calendly`, `cta_mailto`, `download_pdf`, `track_card` (with `{ track: 'ia' | 'tech' }`), all carrying the active `lang`.
**Accessibility:** Skip link per block, `aria-labelledby` on every section, `aria-expanded`/`aria-controls` on accordions, `:focus-visible` outlines, `prefers-reduced-motion` override (`index.html:102-105`).
**Internationalisation:** Duplicated markup plus a `TITLES` map; `documentElement.lang` tracks the active locale.

---

*Architecture analysis: 2026-08-19*
