# Coding Conventions

**Analysis Date:** 2026-08-19

No linter, formatter, or build step exists in this repository. Every convention
below is derived from the actual style of `index.html` (1054 lines) and
`og-image.html` (304 lines). Follow them by hand — nothing enforces them.

## Naming Patterns

**Files:**
- Lowercase, hyphenated, at repo root: `index.html`, `og-image.html`, `og-image.png`, `robots.txt`, `sitemap.xml`
- No directories for source; the site is flat and served as-is by GitHub Pages

**CSS classes (`index.html`):**
- Only used for interaction states that inline styles cannot express (`:hover`, `:focus`)
- Kebab-case, `role-modifier` shape: `.skip-link`, `.link-stitch`, `.link-blue`,
  `.card-hover`, `.btn-ink`, `.btn-blue`, `.btn-invert`
- Declared in one block in the `<style>` head, commented
  `/* Interaction states (generated from the design's style-hover / style-focus). */`
- Every rule in that block uses `!important` because it overrides an inline style

**CSS classes (`og-image.html`):**
- Semantic, kebab-case, describing the visual element: `.aurora`, `.aurora-glow`,
  `.mesh`, `.noise`, `.top-bar`, `.floating-icon`, `.skill-tag`, `.deco-line`
- This file is a standalone 1200x630 render target, so it uses classic
  stylesheet-driven styling rather than the inline-style approach of `index.html`

**CSS custom properties (`index.html:79-84`):**
- Colors are semantic, not literal: `--paper`, `--ink`, `--ink-60`, `--line`, `--work-blue`
- Opacity variants suffix the percentage: `--ink-60`
- Spacing is an indexed scale: `--s1:4px` through `--s7:104px`
- Fonts: `--mono`, `--sans`
- One component-scoped variable is set inline and consumed by a hover rule: `--title-color`

**HTML ids:**
- Section anchors are short and stable: `#ia`, `#tech`, `#cv`, `#contact`
- Per-language elements get a language suffix: `main-fr`, `hero-title-fr`,
  `ia-title-fr`, `proof-fr`. Duplicate the id with `-en` in the English block.

**`data-*` attributes** carry all behavior and layout switching:
| Attribute | Purpose |
|-----------|---------|
| `data-act` | Names a JS action to run on click (40 uses) |
| `data-lang-block` | Marks the `fr` / `en` top-level content blocks (4 uses) |
| `data-cv-panel` | Marks a collapsible resume panel, force-shown on print (18 uses) |
| `data-noprint` | Element hidden by the print stylesheet (7 uses) |
| `data-i` | Index marker on repeated list items (16 uses) |
| `data-grid` | The fixed background grid overlay |

**JS names:**
- Module-level constant maps in SCREAMING_SNAKE: `TITLES`, `PREVENT_DEFAULT`
- Functions and variables in camelCase: `setLang`, `toggle`, `track`, `blocks`, `lang`
- Action keys in the `actions` map are camelCase verbs: `setFr`, `setEn`,
  `trackCalendly`, `trackMailto`, `trackCardIa`, `trackCardTech`, `downloadPdf`

## Code Style

**Formatting:**
- No Prettier, ESLint, EditorConfig, or Biome config. Match surrounding code.
- Indentation: 2 spaces in `<style>`, `<script>`, and JSON-LD; **zero indentation
  for top-level HTML block elements** (`<header>`, `<section>`, `<main>` start at
  column 0), with 2-space indentation for their children
- No trailing whitespace; file ends with a newline
- `index.html` CSS is written **compressed**: one selector per line, declarations
  separated by `;` with no spaces (`body{margin:0;background:var(--paper);...}`)
- `og-image.html` CSS is written **expanded**: one declaration per line with
  `property: value;`. Keep each file in its own style.
- Single quotes in JS, double quotes in HTML attributes

**Linting:**
- None configured. The only automated gate is the GitHub Pages deploy workflow,
  which does not validate anything.

## Styling Approach

`index.html` uses **inline `style` attributes as the primary styling mechanism**
(494 occurrences). The `<style>` head block is reserved for exactly four things:

1. `:root` design tokens
2. Global element resets (`*`, `html`, `body`, `a`, `button`, `table`, headings)
3. `@keyframes heroLine`, `@media (prefers-reduced-motion: reduce)`, `@media print`
4. The `:hover` / `:focus` class rules that inline styles cannot express

When adding an element, put its layout and appearance inline and reference tokens
via `var(--…)`. Add a class only when you need a pseudo-class.

