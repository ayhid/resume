---
phase: 01-reviewable-baseline-and-safe-delivery
plan: 06
subsystem: infra
tags: [ci, github-actions, verification, python-stdlib, allowlist, symlink, gap-closure]

# Dependency graph
requires:
  - "01-02 — .github/scripts/verify_site.py and the `Verify artifact contents` step in both jobs"
  - "01-01 — .github/scripts/stage-site.sh and the two-job verify/deploy workflow"
  - "01-05 — the pull-request gate proven on a real pull request"
provides:
  - "verify_site.py default-deny at the top level: every entry under the staged root must appear in REQUIRED or OPTIONAL, so an unlisted file fails the run instead of shipping"
  - "verify_site.py recursive: a forbidden basename at ANY depth fails the run, naming its path relative to the staged root"
  - "verify_site.py symlink-free: every symlink at any depth, dangling or resolvable, fails the run — is_symlink() replaces the exists() test that upload-pages-artifact's --dereference made unsafe"
  - "An OPTIONAL constant mirroring stage-site.sh's OPTIONAL array, so the D-06 manifest is now asserted from both sides in full"
  - "A comment above FORBIDDEN that describes the three rules the code implements, with no claim it does not provide"
affects: [phase-10-english-mirror, phase-11-performance]

actuals:
  tokens: 2143
  tasks: 3
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Two rules at two depths: positive allowlist at the top level, basename-and-symlink denylist at every depth — the strongest assertion available without enumerating a directory that does not exist yet"
    - "Reject symlinks by name rather than resolve them: is_symlink() answers True for a dangling link where exists() answers False, and --dereference would still publish the target"
    - "Guard filesystem walks on is_dir() so an absent staged directory stays a report rather than becoming a traceback"
    - "Extend the existing scratch harness rather than author a second one, so RED and GREEN compare like for like"

key-files:
  created: []
  modified:
    - .github/scripts/verify_site.py

key-decisions:
  - "Top level gets a positive allowlist, every depth gets basename-plus-symlink — conflating them would either leave the hole open or turn Phase 10's first commit red, because en/'s contents do not exist to enumerate"
  - "The three rules are independent and deliberately overlap: a top-level dangling README.md symlink produces three annotations, and none is gated behind another so each can fail the run on its own"
  - "is_symlink() rather than exists() is the load-bearing choice — CR-01's dangling symlink is invisible to exists(), and actions/upload-pages-artifact tars with --dereference"
  - "The false safety claim was deleted, not softened: 01-VERIFICATION.md named it the single most important fix because a Phase 10 author reading it has no reason to re-open the guard"
  - "The commit was made at Task 2 rather than Task 3, carrying the exact message Task 3 mandates — Task 3 is push-and-confirm and produces no commit, mirroring 01-02 Task 3"

patterns-established:
  - "A gap-closure plan re-runs the prior plan's harness unedited: the case count is identical between the RED and GREEN runs, so any delta is attributable to the checker alone"

requirements-completed: [OPS-01, OPS-02]

