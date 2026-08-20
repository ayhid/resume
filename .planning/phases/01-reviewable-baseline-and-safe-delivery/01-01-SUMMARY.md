---
phase: 01-reviewable-baseline-and-safe-delivery
plan: 01
subsystem: infra
tags: [github-pages, github-actions, ci, deployment, allowlist, bash]

# Dependency graph
requires: []
provides:
  - "GitHub Pages publishing source switched from the legacy branch builder to GitHub Actions (build_type: workflow)"
  - ".github/scripts/stage-site.sh — the single-source production allowlist, shared by the verify and deploy jobs"
  - "Two-job deploy.yml: verify (push + pull_request, contents:read) chained to deploy (push-to-main only, pages:write)"
  - "PHASE_BASE watermark and the GSD bookkeeping commit filter, both recorded below for plans 01-03, 01-04 and 01-05"
  - "A proven end-to-end delivery path: local commit -> verify -> allowlist staging -> artifact -> live domain"
affects: [01-02, 01-03, 01-04, 01-05, phase-10-en-route, phase-11-performance]

actuals:
  tokens: 821
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Allowlist staging: CI copies a named manifest into _site/ and uploads that, instead of publishing the repo root"
    - "Job-scoped permissions and concurrency: workflow-level permissions is the empty mapping; each job grants only what it needs"
    - "Event-asserting deploy gate: `github.event_name == 'push' && github.ref == 'refs/heads/main'`, not a ref-only test"

key-files:
  created:
    - .github/scripts/stage-site.sh
  modified:
    - .github/workflows/deploy.yml

key-decisions:
  - "The Pages publishing source was switched in the GitHub UI, not via `gh api -X PUT`, because the harness permission classifier blocked the API call — the plan's own documented fallback path"
  - "The deploy job chains on verify via `needs: verify`, so a manifest regression cannot reach production; on a pull request deploy reports as skipped, not failed"
  - "Both jobs invoke the staging script through `bash`, so CI never depends on the committed file mode (the mode is nonetheless 100755)"
  - "The two ci(deploy) commits were pushed together in one push, producing exactly one push-event run at the tip commit"

patterns-established:
  - "One manifest, one script: verify and deploy run the identical `bash .github/scripts/stage-site.sh _site` line, so the checked artifact is the published artifact"
  - "Fail-closed staging: a missing REQUIRED entry emits a ::error:: annotation and exits 1; OPTIONAL entries use an explicit if/else so a genuine cp failure is never swallowed"

requirements-completed: [OPS-01, OPS-02, OPS-04]

coverage:
  - id: D1
    description: "GitHub Pages publishes from the Actions workflow, not the legacy branch builder, with the custom domain and HTTPS enforcement intact"
    requirement: "OPS-04"
    verification:
      - kind: integration
        ref: "gh api repos/ayhid/resume/pages --jq '{build_type, cname, https_enforced, status}' -> workflow / ayoub-hidri.dev / true / built"
        status: pass
      - kind: integration
        ref: "gh run list --event dynamic --limit 1 --jq '.[0].createdAt' -> 2026-01-27T11:29:22Z, identical before and after the push"
        status: pass
    human_judgment: false
  - id: D2
    description: "Only the D-06 production manifest is served; README.md, og-image.html, specs/ and .planning/ are unreachable even though they now exist on origin/main"
    requirement: "OPS-02"
    verification:
      - kind: e2e
        ref: "curl -s -o /dev/null -w '%{http_code}' -L https://ayoub-hidri.dev/README.md -> 404 (was 200); /og-image.html -> 404 (was 200); /specs/design.md -> 404; /.planning/STATE.md -> 404"
        status: pass
      - kind: integration
        ref: "bash .github/scripts/stage-site.sh _site && ls -A _site -> CNAME index.html og-image.png robots.txt sitemap.xml"
        status: pass
      - kind: integration
        ref: "stage-site.sh with og-image.png renamed away -> exit 1 with '::error::missing required production asset: og-image.png'"
        status: pass
    human_judgment: false
  - id: D3
    description: "A verify job runs on both push and pull_request with contents:read only; the deploy job holds pages:write and is gated on push-to-main"
    requirement: "OPS-01"
    verification:
      - kind: integration
        ref: "gh run view 32357618724 --json jobs -> 'Verify production artifact' success, then 'Deploy to production' success (needs: verify honoured)"
        status: pass
      - kind: unit
        ref: "grep assertions over deploy.yml: needs:verify=1, event+ref if=1, group:verify-=1, group:\"pages\"=1, pages:write=1 (deploy job only), ^concurrency:=0"
        status: pass
    human_judgment: true
    rationale: "The pull-request half of OPS-01 is asserted structurally here but never exercised — no pull request has run against this workflow. Plan 01-05 supplies the empirical proof (deploy reports skipped, no deployment fires). Until then a human must not read D3 as fully verified."
  - id: D4
    description: "The site was never down during the transition"
    verification:
      - kind: e2e
        ref: "curl https://ayoub-hidri.dev/ -> 200 before the switch, 200 after the switch, 200 after the push; title still the v1 'Ayoub Hidri - Full Stack Engineer | React/TypeScript Expert'"
        status: pass
    human_judgment: false

