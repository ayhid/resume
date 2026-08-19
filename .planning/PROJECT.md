# ayoub-hidri.dev — Personal branding site

## What This Is

A single-page bilingual (FR/EN) personal branding site for Ayoub Hidri, deployed on GitHub Pages at https://ayoub-hidri.dev/. It replaces an online CV with a page that sorts two distinct audiences at the hero and routes each to its own offer: PME leaders looking for AI and automation help, and technical decision-makers looking for a senior freelance engineer.

The split between the two offers is not a compromise to be resolved — the split *is* the positioning.

## Core Value

A PME leader arrives, understands within five seconds what AI can concretely earn them, and books a flash audit — because the visits→Calendly click ratio is the only number that validates the repositioning.

## Business Context

- **Customer**: Two segments, deliberately unmerged — (A) PME leaders, 10–50 employees, no CTO; (B) CTO/DSI/ESN/scale-up hiring senior freelance engineering
- **Revenue model**: (A) paid flash audit 2–3 days → team training → optional implementation; (B) day-rate freelance delivery. Track B is the proven revenue today; track A is the growth bet
- **Success metric**: visits → Calendly click ratio (`experience.md` §6)
- **Strategy notes**: `specs/experience.md` (experience + content), `specs/design.md` (visual direction)

## Requirements

### Validated

<!-- Present in the working tree, verified by reading index.html. Not yet committed. -->

- ✓ Single-page, no build step, no runtime dependency — existing
- ✓ Bilingual FR/EN content in one file, toggled client-side — existing
- ✓ All 8 spec sections built in both languages (hero, preuve, parcours IA, cas concrets, parcours tech, CV, atelier, contact) — existing
- ✓ Two-card audience routing in the hero, anchor-linked to §03 and §05 — existing
- ✓ Brutalist design tokens: `--paper`, `--ink`, `--ink-60`, `--line`, `--work-blue`; no radius, no shadow — existing
- ✓ Sticky minimal header with FR/EN switch and reduced nav — existing
- ✓ Collapsible chronological CV accordion (8 roles) — existing
- ✓ Calendly and mailto CTAs wired, print stylesheet present — existing
- ✓ Structured data (Person + ProfessionalService), OpenGraph, hreflang tags — existing
- ✓ `prefers-reduced-motion` honoured — existing

### Active

- [ ] Enable analytics so the KPI is measurable — Umami is commented out with unreplaced `[UMAMI_HOST]` / `[UMAMI_WEBSITE_ID]` placeholders; without it the one validating metric cannot be read
- [ ] Produce the bilingual CV PDF — no `.pdf` exists in the repo, yet §05 and §06 both promise it and `download_pdf` fires against it
- [ ] Resolve the `/en/` 404 — `hreflang`, `og:locale:alternate`, and both footer links point at `/en/`, which does not exist; language is client-side only
- [ ] Self-host Archivo and IBM Plex Mono as woff2 — currently loaded from the Google Fonts CDN, against `design.md` §8
- [ ] Replace placeholder case-study figures with verified numbers — `experience.md` §04 forbids publishing any unverifiable figure
- [ ] Harden the deploy pipeline — `deploy.yml` deploys live on `pull_request` with no verification steps, and uploads `path: '.'`, shipping `specs/`, `README.md`, and `.planning/` to production
- [ ] Validate the training-financing line legally before publishing — wording depends on Qualiopi/portage status; `experience.md` §03 says promise nothing false
- [ ] Commit the v2 rewrite — ~1000 insertions / ~1660 deletions currently sit uncommitted in the working tree

### Out of Scope

