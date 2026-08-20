# Roadmap: ayoub-hidri.dev — Personal branding site

## Overview

The v2 page is already largely built and sitting uncommitted in the working tree, so this roadmap is mostly about making that work shippable, measurable and true — not about writing it from nothing. It starts by putting the rewrite into git as reviewable commits and closing the pipeline that currently deploys to production from a pull request, because nothing downstream can be verified until shipping is safe. Analytics comes next: the visits→Calendly ratio is the only number that validates the repositioning, and today it cannot be read at all. With delivery and measurement in place, the design system is consolidated first — colour discipline, then type, rhythm, signature and self-hosted fonts — so the section work that follows edits a settled component vocabulary instead of 494 loose inline styles. Then each spec section is verified and corrected against `specs/experience.md`: the CV and its missing PDF, the hero routing skeleton, the PME track, the case-study proof, the tech track. The last two phases close the two gaps a crawler and a keyboard user would hit — the `/en/` 404 with its dependent SEO metadata, and the Lighthouse bars.

**Parallelization:** Phases 7, 8 and 9 (PME track, proof, tech track) touch disjoint sections and can run concurrently once Phase 6 lands the skeleton.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Reviewable Baseline and Safe Delivery** - Commit the v2 rewrite in readable increments and stop pull requests from deploying to production
- [ ] **Phase 2: Live Conversion Measurement** - Make the visits→Calendly ratio readable on a cookieless dashboard
- [ ] **Phase 3: Colour Discipline and the Prohibitions** - Five tokens, one blue CTA, zero radius/shadow/gradient
- [ ] **Phase 4: Type, Rhythm, Signature and Motion** - Self-hosted variable fonts, the spacing scale, the cross-stitch signature, 150ms motion
- [ ] **Phase 5: CV Depth and the Bilingual PDF** - The eight-role accordion, the atelier note, and a real downloadable PDF
- [ ] **Phase 6: Hero Routing and Page Skeleton** - Eight sections in order, two routing cards, a sticky header, clean anchors
- [ ] **Phase 7: PME Track (Parcours IA)** - Two offer steps, honest financing wording, the page's single blue CTA
- [ ] **Phase 8: Proof and Verified Case Studies** - Client names as text, three case cards, no unverifiable figure
- [ ] **Phase 9: Tech Track (Parcours Tech)** - Availability, the stack table, the IA & agents bridge, open source
- [ ] **Phase 10: Bilingual URLs and Discoverability** - `/en/` resolves, and every metadata claim agrees with reality
- [ ] **Phase 11: Accessibility and Performance Bars** - Lighthouse 100 accessibility, above 95 performance, full keyboard path

## Phase Details

### Phase 1: Reviewable Baseline and Safe Delivery

**Goal**: The v2 rewrite lives in git history as scoped, readable commits, and the site can only reach production through a merge to `main`
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04
**Success Criteria** (what must be TRUE):

  1. `git log` shows the v2 rewrite as a series of scoped commits that can each be read on their own, and the working tree is clean.
  2. Opening a pull request runs verification and reports pass or fail without publishing anything to the live site.
  3. Merging to `main` publishes the site, and what is served contains only production assets — `specs/`, `README.md`, `.planning/` and tool directories are absent.
  4. A visitor loading https://ayoub-hidri.dev/ sees the v2 page rather than the v1 online CV.

**Plans:** 1/5 plans executed

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Switch the Pages publishing source to Actions and prove the delivery path end-to-end with an allowlisted artifact

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Add the stdlib-only artifact checker to both jobs and fix repo hygiene

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03-PLAN.md — Slice the v2 rewrite into six scoped commits, provably byte-identical to the working tree

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 01-04-PLAN.md — Correct the stale architectural constraints, then push once and land v2 in production

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 01-05-PLAN.md — Prove the pull-request gate verifies and publishes nothing, then close the phase

### Phase 2: Live Conversion Measurement

**Goal**: The visits→Calendly ratio — the only number that validates the repositioning — is readable on a dashboard without hand computation
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CONV-01, CONV-02, CONV-03
**Success Criteria** (what must be TRUE):

  1. Loading the page records a pageview in the analytics dashboard, and the browser stores no third-party cookie.
  2. Four distinguishable events fire and appear in the dashboard — Calendly click, mailto click, PDF download, and hero routing-card click separating track A from track B.
  3. The visits→Calendly click ratio can be read off the dashboard directly, with no export and no manual arithmetic.

**Plans**: TBD

### Phase 3: Colour Discipline and the Prohibitions

**Goal**: The page uses five colours and nothing else, and blue reads as a signal rather than decoration
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-07, CONV-05
**Success Criteria** (what must be TRUE):

  1. Every colour rendered on screen resolves to `--paper`, `--ink`, `--ink-60`, `--line` or `--work-blue`; no hardcoded value bypasses the tokens.
  2. Exactly one blue CTA exists on the page — the Calendly button in §03 — and every other action renders `--ink` filled or bordered.
  3. On any viewport, blue covers no more than 5% of the visible screen.
  4. No border-radius, box-shadow, gradient, stock image or UI emoji appears anywhere on the page.
  5. Selecting text shows a `--work-blue` background with `--paper` text.