duration: 2min
completed: 2026-08-20
status: complete
---

# Phase 1 Plan 01: Delivery Tracer Summary

**GitHub Pages now publishes through a two-job Actions workflow that uploads only a five-entry allowlist staged by `.github/scripts/stage-site.sh` — `/README.md` and `/og-image.html` went from 200 to 404 while the site stayed up throughout.**

## Performance

- **Duration:** ~2 min for this continuation agent (Task 3 only). Tasks 1 and 2 ran in a prior session; total wall-clock across the plan spans the blocking human gate and is not meaningful as a single figure.
- **Started (continuation):** 2026-08-20T10:08:00Z
- **Completed:** 2026-08-20T10:12:04Z
- **Tasks:** 3 (Task 1 settings-only, Task 2 gate, Task 3 committed)
- **Files modified:** 2

## Accomplishments

- Switched the Pages publishing source from `legacy` to `workflow`, ending the legacy whole-root builder — the change without which the allowlist would have been decorative.
- Created `.github/scripts/stage-site.sh`, the phase's single source of truth for what is publishable, fail-closed on a missing required asset.
- Restructured `deploy.yml` into `verify` + `deploy` with job-scoped permissions and job-scoped concurrency, chained by `needs: verify`.
- Proved the whole path end-to-end with one real push: `specs/` (2 files) and `.planning/` (24 files) are now **on `origin/main`** and remain **404 on the live domain** — the allowlist is demonstrably what keeps them off the site, not their absence.

## Task Commits

1. **Task 1: Capture the live baseline, switch the Pages publishing source** — no commit by design (repository-settings change only)
2. **Task 2: Blocking human-verify gate** — no commit (checkpoint; approved by the developer)
3. **Task 3: Delivery tracer** — `8253bba` (ci) and `70a912a` (ci)

Both Task 3 commits were pushed together in a single `git push`, firing exactly one push-event run (`32357618724`) at the tip commit `70a912a`. This confirms research assumption A4 empirically, which is what lets plan `01-04` land the rewrite series in one push rather than one deploy per commit.

## Files Created/Modified

- `.github/scripts/stage-site.sh` (new, mode `100755`) — the production allowlist. `REQUIRED=(index.html CNAME robots.txt sitemap.xml og-image.png)`, `OPTIONAL=(en)`. `og-image.html` is in neither array, deliberately.
- `.github/workflows/deploy.yml` (rewritten) — two jobs; `permissions: {}` at workflow level; verify holds `contents: read` and a cancellable `verify-…` concurrency group; deploy alone holds `pages: write` + `id-token: write` and the `"pages"` group with `cancel-in-progress: false`.

## Watermarks recorded for later plans

**Plans `01-03`, `01-04` and `01-05` read the two values below from this file. Do not re-derive them.**

### `PHASE_BASE`

```
4b6f8ef5df80e4688fe0f8bb7828aee8a6fe65e3
```

