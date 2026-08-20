---
phase: 01-reviewable-baseline-and-safe-delivery
plan: 02
subsystem: infra
tags: [ci, github-actions, verification, python-stdlib, html-parser, gitignore]

# Dependency graph
requires:
  - "01-01 — .github/scripts/stage-site.sh and the two-job verify/deploy workflow"
provides:
  - ".github/scripts/verify_site.py — dependency-free artifact checker: manifest presence/absence, HTML tag balance, duplicate id, sitemap well-formedness, heading warning"
  - "A `Verify artifact contents` step in BOTH the verify and the deploy job, so the pull-request check is a rehearsal of the publish rather than an approximation"
  - "A .gitignore that makes `git status --porcelain | grep -c '^??'` return 0 — the precondition every later plan's clean-tree assertion depends on"
affects: [01-03, 01-04, 01-05, phase-11-performance]

actuals:
  tokens: 1587
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Explicit-assertion parsing: HTMLParser has no strict mode, so every structural rule is written out; parser silence is never treated as evidence"
    - "Warn-don't-fail for a rule that is red on arrival: the heading check reports and Phase 11 owns promoting it"
    - "Mirrored manifest: verify_site.py's REQUIRED restates stage-site.sh's REQUIRED — one manifest, asserted from both sides"

key-files:
  created:
    - .github/scripts/verify_site.py
  modified:
    - .github/workflows/deploy.yml
    - .gitignore

key-decisions:
  - "The heading rule ships as a ::warning:: with the exit code untouched — measured, not assumed: the committed v1 page carries 2 <h1> and 0 [data-lang-block], so a hard single-<h1> assertion would have been red on the very first run"
  - "The heading rule is block-aware rather than a flat count: one <h1> per [data-lang-block] is healthy and emits nothing, which is why the incoming v2 page passes silently while v1 warns"
  - ".gsd/ was added to .gitignore beyond D-10's two paths — without it the success criterion `git status --porcelain | grep -c '^??'` cannot reach 0"
  - "verify_site.py is invoked as `python3 <script>`, so CI never depends on the committed file mode — the same mode-independence rationale 01-01 applied to `bash <script>`"

patterns-established:
  - "Prove the checker fails before trusting it: 22 cases run in a scratch directory, RED before the script existed, GREEN after — no fixture committed"
  - "Rewrite, don't append, a file with no terminating newline"

requirements-completed: [OPS-02]

coverage:
  - id: D1
    description: "A pull request runs a real artifact check — the verify job stages _site/ and then asserts its contents with the stdlib checker"
    requirement: "OPS-01"
    verification:
      - kind: integration
        ref: "gh run view 32358543565 --json jobs -> 'Verify artifact contents' present and success in BOTH 'Verify production artifact' and 'Deploy to production'"
        status: pass
      - kind: unit
        ref: "grep -v '^[[:space:]]*#' deploy.yml | grep -c 'python3 .github/scripts/verify_site.py _site' -> 2"
        status: pass
    human_judgment: true
    rationale: "The step is proven to run on a push. The pull-request half is still structural — no pull request has run against this workflow. 01-05 owns the empirical proof, exactly as 01-01 recorded."
  - id: D2
    description: "A forbidden entry appearing in the artifact fails the run — README.md, og-image.html, specs, .planning, .github, .claude, .playwright-mcp and a nested _site are each rejected"
    requirement: "OPS-02"
    verification:
      - kind: unit
        ref: "8/8 planted-forbidden cases in the scratch harness each exit 1 naming the entry (see Negative-case results below)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Structurally broken markup and duplicate identifiers fail the run with a line number"
    requirement: "OPS-01"
    verification:
      - kind: unit
        ref: "mismatched </div> closing <p>, stray close tag, element open at EOF, duplicate id — 4/4 exit 1 with the expected annotation"
        status: pass
    human_judgment: false
  - id: D4
    description: "The verification adds no dependency — Python 3 standard library only"
    verification:
      - kind: unit
        ref: "import allowlist grep -> 0 non-stdlib module names; `git ls-files | grep -cE 'package\\.json|requirements\\.txt|pyproject\\.toml|Pipfile'` -> 0; `grep -c setup-python deploy.yml` -> 0"
        status: pass
    human_judgment: false
  - id: D5
    description: "git status is free of untracked agent and tool state, and planning documents are provably still tracked"
    verification:
      - kind: integration
        ref: "git status --porcelain | grep -c '^??' -> 0; git check-ignore -q .planning/ROADMAP.md -> 1; git check-ignore -q .claude/CLAUDE.md -> 1; git ls-files .planning | wc -l -> 26"
        status: pass
    human_judgment: false
  - id: D6
    description: "A push that changes no production asset republishes an identical artifact — the empty-input edge for OPS-04"
    requirement: "OPS-04"
    verification:
      - kind: e2e
        ref: "live matrix after the push identical to the end of 01-01; title still the v1 string; newest event:dynamic run still 2026-01-27T11:29:22Z"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-08-20
