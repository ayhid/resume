---
phase: 01-reviewable-baseline-and-safe-delivery
verified: 2026-08-20T17:40:00Z
status: human_needed
score: 52/57 must-haves verified
behavior_unverified: 1
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 41/46
  gaps_closed:
    - "A forbidden entry appearing in the artifact fails the run — now true at every depth, not only depth 1. The exact tree that returned `0 problem(s)` before (`en/.planning/STATE.md` + `notes.txt` + `src/`) was re-run against the current checker and returns 3 errors, exit 1."
  gaps_remaining: []
  regressions: []
  notes: >-
    Plan 01-06 added 11 new truths to the phase's must-have set, so the
    denominator moved from 46 to 57. All 11 were verified against the committed
    checker in this session using scratch fixtures, not against SUMMARY claims.
gaps: []
deferred:
  - truth: "The published page contains no unverifiable figure — six `[CHIFFRE_A_VALIDER]` placeholders render as the headline result of all three case cards in both locales, live on production now."
    addressed_in: "Phase 8"
    evidence: "REQUIREMENTS.md PROOF-04 — 'Every published figure is verified and attributable — no unverifiable number ships'; ROADMAP Phase 8 SC4 — 'any number that could not be verified was removed rather than softened'."
  - truth: "The training-financing line states something legally true or is absent — two `[MENTION_FINANCEMENT_A_VALIDER]` placeholders render as the financing line of the AI offer in both locales, live on production now."
    addressed_in: "Phase 7"
    evidence: "REQUIREMENTS.md IA-04 — 'The training-financing line is either legally accurate for the current Qualiopi/portage status or absent'; ROADMAP Phase 7 SC3."
  - truth: "The heading rule fails the run rather than warning when the <h1> distribution is wrong."
    addressed_in: "Phase 11"
    evidence: "ROADMAP Phase 11 'Accessibility and Performance Bars'; A11Y-01 is named in verify_site.py:110-111 and in the 01-02 must-have itself as the owner of promoting the warning to a failure."
behavior_unverified_items:
  - truth: "EDGE OPS-04 (ordering): two pushes to `main` landing close together both run to completion in push order because the deploy job's `pages` group sets `cancel-in-progress: false`; the later deployment is the one served, and neither publish is interrupted mid-flight."
    test: "Push two commits to `main` a few seconds apart so the second Deploy run starts while the first is still in its `Deploy to GitHub Pages` step."
    expected: "Both runs reach conclusion `success`, two deployments are created in push order, neither is marked cancelled, and the site serves the later commit."
    why_human: >-
      `cancel-in-progress: false` is present at deploy.yml:48 and was re-read
      this session, but the queueing behaviour it governs is a runtime ordering
      invariant. All six pushes this phase made were 3-13 minutes apart (run
      timestamps 10:10:31, 10:21:33, 10:34:51, 10:40:58, 10:44:06, 14:50:24), so
      no two deploy runs ever overlapped and the invariant was never exercised.
      Presence of the key does not prove the queue behaved.
