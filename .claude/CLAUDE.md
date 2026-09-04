<!-- GSD:project-start source:PROJECT.md -->

## Project

**ayoub-hidri.dev — Personal branding site**

A single-page bilingual (FR/EN) personal branding site for Ayoub Hidri, deployed on GitHub Pages at https://ayoub-hidri.dev/. It replaces an online CV with a page that sorts two distinct audiences at the hero and routes each to its own offer: PME leaders looking for AI and automation help, and technical decision-makers looking for a senior freelance engineer.

The split between the two offers is not a compromise to be resolved — the split *is* the positioning.

**Core Value:** A PME leader arrives, understands within five seconds what AI can concretely earn them, and books a flash audit — because the visits→Calendly click ratio is the only number that validates the repositioning.

### Constraints

- **Tech stack**: One HTML file, no build step, no runtime dependency — the site's simplicity is a deliberate feature and a credibility signal for a technical audience
- **Design**: No border-radius, no box-shadow, no gradient, no stock imagery, no emoji in UI — `design.md` §1 lists these as absolute prohibitions
- **Design**: `--work-blue` (`#2B44D8`) never exceeds 5% of visible screen area, and exactly one blue CTA exists on the page (the Calendly button in §03)
- **Motion**: 150 ms transitions on colour and border only; the sole permitted exception is a staggered hero H1 entrance
- **Performance**: Lighthouse targets — 100 accessibility, >95 performance; fonts self-hosted woff2 with `font-display: swap`
- **Accessibility**: Single `<h1>`, semantic landmarks, full keyboard navigation, visible focus outlines, skip-link
- **Content integrity**: Never publish an unverifiable figure, and never promise training financing that the current Qualiopi/portage status does not support
- **Language**: FR is the default — the AI offer targets French PMEs; EN ships as a simple mirror in v1

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- HTML5 — the entire site is one document, `index.html` (1054 lines). Content, styles and behaviour all live in this file.
- CSS3 — one inline `<style>` block at `index.html:78-115` (design tokens, resets, print/reduced-motion media queries) plus per-element inline `style` attributes on nearly every node.
- JavaScript (ES5-flavoured, browser-native) — one inline IIFE at `index.html:982-1052`. No modules, no transpilation, no framework.
- JSON-LD (`application/ld+json`) — Schema.org structured data at `index.html:31-70`.
- XML — `sitemap.xml`.
- YAML — GitHub Actions workflow, `.github/workflows/deploy.yml`.
- HTML/CSS asset generator — `og-image.html` (304 lines), a standalone page rendered to `og-image.png` for social cards.

## Runtime