status: complete
---

# Phase 1 Plan 02: Artifact Verification and Repo Hygiene Summary

**The pull-request gate now asserts what it stages — a 146-line Python-stdlib checker validates the manifest, tag balance, identifier uniqueness and sitemap well-formedness in both jobs — and `git status` finally reports zero untracked files.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-08-20T10:14:00Z
- **Completed:** 2026-08-20T10:23:04Z
- **Tasks:** 3 (2 producing commits, 1 push-and-confirm)
- **Files modified:** 3

## Accomplishments

- Wrote `.github/scripts/verify_site.py` — the project's first automated check, and it costs the repository nothing: no package manifest, no lockfile, no install step, no `setup-python`.
- Wired `Verify artifact contents` into **both** jobs, so the artifact a pull request checks is produced and asserted by the identical pair of commands that publish it.
- Demonstrated the checker failing on all 15 failure cases before trusting it (22 cases total, counting the 7 that must stay green), in a scratch directory, with no fixture committed.
- Rewrote `.gitignore` with a terminating newline and five ignore paths, taking untracked files from **5 to 0**.
- Pushed once; the run succeeded and the live site is byte-for-byte what it was — the invariance is the point.

## Task Commits

1. **Task 1: The checker and the workflow wiring** — `2483bb9` (`ci(deploy): verify staged artifact contents with a stdlib-only checker`)
2. **Task 2: `.gitignore` rewrite** — `5bcc97a` (`chore: ignore local agent state and CI staging output`)
3. **Task 3: Push and confirm** — no commit by design (push + verification only)

Both were carried to the origin in a single `git push` together with wave 1's bookkeeping commit `7aaf64d`, firing exactly one push-event run.

## Files Created/Modified

- `.github/scripts/verify_site.py` (new, 146 lines, mode `100755`) — `REQUIRED` mirrors the staging script's five entries; `FORBIDDEN` holds eight; `VOID` keeps void elements off the tag stack. A `Checker(HTMLParser)` subclass maintains an explicit stack of `(tag, line)` pairs, a `Counter` of ids, an `<h1>` tally and per-`[data-lang-block]` bookkeeping.
- `.github/workflows/deploy.yml` (+6 lines) — one `Verify artifact contents` step per job, immediately after `Stage production artifact`. Triggers, permissions, concurrency groups, the `if:` gate, `needs: verify` and all four action pins are untouched.
- `.gitignore` (22 → 35 lines) — every pre-existing group preserved verbatim and in order; two new groups appended; the file now ends in `\n`.

## Negative-case results

Run in a scratch directory outside the repository. **RED first:** the harness was written before `verify_site.py` existed and reported `passed=2 failed=20` (the two "passes" were negative assertions that pass vacuously when the interpreter cannot open the script). **GREEN after implementation: `passed=22 failed=0`.**