coverage:
  - id: D1
    description: "A forbidden basename anywhere in the staged tree fails the run, not only at depth 1"
    requirement: "OPS-02"
    verification:
      - kind: unit
        ref: "harness cases 19-20: en/.planning/STATE.md and en/og-image.html each exit 1 naming the path relative to the staged root; RED exit 0 before the edit"
        status: pass
    human_judgment: false
  - id: D2
    description: "An unlisted top-level entry fails the run — every top-level name must appear in REQUIRED or OPTIONAL"
    requirement: "OPS-02"
    verification:
      - kind: unit
        ref: "harness cases 21-23: notes.txt, src/ and both together exit 1 with one `unlisted entry in artifact` annotation each; RED exit 0 before the edit"
        status: pass
    human_judgment: false
  - id: D3
    description: "A symlink anywhere in the staged tree fails the run, including a dangling one"
    requirement: "OPS-02"
    verification:
      - kind: unit
        ref: "harness cases 24-25: README.md -> /nonexistent-target-for-harness and en/leak -> ../../.planning each exit 1 with `symlink in artifact`; RED exit 0 before the edit"
        status: pass
    human_judgment: false
  - id: D4
    description: "en/ stays optional and Phase 10 stays unbroken (D-07)"
    requirement: "OPS-02"
    verification:
      - kind: unit
        ref: "harness cases 26-27: en/ holding index.html and style.css exits 0; en/ absent exits 0. Cases 19, 20 and 25 confirm a forbidden basename or a symlink inside en/ still exits 1"
        status: pass
    human_judgment: false
  - id: D5
    description: "The shipped comment describes the code and claims no guarantee it does not provide"
    verification:
      - kind: unit
        ref: "grep -cF 'Default-deny backstop' -> 0; grep -cF 'even if a future edit to the staging script lets one through' -> 0; grep -c 'en/' -> 3"
        status: pass
    human_judgment: false
  - id: D6
    description: "Nothing plan 01-02 demonstrated regressed"
    requirement: "OPS-01"
    verification:
      - kind: unit
        ref: "harness cases 1-18 pass in both the RED and the GREEN run — five REQUIRED entries, all eight depth-1 forbidden names, tag balance with a line number, duplicate id, malformed sitemap, and the heading rule still warning without failing"
        status: pass
    human_judgment: false
  - id: D7
    description: "A missing staged directory still exits non-zero with named errors and no Python traceback"
    verification:
      - kind: unit
        ref: "python3 .github/scripts/verify_site.py /nonexistent-staged-dir -> exit 1, `staged directory not found: /nonexistent-staged-dir` plus five missing-asset errors, zero `Traceback` lines"
        status: pass
    human_judgment: false
  - id: D8
    description: "The checker still costs the repository nothing at install time"
    verification:
      - kind: unit
        ref: "import allowlist grep -> 0 non-stdlib module names; git ls-files manifest grep -> 0; no test runner, no fixture, no committed harness"
        status: pass
    human_judgment: false
  - id: D9
    description: "Both jobs ran the hardened checker on a real production run and the published bytes are unchanged"
    requirement: "OPS-01"
    verification:
      - kind: e2e
        ref: "run 32382541400 conclusion success; `Verify artifact contents` succeeded in both jobs printing `0 problem(s)`; deployment 6004718597 created; live sha256 still cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-08-20
status: complete
---

# Phase 1 Plan 06: Harden the Artifact Checker Summary

**`verify_site.py` is now the second line of defence its own comment claimed it was — default-deny at the top level of the staged root, rejecting forbidden basenames at any depth and every symlink anywhere — proven by a 28-case scratch harness that went from `failed=8` to `failed=0` across a single 70-line edit, with not one published byte moved.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-08-20T14:44:00Z
- **Completed:** 2026-08-20T14:52:00Z
- **Tasks:** 3 (1 producing a commit, 1 RED capture, 1 push-and-confirm)
- **Files modified:** 1

## Accomplishments

- Closed `01-VERIFICATION.md` `gaps[0]` and all four of its `missing[]` items, plus `01-REVIEW.md` CR-01, in one edit to one file.
- Turned an exact-name, depth-1 denylist into three independent rules: a positive top-level allowlist, a forbidden-basename check at every depth, and a blanket symlink refusal.
- Deleted the sentence that promised protection the code did not provide — the fix `01-VERIFICATION.md` named as the most important one, because a comment that lies is worse than no comment.
- Kept `en/` optional and its contents unenumerated, so Phase 10 inherits a working directory rather than a red gate.
- Proved the gate green against the real staged tree **before** pushing, then confirmed it green in both jobs of the run the push triggered.

## Task Commits

1. **Task 1: Extend the demonstrated set, capture RED** — no commit by design (scratch harness outside the repository; `git status --porcelain` reported nothing new).
2. **Task 2: Harden `verify_site.py`** — `ed4fd4a` (`fix(ci): enforce the artifact allowlist at every depth and reject symlinks`)
3. **Task 3: Push and confirm** — no commit by design (push + live verification only).

The commit was made at Task 2 rather than Task 3 because Task 3's acceptance criteria pin `git log --oneline -1` to that exact subject; a separate Task 2 commit would have made that assertion unsatisfiable and split one logical change across two commits on the same file.

## The change

`.github/scripts/verify_site.py` — 146 → 209 lines, +70 / −7, mode `100755` preserved, import set unchanged at exactly `sys`, `pathlib`, `collections`, `html.parser`, `xml.etree.ElementTree`.