This is `git rev-parse main` — the **local** pre-phase tip, deliberately **not** `git rev-parse origin/main`. Local `main` was 15 commits ahead of the origin when Task 1 ran, carrying planning and codebase-mapping history this phase did not author; Task 3's push carried all of them to the origin. An `origin/main` anchor would sweep every one of them into the phase's own range and break every count derived from it.

Confirmed at the end of Task 1: `git rev-list --count "$PHASE_BASE"..main` was `0`. After Task 3 it reads `2` — the two `ci(deploy):` commits.

### Bookkeeping filter

```
^docs\((state|phase-[0-9.]+|[0-9]{2}(\.[0-9]+)?(-[0-9]{2})?)\): 
```

The phase's own commit series must always be read as:

```bash
git log --format='%s' "$PHASE_BASE"..origin/main | grep -vE '^docs\((state|phase-[0-9.]+|[0-9]{2}(\.[0-9]+)?(-[0-9]{2})?)\): '
```

A bare `wc -l` over the raw range is never valid. The filter excludes these GSD execution-bookkeeping subjects, whose number depends on how many waves and plans actually run:

- `docs(01-0N): complete … plan` — one per plan, from `/gsd-execute-plan`
- `docs(phase-1): update tracking after wave N` — one per wave
- `docs(phase-1): complete phase execution`
- `docs(phase-1): evolve PROJECT.md after phase completion`
- `docs(phase-1): close N resolved todo(s)`
- `docs(state): …` — state-recording commits

The phase's own `docs(readme):` and `docs(claude):` commits are deliberately outside the filter and therefore counted as part of the series.

## Control plane

### Before the switch (recorded by Task 1)

```json
{
  "build_type": "legacy",
  "source": { "branch": "main", "path": "/" },
  "cname": "ayoub-hidri.dev",
  "https_enforced": true,
  "status": "built"
}
```

### After the switch, and again after the push

```json
{
  "build_type": "workflow",
  "cname": "ayoub-hidri.dev",
  "https_enforced": true,
  "status": "built"
}
```

The custom domain and TLS enforcement survived the transition — this closes research assumption A3, which flagged that the transition itself had never been observed.

**OPS-04 adjacency control.** Newest `event: dynamic` (`pages build and deployment`) run `createdAt`:

| | Timestamp |
|---|---|
| Before the push (Task 1) | `2026-01-27T11:29:22Z` |
| After the push (Task 3) | `2026-01-27T11:29:22Z` |

Identical. No legacy-builder run fired, so exactly one publisher targets the site.

## Live status matrix

Measured with `curl -s -o /dev/null -w '%{http_code}' -L https://ayoub-hidri.dev$u`.

| URL | Before (Task 1) | Pre-push, post-switch | After the push | Expected | Verdict |
|---|---|---|---|---|---|
| `/` | 200 | 200 | 200 | 200 | pass |
| `/robots.txt` | 200 | 200 | 200 | 200 | pass |
| `/sitemap.xml` | 200 | 200 | 200 | 200 | pass |
| `/og-image.png` | 200 | 200 | 200 | 200 | pass |
| `/CNAME` | 404 | 404 | **200** | 200 | pass — D-06 puts `CNAME` in the manifest; expected, not a regression |
| `/README.md` | **200** | 200 | **404** | 404 | pass |
| `/og-image.html` | **200** | 200 | **404** | 404 | pass |
| `/specs/design.md` | 404 | 404 | 404 | 404 | pass — and now meaningful, see below |
| `/.planning/STATE.md` | 404 | 404 | 404 | 404 | pass — and now meaningful, see below |
| `/en/` | 404 | 404 | 404 | 404 | pass (Phase 10) |

The middle column matters: switching the publishing source alone changed nothing that was served. The 200→404 flips are attributable to the allowlist and the push, not to the settings change.

`/specs/design.md` and `/.planning/STATE.md` returned 404 before this plan only because those directories had never been pushed. They are now on `origin/main` — `git ls-tree -r --name-only origin/main` reports 2 files under `specs/` and 24 under `.planning/` — and they still return 404. That is the real proof of OPS-02.