| Case | Expected | Result |
|---|---|---|
| clean staged tree | exit 0 | pass |
| planted `README.md` | exit 1, names it | pass |
| planted `og-image.html` | exit 1, names it | pass |
| planted `specs/` | exit 1, names it | pass |
| planted `.planning/` | exit 1, names it | pass |
| planted `.github/` | exit 1, names it | pass |
| planted `.claude/` | exit 1, names it | pass |
| planted `.playwright-mcp/` | exit 1, names it | pass |
| planted nested `_site/` | exit 1, names it | pass |
| removed `sitemap.xml` | exit 1, `missing required asset: sitemap.xml` | pass |
| removed `index.html` | exit 1, required error only, no parse attempt | pass |
| `<div><p></div>` | exit 1, with a line number | pass |
| stray `</span>` | exit 1, `stray </span> at line 2` | pass |
| element open at EOF | exit 1, `unclosed <…> opened at line N` | pass |
| two elements sharing an `id` | exit 1, `duplicate id: x (2 occurrences)` | pass |
| truncated `sitemap.xml` | exit 1, carries the parser message | pass |
| one `<h1>` per `[data-lang-block]` | exit 0, **no** warning | pass |
| two `<h1>`, no language block | exit 0, warning emitted | pass |
| one document-wide `<h1>` | exit 0, no warning | pass |
| working-tree v2 page | exit 0 | pass |
| committed v1 page | exit 0, warning emitted | pass |

## Heading-warning output

Emitted by both jobs of run `32358543565`, rendered by GitHub as a real `##[warning]` annotation:

```
::warning::heading structure: 2 <h1> total, 0 [data-lang-block] element(s),
per-block <h1> counts [] -- expected exactly one <h1> per language block, or
exactly one document-wide when there are none. Reported only; Phase 11
(A11Y-01) owns making this fail.
```

Followed by `0 problem(s)` and exit 0 in both jobs. The warning is informational; the error list is empty.

## Workflow run

Run `32358543565`, `Deploy to GitHub Pages`, head `5bcc97a`, conclusion `success`.

| Job | `Verify artifact contents` | Conclusion |
|---|---|---|
| Verify production artifact | ran, `0 problem(s)` | success |
| Deploy to production | ran, `0 problem(s)` | success |

**OPS-04 adjacency control.** Newest `event: dynamic` run `createdAt` is `2026-01-27T11:29:22Z` before and after this push — identical to the value 01-01 recorded. No legacy-builder run fired.

## Live status matrix

Unchanged from the end of 01-01, which is the assertion this plan makes rather than a lack of one — a push that alters no production asset must republish the same bytes.

| URL | End of 01-01 | After this push | Expected | Verdict |
|---|---|---|---|---|
| `/` | 200 | 200 | 200 | pass |
| `/robots.txt` | 200 | 200 | 200 | pass |
| `/sitemap.xml` | 200 | 200 | 200 | pass |
| `/og-image.png` | 200 | 200 | 200 | pass |
| `/CNAME` | 200 | 200 | 200 | pass |
| `/README.md` | 404 | 404 | 404 | pass |
| `/og-image.html` | 404 | 404 | 404 | pass |
| `/specs/design.md` | 404 | 404 | 404 | pass |
| `/.planning/STATE.md` | 404 | 404 | 404 | pass |
| `/en/` | 404 | 404 | 404 | pass (Phase 10) |

The live title is still the v1 string `Ayoub Hidri - Full Stack Engineer | React/TypeScript Expert`. The v2 rewrite is still uncommitted and intact — `git diff --stat -- index.html README.md` reports `1036 insertions(+), 1662 deletions(-)`, byte-for-byte the figure 01-01 recorded.

## Decisions Made