- The browser. No server-side runtime, no Node.js, no SSR.
- None. There is no `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, or `pyproject.toml`.
- Lockfile: missing (not applicable).
- `.gitignore` pre-emptively ignores `node_modules/` and `npm-debug.log*` even though no build tooling is present.

## Frameworks

- None. Vanilla HTML/CSS/JS by design — `README.md` states "One HTML file, no build step, no runtime dependency".
- None. No test runner, no test files, no assertions.
- No build step. The workflow stages an allowlisted set of files into `_site/` via `.github/scripts/stage-site.sh` and uploads that directory; the files it copies are published verbatim.
- Playwright MCP appears to have been used ad hoc to screenshot `og-image.html` → `.playwright-mcp/og-image.png`; it is not wired into any script or workflow.

## Key Dependencies

- Google Fonts (`fonts.googleapis.com`) — the only runtime third-party asset on the live page.
- `og-image.html:5` loads a different pair — `Sora` (400/600/700/800) and `Plus Jakarta Sans` (400/500/600). This asset generator does not share the site's type system.
- GitHub Actions (`actions/checkout@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`) — see `.github/workflows/deploy.yml`.
- No JS libraries or CDN `<script src>` tags load on the live page. The PostHog snippet is an inline `<script>` that injects its own loader at runtime; it sits inside an HTML comment (`index.html:71-105`) and ships disabled.

## Configuration

- No `.env` file, no runtime configuration, no secrets. Everything is static and public.
- Two deployment-time placeholders exist as literal text inside the commented analytics block at `index.html:74`: `[POSTHOG_KEY]` and `[POSTHOG_HOST]`.
- `.github/workflows/deploy.yml` — the only build/deploy config.
- `CNAME` — contains `ayoub-hidri.dev`. Under the Actions publishing source the domain is bound in repository settings (Settings → Pages), not by this file; the file is kept in the production manifest per D-06 as belt-and-braces, which also makes it fetchable at `/CNAME`.
- `robots.txt` — allows all crawlers, points at the sitemap.
- `sitemap.xml` — single URL entry, `lastmod` 2026-01-26.
- `.claude/settings.local.json` — local agent tool permissions, not part of the site.
- No linter, formatter, `tsconfig.json`, `.editorconfig`, or `.nvmrc`.

## Platform Requirements

- A text editor and a browser. Opening `index.html` from disk is a complete dev loop.
- Modern browser APIs relied on: `Element.closest`, `URLSearchParams`, `NodeList.forEach`, `hidden` attribute, `beforeprint` event, CSS `clamp()`, CSS custom properties, `text-wrap: pretty`. This rules out IE and very old mobile browsers.
- GitHub Pages, custom domain `ayoub-hidri.dev` over HTTPS.
- Runs on push and pull request to `main` as two jobs: `verify` runs on both events, while `deploy` is gated on `github.event_name == 'push' && github.ref == 'refs/heads/main'`, so a pull request reaches only the verify job and never publishes. `concurrency` is declared per job — `verify-…` with `cancel-in-progress: true`, `"pages"` with `cancel-in-progress: false` — not workflow-wide. The artifact is not the repo root: `.github/scripts/stage-site.sh` copies an allowlist into `_site/` and that directory is uploaded, so only `index.html`, `CNAME`, `robots.txt`, `sitemap.xml`, `og-image.png` and, when it exists, `en/` are published — `og-image.html`, `README.md`, `specs/` and `.planning/` are not. A new production asset is not published until it is added to the manifest in `stage-site.sh`.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Lowercase, hyphenated, at repo root: `index.html`, `og-image.html`, `og-image.png`, `robots.txt`, `sitemap.xml`
- No directories for source; the site is flat and served as-is by GitHub Pages
- Only used for interaction states that inline styles cannot express (`:hover`, `:focus`)
- Kebab-case, `role-modifier` shape: `.skip-link`, `.link-stitch`, `.link-blue`,
- Declared in one block in the `<style>` head, commented
- Every rule in that block uses `!important` because it overrides an inline style
- Semantic, kebab-case, describing the visual element: `.aurora`, `.aurora-glow`,
- This file is a standalone 1200x630 render target, so it uses classic
- Colors are semantic, not literal: `--paper`, `--ink`, `--ink-60`, `--line`, `--work-blue`
- Opacity variants suffix the percentage: `--ink-60`
- Spacing is an indexed scale: `--s1:4px` through `--s7:104px`
- Fonts: `--mono`, `--sans`
- One component-scoped variable is set inline and consumed by a hover rule: `--title-color`
- Section anchors are short and stable: `#ia`, `#tech`, `#cv`, `#contact`
- Per-language elements get a language suffix: `main-fr`, `hero-title-fr`,

| Attribute | Purpose |
|-----------|---------|
| `data-act` | Names a JS action to run on click (40 uses) |
| `data-lang-block` | Marks the `fr` / `en` top-level content blocks (4 uses) |
| `data-cv-panel` | Marks a collapsible resume panel, force-shown on print (18 uses) |
| `data-noprint` | Element hidden by the print stylesheet (7 uses) |
| `data-i` | Index marker on repeated list items (16 uses) |
| `data-grid` | The fixed background grid overlay |

- Module-level constant maps in SCREAMING_SNAKE: `TITLES`, `PREVENT_DEFAULT`
- Functions and variables in camelCase: `setLang`, `toggle`, `track`, `blocks`, `lang`
- Action keys in the `actions` map are camelCase verbs: `setFr`, `setEn`,

## Code Style

- No Prettier, ESLint, EditorConfig, or Biome config. Match surrounding code.
- Indentation: 2 spaces in `<style>`, `<script>`, and JSON-LD; **zero indentation
- No trailing whitespace; file ends with a newline
- `index.html` CSS is written **compressed**: one selector per line, declarations
- `og-image.html` CSS is written **expanded**: one declaration per line with
- Single quotes in JS, double quotes in HTML attributes
- None configured. The only automated gate is the GitHub Pages deploy workflow,