human_verification:
  - test: "Read plan 01-03's six slice commits one at a time: `git show 41c11c7`, `fd08fcf`, `ad6884b`, `932e461`, `cc0c41c`, `7272bbf`."
    expected: >-
      Each diff can be understood on its own and its message describes the one
      concern it touches. Note in particular 41c11c7 (`feat(head)`), whose diff
      also carries a 603-line deletion of the v1 body — judge whether folding
      that removal into the head slice still reads cleanly, or whether it should
      have been its own commit.
    why_human: >-
      "Readable on its own" is a human judgement and is ROADMAP SC1's operative
      clause. 01-VALIDATION.md files this as manual-only for OPS-03. Mechanically
      the series is sound and was re-derived this session: six non-empty commits,
      each scoped to one concern, and the end of the series is byte-identical to
      the frozen pre-slice snapshot (proven below against the dangling object).
  - test: "Decide whether the eight live `[CHIFFRE_A_VALIDER]` / `[MENTION_FINANCEMENT_A_VALIDER]` placeholders are acceptable on production until Phases 7 and 8 land, or warrant a content hotfix now."
    expected: "Either an explicit acceptance of the exposure window, or a decision to remove the placeholder paragraphs ahead of their owning phases."
    why_human: >-
      This is a business-risk judgement, not a Phase 1 goal gap. The text is
      confirmed live (`curl https://ayoub-hidri.dev/` returns 6 + 2 occurrences)
      and reads as a broken sentence — "Résultat / [CHIFFRE_A_VALIDER] / de
      temps récupéré sur la clôture mensuelle." Phase 1 was explicitly forbidden
      from editing `index.html` (01-03/01-06 prohibition: "the v2 rewrite ships
      as written"), and PROOF-04 / IA-04 own the copy. Verification defers it and
      escalates the timing decision rather than deciding it.
  - test: "Decide whether `main` should require the `Verify production artifact` check before a push can publish — i.e. enable branch protection."
    expected: "Either branch protection enabled on `main` requiring the verify check, or an explicit acceptance that direct pushes to `main` may publish."
    why_human: >-
      The phase goal reads "the site can only reach production through a merge to
      `main`". `gh api repos/ayhid/resume/branches/main/protection` returns 404
      Branch not protected, and this phase's own gap-closure commit `ed4fd4a`
      (single parent `bb2a894`, zero merges in range) reached production by
      direct push, bypassing the PR gate the phase built. The four ROADMAP
      Success Criteria — the contract — do not require protection, and no plan
      must-have claimed it, so this is not scored as a failure. Flagging the
      literal-wording gap rather than silently resolving it.
  - test: "Load https://ayoub-hidri.dev/ in a browser. Toggle FR→EN and back. Expand and collapse a CV panel. Print-preview the page."
    expected: "The bilingual v2 page renders correctly, the language switch flips the visible tree without a reload, and a CV panel opens and closes."
    why_human: >-
      Visual and interactive correctness is not assertable without a rendering
      budget this phase does not have (Phase 11 owns it). Plan 01-05 truth 6
      records this check but does not self-approve it. The served bytes are
      re-confirmed identical to the committed `index.html` (sha256
      cec4a983…bce9ad), so what a human loads is exactly what was reviewed.
  - test: "Decide whether `https://ayoub-hidri.dev/` stayed 200 for the whole delivery window, or accept that it cannot be established retroactively."
    expected: "Either an uptime record covering 2026-08-20T10:10Z-14:51Z, or an explicit acceptance that the claim is unfalsifiable now."
    why_human: >-
      01-01 asserts the site returned 200 *throughout* the delivery change. No
      continuous probe exists. Indirect evidence only: all six deploy runs in the
      window concluded `success`, none failed, and `/` returns 200 now. A
      time-window availability claim cannot be proven from a point-in-time
      reading.
  - test: "Decide how Phase 1's `Mode: mvp` should be reconciled with its non-User-Story goal."
    expected: >-
      Either the mode marker is corrected on the phase, or MVP-mode verification
      is explicitly waived for Phase 1.
    why_human: >-
      ROADMAP.md:39 marks Phase 1 `**Mode:** mvp`, but its goal is a conventional
      goal statement, not the `As a …, I want to …, so that ….` form MVP mode
      requires. MVP mode's own guard says to refuse rather than produce a
      low-quality User Flow Coverage table, so this verification was run
      goal-backward against the four ROADMAP Success Criteria instead. Carried
      forward unresolved from the previous verification.
---

# Phase 1: Reviewable Baseline and Safe Delivery — Verification Report

**Phase Goal:** The v2 rewrite lives in git history as scoped, readable commits, and the site can only reach production through a merge to `main`
**Verified:** 2026-08-20T17:40:00Z
**Status:** human_needed
**Re-verification:** Yes — after plan 01-06 closed gap G-01

**Method.** Every claim below was re-derived in this session from the codebase, the
git object store, the GitHub API and the live domain. No SUMMARY.md assertion was
accepted as evidence, and no result quoted from the previous VERIFICATION.md was
carried without re-running it. The checker was exercised against fourteen scratch
fixture trees rather than read.

---

## Gap Closure — G-01

The previous run failed the phase on one gap: `verify_site.py` implemented an
exact-name, depth-1 denylist while a shipped comment claimed a default-deny
backstop. Every `missing[]` item is now satisfied, and each was proven by
execution.

| `missing[]` item from the previous verification | Status | Evidence re-run this session |
|---|---|---|
| Walk the staged tree recursively and reject a forbidden basename at any depth | ✓ CLOSED | `check_tree` at verify_site.py:145-167 uses `root.rglob("*")`. Fixture `en/deep/nested/README.md` → `::error::forbidden entry present in artifact: en/deep/nested/README.md`, exit 1 |
| Add a positive allowlist assertion so an unlisted top-level entry fails | ✓ CLOSED | `check_manifest` at verify_site.py:139-142 iterates `root.iterdir()` against `REQUIRED ∪ OPTIONAL`. Fixture `secrets.env` → `::error::unlisted entry in artifact: secrets.env`, exit 1 |
| Correct the comment so it describes what the code does | ✓ CLOSED | verify_site.py:29-45 now enumerates the three rules by depth and states the `en/` limitation explicitly. The sentence "even if a future edit to the staging script lets one through" is gone from the file |
| Add a nested forbidden path and an unlisted top-level entry to the demonstrated set | ✓ CLOSED | Both re-run below; no fixture directory is committed (`git ls-files` → 0 test/fixture matches) |

**The regression case.** The exact tree the previous verification used to falsify
the claim — `en/.planning/STATE.md` + `notes.txt` + `src/` — was reconstructed and
re-run against the committed checker:

```
::error::unlisted entry in artifact: notes.txt
::error::unlisted entry in artifact: src
::error::forbidden entry present in artifact: en/.planning
3 problem(s)   exit=1
```

Previously: `0 problem(s)`, exit 0. G-01 is genuinely closed.

---

## Goal Achievement

### ROADMAP Success Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `git log` shows the v2 rewrite as scoped commits readable on their own; working tree clean | ? UNCERTAIN | Six commits `41c11c7 fd08fcf ad6884b 932e461 cc0c41c 7272bbf`, each non-empty and scoped to one concern by message and by file. `git status --porcelain` empty. "Readable on its own" is human judgement — routed to human verification |
| 2 | Opening a pull request runs verification and reports pass/fail without publishing | ✓ VERIFIED | PR run `32360247760`, event `pull_request`: `Verify production artifact` **success**, `Deploy to production` **skipped**. Deployment ids either side of the PR window are `6000581541` @ 10:41:08Z and `6000626285` @ 10:44:16Z — the 10:42:42Z PR run created none. Every deployment ref is `main`, never a PR ref |
| 3 | Merging to `main` publishes; served content is production assets only | ✓ VERIFIED | Merge `23092f8` → deployment `6000626285`; latest push `ed4fd4a` → run `32382541400` both jobs success → deployment `6004718597` @ 14:50:34Z. Live now: `/README.md`, `/og-image.html`, `/specs/design.md`, `/.planning/STATE.md`, `/.github/workflows/deploy.yml` all **404**; `/`, `/CNAME`, `/robots.txt`, `/sitemap.xml`, `/og-image.png` all **200** — while those same excluded paths sit on `origin/main` |
| 4 | A visitor sees the v2 page, not the v1 online CV | ✓ VERIFIED | `sha256(curl -sL https://ayoub-hidri.dev/)` = `cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` = `sha256(index.html)`. Served page: `data-lang-block` ×4, `cdn.tailwindcss.com` ×0, `mixpanel` ×0, 96 072 bytes |

**Score:** 52/57 truths verified (4 uncertain → human, 1 present-behavior-unverified)

---

### Plan Truths — 01-01 (delivery tracer)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Pages publishes from Actions, not the branch builder | ✓ VERIFIED | `gh api repos/ayhid/resume/pages` → `"build_type":"workflow"`, `"status":"built"` |
| 2 | Custom domain survives; `cname` + `https_enforced` | ✓ VERIFIED | `"cname":"ayoub-hidri.dev"`, `"https_enforced":true`, `"protected_domain_state":"verified"` |
| 3 | A push publishes only the production manifest | ✓ VERIFIED | Local re-run of `stage-site.sh` → `ls -A` yields exactly `CNAME index.html og-image.png robots.txt sitemap.xml`; `en` skipped as optional |
| 4 | `/README.md` and `/og-image.html` 404 where they were 200 | ✓ VERIFIED | Both 404 now; 01-VALIDATION.md records both at 200 in the 2026-08-19 baseline |
| 5 | `/` returns 200 *throughout* the delivery change | ? UNCERTAIN | No continuous probe. All six deploy runs in the window concluded `success`; `/` is 200 now. Time-window claim — routed to human decision |
| 6 | A pull request runs `verify`; `deploy` is skipped, not failed | ✓ VERIFIED | Run `32360247760` job payload: `Deploy to production` conclusion `skipped` |
| 7 | EDGE concurrency — verify and deploy never share a lane | ✓ VERIFIED | Distinct group expressions by construction: `verify-${{ github.workflow }}-${{ github.ref }}` (cancel-in-progress **true**, deploy.yml:19-20) vs `"pages"` (**false**, deploy.yml:47-48). The two strings cannot collide |
| 8 | EDGE ordering — two close pushes both complete, neither interrupted | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Key present at deploy.yml:48. The six pushes were 3-13 min apart; no two runs overlapped, so the queueing invariant was never exercised |
| 9 | EDGE adjacency — exactly one publisher; no `dynamic` run created | ✓ VERIFIED | Newest `event: dynamic` run is still `21395454336` @ **2026-01-27T11:29:22Z**. All six 2026-08-20 pushes, including `ed4fd4a`, created zero |
| 10 | EDGE empty — a no-op push still verifies and republishes identically; a missing manifest entry exits non-zero | ✓ VERIFIED | Push `c6d60ef` (`.planning/` only) → run `32360110077` success → deployment `6000581541`. Missing-entry path re-run from a fixture lacking `CNAME`: `::error::missing required asset: CNAME`, exit **1** |

### Plan Truths — 01-02 (artifact checker and hygiene)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A pull request runs a real artifact check, not just a copy | ✓ VERIFIED | deploy.yml:25-29; run `32382541400` step `Verify artifact contents` = success in the verify job |
| 2 | Both jobs assert the same manifest via the same script | ✓ VERIFIED | Identical `stage-site.sh _site` + `verify_site.py _site` pairs at deploy.yml:25-29 and 58-62 |
| 3 | A forbidden entry appearing in the artifact fails the run — all eight names | ✓ VERIFIED (was the gap) | Each of `README.md`, `og-image.html`, `specs`, `.planning`, `.github`, `.claude`, `.playwright-mcp`, `_site` planted at top level → exit **1**, 2 annotations each (unlisted + forbidden). Nested and unlisted cases now fail too — see Gap Closure |
| 4 | Broken markup fails with a line number | ✓ VERIFIED | Unclosed: `::error::unclosed <html> opened at line 1` + 3 more, exit 1. Mismatched: `::error::</section> at line 1 closes <div> opened at line 1` + 3 more, exit 1 |
| 5 | A duplicate `id` fails the run | ✓ VERIFIED | `::error::duplicate id: dup (2 occurrences)`, exit 1 |
| 6 | A malformed `sitemap.xml` fails the run | ✓ VERIFIED | `::error::sitemap.xml is not well-formed: mismatched tag: line 1, column 15`, exit 1 |
| 7 | The heading check reports without failing in this phase | ✓ VERIFIED | Two-`<h1>` fixture → `::warning::heading structure: 2 <h1> total…`, `0 problem(s)`, exit **0**. Real `index.html` carries 2 `<h1>` and 2 `data-lang-block` — healthy under the rule, so no warning fires on the production artifact |
| 8 | The verification adds no dependency | ✓ VERIFIED | Import set is exactly `sys`, `pathlib`, `collections`, `html.parser`, `xml.etree.ElementTree` (verify_site.py:14-18). No manifest or lockfile in the repo; no `setup-python` or install step in the workflow |
| 9 | `git status --porcelain` empty; local agent state ignored | ✓ VERIFIED | Empty output. `git check-ignore` confirms `.claude/settings.local.json`, `.playwright-mcp/`, `.planning/research/.cache/`, `_site/` all IGNORED |
| 10 | `.gitignore` ends with a newline, one pattern per line | ✓ VERIFIED | 35 lines; final byte `0a` |

### Plan Truths — 01-03 (the six-slice rewrite)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Six scoped commits, each touching one concern | ✓ VERIFIED | `41c11c7 feat(head)` · `fd08fcf feat(style)` · `ad6884b feat(content) FR` · `932e461 feat(content) EN` · `cc0c41c feat(js)` · `7272bbf docs(readme)` |
| 2 | Each diff is local to one region, readable on its own | ? UNCERTAIN | Human judgement — routed to human verification. `41c11c7` carries a 603-line deletion alongside 73 insertions and is the one worth a human eye |
| 3 | The final state is byte-identical to the frozen rewrite snapshot | ✓ VERIFIED | The snapshot branch is deleted, but its commit survives as a dangling object: `0f652f8 "wip: v2 rewrite snapshot (throwaway)"`. `git diff --quiet 0f652f8 7272bbf -- index.html README.md` → **exit 0, byte-identical**. Re-derived from the object store, not from SUMMARY |
| 4 | The working tree is clean when the series ends | ✓ VERIFIED | `git status --porcelain` empty now and no `index.html` commit exists after `cc0c41c` |
| 5 | No slice commit is empty | ✓ VERIFIED | Insertion counts 73 / 38 / 417 / 430 / 72 / 19 — all non-zero |
| 6 | The rewrite is committed as written | ✓ VERIFIED | Follows from truth 3: zero-byte divergence from the snapshot across both files |
| 7 | The rewrite was safe in the object store before slicing | ✓ VERIFIED | Reflog `HEAD@{24}: checkout: moving from main to wip/v2-snapshot`; the snapshot commit `0f652f8` is still reachable via `git fsck` |
| 8 | Nothing reaches the origin in this plan | ✓ VERIFIED | No workflow run exists between the 01-02 push (`32358543565` @ 10:21:33Z) and the 01-04 push (`32359625065` @ 10:34:51Z) — the slicing window pushed nothing |

### Plan Truths — 01-04 (land the rewrite)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A visitor is served the v2 page | ✓ VERIFIED | sha256 match against committed `index.html`; 0 v1 markers |
| 2 | The held commits reach `origin/main` in one push → one deployment | ✓ VERIFIED | Push run `32359625065` @ 10:34:51Z → exactly one deployment `6000496075` @ 10:35:00Z |
| 3 | `/README.md`, `/og-image.html`, `/specs/design.md`, `/.planning/STATE.md` 404 while present on the origin | ✓ VERIFIED | All four 404 (plus `/.github/workflows/deploy.yml` 404); all present in `git ls-tree origin/main` |
| 4 | `/`, `/robots.txt`, `/sitemap.xml`, `/og-image.png`, `/CNAME` return 200 | ✓ VERIFIED | All five 200 |
| 5 | The publishing source is still Actions; no `pages build and deployment` run | ✓ VERIFIED | Newest `dynamic` run unchanged since 2026-01-27 |
| 6 | `.claude/CLAUDE.md` no longer claims the repo root is published or that `CNAME` binds the domain | ✓ VERIFIED | 0 matches for "repository root is published". CLAUDE.md:51/77/202/266/273 describe the `_site/` allowlist; :66 and :274 state the domain is bound in repository settings and the committed `CNAME` is belt-and-braces |
| 7 | Tree clean and local/remote `main` level | ✓ VERIFIED (at plan scope) | Level at the time of the plan's push. Local `main` is currently 2 commits ahead (`c0cf28b`, `c2ce26e` — both `.planning/` bookkeeping added after the plan closed); the working tree is clean |

### Plan Truths — 01-05 (prove the pull-request gate)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Opening a PR runs verification and reports on the PR | ✓ VERIFIED | Run `32360247760`, event `pull_request`, `Verify production artifact` success |
| 2 | Opening a PR publishes nothing | ✓ VERIFIED | Newest deployment id `6000581541` (10:41:08Z) unchanged across the PR run at 10:42:42Z; next id `6000626285` only appears at 10:44:16Z, after the merge. `Deploy to production` = **skipped**, not run |
| 3 | Merging publishes | ✓ VERIFIED | Merge `23092f8` → push run `32360360573` success → deployment `6000626285` |
| 4 | The PR run holds no publishing privilege | ✓ VERIFIED | `permissions: {}` at workflow level (deploy.yml:10); the verify job block contains **0** occurrences of `pages: write` / `id-token: write` — both exist only on the deploy job (deploy.yml:39-42), which `if: github.event_name == 'push'` keeps unreachable from a PR |
| 5 | Verify and deploy occupy different concurrency lanes | ✓ VERIFIED | Distinct group expressions, as in 01-01 truth 7 |
| 6 | A human has loaded the page, switched language, opened a CV panel, and read the six slice commits | ? UNCERTAIN | Not self-verifiable — routed to human verification (two items) |
| 7 | Tree clean, `main` level, no throwaway branch on the origin | ✓ VERIFIED | `git ls-remote --heads origin` → `feat/astro-strapi-migration` (pre-existing, unrelated) and `main`. `chore/pr-gate-probe` is gone |

### Plan Truths — 01-06 (gap closure: harden the checker)

Every truth below was proven by running the committed checker against a scratch
fixture tree. None was accepted from the SUMMARY.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A forbidden basename fails at any depth, naming the relative path | ✓ VERIFIED | `en/.planning` → `::error::forbidden entry present in artifact: en/.planning`, exit 1. `en/deep/nested/README.md` → named at full relative depth, exit 1 |
| 2 | An unlisted top-level entry fails, one annotation per entry | ✓ VERIFIED | `notes.txt` + `src/` → two `unlisted entry in artifact` annotations, exit 1 |
| 3 | A symlink anywhere fails, including a dangling one | ✓ VERIFIED | `en/docs -> …/.planning` → `::error::symlink in artifact: en/docs -> …`, exit 1. Dangling `README.md -> /nonexistent` → exit 1 (previously exit 0, because `exists()` follows the link) |
| 4 | The `FORBIDDEN` comment describes the code and claims no guarantee it lacks | ✓ VERIFIED | verify_site.py:29-45 states the top-level allowlist rule, the any-depth basename+symlink rule, and the `en/` limitation. The prior overstated backstop sentence is absent |
| 5 | The demonstrated negative set is extended; no fixture committed | ✓ VERIFIED | 14 fixture trees exercised this session in a scratch dir; `git ls-files` shows 0 committed test/fixture paths; `git status --porcelain` empty |
| 6 | `en/` stays optional and Phase 10 stays unbroken | ✓ VERIFIED | No `en/` → exit 0. `en/index.html` with arbitrary content → `0 problem(s)`, exit 0. `en/` holding a forbidden basename or symlink → exit 1. The hardening does not pre-break Phase 10 |
| 7 | The gate is green on arrival against the working tree | ✓ VERIFIED | `stage-site.sh` + `verify_site.py` re-run locally → `0 problem(s)`, exit 0 |
| 8 | Every 01-02 check still holds after the hardening | ✓ VERIFIED | All re-run: five REQUIRED, eight depth-1 forbidden names, tag balance with line numbers, duplicate `id`, malformed sitemap, heading warning non-failing. No regression |
| 9 | A missing staged directory exits non-zero with named errors, no traceback | ✓ VERIFIED | Absent dir → `::error::staged directory not found: …` plus five named missing-asset errors, `6 problem(s)`, exit 1, no traceback |
| 10 | The import set is unchanged — five stdlib modules | ✓ VERIFIED | verify_site.py:14-18 exactly `sys`, `pathlib`, `collections`, `html.parser`, `xml.etree.ElementTree` |
| 11 | Both jobs ran the hardened checker on a real run; published bytes unchanged | ✓ VERIFIED | Run `32382541400`: `Verify artifact contents` = success in **both** jobs; deployment `6004718597`. Live sha256 still `cec4a983…bce9ad`; `/README.md` still 404 |

---

### Deferred Items

Items not met but explicitly owned by later milestone phases. These do not block Phase 1.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Six `[CHIFFRE_A_VALIDER]` placeholders render as case-card result figures, live on production | Phase 8 | PROOF-04: "no unverifiable number ships"; Phase 8 SC4 |
| 2 | Two `[MENTION_FINANCEMENT_A_VALIDER]` placeholders render as the AI-offer financing line, live on production | Phase 7 | IA-04: financing line "legally accurate … or absent"; Phase 7 SC3 |
| 3 | The `<h1>` heading rule warns rather than fails | Phase 11 | A11Y-01, named as the owner in verify_site.py:110-111 and in the 01-02 must-have itself |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `.github/scripts/verify_site.py` | Default-deny top level, any-depth basename + symlink rejection, plus manifest/markup/id/sitemap checks; `contains: OPTIONAL`, `min_lines: 150` | ✓ VERIFIED | 209 lines; `OPTIONAL` at :27 and :139; wired at deploy.yml:29 and :62; exercised against 14 fixtures |
| `.github/scripts/stage-site.sh` | Allowlist staging of the D-06 manifest | ✓ VERIFIED | 38 lines; `REQUIRED` :15, `OPTIONAL` :17; re-run locally produces exactly the five-file artifact |
| `.github/workflows/deploy.yml` | Two jobs; deploy gated on push-to-main; per-job concurrency; no ambient permissions | ✓ VERIFIED | 71 lines; `permissions: {}` :10; gate :37; concurrency :18-20 and :46-48 |
| `.gitignore` | Ignores agent state, Playwright dir, research cache, `_site/`; `contains: _site/`, `min_lines: 28` | ✓ VERIFIED | 35 lines, trailing newline; all four paths confirmed IGNORED via `git check-ignore` |
| `index.html` | The v2 rewrite, committed as written | ✓ VERIFIED | Byte-identical to the frozen snapshot `0f652f8` and to the live page |
| `.claude/CLAUDE.md` | Stale deployment/domain constraints corrected | ✓ VERIFIED | :51, :66, :77, :202, :266, :273-274 all describe the allowlist and settings-bound domain |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `.github/workflows/deploy.yml` | `.github/scripts/verify_site.py` | Both jobs run the checker on the staged dir | ✓ WIRED | Pattern `verify_site\.py _site` matches at :29 and :62; both steps reported `success` on run `32382541400` |
| `.github/workflows/deploy.yml` | `.github/scripts/stage-site.sh` | Both jobs stage with the same script | ✓ WIRED | :26 and :59 |
| `.github/scripts/verify_site.py` | `.github/scripts/stage-site.sh` | `REQUIRED`/`OPTIONAL` mirror the staging arrays | ✓ WIRED | Checker `REQUIRED` :23 = script `REQUIRED` :15 (five entries, same order); checker `OPTIONAL` :27 = script `OPTIONAL` :17 (`en`). Verified by running both: the staged output passes the checker's positive allowlist with zero unlisted entries |
| `.github/workflows/deploy.yml` | GitHub Pages | `upload-pages-artifact` on `_site` → `deploy-pages` | ✓ WIRED | :64-71; deployment `6004718597` created; live bytes = staged bytes |

### Data-Flow Trace (Level 4)

| Artifact | Data | Source | Produces Real Data | Status |
|---|---|---|---|---|
| Live `https://ayoub-hidri.dev/` | Page bytes | `_site/index.html` staged from the committed `index.html` | Yes — sha256 identity to the repo file | ✓ FLOWING |
| `verify_site.py` exit code | Pass/fail signal | `errors[]` populated by `check_manifest` / `check_tree` / `Checker` / sitemap parse | Yes — every rule independently produced exit 1 on a targeted fixture | ✓ FLOWING |
| `stage-site.sh` output dir | Artifact contents | `REQUIRED` / `OPTIONAL` arrays, `cp -R` from the repo root | Yes — five files, nothing else | ✓ FLOWING |
| CI gate → production | Deployment | `deploy` job gated by `github.event_name == 'push'` | Yes — PR run created 0 deployments; push runs each created exactly 1 | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Real artifact passes clean | `stage-site.sh` + `verify_site.py` | `0 problem(s)` exit 0 | ✓ PASS |
| Previously-passing exploit tree now fails | fixture `en/.planning` + `notes.txt` + `src/` | 3 errors, exit 1 | ✓ PASS |
| Nested forbidden basename | fixture `en/deep/nested/README.md` | 1 error, exit 1 | ✓ PASS |
| Unlisted top-level file | fixture `secrets.env` | 1 error, exit 1 | ✓ PASS |
| Symlink escape | fixture `en/docs -> …/.planning` | 1 error, exit 1 | ✓ PASS |
| Dangling symlink named `README.md` | fixture | 3 errors, exit 1 | ✓ PASS |
| All eight depth-1 forbidden names | 8 fixtures | exit 1 each | ✓ PASS |
| Valid `en/` does not false-positive | fixture `en/index.html` | `0 problem(s)` exit 0 | ✓ PASS |
| Missing required asset | fixture without `CNAME` | exit 1 | ✓ PASS |
| Absent staged dir, no traceback | `verify_site.py /nonexistent` | 6 errors, exit 1 | ✓ PASS |
| Markup / id / sitemap rules | 4 fixtures | exit 1 each | ✓ PASS |
| Heading rule warns only | 2-`<h1>` fixture | exit 0 with `::warning::` | ✓ PASS |
| Live page = committed page | `curl \| shasum -a 256` | identical | ✓ PASS |
| Exclusions 404, production assets 200 | 10 `curl -o /dev/null -w %{http_code}` | 5×404, 5×200 | ✓ PASS |
| Series matches frozen snapshot | `git diff --quiet 0f652f8 7272bbf -- index.html README.md` | exit 0 | ✓ PASS |
| Deploy-job ordering under real concurrency | — | Never exercised; runs 3-13 min apart | ? SKIP → human |

### Probe Execution

| Probe | Command | Result | Status |
|---|---|---|---|
| — | — | No `scripts/*/tests/probe-*.sh` exists and no plan declares one; the phase's runnable gate is `verify_site.py`, exercised above | SKIPPED (no probes declared) |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|---|---|---|---|---|
| OPS-01 | 01-01, 01-02, 01-05, 01-06 | A pull request runs verification without deploying to production | ✓ SATISFIED | Run `32360247760`: verify success, deploy **skipped**, 0 deployments created |
| OPS-02 | 01-01, 01-02, 01-04, 01-06 | Only production assets are published | ✓ SATISFIED | 5 excluded paths 404 live while present on `origin/main`; staged artifact is exactly the five-file manifest; checker now fails on any unlisted or nested-forbidden entry |
| OPS-03 | 01-03, 01-04 | The v2 rewrite is committed in reviewable increments | ✓ SATISFIED (readability → human) | Six non-empty scoped commits, byte-identical to the frozen snapshot. The "reviewable" judgement is routed to human verification |
| OPS-04 | 01-01, 01-04, 01-05 | Deployment to production happens on merge to `main` | ✓ SATISFIED | Merge `23092f8` → deployment `6000626285`. See warning WR-A on direct pushes also publishing |

**Orphaned requirements:** none. `REQUIREMENTS.md` maps exactly OPS-01…OPS-04 to Phase 1, and all four are claimed by plan frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `index.html` | 219, 247, 269, 291, 649, 677, 699, 721 | Unreplaced content placeholders `[CHIFFRE_A_VALIDER]` ×6, `[MENTION_FINANCEMENT_A_VALIDER]` ×2, live on production | ⚠️ Warning (deferred) | Independently confirmed on the live page. Not a Phase 1 must-have — Phase 1 was explicitly prohibited from editing `index.html`, and PROOF-04 / IA-04 own the copy. Deferred to Phases 8 and 7, with a human timing decision raised |
| `.github/scripts/verify_site.py` | 134-142, 181-198 | The gate green-lights a content-free artifact | ⚠️ Warning | Reproduced: zero-byte `index.html`, `og-image.png`, `CNAME`, `robots.txt` + a minimal valid sitemap → `0 problem(s)`, exit 0. A blank homepage would deploy green. No Phase 1 must-have claims a non-emptiness assertion, so this is hardening backlog rather than a gap |
| `.github/scripts/stage-site.sh` | 9-20 | `rm -rf "$DEST"` behind a four-literal guard, before REQUIRED validation | ⚠️ Warning | Guard covers only `""`, `/`, `.`, `..`. `$HOME` and `.planning` both pass it. README.md:22 instructs the reader to type this command with a destination argument, so the hazardous parameter is hand-entered routinely. Not a must-have; no data loss has occurred |
| `.github/scripts/verify_site.py` | 42-45 | `en/` subtree unenumerated — `en/.env` publishes green | ⚠️ Warning | Reproduced: `en/.env` containing `AWS_KEY=…` → `0 problem(s)`, exit 0. A no-dotfiles rule is available without knowing Phase 10's filenames, so the comment's "strongest assertion available" is overstated. `en/` does not exist yet, so exposure is zero today |
| — | — | Debt markers (`TBD`/`FIXME`/`XXX`/`HACK`/`TODO`) in phase-modified files | ℹ️ None | Scanned `verify_site.py`, `stage-site.sh`, `deploy.yml`, `.gitignore`, `README.md`, `index.html` — zero matches. No unreferenced debt |
| — | — | AI attribution trailers in phase commits | ℹ️ None | 0 matches for `Co-Authored-By: Claude` / `Generated with [Claude` / 🤖 across the phase's commits |

**WR-A — the goal's "only through a merge" clause.** `main` is unprotected
(`branches/main/protection` → 404), and `ed4fd4a` — this phase's own gap-closure
commit — reached production by direct push (single parent `bb2a894`, zero merges in
range). The verify job did run on that push, so nothing unverified shipped, but the
PR gate the phase built was bypassed. The four ROADMAP Success Criteria do not
require branch protection and no plan must-have claimed it, so this is not scored
as a failure; it is raised as a human decision.

### Prohibitions

All prohibitions from 01-02 and 01-06 were checked mechanically. Each is judgment-tier
(declared as bare strings, not `{statement, status, verification}` records), but each
resolved to a deterministic observation rather than an opinion, so none is left
unverified.

| Prohibition | Status | Evidence |
|---|---|---|
| No package manifest or lockfile | ✓ HELD | 0 of `package.json`, `package-lock.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod` |
| No new runtime dependency; five stdlib imports only | ✓ HELD | verify_site.py:14-18 |
| No test framework, runner, or committed fixture | ✓ HELD | `git ls-files` → 0 test/fixture paths |
| `index.html` not edited by 01-06 | ✓ HELD | `ed4fd4a` touches exactly one file: `verify_site.py` (+70/-7) |
| `README.md` not edited by 01-06 | ✓ HELD | same |
| `stage-site.sh` not edited by 01-06 | ✓ HELD | same |
| Action versions not bumped | ✓ HELD | `checkout@v4` ×2, `configure-pages@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4` |
| `en/` must not become required | ✓ HELD | Artifact without `en/` → exit 0 |
| `en/` contents not allowlisted | ✓ HELD | Arbitrary `en/index.html` → exit 0 |
| No language-runtime setup or install step | ✓ HELD | 0 matches for `setup-python`/`setup-node`/`npm install`/`pip install` |
| No Lighthouse or link checking in the PR job | ✓ HELD | 0 matches |
| Deploy job unreachable from a pull request | ✓ HELD | `if:` gate at deploy.yml:37; PR run showed `skipped` |
| Heading rule stays a non-failing warning | ✓ HELD | 2-`<h1>` fixture exits 0 |
| Checker enforces no design rules | ✓ HELD | No colour/radius/shadow logic in the file |
| `og-image.html` not reachable in production | ✓ HELD | `/og-image.html` → 404 |
| `.playwright-mcp/og-image.png` not committed | ✓ HELD | Path is git-ignored; root `og-image.png` is the real asset |
| No AI attribution trailer or generation footer | ✓ HELD | 0 matches across phase commits |

---

### Human Verification Required

Six items — see `human_verification` in the frontmatter for the full text.

1. **Read the six slice commits** — ROADMAP SC1's "readable on its own" is a human judgement; `41c11c7` folds a 603-line v1 deletion into the head slice.
2. **Decide on the live content placeholders** — eight are on production now; owned by Phases 7 and 8, but the exposure window is a business call.
3. **Decide on branch protection for `main`** — the goal says "only through a merge"; the branch is unprotected and this phase's own fix went in by direct push.
4. **Load and exercise the deployed page** — language switch, CV panel, print preview.
5. **Decide the uptime-window claim** — "200 throughout" cannot be established retroactively.
6. **Reconcile Phase 1's `Mode: mvp`** with its non-User-Story goal — carried forward unresolved.

Plus one behavior-unverified truth: the deploy-queue ordering invariant (`cancel-in-progress: false`) has never been exercised by two overlapping runs.

### Gaps Summary

No gaps. The single gap from the previous run — G-01, the shallow depth-1 denylist —
is genuinely closed, and closure was proven by re-running the exact tree that
previously passed: it now produces three annotations and exit 1. All 57 must-have
truths across the four ROADMAP Success Criteria and six plans resolve to VERIFIED
(52), UNCERTAIN pending human judgement (4), or PRESENT_BEHAVIOR_UNVERIFIED (1).
None resolves to FAILED. No artifact is missing, stubbed or orphaned; all four key
links are wired and carry real data.

What the phase built is sound: the artifact that reaches production is an allowlist
staged by one script and asserted by a second that is now default-deny at the top
level and rejects forbidden basenames and symlinks at every depth. A pull request
verifies and publishes nothing; a push to `main` verifies, publishes, and the served
bytes are identical to the reviewed commit.

Three things the phase did not build are worth carrying forward as backlog rather
than as gaps, because no must-have claimed them: the gate cannot tell a finished page
from a blank one (a zero-byte artifact deploys green), it cannot see page text (eight
authoring placeholders are live), and `stage-site.sh` will `rm -rf` an arbitrary path
behind a four-literal guard. The first and third are hardening; the second is content
owned by Phases 7 and 8. The goal's literal "only through a merge to `main`" is not
mechanically enforced — `main` is unprotected — which is the one place where the
delivered contract is narrower than the goal sentence, and it is escalated rather
than resolved here.

---

_Verified: 2026-08-20T17:40:00Z_
_Verifier: Claude (gsd-verifier)_