- **The heading rule is block-aware, not a flat count.** The plan could have been satisfied with "warn unless exactly one `<h1>`". Instead the checker tracks `[data-lang-block]` elements and the `<h1>` inside each, so the healthy bilingual shape (one heading per locale tree) emits nothing at all. This matters for the phase sequencing: v1 warns today, and the moment 01-04 lands v2 the warning disappears on its own without anyone editing the checker. A rule that goes quiet when the markup becomes correct is a rule that will still be trusted in Phase 11.
- **`checker.close()` is called after `feed()`.** `HTMLParser` buffers trailing input; without the flush an element opened in the final bytes of the file could escape the unclosed-tag check.
- **Ids are reported in sorted order** so a duplicate-id failure is stable run to run and diffable across builds.
- **`.gitignore` comments explain the exclusion boundaries** — that `.claude/CLAUDE.md` and the planning documents stay tracked — because the dangerous version of this change is the over-broad one. Two criteria assert exactly that, and both pass.

## Deviations from Plan

### 1. [Rule 2 - Missing critical functionality] `.gsd/` added to `.gitignore`

- **Found during:** Task 2
- **Issue:** D-10 names two paths and the plan's Task 2 action text names three plus `_site/`. `.gsd/` (holding `dispatch-isolation-sentinel.json`) appears in none of them — it did not exist when D-10 was written.
- **Fix:** added to the `# Local agent and tool state` group.
- **Why it is not optional:** the plan's own acceptance criterion is `git status --porcelain | grep -c '^??'` → `0`. With `.gsd/` untracked and unignored that criterion is unreachable, and every clean-tree assertion in `01-03`, `01-04` and `01-05` would fail against noise unrelated to the work. This is exactly the carry-forward `01-01` §Deviation 2 addressed to this plan.
- **Files modified:** `.gitignore`
- **Commit:** `5bcc97a`

### 2. [Measurement] The heading warning fires on the committed page, not on the working tree

- **Found during:** Task 1
- **Issue:** the acceptance criterion reads "Running the checker against the current tree emits the heading `::warning::` and still exits 0", while the task's `<verify>` stages the *working tree*. Measured: the working-tree v2 page has 2 `[data-lang-block]` elements with exactly one `<h1>` each and therefore emits **no** warning; the committed v1 page has 0 language blocks and 2 `<h1>` and **does** warn.
- **Resolution:** both were measured and both exit 0, so the criterion's intent — the gate is not red on arrival, and the heading rule reports without failing — is verified in both directions. The criterion's literal reading was resolved against the committed page, because that is the file CI actually checks until `01-04` lands. Recorded as measured rather than forced.
- **Consequence for Phase 11:** the warning is self-clearing. Once v2 is on `main`, the annotation stops appearing, and A11Y-01 inherits a clean baseline rather than a standing warning.

### 3. [Process] TDD gates ran without producing separate RED and GREEN commits

- **Found during:** Task 1 (`tdd="true"`)
- **Issue:** the RED/GREEN cycle normally produces a `test(...)` commit followed by a `feat(...)` commit. Here it produced one `ci(...)` commit.
- **Cause:** the plan forbids introducing a test runner (`.claude/CLAUDE.md`: "no build step, no runtime dependency") and explicitly instructs that no fixture be committed — "the temporary directory is scratch". There is therefore no committable test artifact for a RED commit to contain.
- **What was done instead:** the cycle was honoured in substance. The 22-case harness was written **first** and run against a non-existent script (`passed=2 failed=20`), then the checker was implemented and the same harness re-run unchanged (`passed=22 failed=0`). The full case list and both results are recorded above, so the evidence survives in the repository even though the harness does not.
- **Commit sequence in git log:** one `ci(deploy):` commit, no `test(...)` gate commit. Flagged here rather than in a TDD-gate-compliance section because the absence is deliberate and plan-mandated.

### 4. [Bookkeeping] OPS-01 left `Pending` in REQUIREMENTS.md