**Plans**: TBD
**UI hint**: yes

### Phase 4: Type, Rhythm, Signature and Motion

**Goal**: The page reads as a well-composed technical document — self-hosted type, a fixed spacing scale, the cross-stitch signature, and motion that never distracts
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-08, PERF-01
**Success Criteria** (what must be TRUE):

  1. Archivo and IBM Plex Mono load from the site's own origin as woff2 variable fonts with `font-display: swap`; the network panel shows no request to Google Fonts.
  2. Display type renders Archivo 700–800 at extended width, body copy stays within 68ch, and every date, tag, eyebrow and key figure is IBM Plex Mono at 12–13px.
  3. The cross-stitch signature appears in exactly its four sanctioned uses — background grid, `✕` section markers, dashed underlines that solidify to blue on hover, optional pixel avatar — and nowhere else.
  4. Sections are separated by full-width 1px `--ink` rules, and every spacing value falls on the 4/8/16/24/40/64/104 scale.
  5. Colour and border transitions last 150ms, the staggered hero H1 entrance is the only other motion, and all of it drops to zero under `prefers-reduced-motion: reduce`.

**Plans**: TBD
**UI hint**: yes

### Phase 5: CV Depth and the Bilingual PDF

**Goal**: A reader can scan fifteen years in place or leave with a real PDF file — the artifact the header and both CTAs will advertise
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: CV-01, CV-02, CV-03, CV-04, CONV-04
**Success Criteria** (what must be TRUE):

  1. Eight roles are listed closed by default; opening one reveals at most three bullets, and the closed row shows role and company left, mono dates right, with a `+` that becomes `-`.
  2. Education (ESPRIT 2010) and languages (French, English, Arabic) read as one compact line beneath the accordion.
  3. The atelier section stays to a few lines — machine embroidery, 3D printing, laser cutting, woodwork, the LEGO sorter — closing on the system-building parallel.
  4. Clicking the CV link downloads a real bilingual PDF file that opens correctly, instead of triggering the browser print dialog.

**Plans**: TBD
**UI hint**: yes

### Phase 6: Hero Routing and Page Skeleton

**Goal**: A visitor is sorted into their own track within five seconds and can reach any of the eight sections from anywhere on the page
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: STRUCT-01, STRUCT-02, STRUCT-03, STRUCT-04, STRUCT-05, STRUCT-06
**Success Criteria** (what must be TRUE):

  1. Scrolling passes the eight sections in spec order — hero, preuve, parcours IA, cas concrets, parcours tech, CV compressé, atelier, contact.
  2. Two side-by-side routing cards in the hero name the two audiences and jump to §03 and §05; on a phone they stack without losing the self-selection framing.
  3. Anchor navigation scrolls smoothly, and jumps instantly under `prefers-reduced-motion: reduce`.
  4. The sticky header exposes the "AH" logo, the IA / Tech / CV / Contact nav, the FR/EN switch and the PDF link at every scroll position.
  5. Pasting `/#ia`, `/#tech`, `/#cv` or `/#contact` into a fresh tab lands on the matching section.

**Plans**: TBD
**UI hint**: yes

### Phase 7: PME Track (Parcours IA)

**Goal**: A PME leader reads the offer as two simple steps and books a thirty-minute call
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: IA-01, IA-02, IA-03, IA-04, IA-05
**Success Criteria** (what must be TRUE):

  1. The section presents exactly two offer cards — Audit flash and Formation équipes — read as a path, not a service catalogue.
  2. Each card states its terms in mono metadata: `2-3 JOURS / LIVRABLE : FEUILLE DE ROUTE` and `1-2 JOURS / INTRA-ENTREPRISE`.
  3. The training-financing line either states something legally true for the current Qualiopi/portage status, or is absent from the page entirely.
  4. The page's single blue CTA, "Réserver un échange de 30 min", sits in this section and opens Calendly.

**Plans**: TBD
**UI hint**: yes

### Phase 8: Proof and Verified Case Studies

**Goal**: Doubt is disarmed before the offer is judged, using only figures that can be defended out loud
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: PROOF-01, PROOF-02, PROOF-03, PROOF-04, PROOF-05
**Success Criteria** (what must be TRUE):

  1. Client names render as styled text separated by vertical rules — Leboncoin, Salomon, Deloitte, Engie Digital, Memo Bank, Technip Energies — with no logo images.
  2. A mono line beneath them reads `15 ANS / 8 SECTEURS / MISSIONS DE 3 MOIS À 2 ANS`.
  3. Three case cards follow the identical `PROBLÈME` / `SYSTÈME` / `RÉSULTAT` structure, each result leading with a large figure and closing with mono technology tags.
  4. Every figure on the page traces to a source Ayoub can defend; any number that could not be verified was removed rather than softened.

**Plans**: TBD
**UI hint**: yes

