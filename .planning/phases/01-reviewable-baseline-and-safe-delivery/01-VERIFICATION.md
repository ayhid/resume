---
phase: 01-reviewable-baseline-and-safe-delivery
verified: 2026-08-20T11:04:37Z
status: gaps_found
score: 41/46 must-haves verified
behavior_unverified: 1
overrides_applied: 0
gaps:
  - truth: "A forbidden entry appearing in the artifact fails the run: README.md, og-image.html, specs, .planning, .github, .claude, .playwright-mcp and a nested _site are each rejected."
    status: partial
    reason: >-
      The eight enumerated names are each rejected, but only at depth 1. The
      leading generalisation — "a forbidden entry appearing in the artifact
      fails the run" — is false. verify_site.py checks `(root / name).exists()`
      for a fixed list of eight literal names, so it is an exact-name, depth-1
      denylist, not the default-deny allowlist its own comment claims. An
      artifact containing `_site/en/.planning/STATE.md`, `_site/notes.txt` and
      `_site/src/` was independently re-run through the checker and returned
      `0 problem(s)`, exit 0. The failure mode is reachable, not theoretical:
      `stage-site.sh` does `cp -R en "$DEST/"`, and Phase 10 introduces `en/`.
      The published artifact is clean today because stage-site.sh is a genuine
      allowlist — the defect is that the second line of defence does not exist,
      while a shipped code comment asserts that it does.
    artifacts:
      - path: ".github/scripts/verify_site.py"
        issue: >-
          Lines 25-28: the comment "Default-deny backstop. None of these may ever
          reach the published artifact, even if a future edit to the staging
          script lets one through" overstates what lines 114-116 implement. The
          loop tests eight literal top-level names; nested occurrences and any
          unlisted entry pass silently.
    missing:
      - "Walk the staged tree recursively and reject a forbidden basename at any depth (e.g. `for p in root.rglob('*')` matching FORBIDDEN)."
      - "Add a positive allowlist assertion: every top-level entry of the artifact must appear in REQUIRED or OPTIONAL, so an unlisted file fails rather than ships."
      - "Correct the comment at verify_site.py:25-26 so it describes what the code does — a false safety claim in shipped code is what a future agent will trust."
      - "Add the two negative cases to the checker's demonstrated set: a nested forbidden path, and an unlisted top-level entry."
behavior_unverified_items:
  - truth: "EDGE OPS-04 (ordering): two pushes to `main` landing close together both run to completion in push order because the deploy job's `pages` group sets `cancel-in-progress: false`; the later deployment is the one served, and neither publish is interrupted mid-flight."
    test: "Push two commits to `main` a few seconds apart so the second Deploy run starts while the first is still in its `Deploy to GitHub Pages` step."
    expected: "Both runs reach conclusion `success`, two deployments are created in push order, neither is marked cancelled, and the site serves the later commit."
    why_human: >-
      `cancel-in-progress: false` is present in the workflow, but the queueing
      behaviour it governs is a runtime ordering invariant. The five pushes this
      phase made were 3-13 minutes apart, so no two runs ever overlapped — the
      invariant was never exercised. Presence of the key does not prove the
      queue behaved.
