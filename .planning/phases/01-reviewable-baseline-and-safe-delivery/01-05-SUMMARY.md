---
phase: 01-reviewable-baseline-and-safe-delivery
plan: 05
subsystem: infra
tags: [github-actions, pull-request, delivery-gate, deployment, phase-close]

# Dependency graph
requires:
  - "01-01 — the two-job workflow whose pull_request half this plan finally exercises, plus PHASE_BASE and the bookkeeping filter"
  - "01-02 — verify_site.py, the checker the pull-request run executes"
  - "01-03 — the six-slice rewrite series this plan hands to the human reader"
  - "01-04 — the push that landed v2, and the eleven-subject series this plan extends to thirteen"
provides:
  - "Empirical proof that a pull request verifies and publishes nothing: deployment id identical across the pull request's open window"
  - "Empirical proof that a merge to main publishes: a new deployment id created by the merge commit's push run"
  - "OPS-01 flipped to Complete on observed evidence rather than on workflow-file reasoning"
  - "The closed phase commit series: thirteen filtered subjects, every prefix count matching prediction"
  - "The README's local rehearsal line — the production artifact reproducible off-CI"
affects: [phase-02-analytics, phase-10-en-route, phase-11-performance]

actuals:
  tokens: 1100
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Deployment-id invariance as the negative-publication assertion: a job status can be misread, a created deployment cannot"
    - "Watermark-after-levelling: read the control-plane watermark only after the bookkeeping push has settled, so its own deploy cannot be mistaken for a publication during the probe window"

key-files:
  created: []
  modified:
    - README.md

key-decisions:
  - "The probe pull request was merged with `gh pr merge --merge`, not squashed or rebased — the merge commit is itself the OPS-04 evidence and the thirteenth entry in the phase series"
  - "The `github-pages` environment deployment-branch policy was left untouched at `gh-pages,main`; it is the independent backstop behind the event gate and removing it as redundant is prohibited by this plan"
  - "The README addition was given its own `## Local rehearsal` heading rather than being folded into `## Technologies used`, whose bullets describe technologies and not commands"
  - "The end-of-phase human check is recorded as OUTSTANDING rather than self-approved; `workflow.human_verify_mode` is `end-of-phase` and no agent may answer a readability judgement on the developer's behalf"

patterns-established:
  - "Prove a negative about a deployment pipeline with a control-plane watermark, not with a job conclusion — read the newest deployment id before and during the window and compare"

requirements-completed: [OPS-01, OPS-04]

coverage:
  - id: D1
    description: "Opening a pull request against main runs verification and reports pass or fail on the pull request"
    requirement: "OPS-01"
    verification:
      - kind: e2e
        ref: "run 32360247760 (event pull_request, the repository's first) -> conclusion success; 'Verify production artifact' -> success, 6s; gh pr checks 2 reported it on the pull request"
        status: pass
      - kind: e2e
        ref: "run log shows the identical rehearsal: five staged files from stage-site.sh then '0 problem(s)' from verify_site.py"
        status: pass
    human_judgment: false
  - id: D2
    description: "Opening a pull request publishes nothing"
    requirement: "OPS-01"
    verification:
      - kind: e2e
        ref: "newest deployment id 6000581541 @ 2026-08-20T10:41:08Z before the branch was cut; 6000581541 again while the pull request was open — identical"
        status: pass
      - kind: e2e
        ref: "'Deploy to production' on run 32360247760 -> skipped; newest push run unchanged at 32360110077; served sha256 unchanged at cec4a983…bce9ad"
        status: pass
    human_judgment: false
  - id: D3
    description: "The pull-request run holds no publishing privilege"
    requirement: "OPS-01"
    verification:
      - kind: unit
        ref: "deploy.yml: `pages: write` L41, `id-token: write` L42, `environment.name: github-pages` L44 — all inside `deploy:` (L31+); `verify:` spans L13-29; `pull_request_target` count 0"
        status: pass
      - kind: integration
        ref: "gh api environments/github-pages/deployment-branch-policies -> gh-pages,main — unchanged backstop"
        status: pass
    human_judgment: false
  - id: D4
    description: "Merging that pull request to main publishes"
    requirement: "OPS-04"
    verification:
      - kind: e2e
        ref: "merge commit 23092f8 -> push run 32360360573, conclusion success, Verify success then Deploy success; new deployment 6000626285 @ 2026-08-20T10:44:16Z, differing from the 6000581541 watermark"
        status: pass
      - kind: e2e
        ref: "gh run list --event dynamic newest createdAt -> 2026-01-27T11:29:22Z, unmoved across the whole plan"
        status: pass
    human_judgment: false
  - id: D5
    description: "A merged commit that edits README.md changes nothing that ships"
    requirement: "OPS-02"
    verification:
      - kind: e2e
        ref: "after the merge: /README.md -> 404; served sha256 still cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad; data-lang-block 4"
        status: pass
    human_judgment: false
  - id: D6
    description: "The phase's commit series is readable one commit at a time"
    requirement: "OPS-03"
    verification:
      - kind: unit
        ref: "filtered SERIES = 13 entries; ci(deploy) 3, chore 1, feat( 5, docs( 3, Merge 1; oldest = 'ci(deploy): add production allowlist staging script'; attribution trailers over the raw range = 0"
        status: pass
      - kind: manual
        ref: "human reading of the six slice commits and of the corrected .claude/CLAUDE.md prose — printed and handed over, NOT YET ANSWERED"
        status: pending
    human_judgment: true
    rationale: "Whether each commit is genuinely reviewable six months from now is a judgement no assertion substitutes for. The evidence is assembled and the reading order is printed below; the developer's answer is owned by the end-of-phase verification."