**Responsive values use `clamp()` rather than media queries.** There are no
width breakpoints in `index.html`. Recurring pairs:
- Horizontal page padding: `clamp(24px,3.5vw,48px)`
- Section vertical padding: `clamp(48px,6vw,104px)`
- Container: `max-width:1140px;margin:0 auto`
- Body copy: `clamp(16px,1.1vw,18px)`; eyebrow/mono labels: `clamp(11px,1vw,13px)`
- Transitions: `150ms ease-out`; hero animation: `300ms ease-out` with 80ms stagger

**Typographic system:**
- Mono (`var(--mono)`) for eyebrows, labels, nav, and CTAs — always with
  `letter-spacing:0.04em;text-transform:uppercase;font-weight:500`
- Sans (`var(--sans)`) for headings and body; headings use `font-weight:700/800`
  and `font-stretch:125%` (Archivo is a variable width font)
- Prose blocks are capped with `max-width:68ch`

## Bilingual Content

Both languages ship in the same document. `[data-lang-block="fr"]` and
`[data-lang-block="en"]` are sibling wrappers; the inactive one carries `hidden`.
Any content change must be applied to **both** blocks, including the duplicated
`-fr` / `-en` ids and the `TITLES` map in the script.

## Accessibility Conventions

These are consistently applied and must be preserved:
- A `.skip-link` as the first child of each language block, targeting `#main-{lang}`
- Every `<section>` has `aria-labelledby` pointing at its heading id
- Decorative glyphs and separators carry `aria-hidden="true"`
- Accordion triggers are `<button>` with `aria-expanded` + `aria-controls`; the
  panel is toggled via the `hidden` property, never `display`
- `:focus-visible{outline:2px solid var(--work-blue);outline-offset:2px}` is global
- `prefers-reduced-motion` kills all animation and transition durations
- Non-text visuals use `role="img"` with an `aria-label`

## JavaScript Conventions

All script lives in a single IIFE at `index.html:982`. Rules it follows:

- **ES5 only.** `var`, `function` expressions, no arrow functions, no `const`/`let`,
  no template literals. (`URLSearchParams` and `Element.closest` are the only
  modern APIs used.) Keep it that way — there is no transpiler.
- **No dependencies, no bundler, no `type="module"`.**
- **Event delegation over per-element listeners.** One document-level `click`
  handler resolves `event.target.closest('[data-act]')` and dispatches through the
  `actions` map. Add behavior by adding a key to `actions` plus a `data-act`
  attribute — never by attaching a new listener.
- **`preventDefault` is opt-in** via the `PREVENT_DEFAULT` lookup table, not called
  unconditionally.
- Handlers are invoked as `fn(el, event)`.
- State is a single module-scoped `lang` variable; the DOM is the rest of the state.

## Error Handling

There is no error handling and no `try`/`catch` anywhere. The code defends with
existence checks instead, which is the expected pattern:

```js
var u = window.umami;
if (u && typeof u.track === 'function') u.track(name, data);
```

```js
var fn = actions[act];
if (!fn) return;
var panel = document.getElementById(button.getAttribute('aria-controls'));
if (panel) panel.hidden = !open;
```

Guard-clause early returns; never throw. Optional browser APIs are feature
detected (`if (window.scrollTo)`).

## Logging

No logging framework, no `console` calls in committed source. Analytics is the
only outbound signal: a `track(name, data)` wrapper that no-ops when the Umami
global is absent. Events emitted: `cta_calendly`, `cta_mailto`, `download_pdf`,
`track_card` (with `{ track: 'ia' | 'tech' }`); every event also carries `lang`.

## Comments

- French for authoring notes in the `<head>` (the Umami block at `index.html:71-77`),
  English for inline code comments in the script
- Comment the *why*, not the *what*. Existing examples:
  - `// Deep links: /en/ or ?lang=en open the English block directly.`
  - `// Print the language currently on screen, both accordions expanded.`
  - `/* Aurora background effect */` in `og-image.html`
- No JSDoc/TSDoc anywhere

## Module Design

Single-file delivery is the architecture, not an accident: no imports, no exports,
no external JS or CSS asset. The only network dependency is the Google Fonts
stylesheet, preceded by `preconnect` hints to `fonts.googleapis.com` and
`fonts.gstatic.com`. Preserve the zero-build, zero-dependency property when adding
features.

## SEO and Metadata

Kept in sync manually and easy to break:
- `<title>` must match the corresponding entry in the JS `TITLES` map
- `og:` / `twitter:` description must match `<meta name="description">` in intent
- `hreflang` alternates (`fr`, `en`, `x-default`) plus `<link rel="canonical">`
- JSON-LD `@graph` with a `Person` and a `ProfessionalService` node cross-linked
  by `@id`; update `knowsAbout` when the skills list on the page changes
- `sitemap.xml` and `robots.txt` are hand-maintained

---

*Convention analysis: 2026-08-19*