human_verification:
  - test: "Read plan 01-03's six slice commits one at a time: `git show 41c11c7`, `fd08fcf`, `ad6884b`, `932e461`, `cc0c41c`, `7272bbf`."
    expected: >-
      Each diff can be understood on its own and its message describes the one
      concern it touches. Note in particular 41c11c7 (`feat(head)`), whose diff
      also carries a 541-line deletion of the v1 body — judge whether folding
      that removal into the head slice still reads cleanly, or whether it
      should have been its own commit.
    why_human: >-
      "Readable on its own" is a human judgement. 01-VALIDATION.md files this as
      manual-only for OPS-03; no assertion substitutes for it. Mechanically the
      series is sound: six non-empty commits, scoped by file and by concern,
      byte-identical at the end to the frozen snapshot.
  - test: "Load https://ayoub-hidri.dev/ in a browser. Toggle FR→EN and back. Expand and collapse a CV panel. Print-preview the page."
    expected: "The bilingual v2 page renders correctly, the language switch flips the visible tree without a reload, and a CV panel opens and closes."
    why_human: >-
      Visual and interactive correctness is not assertable without a rendering
      budget this phase does not have (Phase 11 owns it). Plan 01-05 Task 3
      records this check but does not self-approve it. The served bytes are
      confirmed identical to the committed `index.html` (sha256
      cec4a983…bce9ad), so what a human loads is exactly what was reviewed.
  - test: "Confirm in a browser that https://ayoub-hidri.dev/README.md, /og-image.html, /specs/design.md and /.planning/STATE.md each return 404."
    expected: "All four render GitHub Pages' 404, not content."
    why_human: >-
      Plan 01-05 Task 3 records this as a human check. All four were
      independently re-fetched with curl and return 404 while sitting on
      `origin/main` — the browser pass is confirmation, not discovery.
  - test: "Decide whether `https://ayoub-hidri.dev/` stayed 200 for the whole delivery window, or accept that it cannot be established retroactively."
    expected: "Either an uptime record covering 2026-08-20T10:10Z-10:45Z, or an explicit acceptance that the claim is unfalsifiable now."
    why_human: >-
      01-01 asserts the site returned 200 *throughout* the delivery change. No
      continuous probe exists. Indirect evidence only: all five deploy runs in
      the window concluded `success`, no run failed, and `/` returns 200 now.
      Marked uncertain rather than passed — a time-window availability claim
      cannot be proven from a point-in-time reading.
  - test: "Decide how Phase 1's `Mode: mvp` should be reconciled with its non-User-Story goal."
    expected: >-
      Either the mode marker is corrected on the phase, or MVP-mode verification
      is explicitly waived for Phase 1.
    why_human: >-
      ROADMAP.md marks Phase 1 `**Mode:** mvp`, but its goal is a conventional
      goal statement, not the `As a …, I want to …, so that ….` form MVP mode
      requires. `gsd-tools query user-story.validate` returns `valid: false` on
      all four slots. MVP mode's own guard says to refuse rather than produce a
      low-quality User Flow Coverage table, so this verification was run
      goal-backward against the four ROADMAP Success Criteria instead. Flagging
      rather than silently choosing.
---

# Phase 1: Reviewable Baseline and Safe Delivery — Verification Report

**Phase Goal:** The v2 rewrite lives in git history as scoped, readable commits, and the site can only reach production through a merge to `main`
**Verified:** 2026-08-20T11:04:37Z
**Status:** gaps_found
**Re-verification:** No — initial verification

**Method.** Every claim below was re-derived from the codebase, the git object
store, the GitHub API and the live domain in this session. No SUMMARY.md
assertion was accepted as evidence. Where an orchestrator-supplied command is
cited, it was re-run rather than trusted.

---

## Goal Achievement

### ROADMAP Success Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `git log` shows the v2 rewrite as scoped commits readable on their own; working tree clean | ? UNCERTAIN | Six commits `41c11c7 fd08fcf ad6884b 932e461 cc0c41c 7272bbf`, each non-empty, each scoped to one concern by message and by file. Tree clean apart from post-phase artifacts (below). "Readable on its own" is human judgement — routed to human verification. |
| 2 | Opening a pull request runs verification and reports pass/fail without publishing | ✓ VERIFIED | PR #2 (merged). Run `32360247760`, event `pull_request`, conclusion `success`; jobs: `Verify production artifact` **success**, `Deploy to production` **skipped**. Deployments created between 10:42:00Z and 10:44:06Z: **0**. |
| 3 | Merging to `main` publishes; served content is production assets only | ✓ VERIFIED | Merge `23092f8` → push run `32360360573` success → deployment `6000626285` at 10:44:16Z. Live: `/README.md` 404, `/og-image.html` 404, `/specs/design.md` 404, `/.planning/STATE.md` 404 — while `git ls-tree origin/main` confirms `README.md`, `og-image.html`, `specs/`, `.planning/`, `.github/`, `.claude` all sit on the branch. Absent from the artifact, present on the origin: that is the criterion, proven as a contrast. |
| 4 | A visitor sees the v2 page, not the v1 online CV | ✓ VERIFIED | `sha256(curl -sL https://ayoub-hidri.dev/)` = `cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` = `sha256(index.html)`. Served page: `data-lang-block` ×4, `cdn.tailwindcss.com` ×0, 96 072 bytes. Byte-identical to the reviewed commit. |

**Score:** 41/46 truths verified (1 partial → gap, 1 present-behavior-unverified, 3 uncertain)

---