The matrix settled on the first poll (10 s after the run completed); a second reading 2 minutes later was identical. The 3-minute polling budget was not needed.

The live page is still v1 (`<title>Ayoub Hidri - Full Stack Engineer | React/TypeScript Expert`, 9 Mixpanel references). The v2 rewrite lands in plan `01-04`, as planned.

## Workflow run

Run `32357618724`, `Deploy to GitHub Pages`, head `70a912a`, conclusion `success`.

| Job | Conclusion | Duration |
|---|---|---|
| Verify production artifact | success | 4 s |
| Deploy to production | success | 10 s |

`needs: verify` was honoured — deploy started 5 s after verify finished, not concurrently.

## Decisions Made

- **The `gh api -X PUT` call was not used.** The harness permission classifier blocked it, so Task 1 used the plan's documented UI fallback (Settings → Pages → Build and deployment → Source → GitHub Actions), performed by the developer. The outcome was verified through the API regardless, so the assertion is unaffected — only the mechanism differed.
- **`bash <script>` in both `run:` lines** rather than a bare `./` invocation. The committed mode is `100755` and was asserted, but making CI independent of file mode costs nothing and removes a class of failure that only appears after a `git apply` or a Windows checkout.
- **Comments were added to `deploy.yml`** explaining *why* the `if:` asserts on the event and why both jobs share one script — per the project's comment-the-why convention. All acceptance-criteria greps were run against `grep -v '^[[:space:]]*#'` output, so the comments do not inflate any count.

## Deviations from Plan

### 1. [Bookkeeping] The `git status --porcelain --untracked-files=no | wc -l` criterion reads 3, not 2

- **Found during:** Task 3, pre-staging survey
- **Issue:** The plan asserts the count is exactly `2` (`index.html` and `README.md`, the uncommitted v2 rewrite). It reads `3`.
- **Cause:** The third entry is ` M .planning/STATE.md`, a GSD execution-bookkeeping modification made after the plan was written. It is not a plan violation and not a stray edit of site content.
- **Resolution:** The criterion's *intent* is verified rather than its literal figure: `git status --porcelain --untracked-files=no | grep -c 'index.html\|README.md'` outputs `2`, and `git diff --stat -- index.html README.md` still reports `1036 insertions(+), 1662 deletions(-)`, byte-for-byte the rewrite described in `01-CONTEXT.md`. Nothing under `.github/` is left uncommitted. The number was recorded as measured, not forced.

### 2. [Carry-forward to 01-02] `.gsd/` is untracked and not covered by the D-10 `.gitignore` rewrite

- **Found during:** Task 3, pre-staging survey
- **Issue:** `.gsd/` (holding `dispatch-isolation-sentinel.json` and GSD tool state) did not exist when D-10 was written, so the `.gitignore` rewrite scheduled for plan `01-02` Task 2 does not name it.
- **Why it was not fixed here:** the `.gitignore` rewrite is `01-02`'s scope under D-10. Editing `.gitignore` in this plan would put a change outside `files_modified` into the tracer commit and blur what the tracer proves.
- **Action required in `01-02` Task 2.** The ignore list must cover all of:
  - `.claude/settings.local.json` (already in D-10)
  - `.playwright-mcp/` (already in D-10)
  - `.gsd/` — **new, not in D-10**
  - `.planning/research/` and `.planning/research/.cache/` — **new, not in D-10**
  - `_site/` — **new, not in D-10; see deviation 3**

  Without these, the clean-tree assertions in `01-03` onward will fail against untracked noise.

### 3. [Expected, carried forward] `_site/` is left on disk, untracked and unignored

- **Found during:** Task 3, local rehearsal (anticipated by the plan text)
- **Issue:** Rehearsing the staging script leaves `_site/` in the working tree, and the pattern that would ignore it does not land until `01-02` Task 2.
- **Mitigation applied:** every commit in this task staged by exact path (`git add .github/scripts/stage-site.sh`, then `git add .github/workflows/deploy.yml`). No whole-tree or whole-directory staging form was used anywhere. Verified: `git ls-files _site` outputs `0`, and `git show --stat --format= HEAD | grep -c '_site'` outputs `0` for both `HEAD` and `HEAD~1`.
- **Standing risk until `01-02` lands:** any `git add -A` or `git add .` in this repository would commit five staged production files into the artifact directory. Plans `01-03` and `01-04` must continue staging by exact path.