| Symbol | Kind | Note |
|---|---|---|
| `OPTIONAL` | module constant | `["en"]`, mirroring the `OPTIONAL` array of `stage-site.sh` (D-07) |
| `check_manifest` | function | `REQUIRED` presence (wording unchanged) plus the positive top-level allowlist over `sorted(root.iterdir())` |
| `check_tree` | function | One pass over `sorted(root.rglob("*"))`: symlink rejection and forbidden basename at any depth |
| `"unlisted entry in artifact: %s"` | error string | New |
| `"symlink in artifact: %s -> %s"` | error string | New |
| `"staged directory not found: %s"` | error string | New |
| `"forbidden entry present in artifact: %s"` | error string | Existing wording, now carrying a path relative to the staged root |

`Checker`, `handle_starttag`, `handle_endtag`, `check_headings`, `REQUIRED`, `FORBIDDEN`, `VOID`, the markup checks, the duplicate-`id` check and the sitemap check are untouched. The heading rule is still a `::warning::` that leaves the exit code alone — Phase 11 owns promoting it.

Two `rglob` properties the implementation depends on were confirmed empirically before the edit rather than assumed: it yields a dangling symlink as an entry, and it does not descend into a symlinked directory. That combination is what makes rejecting the link itself sufficient — the tree behind it is never walked.

## Demonstrated set: RED then GREEN

Scratch root `/var/folders/37/_mcty5px0cbbxh_r6yvvl42m0000gn/T/tmp.BlakmIM9Cb`, outside the repository. The harness rebuilds every case tree from a real `stage-site.sh` run on each invocation, and the **identical unedited script** produced both tallies.

- **RED, against the committed checker:** `passed=20 failed=8 cases=28`
- **GREEN, against the hardened checker:** `passed=28 failed=0 cases=28`

Case count identical, so the delta is attributable to the checker alone.

| # | Case | Expected | RED | GREEN |
|---|---|---|---|---|
| 1 | clean staged tree, `en/` absent | exit 0 | pass | pass |
| 2 | planted `README.md` (real file) | exit 1, names it | pass | pass |
| 3 | planted `og-image.html` | exit 1, names it | pass | pass |
| 4 | planted `specs/` | exit 1, names it | pass | pass |
| 5 | planted `.planning/` | exit 1, names it | pass | pass |
| 6 | planted `.github/` | exit 1, names it | pass | pass |
| 7 | planted `.claude/` | exit 1, names it | pass | pass |
| 8 | planted `.playwright-mcp/` | exit 1, names it | pass | pass |
| 9 | planted nested `_site/` | exit 1, names it | pass | pass |
| 10 | removed `CNAME` | exit 1, `missing required asset: CNAME` | pass | pass |
| 11 | removed `sitemap.xml` | exit 1, `missing required asset: sitemap.xml` | pass | pass |
| 12 | `<div><p></div>` | exit 1, `closes <p> opened at line N` | pass | pass |
| 13 | stray `</span>` | exit 1, `stray </span> at line N` | pass | pass |
| 14 | element open at end of input | exit 1, `unclosed <div> opened at line N` | pass | pass |
| 15 | duplicate `id` | exit 1, `duplicate id: dupe (2 occurrences)` | pass | pass |
| 16 | truncated `sitemap.xml` | exit 1, carries the parser message | pass | pass |
| 17 | clean tree | exit 0, **no** heading warning | pass | pass |
| 18 | extra `<h1>` appended | exit 0, warning emitted | pass | pass |
| 19 | `en/.planning/STATE.md` | exit 1, names `en/.planning` | **FAIL — exit 0** | pass |
| 20 | `en/og-image.html` | exit 1, names `en/og-image.html` | **FAIL — exit 0** | pass |
| 21 | `notes.txt` at top level | exit 1, `unlisted entry in artifact: notes.txt` | **FAIL — exit 0** | pass |
| 22 | `src/` at top level | exit 1, `unlisted entry in artifact: src` | **FAIL — exit 0** | pass |
| 23 | `notes.txt` and `src/` together | exit 1, one annotation each | **FAIL — exit 0** | pass |
| 24 | `README.md` as a **dangling** symlink | exit 1, `symlink in artifact` | **FAIL — exit 0** | pass |
| 25 | `en/leak -> ../../.planning` | exit 1, `symlink in artifact` | **FAIL — exit 0** | pass |
| 26 | `en/` holding `index.html` + `style.css` | exit 0 (D-07) | pass | pass |
| 27 | `en/` absent — the tree CI stages today | exit 0 | pass | pass |
| 28 | staged directory does not exist | exit 1, names the directory, no traceback | **FAIL — no such error** | pass |