status: complete
metrics:
  duration: 8min
  completed: 2026-08-20
---

# Phase 01 Plan 05: Prove the Pull-Request Gate Summary

**The repository's first pull-request workflow run verified the production artifact and published
nothing — the newest deployment id read `6000581541` both before and while the pull request was
open — and merging the same pull request moved it to `6000626285`, so both halves of the delivery
gate are now observed rather than reasoned about.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-08-20T10:38:00Z
- **Completed:** 2026-08-20T10:46:00Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Opened, verified and merged the repository's first-ever `pull_request` workflow run.
- Proved non-publication by control-plane watermark, not by job status: the newest deployment id was
  byte-identical before the probe branch was cut and while the pull request was open.
- Proved the merge path publishes, closing OPS-04 through the route a reviewer would actually use
  rather than through a direct push.
- Confirmed the pull-request run never held publishing privilege, and left the `github-pages`
  environment branch policy intact as the independent backstop.
- Closed the phase series at exactly thirteen filtered commits, with every prefix count landing on
  its predicted value.
- Flipped OPS-01 to Complete — the first plan in this phase entitled to, because it is the first with
  evidence.

## Task Commits

1. **Task 1: Record the deployment watermark and open the probe pull request** — `9af8c71`
   (`docs(readme): document the local artifact rehearsal`), 3 insertions, `README.md` only.
2. **Task 2: Prove the pull request verifies and publishes nothing, then merge** — `23092f8`
   (`Merge pull request #2 from ayhid/chore/pr-gate-probe`), created by `gh pr merge --merge`.
   No file edited by this task.
3. **Task 3: Close the phase** — no commit by design (assertions and human handover only).

## The levelling push

Plan `01-04`'s own SUMMARY commit `c6d60ef` landed after that plan's push, so local `main` was one
commit ahead of the origin. Pushing it first is what keeps `.planning/` out of the probe pull
request's diff.