## Styling Approach

- Horizontal page padding: `clamp(24px,3.5vw,48px)`
- Section vertical padding: `clamp(48px,6vw,104px)`
- Container: `max-width:1140px;margin:0 auto`
- Body copy: `clamp(16px,1.1vw,18px)`; eyebrow/mono labels: `clamp(11px,1vw,13px)`
- Transitions: `150ms ease-out`; hero animation: `300ms ease-out` with 80ms stagger
- Mono (`var(--mono)`) for eyebrows, labels, nav, and CTAs — always with
- Sans (`var(--sans)`) for headings and body; headings use `font-weight:700/800`
- Prose blocks are capped with `max-width:68ch`

## Bilingual Content

## Accessibility Conventions

- A `.skip-link` as the first child of each language block, targeting `#main-{lang}`
- Every `<section>` has `aria-labelledby` pointing at its heading id
- Decorative glyphs and separators carry `aria-hidden="true"`
- Accordion triggers are `<button>` with `aria-expanded` + `aria-controls`; the
- `:focus-visible{outline:2px solid var(--work-blue);outline-offset:2px}` is global
- `prefers-reduced-motion` kills all animation and transition durations
- Non-text visuals use `role="img"` with an `aria-label`

## JavaScript Conventions

- **ES5 only.** `var`, `function` expressions, no arrow functions, no `const`/`let`,
- **No dependencies, no bundler, no `type="module"`.**
- **Event delegation over per-element listeners.** One document-level `click`
- **`preventDefault` is opt-in** via the `PREVENT_DEFAULT` lookup table, not called
- Handlers are invoked as `fn(el, event)`.
- State is a single module-scoped `lang` variable; the DOM is the rest of the state.

## Error Handling

## Logging

## Comments

- French for authoring notes in the `<head>` (the PostHog block at `index.html:71-77`),
- Comment the *why*, not the *what*. Existing examples:
- No JSDoc/TSDoc anywhere

## Module Design

## SEO and Metadata

- `<title>` must match the corresponding entry in the JS `TITLES` map
- `og:` / `twitter:` description must match `<meta name="description">` in intent
- `hreflang` alternates (`fr`, `en`, `x-default`) plus `<link rel="canonical">`
- JSON-LD `@graph` with a `Person` and a `ProfessionalService` node cross-linked
- `sitemap.xml` and `robots.txt` are hand-maintained

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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
| OG card generator | Standalone 1200×630 artboard rendered to `og-image.png`; excluded from the published artifact | `og-image.html` |
| Deploy pipeline | Stages the allowlist into `_site/` and uploads that directory as a Pages artifact on push to `resume` | `.github/workflows/deploy.yml`, `.github/scripts/stage-site.sh` |

## Pattern Overview

- No build step, no bundler, no runtime dependency; the deployed artifact is the source.
- Both languages ship in the same document; switching is a `hidden` attribute flip, never a fetch or a route change.
- Styling is inline `style="…"` per element, resolved through `:root` design tokens; the `<style>` block holds only resets, keyframes, media queries and pseudo-class states that inline styles cannot express.
- All interactivity is declared in markup via `data-act` and resolved by a single document-level click listener.

## Layers

- Purpose: Renders every section for both locales.
- Location: `index.html` L117-980
- Contains: Two sibling `[data-lang-block]` trees, each with `<header>`, `<main>`, `<footer>`.
- Depends on: `:root` tokens in the `<style>` block.
- Used by: The controller, through `data-*` attribute selectors only.
- Purpose: Tokens, resets, print stylesheet, `prefers-reduced-motion` overrides, hover/focus states.
- Location: `index.html` L78-115
- Depends on: Google Fonts (`Archivo`, `IBM Plex Mono`).
- Used by: Every inline `style` attribute via `var(--…)`.
- Purpose: Language state, accordion state, analytics dispatch, print preparation.
- Location: `index.html` L982-1052 (one IIFE, no globals exported).
- Depends on: `window.posthog` if present; degrades silently if absent.
- Purpose: SEO and social discovery.
- Location: `index.html` L1-76, `sitemap.xml`, `robots.txt`, `og-image.png`.

## Data Flow

