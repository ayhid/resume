# Codebase Structure

**Analysis Date:** 2026-08-19

## Directory Layout

```
resume/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deploy on push/PR to main
├── .claude/
│   └── settings.local.json # Local Claude Code permissions (untracked)
├── .planning/              # GSD planning artifacts (this directory)
├── .playwright-mcp/        # Playwright screenshot scratch output (untracked)
├── index.html              # The entire site: markup, inline CSS, inline JS
├── og-image.html           # 1200x630 artboard used to render og-image.png
├── og-image.png            # Social card image referenced by OG/Twitter meta
├── CNAME                   # Custom domain: ayoub-hidri.dev
├── robots.txt              # Allow-all + sitemap pointer
├── sitemap.xml             # Single URL entry
├── README.md               # Project overview, features, analytics notes
└── .gitignore              # OS, editor, node, temp-file ignores
```

There are no source directories, no `package.json`, no dependency manifest and no build output. The repository root *is* the deployment artifact.

## Directory Purposes

**Repository root:**
- Purpose: Everything published to `https://ayoub-hidri.dev/`.
- Contains: The page, the social card and its generator, crawler files, domain config.
- Key files: `index.html`, `og-image.png`, `CNAME`.

**`.github/workflows/`:**
- Purpose: CI/CD.
- Contains: One workflow.
- Key files: `.github/workflows/deploy.yml` — checkout → `configure-pages@v4` → `upload-pages-artifact@v3` with `path: '.'` → `deploy-pages@v4`.

**`.planning/`:**
- Purpose: GSD planning and codebase documents. Not part of the site content.

**`.playwright-mcp/`:**
- Purpose: Scratch output from browser screenshot runs (`og-image.png` capture). Untracked; safe to delete.

**`.claude/`:**
- Purpose: Local agent settings. Untracked.

## Key File Locations

**Entry Points:**
- `index.html`: The whole application. 1054 lines / ~96KB.
- `og-image.html`: Standalone artboard, 304 lines. Dark aurora design with Sora + Plus Jakarta Sans — deliberately different from the site's paper/ink design system.

**Configuration:**
- `CNAME`: Custom domain. Must never be deleted.
- `.github/workflows/deploy.yml`: Deploy pipeline.
- `.gitignore`: macOS, editor, `node_modules/`, temp files.

**Core Logic:**
- `index.html` L78-115: `<style>` block — `:root` tokens, resets, `@keyframes heroLine`, print and reduced-motion media queries, `.link-stitch` / `.link-blue` / `.card-hover` / `.btn-ink` / `.btn-blue` / `.btn-invert` / `.skip-link` states.
- `index.html` L982-1052: the single IIFE controller.

**Content:**
- `index.html` L120-552: French block (`[data-lang-block="fr"]`).
- `index.html` L553-980: English block (`[data-lang-block="en"]`).

**SEO / Metadata:**
- `index.html` L1-30: title, description, canonical, hreflang, OG, Twitter.
- `index.html` L31-70: JSON-LD `@graph` with `Person` (`#person`) and `ProfessionalService` (`#opkod`).
- `sitemap.xml`, `robots.txt`.

**Testing:**
- None. No test files, no test runner, no linter config.

## Section Map (`index.html`)

Each section exists twice. FR ids are bare; EN ids carry an `-en` suffix.

| Section | FR anchor | FR lines | EN anchor | EN lines |
|---------|-----------|----------|-----------|----------|
| Header / nav | — | 123-139 | — | 554-570 |
| Hero | `hero-title-fr` | 143-177 | `hero-title-en` | 574-607 |
| Proof strip | `proof-fr` | 179-194 | `proof-en` | 609-624 |
| AI track | `#ia` | 196-225 | `#ia-en` | 626-655 |
| Case studies | `cases-fr` | 227-303 | `cases-en` | 657-733 |
| Tech track | `#tech` | 305-355 | `#tech-en` | 735-785 |
| Resume / CV | `#cv` | 357-507 | `#cv-en` | 787-937 |
| Atelier | `atelier-fr` | 509-523 | `atelier-en` | 939-953 |
| Contact | `#contact` | 525-536 | `#contact-en` | 955-966 |
| Footer | — | 538-551 | — | 968-979 |

Eight resume accordion entries per locale, in order: `salomon`, `leboncoin`, `deloitte`, `engie`, `isobar`, `cleanio`, `bd`, `dm`.