- **Issue:** this plan's `requirements:` frontmatter lists `[OPS-01, OPS-02]`, so the executor marked both complete. OPS-01 was then reverted to `Pending`.
- **Reason:** OPS-01 reads "A pull request runs verification without deploying to production". This plan supplies the *verification* half — and it is now real rather than a bare staging step — but **no pull request has run against this workflow**. The claim that a pull request verifies without deploying is still structural, exactly as it was at the end of `01-01`, which left OPS-01 `Pending` for the same reason. `01-05` opens the throwaway pull request that proves it.
- **Resolution:** only `OPS-02` is marked complete here. `coverage.D1` carries `human_judgment: true` with the same rationale, so a verifier reading this summary cannot mistake the step's existence for proof that the gate behaves correctly on a pull request.

---

**Total deviations:** 4 — one Rule 2 auto-fix, one measurement clarification recorded rather than forced, one process note, one requirement deliberately left pending. No architectural decision arose and no fix-attempt limit was approached.
**Impact on plan:** none. All three tasks completed as specified.

## Issues Encountered

None. The checker passed its 22 cases on the first implementation, the workflow insertion was mechanical, and the run went green on the first attempt.

## Known Stubs

None. `verify_site.py` implements every rule its `<behavior>` block names, and each is demonstrated above. The heading rule is a *warning by design*, decided from measurement and documented in the source with a comment naming Phase 11 as its owner — that is a scoped decision, not an unfinished implementation.

## Threat Flags

None. No new security-relevant surface. Registered threats now carry evidence:

- **T-01-09** (artifact information disclosure) — mitigated and proven: 8/8 forbidden entries rejected, and the identical checker runs in the deploy job, so a leak fails the run before `upload-pages-artifact` sees the directory.
- **T-01-10** (parsing untrusted markup) — mitigated: `html.parser` and `xml.etree.ElementTree` parse only; nothing is executed and no parsed value reaches a shell.
- **T-01-11** (local agent state committed by accident) — mitigated: five ignore paths, `git status` clean, and `.github`/`.claude` are in `FORBIDDEN` so neither could ship even if committed.
- **T-01-04** (`run:` step injection) — mitigated: both new steps are fixed string invocations of a committed script with no `${{ github.event.* }}` interpolation.
- **T-01-SC** (supply chain) — mitigated: zero packages installed, action pins unchanged, no package-legitimacy checkpoint applicable.
- **T-01-08** (Mixpanel token in public history) — unchanged, still `accept`, developer-confirmed deferral.

## Next Phase Readiness

Ready for `01-03`. The blockers `01-01` raised for this plan are closed:

- `git status --porcelain | grep -c '^??'` returns `0`, so every clean-tree assertion from `01-03` onward can now hold.
- `_site/` is ignored, which retires the standing risk that a `git add -A` would commit five staged production files. Staging by exact path remains the discipline regardless, and was used for both commits here.
- The v2 rewrite is untouched and verified at `1036 insertions(+), 1662 deletions(-)`.

**Concerns carried forward:**

- The pull-request half of OPS-01 is still structural, not observed. `01-05` owns it, and the checker now gives that pull request something real to assert.
- `main` is public and deploys on every push; `01-04` must get its slice boundaries right locally before pushing (D-03).
- The `<edge_assumptions>` flag stands: this plan proves the manifest is *enforced*, not that it is *right*. A root asset added in a later phase and not added to `REQUIRED`/`OPTIONAL` is silently unpublished by design — the intended default-deny behaviour, and the failure mode to watch for.

---
*Phase: 01-reviewable-baseline-and-safe-delivery*
*Completed: 2026-08-20*

## Self-Check: PASSED

- `.github/scripts/verify_site.py` — present, mode `100755`
- `.github/workflows/deploy.yml` — present, `Verify artifact contents` in both jobs
- `.gitignore` — present, 35 lines, terminating newline
- `.planning/phases/01-reviewable-baseline-and-safe-delivery/01-02-SUMMARY.md` — present
- Commit `2483bb9` — present in `git log --all`
- Commit `5bcc97a` — present in `git log --all`, and is `origin/main`
- Push run `32358543565` — present, conclusion `success`
