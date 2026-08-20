# Requirements: ayoub-hidri.dev — Personal branding site

**Defined:** 2026-08-19
**Core Value:** A PME leader arrives, understands within five seconds what AI can concretely earn them, and books a flash audit — because the visits→Calendly click ratio is the only number that validates the repositioning.

Requirements derive from `specs/experience.md` (structure, intent, reference FR copy) and `specs/design.md` (visual system, components, motion, quality bars). Where a requirement restates a spec rule, the spec is authoritative on detail.

## v1 Requirements

### Page Structure

- [ ] **STRUCT-01**: Visitor sees the eight spec sections in order — hero, preuve, parcours IA, cas concrets, parcours tech, CV compressé, atelier, contact
- [ ] **STRUCT-02**: Visitor is sorted at the hero by two side-by-side routing cards ("Vous dirigez une PME" / "Vous cherchez un ingénieur senior") that anchor-link to §03 and §05
- [ ] **STRUCT-03**: Routing cards stack vertically on mobile without losing the self-selection framing
- [ ] **STRUCT-04**: Anchor navigation scrolls smoothly, and jumps instantly under `prefers-reduced-motion: reduce`
- [ ] **STRUCT-05**: A minimal sticky header exposes the "AH" text logo, reduced nav (IA / Tech / CV / Contact), the FR/EN switch, and the PDF link
- [ ] **STRUCT-06**: Anchors resolve at clean paths — `/#ia`, `/#tech`, `/#cv`, `/#contact`

### PME Track (Parcours IA)

- [ ] **IA-01**: Visitor reads the offer as two steps, not a catalogue — "Audit flash" and "Formation équipes" as two cards
- [ ] **IA-02**: Audit flash card states duration and deliverable in mono metadata (`2-3 JOURS / LIVRABLE : FEUILLE DE ROUTE`)
- [ ] **IA-03**: Formation card states duration and format in mono metadata (`1-2 JOURS / INTRA-ENTREPRISE`)
- [ ] **IA-04**: The training-financing line is either legally accurate for the current Qualiopi/portage status or absent — never a false promise
- [ ] **IA-05**: The section carries the page's single blue CTA, "Réserver un échange de 30 min", linking to Calendly

### Proof

- [ ] **PROOF-01**: Visitor sees client names as styled text, not logo images — Leboncoin, Salomon, Deloitte, Engie Digital, Memo Bank, Technip Energies — separated by vertical rules
- [ ] **PROOF-02**: A mono line summarises reach (`15 ANS / 8 SECTEURS / MISSIONS DE 3 MOIS À 2 ANS`)
- [ ] **PROOF-03**: Visitor reads three case cards in a strict `PROBLÈME` / `SYSTÈME` / `RÉSULTAT` structure, result leading with a large figure
- [ ] **PROOF-04**: Every published figure is verified and attributable — no unverifiable number ships
- [ ] **PROOF-05**: Each case card closes with mono technology tags

### Tech Track (Parcours Tech)

- [ ] **TECH-01**: Visitor reads availability framing — long freelance missions, technical leadership, legacy modernization, remote-first from Strasbourg
- [ ] **TECH-02**: Visitor scans a real HTML stack table of technology and years (React 10+, TypeScript 8+, Next.js 10+, Node.js 12+, NestJS 6+, Strapi 4+, PostgreSQL 10+, AWS 8+)
- [ ] **TECH-03**: A distinct "IA & agents" block bridges the two tracks — agent development, AI workflow orchestration, LLM integration in production
- [ ] **TECH-04**: An open source block links Strapi Stars contributions and published plugins under `opkod-france`
- [ ] **TECH-05**: Secondary CTAs offer "Me contacter" (mailto) and "Télécharger le CV" (PDF)

### CV and Atelier

- [ ] **CV-01**: Visitor expands any of the eight roles in a chronological accordion, closed by default, three bullets maximum per role
- [ ] **CV-02**: Closed accordion rows show role and company left, dates in mono right, with an ASCII `+`/`-` affordance
- [ ] **CV-03**: Education (ESPRIT 2010) and languages (French, English, Arabic) render as one compact line below the accordion
- [ ] **CV-04**: The atelier section stays short — machine embroidery, 3D printing, laser cutting, woodwork, LEGO sorter — closing on the system-building parallel

### Conversion and Measurement