### Plan Truths — 01-01 (delivery tracer)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Pages publishes from Actions, not the branch builder | ✓ VERIFIED | `gh api repos/ayhid/resume/pages` → `"build_type":"workflow"`, `"status":"built"` |
| 2 | Custom domain survives; `cname` + `https_enforced` | ✓ VERIFIED | `"cname":"ayoub-hidri.dev"`, `"https_enforced":true`, `"protected_domain_state":"verified"`, cert approved to 2026-09-30 |
| 3 | A push publishes only the production manifest | ✓ VERIFIED | Local re-run of `stage-site.sh` → `ls -A` yields exactly `CNAME index.html og-image.png robots.txt sitemap.xml`; `en` skipped as optional |
| 4 | `/README.md` and `/og-image.html` 404 where they were 200 | ✓ VERIFIED | Both 404 now; 01-VALIDATION.md records both at 200 in the 2026-08-19 baseline |
| 5 | `/` returns 200 *throughout* the delivery change | ? UNCERTAIN | No continuous probe. All five deploy runs in the window concluded `success`; `/` is 200 now. Time-window claim, not point-in-time — routed to human decision. |
| 6 | A pull request runs `verify`; `deploy` is skipped, not failed | ✓ VERIFIED | Run `32360247760` job payload: `Deploy to production` conclusion `skipped` |
| 7 | EDGE concurrency — verify and deploy never share a lane | ✓ VERIFIED | Distinct group expressions by construction: `verify-${{ github.workflow }}-${{ github.ref }}` (cancel-in-progress **true**) vs `"pages"` (cancel-in-progress **false**). The two strings cannot collide. Not exercised under true concurrency. |
| 8 | EDGE ordering — two close pushes both complete, neither interrupted | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `cancel-in-progress: false` present on the deploy job. The five pushes were 3-13 min apart; no two runs overlapped, so the queueing invariant was never exercised. See `behavior_unverified_items`. |
| 9 | EDGE adjacency — exactly one publisher; no `dynamic` run created | ✓ VERIFIED | Newest `event: dynamic` run is still `21395454336` @ **2026-01-27T11:29:22Z**. All five 2026-08-20 pushes created zero. |
| 10 | EDGE empty — a no-op push still verifies, deploys, republishes identically; a missing manifest entry exits non-zero | ✓ VERIFIED | Exercised twice: push `c6d60ef` (`.planning/` only) → run `32360110077` success → deployment `6000581541`; merge `23092f8` (`README.md` only, unpublished) → deployment `6000626285`. Live sha256 unchanged across both. Missing-entry path re-run from a directory lacking `CNAME`: `::error::missing required production asset: CNAME`, exit **1** — the step fails before `upload-pages-artifact`, so no partial artifact is uploaded. |

### Plan Truths — 01-02 (artifact checker and hygiene)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The verify job stages `_site/` then asserts it with `verify_site.py _site` | ✓ VERIFIED | `deploy.yml` verify job: `bash .github/scripts/stage-site.sh _site` then `python3 .github/scripts/verify_site.py _site` |
| 2 | Verification asserts the same manifest the deploy job ships | ✓ VERIFIED | Both jobs run the identical two commands against the identical directory |
| 3 | A forbidden entry appearing in the artifact fails the run | ✗ **PARTIAL — GAP G-01** | All eight enumerated names rejected at depth 1 (re-run: `README.md`, `.planning`, nested `_site` each → exit 1). But `_site/en/.planning/STATE.md` + `_site/notes.txt` + `_site/src/` → `0 problem(s)`, exit **0**. Exact-name depth-1 denylist, not the default-deny the code comment claims. |
| 4 | Structurally broken markup fails with a line number | ✓ VERIFIED | Appended `<div><span></div>` → `::error::</div> at line 1055 closes <span> opened at line 1055` + `unclosed <div>`, exit 1 |
| 5 | A duplicate `id` fails the run | ✓ VERIFIED | Injected `id="main-fr"` → `::error::duplicate id: main-fr (2 occurrences)`, exit 1 |
| 6 | A malformed `sitemap.xml` fails the run | ✓ VERIFIED | `::error::sitemap.xml is not well-formed: no element found: line 2, column 0`, exit 1 |
| 7 | The heading check reports without failing in this phase | ✓ VERIFIED | Clean run: exit 0, no warning. Warning path re-tested by adding a third `<h1>`: `::warning::heading structure: 3 <h1> total, 2 [data-lang-block] …`, exit **0**. See IN-01 below — the implementation is per-lang-block-aware, so it is silent on today's document rather than warning; the load-bearing half ("does not fail") holds. |
| 8 | No dependency added — Python 3 stdlib only | ✓ VERIFIED | Imports: `sys`, `pathlib`, `collections`, `html.parser`, `xml.etree.ElementTree`. No `package.json`/`requirements.txt`/`pyproject.toml`/`Cargo.toml`/`go.mod` at root. No `setup-python` in `deploy.yml`. |
| 9 | `git status --porcelain` clean beyond the rewrite | ✓ VERIFIED | `.gitignore` covers `.claude/settings.local.json`, `.playwright-mcp/`, `.planning/research/.cache/`, `_site/` (and `.gsd/`) |
| 10 | `.gitignore` ends with a newline, one pattern per line | ✓ VERIFIED | `tail -c 1` → `0a`; no line carries two patterns (the D-10 `*.temp.claude/settings.local.json` concatenation is split at lines 22 and 28) |