| | Value |
|---|---|
| Range | `a6e32d2..c6d60ef` |
| Run | [`32360110077`](https://github.com/ayhid/resume/actions/runs/32360110077), head `c6d60ef` |
| Conclusion | `success` |
| Level after | `git rev-list --left-right --count origin/main...main` → `0 0` |

`.planning/` is excluded by the D-06 manifest, so this republished a byte-identical artifact — one
more free observation of the OPS-04 empty-input edge.

## The watermark

Read **after** the levelling push settled, so its own deployment could not be mistaken for a
publication during the probe window.

| Measurement | Value |
|---|---|
| Newest deployment id | `6000581541` |
| Its `created_at` | `2026-08-20T10:41:08Z` (sha `c6d60ef`) |
| Newest push-event run id | `32360110077` |
| Newest `event: dynamic` run | `2026-01-27T11:29:22Z` |

Counting the deployments array would have been unreliable — that endpoint paginates. The newest
identifier is the stable watermark.

## The pull request

[**#2 — `docs(readme): document the local artifact rehearsal`**](https://github.com/ayhid/resume/pull/2),
head `chore/pr-gate-probe`, one file changed (`README.md`), body carrying zero generation footers.

**Run [`32360247760`](https://github.com/ayhid/resume/actions/runs/32360247760)** — `event:
pull_request`, head `9af8c71`, conclusion `success`. This is the first `pull_request` run in the
repository's history.

| Job | Conclusion | Duration |
|---|---|---|
| Verify production artifact | `success` | 6 s |
| Deploy to production | `skipped` | — |

The skip is the design, not a symptom: `needs: verify` was satisfied while
`github.event_name == 'push'` was false.

The run performed the **identical** rehearsal the deploy performs, not an approximation:

```
staged   index.html
staged   CNAME
staged   robots.txt
staged   sitemap.xml
staged   og-image.png
skipped  en (optional, absent)
0 problem(s)
```

## Nothing was published — the load-bearing assertion

| Measurement | Before the branch was cut | While the pull request was open | Verdict |
|---|---|---|---|
| Newest deployment id | `6000581541` | **`6000581541`** | identical |
| Newest push-event run | `32360110077` | `32360110077` | no new push run |
| Newest `event: dynamic` run | `2026-01-27T11:29:22Z` | `2026-01-27T11:29:22Z` | legacy builder silent |
| `sha256(curl /)` | `cec4a983…bce9ad` | `cec4a983…bce9ad` | live page unmoved |

A job conclusion can be misread; a deployment that was never created cannot be. This is the only
piece of evidence in the phase that survives a mis-edited workflow, and it is the evidence ROADMAP
criterion 2 rests on.

## No privilege was granted

Read from the shipped `deploy.yml` with comments stripped. `verify:` opens at line 13 and ends at
line 29; `deploy:` opens at line 31.

| Grant | Line | Job | Count |
|---|---|---|---|
| `pages: write` | 41 | deploy | 1 |
| `id-token: write` | 42 | deploy | 1 |
| `environment.name: github-pages` | 44 | deploy | 1 |
| `pull_request_target` | — | — | **0** |

The pull-request run's token could not have created a deployment even if the event gate had been
wrong. The `github-pages` environment deployment-branch policy still lists exactly `gh-pages,main`
— untouched, as this plan requires.

## The merge published

`gh pr merge 2 --merge --delete-branch` produced merge commit `23092f8`.

| | Value |
|---|---|
| Run | [`32360360573`](https://github.com/ayhid/resume/actions/runs/32360360573), `event: push`, head `23092f8` |
| Conclusion | `success` — `Verify production artifact` success, then `Deploy to production` success |
| New deployment id | **`6000626285`** @ `2026-08-20T10:44:16Z`, sha `23092f8` |
| Watermark it replaced | `6000581541` — different, as required |
| `event: dynamic` after the merge | `2026-01-27T11:29:22Z` — still unmoved |

OPS-04 is now observed through a merge, not only through a direct push.

## Live status matrix after the merge

`curl -s -o /dev/null -w '%{http_code}' -L https://ayoub-hidri.dev$u`

| URL | Code | Expected | Verdict |
|---|---|---|---|
| `/` | 200 | 200 | pass |
| `/robots.txt` | 200 | 200 | pass |
| `/sitemap.xml` | 200 | 200 | pass |
| `/og-image.png` | 200 | 200 | pass |
| `/CNAME` | 200 | 200 | pass |
| `/README.md` | **404** | 404 | pass — a merged commit *edited this file* and it still does not ship |
| `/og-image.html` | 404 | 404 | pass |
| `/specs/design.md` | 404 | 404 | pass |
| `/.planning/STATE.md` | 404 | 404 | pass |
| `/en/` | 404 | 404 | pass (Phase 10) |

`data-lang-block` on the served page: `4`. `sha256(served)` is still
`cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` — identical to before the merge,
because the merged change touched a file outside the manifest. That is OPS-02 restated in its most
compact form.

Control plane: `workflow ayoub-hidri.dev built`.

## The closed phase series

`PHASE_BASE` = `4b6f8ef5df80e4688fe0f8bb7828aee8a6fe65e3` — the **local** pre-phase tip, read from
`01-01-SUMMARY.md` and not re-derived. Filter applied verbatim from the same source.

Raw range: **17** commits — deliberately not asserted, since it counts GSD's own SUMMARY and
wave-tracking commits, whose number depends on how the run went.

Filtered series — **13** entries, newest first:

```
 1  Merge pull request #2 from ayhid/chore/pr-gate-probe
 2  docs(readme): document the local artifact rehearsal
 3  docs(claude): correct the deployment scope and custom domain constraints
 4  docs(readme): describe the v2 site
 5  feat(js): v2 language switch, accordions and print hook
 6  feat(content): v2 English mirror
 7  feat(content): v2 French page tree
 8  feat(style): v2 design tokens and global stylesheet
 9  feat(head): v2 metadata, OpenGraph and JSON-LD
10  chore: ignore local agent state and CI staging output
11  ci(deploy): verify staged artifact contents with a stdlib-only checker
12  ci(deploy): split verify and deploy jobs, publish only the staged artifact
13  ci(deploy): add production allowlist staging script
```

Entries 3–13 are `01-04`'s eleven, unchanged. Entries 1–2 are this plan's.

| Assertion | Expected | Measured |
|---|---|---|
| total | `13` | `13` |
| `^ci(deploy): ` | `3` | `3` |
| `^chore: ` | `1` | `1` |
| `^feat(` | `5` | `5` |
| `^docs(` | `3` | `3` |
| `^Merge pull request ` | `1` | `1` |
| oldest (`tail -1`) | `ci(deploy): add production allowlist staging script` | matched — D-04 holds |
| attribution trailers over the **raw** range | `0` | `0` |

3 + 1 + 5 + 3 = 12, plus the merge commit = 13. The breakdown and the total corroborate each other,
and all three `docs(` entries are named phase commits rather than a bookkeeping subject that slipped
the filter.

## Cleanliness

| Check | Result |
|---|---|
| `git status --porcelain` | empty |
| `git rev-list --left-right --count origin/main...main` | `0 0` |
| `git ls-remote --heads origin chore/pr-gate-probe` | exit `2` — gone |
| `git branch --list 'wip/*' 'chore/pr-gate-probe'` | `0` |

## OUTSTANDING — the end-of-phase human check

**Not answered, and deliberately not self-approved.** `workflow.human_verify_mode` is
`end-of-phase`, and the two judgements below are the ones no assertion substitutes for. They are
owned by the phase-close verification.

### 1. Read the commit series (ROADMAP criterion 1, OPS-03 manual half)

```bash
git log --oneline 4b6f8ef..origin/main
```

Read the **filtered** thirteen printed above, not the raw seventeen. Then read the six slice commits
one at a time, newest first:

| # | SHA | Subject | Stat |
|---|---|---|---|
| 6 | `7272bbf` | `docs(readme): describe the v2 site` | `README.md` +19 / −13 |
| 5 | `cc0c41c` | `feat(js): v2 language switch, accordions and print hook` | `index.html` +72 |
| 4 | `932e461` | `feat(content): v2 English mirror` | `index.html` +430 |
| 3 | `ad6884b` | `feat(content): v2 French page tree` | `index.html` +417 / −1059 |
| 2 | `fd08fcf` | `feat(style): v2 design tokens and global stylesheet` | `index.html` +38 |
| 1 | `41c11c7` | `feat(head): v2 metadata, OpenGraph and JSON-LD` | `index.html` +73 / −603 |

Every stat matches `01-03-SUMMARY.md` exactly. For each: does the message name one concern, and does
the diff stay inside that concern's region of `index.html`? Commits 1–4 are expected to leave a page
that renders imperfectly — that is D-02, not a defect. The question is whether you could review
these one at a time six months from now.

The same judgement covers the corrected `.claude/CLAUDE.md` prose from `01-04` (`a6e32d2`), whose
readability that plan explicitly deferred here.

### 2. Load the deployed page (ROADMAP criterion 4)

Open https://ayoub-hidri.dev/ and confirm it is the v2 bilingual page; the FR/EN switch flips the
visible language; opening one CV role panel expands it and the `+` becomes `−`; no console error on
load. Design, colour, type and performance are **not** under review — Phases 3, 4 and 11 own those.

### 3. Confirm the leak is closed (ROADMAP criterion 3)

Open https://ayoub-hidri.dev/README.md, https://ayoub-hidri.dev/og-image.html and
https://ayoub-hidri.dev/specs/design.md in a browser. All three must be 404. All three were measured
as 404 by `curl` above; the browser check confirms it against a real cache path.

A rendering complaint about the rewrite is input to a later phase, not a change to make here. A
defect in the *delivery* path is a gap for `/gsd-plan-phase --gaps`.

## Decisions Made

- **Merged rather than closed, with `--merge`.** D-09 allowed either. Merging bought the OPS-04
  merge-path proof for free, and `--merge` specifically because a squash or rebase merge creates no
  merge commit — the series count would have been 12, and the merge-path evidence would have been
  a fast-forward rather than a merge.
- **Read the watermark after the levelling push, not before.** Had it been read first, the levelling
  push's own deployment (`6000581541`) would have appeared *during* the probe window and looked like
  a publication caused by the pull request. The ordering is what makes the invariance assertion mean
  anything.
- **Gave the README addition its own heading.** The plan asked for "one line"; the content is one
  line, under a two-word `## Local rehearsal` heading. Folding it into `## Technologies used` would
  have put a command among bullets that name technologies. The README uses inline backticks and no
  fenced blocks, so the command is inline, matching the file's existing style.
- **Rehearsed the documented command before committing it.** `bash .github/scripts/stage-site.sh
  _site && python3 .github/scripts/verify_site.py _site` was run locally and reported `0 problem(s)`
  — documentation of a command that had not been executed would be a stub.

## Deviations from Plan

### 1. [Precondition] The plan anticipated two bookkeeping commits ahead of the origin; there was one

- **Found during:** Task 1, precondition check
- **Issue:** The plan's precondition text expects `01-04`'s SUMMARY commit *and* a wave-4 tracking
  commit. Only `c6d60ef` (`docs(01-04): complete land the rewrite plan`) existed.
- **Resolution:** The precondition is written as a predicate, not a count —
  `git log --format='%s' origin/main..main | grep -vcE '<filter>'` outputs `0` — and it did. The
  levelling push was performed exactly as specified. No adjustment was needed; recorded because the
  plan's prose names a commit that never materialised.

### 2. [Interpretation] The README addition is three lines, not one

- **Found during:** Task 1
- **Issue:** The plan says "add one line to `README.md`". The commit adds three: a `## Local
  rehearsal` heading, the content line, and a blank separator.
- **Resolution:** The *content* is one line. The acceptance criterion (`grep -c 'stage-site.sh'
  README.md` ≥ 1, and the pull request's file list being exactly `README.md`) is satisfied, and the
  diff is 3 insertions with 0 deletions. Recorded as measured rather than compressed into a form
  that would read worse.

---

**Total deviations:** 2 — one precondition-prose discrepancy recorded rather than forced, one
formatting interpretation. No auto-fix under Rules 1–3 was required and no architectural decision
arose.
**Impact on plan:** none. Every load-bearing assertion passed on its predicted value.

## Issues Encountered

None. The pull-request run, the skip, the watermark invariance, the merge run and edge propagation
all behaved exactly as `01-RESEARCH.md` §Pattern 2 predicted. The live matrix had settled by the
first poll after the merge deploy finished.

## Known Stubs

None. The README line documents a command that was executed and passed before it was committed.

## Deferred Issues

- **T-01-08 — the Mixpanel project token at `0650811` in public git history.** Unchanged by this
  plan, disposition `accept`, recorded in `01-CONTEXT.md` §Deferred Ideas and `.planning/STATE.md`
  §Blockers/Concerns. Rotation or project disablement is a minutes-long action with no code change;
  re-raise at milestone close.
- **Node 20 deprecation annotations** on the pinned `actions/*` versions. Informational; a version
  bump is a separate ops change touching no file in this plan's `files_modified`.
- **The end-of-phase human check above is unanswered.** It is the only item standing between this
  phase and a fully green close.

## Threat Flags

None. No new security-relevant surface. This plan *measured* the register rather than extending it:

- **T-01-02** (a pull request reaching the deploy job and self-publishing) moves from
  structurally-mitigated to **empirically mitigated** — deployment-id invariance across the probe
  window, deploy `skipped`, and all three independent controls confirmed intact.
- **T-01-19** (`pull_request_target`) confirmed absent from the shipped workflow: grep count `0`.
- **T-01-04** (pull-request metadata reaching a `run:` step) holds — the probe's title and body never
  entered a shell; no step interpolates `${{ github.event.* }}`.
- **T-01-05** (a pull-request run delaying a production publish) held in practice: the verify run
  used its own ref-keyed group and never entered the `"pages"` lane.
- **T-01-SC** unchanged — first-party `actions/` pins only, and no package was installed anywhere in
  this plan, so no package-legitimacy checkpoint applied.

## Next Phase Readiness

ROADMAP criteria 1, 2, 3 and 4 all have their automated evidence. OPS-01, OPS-02, OPS-03 and OPS-04
are all Complete in `REQUIREMENTS.md`. The tree is clean, `main` and `origin/main` are level at
`23092f8`, and no throwaway branch remains locally or on the origin.

**One item is outstanding:** the end-of-phase human check above. Run `/gsd-verify-work` to answer it.
Until it is answered, the phase's manual half of OPS-03 and ROADMAP criterion 4's visual half stand
on assembled evidence rather than on a developer's confirmation.

---
*Phase: 01-reviewable-baseline-and-safe-delivery*
*Completed: 2026-08-20*

## Self-Check: PASSED

- `README.md` — present, carries the `## Local rehearsal` line
- `.planning/phases/01-reviewable-baseline-and-safe-delivery/01-05-SUMMARY.md` — present
- Commit `9af8c71` — present in `git log --all`
- Commit `23092f8` — present in `git log --all`, and is `origin/main`
- Run `32360247760` (pull_request) — present, conclusion `success`, deploy `skipped`
- Run `32360360573` (push, merge) — present, conclusion `success`, deployment `6000626285`
