# Walking Skeleton — ayoub-hidri.dev

**Phase:** 1
**Generated:** 2026-08-19

> This project has no application stack to scaffold — it is one HTML file with no build step, and
> the page already exists. The Walking Skeleton here is therefore not an app scaffold but the
> thinnest end-to-end **delivery** path: a change is committed, a pull request runs verification
> and publishes nothing, a push to `main` publishes, and the live domain serves the new artifact
> and nothing else. Every later phase edits content that rides this path, so this is the
> architecture the rest of the project inherits.

## Capability Proven End-to-End

A change committed on `main` travels through a verification job, an allowlisted staging step, an
uploaded artifact and a Pages deployment, and appears at `https://ayoub-hidri.dev/` — while every
file outside the production manifest returns 404.

The tracer that proves it (plan `01-01`, Task 3) uses the pipeline itself as its payload: the
first change to travel the path is the path.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Publishing source | GitHub Pages `build_type: workflow` (Actions), switched from `legacy` | The legacy branch builder publishes the whole `main` root and never reads `deploy.yml`. No artifact-scoping decision has any effect until this is switched, and `actions/configure-pages` cannot switch it. |
| Artifact boundary | Allowlist copy into `_site/` via `.github/scripts/stage-site.sh` (D-05) | Default-deny. Anything new must be added deliberately; nothing leaks by omission. Denylisting would have missed `specs/`, `README.md` and `og-image.html`, none of which is dot-prefixed. |
| Production manifest | `index.html`, `CNAME`, `robots.txt`, `sitemap.xml`, `og-image.png`, plus `en/` when present (D-06, D-07) | `og-image.html` is a dev-only artboard and is deliberately absent. `en/` is optional so Phase 10 can add the English route without editing `deploy.yml`. |
| Job graph | One workflow, two jobs: `verify` on `push` and `pull_request`, `deploy` on `push` to `main` only, chained with `needs: verify` (D-08) | The trigger gate is the intent; chaining means a manifest regression can never publish. Resolves the research's open question in favour of chaining. |
| Privilege model | `permissions: {}` at workflow level; `contents: read` on verify; `contents: read` plus `pages: write` plus `id-token: write` on deploy | A pull-request run must not hold publishing privilege even if the trigger gate were mis-edited. |
| Concurrency model | Job-level only: verify uses a cancellable ref-keyed group, deploy alone uses `"pages"` with `cancel-in-progress: false` | A pull request must never queue behind or cancel a production publish, and a publish must never be interrupted mid-flight. |
| Verification | `python3 .github/scripts/verify_site.py` — standard library only | The project's credibility signal is "no build step, no runtime dependency". `xmllint` and `tidy` are absent from `ubuntu-latest`, and an npm dev-dependency would contradict the constraint in the very phase meant to make delivery boring. |
| Custom domain binding | Repository Pages settings (`cname: ayoub-hidri.dev`) | Under a workflow publishing source GitHub creates no `CNAME` file and ignores any existing one. The file is retained in the manifest per D-06 as belt-and-braces, not as the binding. |
| Repository layout | Flat root, unchanged; `.github/scripts/` is the only new directory | Opening `index.html` from disk stays the entire dev loop. `.github/` is excluded from the artifact unconditionally by `upload-pages-artifact`, so the scripts can never ship. |
| History shape | Rewrite sliced by concern into six commits landing directly on `main` (D-01, D-03) | Readability of the series over per-commit renderability (D-02). Reconstructed from a snapshot branch by absolute line range, so the final state is provably byte-identical. |

## Stack Touched in Phase 1

- [x] Control plane — Pages publishing source switched to Actions, custom domain and TLS asserted intact
- [x] CI job graph — two jobs, event-gated, least-privilege, job-scoped concurrency
- [x] Staging — the allowlist script, runnable locally with the identical command CI uses
- [x] Verification — manifest presence and absence, HTML tag balance, duplicate `id`, sitemap well-formedness, heading warning
- [x] Artifact and deployment — `upload-pages-artifact` on `_site`, `deploy-pages` in a dedicated job
- [x] Live domain — the status matrix flips from two leaked 200s to two 404s, and the served page becomes v2
- [x] History — the rewrite exists as six readable commits with a clean working tree

## Out of Scope (Deferred to Later Slices)

Explicit, so later phases do not re-litigate Phase 1's minimalism:

- **Analytics.** The commented Umami stub and its two bracketed placeholders ship verbatim; wiring them is Phase 2.
- **Design system.** Colour discipline, the prohibitions, type, rhythm, signature and motion are Phases 3 and 4. The verification script deliberately enforces no design rule.
- **Lighthouse budgets and link checking in CI.** Phase 11. Adding them to the pull-request job now would make the gate slow and noisy before it has earned trust.
- **The single-`<h1>` assertion.** Both the previous page and the rewrite carry two `<h1>` elements, one per language block. It is a warning here; A11Y-01 in Phase 11 owns tightening it.
- **The `/en/` route.** `en/` is an optional manifest entry that does not yet exist. Phase 10 creates it.
- **Action version bumps.** The current pins have nineteen green runs; cross-major artifact compatibility is undocumented. A bump is its own commit with its own deploy to observe.
- **Branch protection on `main`.** D-03 pushes directly; enforcement is by convention here.
- **The Mixpanel token in public git history** (commit `0650811`). Deferred by developer decision, tracked as an accepted risk in every plan's threat model and in `.planning/STATE.md`.
- **Refactoring the rewrite.** Promoting repeated inline styles into classes and de-duplicating the FR/EN trees is real debt and a phase of its own; this phase commits the rewrite as written.

## Subsequent Slice Plan

Each later phase adds one vertical slice of visitor-facing capability on top of this delivery
skeleton without altering its architectural decisions:

- Phase 2: the visits→Calendly ratio is readable on a cookieless dashboard
- Phase 3: the page uses five colours and one blue CTA
- Phase 4: self-hosted type, the spacing scale, the cross-stitch signature, 150 ms motion
- Phase 5: the eight-role CV accordion and a real downloadable bilingual PDF
- Phase 6: hero routing cards, eight sections, sticky header, working anchors
- Phases 7–9: the PME track, the proof section, the tech track (parallel)
- Phase 10: `/en/` resolves and every metadata claim agrees with reality
- Phase 11: Lighthouse 100 accessibility, above 95 performance, full keyboard path

The one architectural decision a later phase will touch: Phase 10 adds `en/` to the repository,
which the manifest already accommodates as an optional entry (D-07) — no change to
`deploy.yml` is required.