- Integrated blog — Medium is sufficient for now (`experience.md` §7)
- Dark mode — explicitly deferred; `design.md` §2 says do not implement it half-way
- Separate `/cv` page — the accordion is the v1 answer; revisit in v2 if it proves insufficient
- Client testimonials — the section is designed and slotted between §04 and §05, but nothing ships until two genuine testimonials exist
- Reordered EN version — v1 ships a simple EN mirror; reordering the tech track first is a v2 decision (`experience.md` §4)
- Fractional CTO retainers — a plausible evolution of the PME track, but not the promise on the page today
- Merging the two offers into one generic positioning — rejected outright; the split is the positioning
- Carousels, sliders, scroll-triggered reveals, parallax, animated counters, stock imagery, emoji in UI, border-radius, box-shadow, gradients — forbidden by `design.md` §1 and §7

## Context

**Technical environment.** One `index.html` (~96 KB) holds the entire site: inline `<style>` with design tokens in `:root`, inline vanilla JS for the language toggle, accordions and analytics events. No build step, no package manifest, no dependencies. Deployed by `.github/workflows/deploy.yml` to GitHub Pages, custom domain via `CNAME`. Supporting files: `og-image.html` (generator source), `og-image.png` (660 KB, committed), `robots.txt`, `sitemap.xml`.

**Prior work.** The v2 rewrite is already largely implemented but uncommitted. A codebase map exists at `.planning/codebase/` (7 documents, commit `52ac455`).

**Specs are authoritative.** `specs/experience.md` defines the section order, intent, and reference FR copy for sections 01–08. `specs/design.md` defines the palette, type scale, the cross-stitch visual signature, component rules, and motion limits. Both were written before this planning pass and should be followed as written.

**Known issues to address.** Documented in `.planning/codebase/CONCERNS.md`. The most consequential: the analytics gap (KPI unmeasurable), the missing PDF, the `/en/` broken canonical, and the PR-triggered production deploy.

**Editorial tone.** Short sentences, active voice, first person. Numbers instead of adjectives — "12 h/mois récupérées", never "gain de productivité significatif". No marketing jargon.

## Constraints

- **Tech stack**: One HTML file, no build step, no runtime dependency — the site's simplicity is a deliberate feature and a credibility signal for a technical audience
- **Design**: No border-radius, no box-shadow, no gradient, no stock imagery, no emoji in UI — `design.md` §1 lists these as absolute prohibitions
- **Design**: `--work-blue` (`#2B44D8`) never exceeds 5% of visible screen area, and exactly one blue CTA exists on the page (the Calendly button in §03)
- **Motion**: 150 ms transitions on colour and border only; the sole permitted exception is a staggered hero H1 entrance
- **Performance**: Lighthouse targets — 100 accessibility, >95 performance; fonts self-hosted woff2 with `font-display: swap`
- **Accessibility**: Single `<h1>`, semantic landmarks, full keyboard navigation, visible focus outlines, skip-link
- **Content integrity**: Never publish an unverifiable figure, and never promise training financing that the current Qualiopi/portage status does not support
- **Language**: FR is the default — the AI offer targets French PMEs; EN ships as a simple mirror in v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep the two offers strictly separate rather than one generic positioning | The two audiences need different proof; merging them would dilute both. The split is the positioning | — Pending |
| Explicit hero routing cards instead of a passive "scroll deeper" layering or an audience toggle | One URL and one page to maintain in FR and EN; a link forwarded from a dirigeant to their tech advisor still shows both tracks | — Pending |
| Calendly is the primary conversion; the PDF is audience B's secondary action | Initially the PDF was named as the win, but `experience.md` §6 makes the visits→Calendly ratio the only validating KPI. The spec governs | — Pending |
| Brutalist direction — visible structure, no decoration | The page should look like what Ayoub is: an engineer who builds systems, not an agency selling dreams | — Pending |
| Single blue accent (`--work-blue`), reserved for one CTA | Workshop-jacket blue links the maker side to the serious side; scarcity is what makes it function as a signal | — Pending |
| Ship EN as a simple mirror in v1, defer reordering to v2 | Reordering the tech track first for EN is a real improvement but not worth blocking v1 | — Pending |
| Specs live in `specs/` and are versioned with the code | They were authored outside the repo; committing them makes them readable by planning agents and reviewable in diffs | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-19 after initialization*