### Phase 9: Tech Track (Parcours Tech)

**Goal**: A CTO or DSI confirms seniority, stack and availability in a twenty-second scan
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: TECH-01, TECH-02, TECH-03, TECH-04, TECH-05
**Success Criteria** (what must be TRUE):

  1. The section states availability plainly — long freelance missions, technical leadership, legacy modernization, remote-first from Strasbourg.
  2. A real HTML table lists technology against years, from React 10+ through AWS 8+.
  3. A distinct "IA & agents" block bridges the two tracks with agent development, AI workflow orchestration and LLM integration in production.
  4. An open source block links Strapi Stars contributions and the plugins published under `opkod-france`.
  5. Secondary CTAs offer "Me contacter" (mailto) and "Télécharger le CV" (the real PDF), neither of them blue.

**Plans**: TBD
**UI hint**: yes

### Phase 10: Bilingual URLs and Discoverability

**Goal**: Every URL and every metadata claim the page makes resolves to the content a crawler, a shared link, or a no-JS visitor expects
**Mode:** mvp
**Depends on**: Phases 7, 8, 9
**Requirements**: I18N-01, I18N-02, I18N-03, I18N-04, SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):

  1. `https://ayoub-hidri.dev/en/` returns a page — never a 404 — for a crawler, a shared link, or a visitor with JavaScript disabled.
  2. Landing directly on the EN URL shows English immediately, with no flash of French, and the EN page mirrors the same eight sections as FR.
  3. Switching language from the sticky header keeps the reader's position and produces a URL that can be copied and reshared.
  4. The FR title and meta description state the dual positioning in under 150 characters without empty superlatives, and JSON-LD publishes Person plus ProfessionalService with `sameAs` to LinkedIn, GitHub and Medium.
  5. `sitemap.xml`, `robots.txt`, canonical, `hreflang` and the OpenGraph image all agree with each other and with the URLs that actually exist.

**Plans**: TBD
**UI hint**: yes

### Phase 11: Accessibility and Performance Bars

**Goal**: The deployed page passes its own quality bars on a cold load, for keyboard and screen-reader users as much as for a fast connection
**Mode:** mvp
**Depends on**: Phase 10
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):

  1. Lighthouse reports 100 accessibility and above 95 performance against the deployed page.
  2. Tabbing reaches every interactive element in reading order with a visible 2px `--work-blue` outline at 2px offset, and the first tab stop is a skip-link to main content.
  3. The rendered document exposes exactly one `<h1>`, semantic landmarks, buttons for actions and links for navigation, in whichever language is active.
  4. No oversized asset sits on the critical path — the OpenGraph image and any committed media load fast enough for a link unfurler.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11
Phases 7, 8 and 9 may run in parallel once Phase 6 is complete.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Reviewable Baseline and Safe Delivery | 1/5 | In Progress|  |
| 2. Live Conversion Measurement | 0/TBD | Not started | - |
| 3. Colour Discipline and the Prohibitions | 0/TBD | Not started | - |
| 4. Type, Rhythm, Signature and Motion | 0/TBD | Not started | - |
| 5. CV Depth and the Bilingual PDF | 0/TBD | Not started | - |
| 6. Hero Routing and Page Skeleton | 0/TBD | Not started | - |
| 7. PME Track (Parcours IA) | 0/TBD | Not started | - |
| 8. Proof and Verified Case Studies | 0/TBD | Not started | - |
| 9. Tech Track (Parcours Tech) | 0/TBD | Not started | - |
| 10. Bilingual URLs and Discoverability | 0/TBD | Not started | - |
| 11. Accessibility and Performance Bars | 0/TBD | Not started | - |

## Coverage

All 57 v1 requirements are mapped to exactly one phase. Full mapping lives in the
Traceability table of `.planning/REQUIREMENTS.md`.

| Category | Requirements | Phase |
|----------|--------------|-------|
| Delivery | OPS-01 … OPS-04 | 1 |
| Conversion (measurement) | CONV-01, CONV-02, CONV-03 | 2 |
| Conversion (blue CTA rule) | CONV-05 | 3 |
| Conversion (PDF artifact) | CONV-04 | 5 |
| Design (colour) | DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-07 | 3 |
| Design (type, rhythm, signature, motion) | DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-08 | 4 |
| Performance (self-hosted fonts) | PERF-01 | 4 |
| Performance (budgets) | PERF-02, PERF-03 | 11 |
| CV and Atelier | CV-01 … CV-04 | 5 |
| Page Structure | STRUCT-01 … STRUCT-06 | 6 |
| PME Track | IA-01 … IA-05 | 7 |
| Proof | PROOF-01 … PROOF-05 | 8 |
| Tech Track | TECH-01 … TECH-05 | 9 |
| Bilingualism | I18N-01 … I18N-04 | 10 |
| SEO | SEO-01 … SEO-04 | 10 |
| Accessibility | A11Y-01 … A11Y-04 | 11 |

---
*Roadmap created: 2026-08-19*