## Naming Conventions

**Files:**
- Lowercase, hyphenated: `og-image.html`, `deploy.yml`.
- Web-standard names kept verbatim: `CNAME`, `robots.txt`, `sitemap.xml`, `README.md`.

**Element ids:**
- `<purpose>-<locale>`: `hero-title-fr`, `contact-en-title`.
- Accordion panels: `cv-<locale>-<company>`, e.g. `cv-fr-salomon`, `cv-en-isobar`.
- Nav anchors: bare word for FR (`#ia`, `#tech`, `#cv`, `#contact`), `-en` suffix for EN.

**Data attributes:**
- `data-lang-block="fr|en"` — locale wrapper (2 occurrences).
- `data-act="<camelCaseAction>"` — behaviour binding (40 occurrences); values: `setFr`, `setEn`, `toggle`, `trackCalendly`, `trackMailto`, `trackCardIa`, `trackCardTech`, `downloadPdf`.
- `data-cv-panel="true"` — collapsible resume panel, force-shown when printing (18).
- `data-noprint="true"` — chrome excluded from print (7).
- `data-i="<company>"` — accordion identity hook on the button (16).
- `data-grid` — background grid overlay, currently `hidden` (1).

**CSS:**
- Custom properties: `--paper`, `--ink`, `--ink-60`, `--line`, `--work-blue`; spacing scale `--s1`…`--s7`; type `--mono`, `--sans`.
- Utility classes for pseudo-states only: `.link-stitch`, `.link-blue`, `.card-hover`, `.btn-ink`, `.btn-blue`, `.btn-invert`, `.skip-link`.

**JavaScript:**
- `camelCase` functions and variables; `UPPER_SNAKE` for the `TITLES` and `PREVENT_DEFAULT` constant maps.

## Where to Add New Code

**A new page section:**
- Insert into `index.html` inside `[data-lang-block="fr"]` at the right position, then mirror it inside `[data-lang-block="en"]`.
- Give it `id` + `aria-labelledby` with locale suffixes; add the nav link to both headers (`index.html:126` and `index.html:557`).
- Wrap it in the standard shell: `<section style="border-bottom:1px solid var(--ink)">` → inner `div` with `max-width:1140px;margin:0 auto;padding:clamp(64px,7vw,104px) clamp(24px,3.5vw,48px)`.

**A new resume entry:**
- Add a `<div style="border-top:1px solid var(--line)">` wrapper containing a `button[data-i][data-act="toggle"][aria-expanded="false"][aria-controls]` and a `div[id][data-cv-panel="true"][hidden]` in both CV sections (`index.html:363` and `index.html:793`).

**New behaviour:**
- Add a `data-act="name"` attribute in markup and a matching entry in the `actions` object (`index.html:1023-1032`). Add the key to `PREVENT_DEFAULT` (`index.html:1031`) only if the element is a link whose navigation should be suppressed.

**A new analytics event:**
- Call the existing `track(name, data)` helper (`index.html:994`) from an action; include `lang: lang` in the payload, matching the existing four events. Document it in `README.md`.

**Style changes:**
- Colour, spacing or type: edit `:root` (`index.html:79-84`).
- Hover, focus or other pseudo-state: add a class rule in the `<style>` block (`index.html:110-115`) — inline styles cannot express these.
- Everything else: inline `style` on the element, using `var(--…)`.

**Metadata changes:**
- Title/description: update the head (`index.html:6-7`) *and* the `TITLES` map (`index.html:984-987`), which overrides `document.title` on language switch.
- Structured data: `index.html:31-70`.
- New URL: add to `sitemap.xml` and bump `lastmod`.

**Social card changes:**
- Edit `og-image.html`, screenshot at exactly 1200×630, overwrite `og-image.png` at the repo root.

## Special Directories

**`.playwright-mcp/`:**
- Purpose: Screenshot scratch output.
- Generated: Yes.
- Committed: No (currently untracked, not in `.gitignore`).

**`.claude/`:**
- Purpose: Local Claude Code settings.
- Generated: Yes.
- Committed: No (currently untracked, not in `.gitignore`).

**`.planning/`:**
- Purpose: GSD artifacts.
- Generated: Yes.
- Committed: Project-dependent. Note that `upload-pages-artifact` publishes `path: '.'`, so anything committed here is served publicly.

**`.github/workflows/`:**
- Purpose: CI.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-08-19*