### Plan Truths — 01-03 (reviewable commit series)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Six scoped commits, one concern each | ✓ VERIFIED | head/SEO `41c11c7`, stylesheet `fd08fcf`, FR tree `ad6884b`, EN mirror `932e461`, controller `cc0c41c`, README `7272bbf` |
| 2 | Each diff local to one region of `index.html` | ✓ VERIFIED | Hunk ranges: `fd08fcf` one hunk @78, `932e461` one hunk @551, `cc0c41c` one hunk @981. `41c11c7` and `ad6884b` span more, absorbing the v1 removal — permitted by D-02 and by D-01's concern ordering. |
| 3 | Series byte-identical to the frozen rewrite | ✓ VERIFIED | Re-run independently: `git diff --quiet 0f652f8 7272bbf -- index.html README.md` → exit **0**. (`wip/v2-snapshot` was deleted by 01-04 as planned; the commit is still reachable.) |
| 4 | Working tree clean when the series ends | ✓ VERIFIED | Reflog `main@{5}` = `7272bbf` with no intervening stash/reset; no untracked source files |
| 5 | No slice commit is empty | ✓ VERIFIED | 73/603, 38/0, 417/1059, 430/0, 72/0, 19/13 insert/delete per commit |
| 6 | Committed as written — no line differs | ✓ VERIFIED | Same exit-0 diff as #3; `index.html` unchanged from `7272bbf` to `HEAD` |
| 7 | Safe in the object store before the first slice | ✓ VERIFIED | `0f652f8` committed 12:27:38+02:00; first slice `41c11c7` 12:28:10+02:00 |
| 8 | Nothing pushed in this plan; `main` ends exactly six ahead | ✓ VERIFIED | Reflog: no push between `main@{11}` (`15c4676`, the 01-02 push point) and `main@{5}`; `15c4676..7272bbf` is exactly six commits |

### Plan Truths — 01-04 (land the rewrite)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A visitor is served the v2 page | ✓ VERIFIED | sha256 match, see SC4 |
| 2 | Seven commits reach `origin` in a single push → one deployment | ✓ VERIFIED | Reflog shows one push at tip `a6e32d2`, carrying `41c11c7..a6e32d2`; run `32359625065` @10:34:51Z → the single deployment `6000496075` @10:35:00Z. No half-rewritten state reached a runner. |
| 3 | Served content is the D-06 manifest only, while `specs/`/`.planning/` sit on the origin | ✓ VERIFIED | See SC3 |
| 4 | `/`, `/robots.txt`, `/sitemap.xml`, `/og-image.png`, `/CNAME` → 200 | ✓ VERIFIED | All five re-fetched: 200 |
| 5 | Publishing source still the workflow after the largest push | ✓ VERIFIED | `build_type: workflow`; newest `dynamic` run unchanged at 2026-01-27 |
| 6 | `.claude/CLAUDE.md` no longer claims whole-root publish or CNAME-binds-domain | ✓ VERIFIED | L51, L66, L273-274 now describe the `_site/` allowlist and the settings-resident domain; both stale claims are gone. 328 lines; contains `_site` and `stage-site.sh`. |
| 7 | `git status --porcelain` empty; `main` and `origin/main` level | ✓ VERIFIED (at plan close) | Reflog `main@{2}` then `main@{1}: pull --ff-only`. Current divergence is post-phase bookkeeping only — see "Working-tree state" below. |