- [ ] **CONV-01**: Analytics is live and cookieless, with no third-party cookies set
- [ ] **CONV-02**: Four events fire reliably — Calendly click, mailto click, PDF download, and hero routing-card click distinguishing track A from track B
- [ ] **CONV-03**: The visits→Calendly click ratio is readable from the analytics dashboard without manual computation
- [ ] **CONV-04**: A bilingual CV PDF exists as a real file, is linked from the header, §05 and §06, and downloads correctly
- [ ] **CONV-05**: Exactly one blue CTA exists on the page; every other action is `--ink` or bordered

### Bilingualism

- [ ] **I18N-01**: FR renders by default; the EN version is a faithful mirror of the same eight sections
- [ ] **I18N-02**: Every URL advertised in `hreflang` and `og:locale:alternate` resolves — `/en/` returns a page, never a 404
- [ ] **I18N-03**: A visitor landing directly on the EN URL sees English without a flash of French
- [ ] **I18N-04**: The language switch preserves the reader's position and is reachable from the sticky header

### Design System

- [ ] **DESIGN-01**: The five tokens (`--paper`, `--ink`, `--ink-60`, `--line`, `--work-blue`) are the only colours used
- [ ] **DESIGN-02**: `--work-blue` covers no more than 5% of any visible screen
- [ ] **DESIGN-03**: No border-radius, box-shadow, gradient, stock image, or UI emoji appears anywhere
- [ ] **DESIGN-04**: The cross-stitch signature appears in exactly its four sanctioned uses — background grid, `✕` section markers, dashed link underlines that solidify to blue on hover, optional pixel avatar
- [ ] **DESIGN-05**: Type follows the scale — Archivo 700–800 extended for display, Archivo 400 body at max 68ch, IBM Plex Mono 12–13px for all metadata
- [ ] **DESIGN-06**: Spacing uses only the 4/8/16/24/40/64/104 scale, with full-width 1px `--ink` rules between sections
- [ ] **DESIGN-07**: `::selection` renders `--work-blue` background with `--paper` text
- [ ] **DESIGN-08**: Motion is limited to 150ms colour and border transitions, plus the optional staggered hero H1 entrance; all transitions drop to zero under reduced-motion

### Accessibility

- [ ] **A11Y-01**: The page exposes one `<h1>`, semantic landmarks, buttons for actions and links for navigation
- [ ] **A11Y-02**: Every interactive element is keyboard reachable with a visible 2px `--work-blue` focus outline at 2px offset
- [ ] **A11Y-03**: A skip-link jumps to main content
- [ ] **A11Y-04**: Lighthouse accessibility scores 100

### Performance

- [ ] **PERF-01**: Archivo and IBM Plex Mono are self-hosted as woff2 variable fonts with `font-display: swap`, with no request to Google Fonts
- [ ] **PERF-02**: Lighthouse performance scores above 95
- [ ] **PERF-03**: Page weight carries no oversized committed assets on the critical path

### SEO

- [ ] **SEO-01**: FR title and meta description state the dual positioning within 150 characters, without empty superlatives
- [ ] **SEO-02**: JSON-LD publishes Person plus ProfessionalService (OPKOD) with `sameAs` to LinkedIn, GitHub and Medium
- [ ] **SEO-03**: `sitemap.xml`, `robots.txt`, canonical and `hreflang` tags agree with each other and with the URLs that actually exist
- [ ] **SEO-04**: The OpenGraph image reflects the v2 positioning

### Delivery

- [ ] **OPS-01**: A pull request runs verification without deploying to production
- [x] **OPS-02**: Only production assets are published — `specs/`, `README.md`, and `.planning/` never ship to the live site
- [ ] **OPS-03**: The v2 rewrite is committed in reviewable increments rather than one undifferentiated change
- [x] **OPS-04**: Deployment to production happens on merge to `main`

## v2 Requirements

Deferred. Tracked but not in the current roadmap.

### Content

- **V2-01**: Client testimonials section between §04 and §05 — ships once two genuine testimonials exist
- **V2-02**: Reordered EN version leading with the tech track rather than a simple mirror
- **V2-03**: Separate `/cv` page if the accordion proves insufficient
- **V2-04**: Fractional CTO retainer offer for the PME track

### Presentation

- **V2-05**: Dark mode
- **V2-06**: Pixelated portrait avatar in the 32×32 embroidery-grid style

## Out of Scope