Nothing was committed by the harness: `git status --porcelain` reported no new entry after it ran, and `git ls-files | grep -cE '(package\.json|package-lock\.json|requirements\.txt|pyproject\.toml|Pipfile)'` stays at `0`.

The absent-directory case is worth naming separately. The committed checker already reported five errors and exited 1 there, so the hole was in the *message*, not the exit code; the risk in this plan was the opposite direction — an unguarded `iterdir()` would have turned that report into a traceback. Both walks are guarded on `is_dir()`, and the case now reads:

```
::error::staged directory not found: /nonexistent-staged-dir
::error::missing required asset: index.html
::error::missing required asset: CNAME
::error::missing required asset: robots.txt
::error::missing required asset: sitemap.xml
::error::missing required asset: og-image.png
6 problem(s)
```

## Green on arrival

Run against the real working tree before the commit was made, the exact pair of commands both CI jobs run:

```
bash .github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site
→ 0 problem(s)   exit 0
```

A stricter gate that is red on arrival blocks every deploy (T-01-15). It was proven green first, and `needs: verify` means the failure mode was fail-closed regardless.

## Workflow run

Run `32382541400`, `Deploy to GitHub Pages`, head `ed4fd4a`, conclusion **success**.

| Job | `Verify artifact contents` | Output | Conclusion |
|---|---|---|---|
| Verify production artifact | ran | `0 problem(s)` | success |
| Deploy to production | ran | `0 problem(s)` | success |

`[.jobs[] | select(.conclusion=="success") | .steps[] | select(.name=="Verify artifact contents")] | length` → `2`. The hardened checker was exercised on both the OPS-01 pull-request path and the OPS-02 publish path.

New deployment `6004718597` created at `2026-08-20T14:50:34Z`, newer than the `6000626285` / `2026-08-20T10:44:16Z` that `01-VERIFICATION.md` recorded. `gh api repos/ayhid/resume/pages --jq '.build_type'` → `workflow`. Newest `event: dynamic` run still `2026-01-27T11:29:22Z` — no legacy branch-builder run fired.

The only annotation on the run is GitHub's own Node.js 20 deprecation notice against `actions/checkout@v4`. Action versions are under an explicit prohibition in this plan; the notice is recorded, not acted on.

## No published byte changed

This is the assertion, not the absence of one. The plan modifies a script that is not in the D-06 manifest, so the served page had to be byte-identical.

| | sha256 of `https://ayoub-hidri.dev/` |
|---|---|
| Before the push | `cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` |
| After the push | `cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` |
| `shasum -a 256 index.html` | `cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` |

Exclusion matrix intact:

| URL | Code | Expected |
|---|---|---|
| `/` | 200 | 200 |
| `/CNAME` | 200 | 200 |
| `/robots.txt` | 200 | 200 |
| `/sitemap.xml` | 200 | 200 |
| `/og-image.png` | 200 | 200 |
| `/README.md` | 404 | 404 |
| `/og-image.html` | 404 | 404 |
| `/specs/design.md` | 404 | 404 |
| `/.planning/STATE.md` | 404 | 404 |

## Threat mitigations applied

