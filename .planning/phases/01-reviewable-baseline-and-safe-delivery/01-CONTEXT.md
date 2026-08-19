# Phase 1: Reviewable Baseline and Safe Delivery - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

The uncommitted v2 rewrite (`index.html` ~1036 insertions / 1662 deletions, plus `README.md`) enters git history as a series of scoped, individually readable commits, and the GitHub Pages pipeline is made safe: a pull request runs verification without publishing, a merge/push to `main` publishes, and the published artifact contains production assets only.

Covers OPS-01, OPS-02, OPS-03, OPS-04. Does not cover analytics wiring (Phase 2), colour/design work (Phase 3+), the `/en/` route (Phase 10), or Lighthouse budgets (Phase 11).

</domain>

<decisions>
## Implementation Decisions

### Commit slicing

- **D-01:** Slice the v2 rewrite **by concern, in dependency order** — roughly: head/SEO + JSON-LD, design tokens and the `<style>` block, FR content tree, EN mirror, JS controller, README. Each commit touches a distinct region of the single file so diffs stay local and reviewable despite the monolith.
- **D-02:** **Intermediate commits may render imperfectly.** Only the final commit of the series must leave the page correct. Readability of the series wins over per-commit renderability.
- **D-03:** The commit series lands **directly on `main`** — no feature branch for the rewrite itself. — **Reversibility:** costly — once pushed, rewriting the series means a force-push to a public deployed branch.
- **D-04:** **Ordering is mandatory: the deploy workflow change is the first commit**, before any rewrite commit. Every push to `main` deploys, so until the allowlist exists an intermediate push would publish `specs/`, `README.md` and `.planning/` to the live domain.

### Deploy pipeline and artifact

- **D-05:** Limit the artifact with an **allowlist copy into `_site/`**: a CI step copies the named production files into `_site/`, and `upload-pages-artifact` uploads that directory instead of `.`. Anything new must be added deliberately — nothing leaks by default. The repo root stays flat, so opening `index.html` from disk remains the dev loop.
- **D-06:** Production manifest: `index.html`, `CNAME`, `robots.txt`, `sitemap.xml`, `og-image.png`, and `en/` (reserved for Phase 10). **`og-image.html` is excluded** — it is a dev-only artboard and should not be reachable at `/og-image.html`.
- **D-07:** The copy step **tolerates missing entries** (copy `en/` if present, skip silently otherwise), so Phase 10 can add `/en/` without editing `deploy.yml`.
- **D-08:** Split the workflow into a `pull_request` **verify-only** job and a `push`-to-`main` **deploy** job. The deploy job must not be reachable from a `pull_request` trigger.
- **D-09:** Prove criterion 2 with **one throwaway pull request** after the workflow change is on `main` — a trivial change (e.g. a README typo), confirming the check reports pass/fail and no deployment fires. Merge or close it afterwards.

### Repo hygiene

- **D-10:** Fix `.gitignore`: split the malformed final line (`*.temp.claude/settings.local.json` is currently one concatenated pattern), and add `.claude/settings.local.json` and `.playwright-mcp/`.
- **D-11:** Leave `.playwright-mcp/og-image.png` on disk, untracked and ignored. Root `og-image.png` remains the real asset.

### Claude's Discretion

- **PR verification content** (not discussed; scoped by Claude): keep it minimal — an artifact manifest check (every allowlisted file present in `_site/`; `specs/`, `.planning/`, `README.md`, `.github/`, `og-image.html` absent) plus an HTML parse of `index.html`. Link checking and Lighthouse are explicitly out of scope here; Lighthouse budgets belong to Phase 11.
- Exact commit boundaries and messages within D-01's concern ordering.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §"Phase 1: Reviewable Baseline and Safe Delivery" — goal and the four success criteria
- `.planning/REQUIREMENTS.md` — OPS-01 through OPS-04 (lines 98-101) and the traceability table

### Project constraints
- `.claude/CLAUDE.md` — no build step, flat root, one HTML file; the "whole-repo deploy" and "custom domain" architectural constraints this phase changes
- `specs/design.md` — design prohibitions (not exercised in this phase, but the rewrite being committed must not be edited to violate them)
- `specs/experience.md` — the experience spec the v2 rewrite implements

### Current state
- `.github/workflows/deploy.yml` — the file this phase rewrites; currently `path: '.'` with both `push` and `pull_request` triggers feeding one deploy job
- `.planning/codebase/CONCERNS.md` §"Uncommitted rewrite in working tree", §"Untracked directories not ignored", §"No build tooling, linting, or formatting" — the concerns this phase closes
- `.gitignore` — malformed final line

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.github/workflows/deploy.yml` — the existing job structure (checkout → configure-pages → upload-pages-artifact → deploy-pages) is kept; only the trigger gating and the artifact path change.
- `CNAME` (`ayoub-hidri.dev`) — must appear in the allowlist or the custom domain breaks on the next deploy.

### Established Patterns
- Single-file site: `index.html` holds head, JSON-LD, one `<style>` block (L78-115), two `[data-lang-block]` content trees (FR L121-552, EN L553-980) and one IIFE (L982-1052). These region boundaries are what makes concern-based commit slicing (D-01) tractable.
- Root is published verbatim today — the allowlist copy is the first departure from "the committed file is the deployed file", and it stays build-free (a `cp` step, not a bundler).

### Integration Points
- `concurrency: group: "pages"` with `cancel-in-progress: false` — keep, so a deploy is not cancelled mid-publish.
- `permissions: pages: write, id-token: write` — the verify-only job should not need these; scope them to the deploy job.

</code_context>

<specifics>
## Specific Ideas

- The current working tree is the v2 rewrite: `M index.html`, `M README.md`, plus untracked `.claude/settings.local.json` and `.playwright-mcp/`. The rewrite already removed Mixpanel and added a commented Umami stub with `[UMAMI_HOST]` / `[UMAMI_WEBSITE_ID]` placeholders — those placeholders stay as-is; wiring them up is Phase 2.
- Criterion 4 ("a visitor sees v2, not the v1 online CV") is satisfied by the rewrite series reaching `main` and deploying — no separate work item.

</specifics>

<deferred>
## Deferred Ideas

- **Mixpanel token in git history** — a project token was committed in plain text (commit `0650811`) and remains reachable in this public repo. Rotating/revoking it and any history rewrite is out of scope here; flagged in `.planning/codebase/CONCERNS.md` §Security.
- **Link checking and Lighthouse CI in the PR job** — belongs with Phase 11 (accessibility and performance bars).
- **Promoting repeated inline styles into classes / de-duplicating the FR-EN trees** — real tech debt, but a refactor phase of its own; this phase commits the rewrite as written, it does not improve it.
- **Branch protection on `main`** — D-03 pushes directly to `main`, so enforcement is by convention here; making it a rule is a later ops decision.

</deferred>

---

*Phase: 1-Reviewable Baseline and Safe Delivery*
*Context gathered: 2026-08-19*