| Feature | Reason |
|---------|--------|
| Integrated blog | Medium is sufficient for now (`experience.md` §7) |
| Dark mode | Explicitly deferred; `design.md` §2 forbids implementing it half-way |
| Separate `/cv` page | The accordion is the v1 answer |
| Client testimonials | Nothing ships until two genuine testimonials exist |
| Merging the two offers into one positioning | Rejected outright — the split is the positioning |
| Carousels and sliders | `design.md` §1 absolute prohibition |
| Scroll-triggered reveals, parallax, animated counters | `design.md` §7 — motion is functional only |
| Border-radius, box-shadow, gradients, glassmorphism | `design.md` §1 absolute prohibition |
| Stock imagery, generic 3D illustration, UI emoji | `design.md` §1 absolute prohibition |
| Cream background with terracotta accent; black with acid green | Named as AI-generated clichés in `design.md` §1 |
| Heavy CSS framework | `design.md` §8 — custom CSS or purged Tailwind only |
| Third-party cookies | `experience.md` §6 requires cookieless analytics |
| Build step or runtime dependency | The site's simplicity is a credibility signal for a technical audience |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRUCT-01 | Phase 6 | Pending |
| STRUCT-02 | Phase 6 | Pending |
| STRUCT-03 | Phase 6 | Pending |
| STRUCT-04 | Phase 6 | Pending |
| STRUCT-05 | Phase 6 | Pending |
| STRUCT-06 | Phase 6 | Pending |
| IA-01 | Phase 7 | Pending |
| IA-02 | Phase 7 | Pending |
| IA-03 | Phase 7 | Pending |
| IA-04 | Phase 7 | Pending |
| IA-05 | Phase 7 | Pending |
| PROOF-01 | Phase 8 | Pending |
| PROOF-02 | Phase 8 | Pending |
| PROOF-03 | Phase 8 | Pending |
| PROOF-04 | Phase 8 | Pending |
| PROOF-05 | Phase 8 | Pending |
| TECH-01 | Phase 9 | Pending |
| TECH-02 | Phase 9 | Pending |
| TECH-03 | Phase 9 | Pending |
| TECH-04 | Phase 9 | Pending |
| TECH-05 | Phase 9 | Pending |
| CV-01 | Phase 5 | Pending |
| CV-02 | Phase 5 | Pending |
| CV-03 | Phase 5 | Pending |
| CV-04 | Phase 5 | Pending |
| CONV-01 | Phase 2 | Pending |
| CONV-02 | Phase 2 | Pending |
| CONV-03 | Phase 2 | Pending |
| CONV-04 | Phase 5 | Pending |
| CONV-05 | Phase 3 | Pending |
| I18N-01 | Phase 10 | Pending |
| I18N-02 | Phase 10 | Pending |
| I18N-03 | Phase 10 | Pending |
| I18N-04 | Phase 10 | Pending |
| DESIGN-01 | Phase 3 | Pending |
| DESIGN-02 | Phase 3 | Pending |
| DESIGN-03 | Phase 3 | Pending |
| DESIGN-04 | Phase 4 | Pending |
| DESIGN-05 | Phase 4 | Pending |
| DESIGN-06 | Phase 4 | Pending |
| DESIGN-07 | Phase 3 | Pending |
| DESIGN-08 | Phase 4 | Pending |
| A11Y-01 | Phase 11 | Pending |
| A11Y-02 | Phase 11 | Pending |
| A11Y-03 | Phase 11 | Pending |
| A11Y-04 | Phase 11 | Pending |
| PERF-01 | Phase 4 | Pending |
| PERF-02 | Phase 11 | Pending |
| PERF-03 | Phase 11 | Pending |
| SEO-01 | Phase 10 | Pending |
| SEO-02 | Phase 10 | Pending |
| SEO-03 | Phase 10 | Pending |
| SEO-04 | Phase 10 | Pending |
| OPS-01 | Phase 1 | Pending |
| OPS-02 | Phase 1 | Complete |
| OPS-03 | Phase 1 | Pending |
| OPS-04 | Phase 1 | Complete |

**Coverage:**

- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0 ✓

**Per-phase counts:**

| Phase | Requirements |
|-------|--------------|
| 1. Reviewable Baseline and Safe Delivery | 4 |
| 2. Live Conversion Measurement | 3 |
| 3. Colour Discipline and the Prohibitions | 5 |
| 4. Type, Rhythm, Signature and Motion | 5 |
| 5. CV Depth and the Bilingual PDF | 5 |
| 6. Hero Routing and Page Skeleton | 6 |
| 7. PME Track (Parcours IA) | 5 |
| 8. Proof and Verified Case Studies | 5 |
| 9. Tech Track (Parcours Tech) | 5 |
| 10. Bilingual URLs and Discoverability | 8 |
| 11. Accessibility and Performance Bars | 6 |

---
*Requirements defined: 2026-08-19*
*Last updated: 2026-08-19 after roadmap creation*