### 4. [Process] The tracer feedback gate was not raised as an interactive checkpoint

- **Rationale:** Task 3 is `type="tracer"`, and the tracer gate exists to stop expansion tasks from building on an unproven slice. Task 3 is the plan's final task, so there is no expansion task for the gate to protect. Its `<verify>` was re-run end-to-end regardless (staging, run conclusion, adjacency control, and the full live matrix polled to settlement) and passed. `workflow.human_verify_mode` is `end-of-phase`, so human verification is deferred to phase close by configuration.

---

### 5. [Bookkeeping] OPS-01 was deliberately left `Pending` in REQUIREMENTS.md

- **Issue:** this plan's `requirements:` frontmatter lists `[OPS-01, OPS-02, OPS-04]`, and the executor would normally mark all three complete.
- **Resolution:** only `OPS-02` and `OPS-04` were marked complete. The plan's own `<success_criteria>` scopes OPS-01 as *partial* — "a `verify` job exists and runs on both `push` and `pull_request`; the empirical pull-request proof lands in plan `01-05`". No pull request has yet run against this workflow, so the claim that a pull request verifies without deploying is structural, not observed. Marking it complete here would have produced a green requirement that nothing proved. `01-05` owns the flip.

---

**Total deviations:** 5 — 2 measurement/bookkeeping discrepancies recorded rather than forced, 2 carried forward to `01-02`, 1 process note. No auto-fix under Rules 1-3 was required and no architectural decision arose.
**Impact on plan:** none on the delivery outcome. Two items are genuine input to `01-02`'s scope.

## Issues Encountered

None. The Pages transition, the workflow run and edge propagation all behaved as researched. Edge propagation in particular was faster than the plan budgeted — the matrix had settled on the first 10-second poll.

## Known Stubs

None. `stage-site.sh` and `deploy.yml` are both complete as written; the `Verify artifact contents` step referenced in `01-RESEARCH.md` §Code Example 1 is intentionally absent because `verify_site.py` is plan `01-02`'s deliverable and referencing a nonexistent script would break every CI run in between.

## Threat Flags

None. No security-relevant surface was introduced beyond what `<threat_model>` already registers. T-01-01, T-01-03, T-01-04, T-01-05 and T-01-07 are now mitigated and evidenced above. T-01-02 is structurally mitigated but empirically unproven until `01-05`. T-01-08 (the Mixpanel token in public history) is unchanged by this plan and remains `accept`.

## Next Phase Readiness

Ready for `01-02` (verify script + `.gitignore` rewrite). Both jobs already run `stage-site.sh`; `01-02` adds the `Verify artifact contents` step to the verify job only.

**Blockers and concerns for the plans that follow:**

- `.gitignore` must absorb `.gsd/`, `.planning/research/` and `_site/` on top of D-10's original list, or every later clean-tree assertion fails.
- Until that lands, staging by exact path is mandatory. `git add -A` would commit the staging directory.
- `main` is now public and deployed on every push. The v2 rewrite series in `01-04` must be right locally before it is pushed; correcting a boundary afterwards means a force-push to a deployed branch (D-03, rated costly).
- The pull-request half of OPS-01 is still unproven empirically. `01-05` owns that.

---
*Phase: 01-reviewable-baseline-and-safe-delivery*
*Completed: 2026-08-20*

## Self-Check: PASSED

- `.github/scripts/stage-site.sh` — present, mode `100755`
- `.github/workflows/deploy.yml` — present
- `.planning/phases/01-reviewable-baseline-and-safe-delivery/01-01-SUMMARY.md` — present
- Commit `8253bba` — present in `git log --all`
- Commit `70a912a` — present in `git log --all`, and is `origin/main`
- Push run `32357618724` — present, conclusion `success`