### Page load

### User interaction (delegated)

### Language switch

### Accordion toggle

### Print / PDF export

- Three pieces of state: the module-scoped `lang` variable, each button's `aria-expanded`, and each panel's `hidden`. Nothing is persisted; a reload resets to French unless a deep link says otherwise.

## Key Abstractions

- Purpose: A complete locale-scoped copy of the page.
- Examples: `index.html:120` (`fr`), `index.html:553` (`en`).
- Pattern: Sibling wrappers toggled by `hidden`; every id inside is suffixed with the locale (`cv-fr-salomon`, `cv-en-salomon`).
- Purpose: Declarative binding from markup to behaviour without inline handlers.
- Examples: 40 occurrences across `index.html`; handlers at `index.html:1023-1032`.
- Pattern: Command lookup table keyed by string; unknown values are ignored.
- Purpose: Collapsible resume entry.
- Examples: `index.html:366` (button) and `index.html:373` (`[data-cv-panel]`).
- Pattern: `button[aria-expanded][aria-controls]` + `div[id][data-cv-panel][hidden]`, 8 entries per locale.
- Purpose: Single source of colour, spacing and typography values.
- Examples: `index.html:79-84` (`--paper`, `--ink`, `--work-blue`, `--s1`…`--s7`, `--mono`, `--sans`).

## Entry Points

- Location: repo root, served as `/` by GitHub Pages.
- Triggers: Any request to `https://ayoub-hidri.dev/`.
- Responsibilities: Everything the visitor sees.
- Location: repo root.
- Triggers: Manual screenshot at 1200×630 (a Playwright capture lives in `.playwright-mcp/og-image.png`).
- Responsibilities: Produces `og-image.png`; not linked from the site, not part of the visitor path, and excluded from the production manifest, so it is not reachable at `/og-image.html`.
- Location: `.github/workflows/deploy.yml`
- Triggers: `push` and `pull_request` on `main`; only a push to `main` reaches the deploy job.
- Responsibilities: `verify` stages the allowlist with `.github/scripts/stage-site.sh` and checks it with `.github/scripts/verify_site.py`; `deploy` then runs `configure-pages` → `stage-site.sh` → `verify_site.py` → `upload-pages-artifact` on `_site` → `deploy-pages`.

## Architectural Constraints

- **No build step:** The committed file is the deployed file. Anything requiring compilation, bundling or templating is out of scope.
- **Content duplication:** Every copy edit must be applied twice, once per `[data-lang-block]`. Ids, `aria-controls` and `aria-labelledby` must stay locale-suffixed and unique across the whole document.
- **Single script scope:** All JS lives in one IIFE at `index.html:982`. Nothing is exported; there is no module system.
- **Allowlisted deploy:** `upload-pages-artifact` uploads `_site/`, staged by `.github/scripts/stage-site.sh` from a named manifest, so nothing is published by default. `og-image.html`, `README.md`, `specs/` and `.planning/` are all committed and all excluded from the artifact. A new production asset does not ship until it is added to that manifest.
- **Custom domain:** The domain is bound in repository settings (Settings → Pages), which hold `ayoub-hidri.dev` with HTTPS enforced; under the Actions publishing source GitHub creates no `CNAME` file and ignores any committed one. The `CNAME` file is retained in the manifest per D-06 as belt-and-braces rather than as the binding, and is therefore fetchable at `/CNAME` — a harmless consequence of shipping it.
- **Absolute URLs are hardcoded:** Canonical, hreflang, OG and JSON-LD all hardcode `https://ayoub-hidri.dev/`; a domain change is a multi-site-wide find/replace.
- **`/en/` route does not exist:** `hreflang` and the header link point at `/en/`, but Pages serves no such path; only the `?lang=en` query and the client-side toggle actually work.

## Anti-Patterns

### Adding a `<script src>` or a framework

### Inline `onclick` handlers

### Hardcoded colours or spacing in inline styles

### Editing one language block only

### Showing new UI without print/reduced-motion handling

## Error Handling

- Analytics is feature-detected: `track()` calls `window.posthog.capture` only when it exists (`index.html:994-997`).
- Unknown `data-act` values return silently (`index.html:1039`).
- A missing `aria-controls` target is skipped rather than throwing (`index.html:1013`).

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