### Plan Truths — 01-05 (prove the pull-request gate)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A pull request runs verification and reports pass/fail | ✓ VERIFIED | Run `32360247760` — `Verify production artifact` success |
| 2 | A pull request publishes nothing | ✓ VERIFIED | Newest deployment id `6000581541` (10:41:08Z) unchanged across the PR window 10:42:42Z→10:44:06Z; `gh api …/deployments` filtered to that window returns **0**; deploy job `skipped` |
| 3 | Merging publishes — a push run fires, succeeds, creates a new deployment | ✓ VERIFIED | Run `32360360573` success; deployment `6000626285` @10:44:16Z |
| 4 | The PR run holds no publishing privilege | ✓ VERIFIED | `deploy.yml`: workflow-level `permissions: {}`; `verify` has `contents: read` only; `pages: write` + `id-token: write` exist solely on `deploy`, which `pull_request` never reaches |
| 5 | Verify and in-flight deploy occupy different lanes | ✓ VERIFIED | By construction — see 01-01 #7 |
| 6 | A human has loaded the page, switched language, opened a CV panel, and read the six slices | ? UNCERTAIN | Outstanding by design (`human_verify_mode: end-of-phase`). Plan 01-05 records the check without self-approving it. Routed to human verification. |
| 7 | Tree clean, branches level, no throwaway branch on the origin | ✓ VERIFIED | `chore/pr-gate-probe` deleted from origin. The one remaining non-`main` remote branch, `feat/astro-strapi-migration`, dates to 2026-02-18 and predates this phase — not a phase artifact. |

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.github/scripts/stage-site.sh` | Production allowlist; fails hard on a missing required entry; ≥25 lines; contains `REQUIRED` | ✓ VERIFIED | 38 lines, executable (`0755`), `REQUIRED=(index.html CNAME robots.txt sitemap.xml og-image.png)`, `OPTIONAL=(en)`, `set -euo pipefail`, `rm -rf "$DEST"` then copy — a genuine allowlist. DEST guard rejects `.` and `/` with exit 2. |
| `.github/workflows/deploy.yml` | Two-job pipeline; contains `needs: verify`; ≥55 lines | ✓ VERIFIED | 71 lines. `verify` on both events; `deploy` gated `github.event_name == 'push' && github.ref == 'refs/heads/main'` with `needs: verify`. |
| `.github/scripts/verify_site.py` | Manifest presence/absence, tag balance, duplicate id, sitemap, heading warning; contains `FORBIDDEN`; ≥60 lines | ⚠️ **HOLLOW (partial)** | 146 lines, executable, stdlib only. Five of six checks verified by re-run. The `FORBIDDEN` check is present and wired but shallower than its comment claims — see gap G-01. |
| `.gitignore` | Ignores agent state, Playwright dir, research cache, `_site/`; ≥28 lines | ✓ VERIFIED | 35 lines, all four patterns present plus `.gsd/`, terminating newline |
| `index.html` | v2 page in six commits; contains `data-lang-block`; ≥1054 lines | ✓ VERIFIED | 1054 lines, `data-lang-block` ×4, byte-identical to the served page |
| `README.md` | v2 README + local rehearsal line containing `stage-site.sh` | ✓ VERIFIED | L22: `bash .github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site` |
| `.claude/CLAUDE.md` | Constraints corrected; contains `_site`; ≥320 lines | ✓ VERIFIED | 328 lines; allowlist and settings-resident domain described at L51, L66, L273-274 |

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `deploy.yml` | `stage-site.sh` | Both jobs invoke the same staging script | ✓ WIRED | `bash .github/scripts/stage-site.sh _site` appears in both `verify` and `deploy` |
| `deploy.yml` | Pages control plane | `upload-pages-artifact` `path: _site`, then `deploy-pages` | ✓ WIRED | Present on the deploy job only; deployment `6000626285` created on merge |
| `deploy.yml` | `verify_site.py` | Verify job checks the directory staging just produced | ✓ WIRED | `python3 .github/scripts/verify_site.py _site` in both jobs |
| `verify_site.py` | `stage-site.sh` | `REQUIRED` mirrors the staging `REQUIRED` array | ✓ WIRED | Both lists = `index.html CNAME robots.txt sitemap.xml og-image.png`, in the same order |
| `index.html` | `wip/v2-snapshot` | Series asserted byte-identical against the frozen snapshot | ✓ WIRED | `git diff --quiet 0f652f8 7272bbf -- index.html README.md` exit 0 |
| `.claude/CLAUDE.md` | `stage-site.sh` | Corrected constraint points future agents at the allowlist | ✓ WIRED | L51, L77, L202, L266, L273 all name `stage-site.sh` as the manifest |
| PR against `main` | `deploy.yml` | `pull_request` reaches `verify` only | ✓ WIRED | `if: github.event_name == 'push' && …` — PR run's deploy job `skipped` |
| Merge to `main` | live site | Merge commit is a push → deploy job → deployment | ✓ WIRED | Run `32360360573` → deployment `6000626285` |

## Data-Flow Trace (Level 4)

| Artifact | Data | Source | Produces real data | Status |
|----------|------|--------|--------------------|--------|
| Live `/` | Page HTML | `index.html` @ `origin/main` via `_site/` | Yes — sha256 identical | ✓ FLOWING |
| `_site/` | Five manifest files | `stage-site.sh` copy from repo root | Yes — `ls -A` matches exactly | ✓ FLOWING |
| `verify_site.py` FORBIDDEN | Rejection decisions | `(root / name).exists()` for 8 literals | Partially — depth-1 only; nested and unlisted entries produce no signal | ⚠️ STATIC |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Staging produces exactly the manifest | `bash .github/scripts/stage-site.sh <tmp>/_site && ls -A` | `CNAME index.html og-image.png robots.txt sitemap.xml`, `en` skipped | ✓ PASS |
| Clean artifact verifies | `python3 .github/scripts/verify_site.py <tmp>/_site` | `0 problem(s)`, exit 0 | ✓ PASS |
| Missing required asset rejected | remove `CNAME`, re-verify | `::error::missing required asset: CNAME`, exit 1 | ✓ PASS |
| Top-level `README.md` rejected | inject, re-verify | `::error::forbidden entry present in artifact: README.md`, exit 1 | ✓ PASS |
| Top-level `.planning` rejected | inject, re-verify | `::error::forbidden entry present in artifact: .planning`, exit 1 | ✓ PASS |
| Nested `_site` rejected | inject, re-verify | `::error::forbidden entry present in artifact: _site`, exit 1 | ✓ PASS |
| Mismatched tag rejected | append `<div><span></div>` | line-numbered error ×2, exit 1 | ✓ PASS |
| Duplicate id rejected | append `id="main-fr"` | `duplicate id: main-fr (2 occurrences)`, exit 1 | ✓ PASS |
| Malformed sitemap rejected | overwrite with `<broken>` | `not well-formed: no element found`, exit 1 | ✓ PASS |
| Heading warning path | append a third `<h1>` | `::warning::heading structure: 3 <h1> total …`, exit 0 | ✓ PASS |
| **Nested forbidden path rejected** | `_site/en/.planning/STATE.md` | `0 problem(s)`, exit **0** | ✗ **FAIL** |
| **Unlisted entry rejected** | `_site/notes.txt`, `_site/src/` | `0 problem(s)`, exit **0** | ✗ **FAIL** |
| stage-site fails on missing required | run from a dir lacking `CNAME` | `::error::missing required production asset: CNAME`, exit 1 | ✓ PASS |
| stage-site DEST guard | `stage-site.sh .` / `stage-site.sh /` | `refusing to stage into '.'` / `'/'`, exit 2 | ✓ PASS |
| Live page is v2 | `sha256(curl -sL /)` vs `sha256(index.html)` | `cec4a983…bce9ad` both sides | ✓ PASS |
| Live 404 matrix | curl ×11 | `/ /CNAME /robots.txt /sitemap.xml /og-image.png` 200; `/README.md /og-image.html /specs/design.md /.planning/STATE.md /en/ /.github/workflows/deploy.yml` 404 | ✓ PASS |
| Pages publishing source | `gh api repos/ayhid/resume/pages` | `build_type: workflow`, `status: built`, `https_enforced: true` | ✓ PASS |
| PR run publishes nothing | `gh run view 32360247760`, deployments in window | verify success / deploy skipped; 0 deployments | ✓ PASS |
| No second publisher | `gh run list --json event` | newest `dynamic` = 2026-01-27T11:29:22Z, unchanged | ✓ PASS |
| No AI attribution in phase commits | `git log 4b6f8ef..HEAD` grep | none found | ✓ PASS |

## Probe Execution

No `scripts/*/tests/probe-*.sh` exist in this repository and no plan declares one. The
phase's runnable checks are `stage-site.sh` and `verify_site.py`, both executed above.

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| OPS-01 | 01-01, 01-02, 01-05 | A pull request runs verification without deploying to production | ✓ SATISFIED | PR #2 run `32360247760`: verify success, deploy skipped, 0 deployments in window, no `pages: write` on the verify job |
| OPS-02 | 01-01, 01-02, 01-04 | Only production assets are published — `specs/`, `README.md`, `.planning/` never ship | ✓ SATISFIED (with G-01) | Live 404s for all three while they sit on `origin/main`. Enforcement rests on `stage-site.sh`'s allowlist; the redundant checker's denylist is shallower than claimed — see gap G-01. |
| OPS-03 | 01-03, 01-04 | The v2 rewrite is committed in reviewable increments | ? NEEDS HUMAN | Six scoped, non-empty commits, byte-identical to the frozen snapshot. "Reviewable" is the manual-only check 01-VALIDATION.md files under OPS-03. |
| OPS-04 | 01-01, 01-04, 01-05 | Deployment to production happens on merge to `main` | ✓ SATISFIED | Merge `23092f8` → run `32360360573` → deployment `6000626285`; no `dynamic` publisher remains |

**Orphaned requirements:** none. All four IDs mapped to Phase 1 in REQUIREMENTS.md are claimed
by at least one plan, and no plan claims an ID outside the four.

**Bookkeeping note:** REQUIREMENTS.md lines 98-101 and 194-197 already mark all four `[x]` /
`Complete`. That was written by 01-05 before verification ran. OPS-03 is not yet human-confirmed
and OPS-02 carries gap G-01, so the table is currently ahead of the evidence.

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.github/scripts/verify_site.py` | 25-26 | Comment asserts "Default-deny backstop … even if a future edit to the staging script lets one through"; lines 114-116 implement an exact-name depth-1 denylist | 🛑 Blocker (gap G-01) | A false safety claim in shipped code. A future agent reading this will believe the artifact is defended in depth and it is not. Reproduced: nested and unlisted entries pass with exit 0. |
| `.github/scripts/stage-site.sh` | 10-12 | `case "$DEST"` guards `""`, `/`, `.`, `..`; the `..` arm is unreachable because `rm -rf ".."` would be caught earlier only by chance | ⚠️ Warning (REVIEW WR-01) | Cosmetic. `.` and `/` were re-tested and both exit 2. |
| `index.html` | 73 | `Décommenter et remplacer les deux placeholders au déploiement` (Umami block, inside an HTML comment) | ℹ️ Info | Intentional and locked — D-03 of the phase context defers analytics wiring to Phase 2. Not a debt marker: no `TODO`/`FIXME`/`TBD`/`XXX` appears in any file this phase touched. |
| `index.html` | controller | `beforeprint` expands CV panels without reverting `aria-expanded`/`hidden` after printing | ⚠️ Warning (REVIEW WR-02) | Post-print the accordion ARIA state desynchronises. Belongs to the rewrite this phase was forbidden from editing; carry to a content/behaviour phase. |
| `.claude/CLAUDE.md` | font constraint | States self-hosted woff2 while `index.html` loads Google Fonts | ⚠️ Warning (REVIEW WR-03) | Documentation ahead of implementation; Phase 4 owns self-hosting. |

**Debt-marker gate:** PASS. `grep -nE "TBD|FIXME|XXX"` over all seven files this phase touched
returns nothing.

**Prohibitions:** all checked, none violated.

| Prohibition | Status |
|-------------|--------|
| Deploy job unreachable from a pull-request run | ✓ Held — `deploy` skipped on run `32360247760`; gate is on `github.event_name`, not the ref alone |
| No npm/pip/cargo dependency, no package manifest, no build step | ✓ Held — no manifest or lockfile at root; checker imports stdlib only; no `setup-python` |
| Repository root stays flat | ✓ Held — root is unchanged apart from `.github/scripts/` |
| `og-image.html` unreachable in production | ✓ Held — 404 |
| `specs/`, `README.md`, `.planning/`, `.github/` absent from the artifact | ✓ Held — all 404 while present on `origin/main` |
| No Lighthouse or link checking in the PR job | ✓ Held — the verify job runs two steps |
| Action versions not bumped | ✓ Held — `checkout@v4`, `configure-pages@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4` |
| No AI attribution trailer or generation footer | ✓ Held — no match across `4b6f8ef..HEAD` commit bodies; PR #2 body clean |
| `.playwright-mcp/og-image.png` not committed | ✓ Held — directory ignored, untracked; root `og-image.png` is the real asset |
| Rewrite committed as written, no line edited | ✓ Held — `git diff --quiet 0f652f8 7272bbf` exit 0 |
| Umami placeholders committed verbatim | ✓ Held — `index.html:71-77` still commented |
| No commit pushed during 01-03 | ✓ Held — reflog shows no push between the 01-02 and 01-04 push points |
| Snapshot branch never pushed | ✓ Held — `git ls-remote --heads origin` shows only `main` and a pre-existing 2026-02 branch |
| Series pushed as one push, not commit by commit | ✓ Held — one push at `a6e32d2`, one deployment |
| No force-push to `main` | ✓ Held — reflog is strictly append-only |
| `pull_request_target` not used | ✓ Held — trigger is `pull_request` |
| `github-pages` environment policy intact | ✓ Held — `environment: name: github-pages` still declared on the deploy job |

## Working-Tree State

`git status --porcelain` currently outputs one line — `?? .planning/phases/01-reviewable-baseline-and-safe-delivery/01-REVIEW.md` — and local `main`
is one commit ahead of `origin/main` (`a45809b docs(01-05): complete prove the pull-request gate plan`,
touching only `.planning/`). Both are post-phase GSD bookkeeping produced after 01-05 closed, not
phase working state. `a45809b` was inspected: 4 files, all under `.planning/`. This does **not**
falsify the clean-tree truths, which were satisfied at each plan's close (confirmed via reflog).

## Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|--------------|----------|
| 1 | Single-`<h1>` assertion promoted from warning to failure | Phase 11 | Phase 11 goal: "The deployed page passes its own quality bars … for keyboard and screen-reader users"; A11Y-01. `verify_site.py:81-105` names Phase 11 as the owner. |
| 2 | `/en/` returns a page rather than 404 | Phase 10 | Phase 10 SC1: "`https://ayoub-hidri.dev/en/` returns a page — never a 404". `stage-site.sh` already carries `en` in `OPTIONAL` per D-07. |
| 3 | `sitemap.xml` `lastmod` stale after the v2 rewrite (REVIEW IN-04) | Phase 10 | Phase 10 SC5: "`sitemap.xml`, `robots.txt`, canonical, `hreflang` and the OpenGraph image all agree with each other and with the URLs that actually exist" |
| 4 | Self-hosted woff2 replacing Google Fonts (REVIEW WR-03) | Phase 4 | Phase 4 goal: "self-hosted type" |

Gap G-01 was checked against every later phase and matches none — Phase 10 introduces `en/`
(the directory that makes the nested-path hole reachable) but nothing in its goal or success
criteria covers hardening the artifact checker. It is therefore a real gap, not a deferral.

## Gaps Summary

**One gap, and it does not block the phase goal.**

All four ROADMAP Success Criteria hold and were each proven against the live domain and the
GitHub API rather than against SUMMARY.md. The rewrite is in history as six scoped commits
byte-identical to the frozen snapshot; a pull request verifies without publishing; a merge
publishes; and what is served is the five-file manifest and nothing else, while `specs/`,
`README.md` and `.planning/` demonstrably sit on `origin/main`. The publishing source is the
workflow, and the old branch builder has been silent since January.

What fails is narrower and specific. `verify_site.py` was planned as a *backstop* — the second
line of defence that catches a leak if the staging script is ever edited wrong. Its comment says
exactly that. Its code does not do it: eight literal names, checked once, at the top level. An
artifact containing `_site/en/.planning/STATE.md` and `_site/notes.txt` returns `0 problem(s)`
and exit 0. That was re-run in this session, not taken from the code review.

The reason this matters rather than being a nitpick: `stage-site.sh` does `cp -R en "$DEST/"`,
and Phase 10 creates `en/`. The moment that directory exists, the depth-1 assumption stops
being safe, and the phase that introduces it will not think to re-check the guard — because the
comment in the file will tell whoever reads it that the guard already covers this. **The most
important single fix is not the recursion; it is deleting the false claim in the comment.**

Two further findings are recorded for judgement rather than closure: `cancel-in-progress: false`
is present but the queueing invariant it governs was never exercised (the five pushes were
minutes apart), and the "site stayed 200 throughout" claim cannot be established retroactively
with no uptime record. Neither is a defect; both are honest gaps in evidence.

Five items await a human, all outstanding by design under `human_verify_mode: end-of-phase` —
the readability read of the six slices, the browser pass over the live page, the 404 confirmation,
the availability-window decision, and the `Mode: mvp` / non-User-Story goal mismatch.

---

_Verified: 2026-08-20T11:04:37Z_
_Verifier: Claude (gsd-verifier)_