| Threat ID | Disposition | Evidence |
|---|---|---|
| T-01-09 information disclosure, `_site/` contents | mitigated | `check_manifest` fails on any top-level entry outside `REQUIRED ∪ OPTIONAL`; `check_tree` fails on any `FORBIDDEN` basename at any depth. Both run in the deploy job too, so a leak fails before `upload-pages-artifact`. Cases 19-23. |
| T-01-12 information disclosure, symlink | mitigated | `is_symlink()` over the same walk; cases 24-25, including the dangling link `exists()` returns `False` for. |
| T-01-14 tampering, future `en/` contents | mitigated | Basename-and-symlink rule applies inside `en/` (cases 19, 20, 25) while ordinary contents stay green (case 26). Full enumeration deferred to Phase 10, with the reasoning written into the file itself. |
| T-01-15 denial of service, deploy pipeline | mitigated | Green on arrival proven before the commit; `needs: verify` keeps the failure mode fail-closed. |
| T-01-16 repudiation, false safety claim | mitigated | Both negative greps return `0`; the replacement comment states the three rules and names `en/` explicitly. |
| T-01-10, T-01-04, T-01-SC | unchanged | No parsing change, no workflow edit, zero packages installed. |
| T-01-08 Mixpanel token in git history at `0650811` | **accepted** | Developer-confirmed deferral, carried forward not dropped. Unscheduled. |

No package install occurred, so no package-legitimacy checkpoint applied.

## Deviations from Plan

**None affecting behaviour.** Two bookkeeping notes:

1. **Commit placed at Task 2 rather than Task 3.** Task 3's acceptance criteria pin `git log --oneline -1 --format='%s'` to `fix(ci): enforce the artifact allowlist at every depth and reject symlinks`. Committing at Task 2 with a different message and again at Task 3 would have split one file's single logical change across two commits and falsified that criterion. Task 3 remains push-and-confirm with no commit, exactly as 01-02 Task 3 did.
2. **`git diff --name-only` also listed `.planning/STATE.md`.** Task 2's criterion expects the checker and nothing else. `.planning/STATE.md` was already modified by the orchestrator's own init before this plan's first task ran (confirmed by `git status` before any edit), it is planning bookkeeping rather than a source change, and only `.github/scripts/verify_site.py` was staged into `ed4fd4a`. `git diff --quiet HEAD -- index.html README.md .github/scripts/stage-site.sh .github/workflows/deploy.yml` exits 0.

## Deferred items carried forward

None fixed here. Recorded so they survive the phase.

| # | Item | Source | Owner |
|---|---|---|---|
| 1 | `stage-site.sh`'s `rm -rf "$DEST"` guard has an unreachable `""` arm and accepts `$HOME` or any absolute path | REVIEW WR-01 | A later ops/hardening phase. Developer-workstation hazard with no production reachability — both jobs pass the literal `_site`. Folding a behavioural change to the staging script into the same green-on-arrival window as the checker fix would have doubled the blast radius against a live public domain. |
| 2 | `beforeprint` expands CV panels with no `afterprint`, leaving `aria-expanded` desynchronised | REVIEW WR-02 | Phase 11 (A11Y-01) or a content/behaviour phase. `index.html` is under an explicit prohibition in 01-03. |
| 3 | `.claude/CLAUDE.md:19` claims self-hosted woff2 while `index.html:28-30` loads Google Fonts | REVIEW WR-03 | Phase 4 (PERF-01), whose goal is self-hosted type. |
| 4 | Mixpanel project token in public git history at `0650811` | `01-CONTEXT.md` §Deferred Ideas | Unscheduled. Developer-confirmed deferral, carried as an accepted high-severity threat. |

Also out of scope and unchanged: the `behavior_unverified` OPS-04 concurrency ordering and the five `human_verification` items, both routed to `/gsd-verify-work`; and the `actions/checkout@v4` Node 20 deprecation notice, blocked by this plan's action-version prohibition.

## Known Stubs

None. No placeholder, no `TODO`, no skipped assertion, no unrun `<verify>` — every case in the demonstrated set was executed, and both task `<verify>` commands ran green.

## Self-Check: PASSED

- `.github/scripts/verify_site.py` — FOUND (209 lines, mode `100755`, `python3 -c "import ast;ast.parse(...)"` exits 0)
- Commit `ed4fd4a` — FOUND on `main`, `git rev-list --left-right --count origin/main...main` → `0 0`
- `git log -1 --format='%B' | grep -ci 'co-authored-by\|generated with'` → `0`
- `git show --stat --format= HEAD | grep -cE 'index\.html|README\.md|stage-site\.sh|deploy\.yml'` → `0`
- `git diff --diff-filter=D --name-only HEAD~1 HEAD` → empty; no file was deleted
