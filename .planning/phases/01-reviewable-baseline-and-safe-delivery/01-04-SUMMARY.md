---
phase: 01-reviewable-baseline-and-safe-delivery
plan: 04
subsystem: infra
tags: [github-pages, deployment, live-verification, documentation, git-history]

# Dependency graph
requires:
  - "01-01 — the allowlist, the two-job workflow, the workflow publishing source, PHASE_BASE and the bookkeeping filter"
  - "01-02 — verify_site.py and the .gitignore that makes the clean-tree assertion reachable"
  - "01-03 — the six-slice rewrite series and the wip/v2-snapshot recovery net"
provides:
  - "The v2 site live at https://ayoub-hidri.dev/ — byte-identical to the committed index.html"
  - "OPS-02 proven by observation: specs/ and .planning/ are on origin/main and return 404 in production"
  - "A corrected .claude/CLAUDE.md that describes the allowlist artifact and the settings-resident custom domain"
  - "PHASE_BASE and the bookkeeping filter carried forward verbatim for plan 01-05"
  - "The eleven filtered phase commit subjects, enumerated, so 01-05 diffs rather than re-derives"
affects: [01-05, phase-02-analytics, phase-10-en-route]

actuals:
  tokens: 1024
  tasks: 2
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Batch-then-push: a multi-commit series lands in one push so exactly one deployment fires at the tip commit, and no intermediate state reaches a runner"
    - "Byte-identity as the live-verification gate: sha256 of the served page against the committed file, rather than a set of content greps"

key-files:
  created: []
  modified:
    - .claude/CLAUDE.md

key-decisions:
  - "The `**Whole-repo deploy:**` bold label was renamed to `**Allowlisted deploy:**` — the label is itself the false claim, so leaving it while inverting the body would have left a contradiction at the exact place a future agent skims"
  - "Two stale claims outside the five lines the plan named (line 51 'the repository root is published verbatim' and the Deploy pipeline row of the component table) were corrected as well: the plan's success criterion is that the file no longer claims whole-repo deploy, and both claimed it"
  - "The live check was strengthened from the plan's content greps to a sha256 comparison of the served bytes against the committed index.html — total evidence rather than three discriminators"
  - "wip/v2-snapshot was deleted only after the full live matrix and the byte-identity check had passed, per the plan's ordering; the reflog retains 0f652f8"

patterns-established:
  - "Compare the served artifact to the committed source by digest; a discriminator grep can pass against a stale edge copy that happens to share a marker"

requirements-completed: [OPS-02, OPS-03, OPS-04]

coverage:
  - id: D1
    description: "A visitor loading https://ayoub-hidri.dev/ is served the v2 page, not the previous online CV"
    requirement: "OPS-03"
    verification:
      - kind: e2e
        ref: "sha256 of curl -s -L https://ayoub-hidri.dev/ == sha256 of committed index.html -> cec4a983…bce9ad, identical"
        status: pass
      - kind: e2e
        ref: "served page: 4 data-lang-block, 0 cdn.tailwindcss.com, title 'Ayoub Hidri : Consultant IA & automatisation pour PME…' (was 'Full Stack Engineer | React/TypeScript Expert')"
        status: pass
    human_judgment: false
  - id: D2
    description: "Only the D-06 manifest is served, while specs/ and .planning/ sit on origin/main"
    requirement: "OPS-02"
    verification:
      - kind: e2e
        ref: "/README.md, /og-image.html, /specs/design.md, /.planning/STATE.md -> 404; /, /robots.txt, /sitemap.xml, /og-image.png, /CNAME -> 200"
        status: pass
    human_judgment: false
  - id: D3
    description: "One push produced exactly one production deployment, through the Actions workflow only"
    requirement: "OPS-04"
    verification:
      - kind: integration
        ref: "gh run list --event push, headSha a6e32d2 -> exactly 1 run (32359625065), conclusion success, both jobs success"
        status: pass
      - kind: integration
        ref: "gh run list --event dynamic newest createdAt -> 2026-01-27T11:29:22Z, identical to the 01-01 baseline"
        status: pass
      - kind: integration
        ref: "gh api repos/ayhid/resume/pages -> workflow / ayoub-hidri.dev / built, https_enforced true"
        status: pass
    human_judgment: false
  - id: D4
    description: ".claude/CLAUDE.md no longer states that the whole repository root is published or that deleting the CNAME file breaks the domain"
    requirement: "OPS-03"
    verification:
      - kind: unit
        ref: "grep counts: stage-site.sh 5, _site 5, 'every committed file at the root is published' 0, 'deleting it breaks the domain' 0, \"path: '.'\" 0"
        status: pass
    human_judgment: true
    rationale: "The greps prove the false sentences are gone and the new ones name the right script. Whether the replacement prose actually orients a future agent is a readability judgement that plan 01-05's end-of-phase human check owns, alongside the commit-series readability it already carries."

status: complete
metrics:
  duration: 6min
  completed: 2026-08-20
---

# Phase 01 Plan 04: Land the Rewrite Summary

**One push carried the phase's remaining seven commits to `origin/main`, fired exactly one
deployment, and put the v2 page live — the served bytes are sha256-identical to the committed
`index.html`, while `specs/` and `.planning/` now sit on the origin and still return 404.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-08-20T10:30:00Z
- **Completed:** 2026-08-20T10:36:23Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Corrected the two architectural constraints this phase falsified in `.claude/CLAUDE.md` — plus
  two more instances of the same whole-repo-deploy claim the plan had not enumerated.
- Pushed the series once. `5bcc97a..a6e32d2`, seven of this phase's own commits plus three GSD
  bookkeeping commits, producing exactly one push-event run at the tip.
- Proved the live page is the rewrite by digest rather than by discriminator: `cec4a983…bce9ad`
  on both sides.
- Proved OPS-02 in its strongest available form: the excluded directories exist on `origin/main`
  and are unreachable in production.
- Retired `wip/v2-snapshot` after — never before — the live verification passed.

## Task Commits

1. **Task 1: Correct the two architectural constraints this phase made false** — `a6e32d2`
   (`docs(claude): correct the deployment scope and custom domain constraints`), 10 insertions,
   10 deletions, `.claude/CLAUDE.md` only.
2. **Task 2: Push once, and prove the live domain serves v2** — no commit by design. The task
   pushes existing commits, asserts against the live domain, and deletes a local branch.

## The push

| | Value |
|---|---|
| Range | `5bcc97a..a6e32d2` |
| Pushes | 1 |
| Force | none — `git reflog main \| grep -c forced-update` is `0` |
| Run | [`32359625065`](https://github.com/ayhid/resume/actions/runs/32359625065), `Deploy to GitHub Pages`, head `a6e32d2` |
| Conclusion | `success` — `Verify production artifact` success, then `Deploy to production` success (15 s) |
| Push runs at tip `a6e32d2` | exactly `1` |

Nine commits crossed in that one push: this phase's seven (`41c11c7`, `fd08fcf`, `ad6884b`,
`932e461`, `cc0c41c`, `7272bbf`, `a6e32d2`) plus two GSD bookkeeping commits — `15c4676`
(`docs(01-02): …`) and `bf40bf8` (`docs(01-03): …`), both matched and removed by the filter.
`git rev-list --count 4b6f8ef..origin/main` reads `14`; that raw figure is deliberately not
asserted anywhere.

The four intermediate states D-02 permits to render imperfectly (`41c11c7` through `932e461`)
exist only in history. No runner ever checked them out and no visitor ever saw them — which is
the entire reason the series was batched.

## Live status matrix — before and after

`curl -s -o /dev/null -w '%{http_code}' -L https://ayoub-hidri.dev$u`. The "Before" column is the
Task 1 baseline recorded in `01-01-SUMMARY.md`; "After 01-01" is that plan's post-push reading.

| URL | Before (pre-phase) | After 01-01 | **After this push** | Expected | Verdict |
|---|---|---|---|---|---|
| `/` | 200 | 200 | **200** | 200 | pass |
| `/robots.txt` | 200 | 200 | **200** | 200 | pass |
| `/sitemap.xml` | 200 | 200 | **200** | 200 | pass |
| `/og-image.png` | 200 | 200 | **200** | 200 | pass |
| `/CNAME` | 404 | 200 | **200** | 200 | pass — D-06 puts it in the manifest |
| `/README.md` | 200 | 404 | **404** | 404 | pass |
| `/og-image.html` | 200 | 404 | **404** | 404 | pass |
| `/specs/design.md` | 404 | 404 | **404** | 404 | pass — and `specs/` is on the origin |
| `/.planning/STATE.md` | 404 | 404 | **404** | 404 | pass — and `.planning/` is on the origin |
| `/en/` | 404 | 404 | **404** | 404 | pass (reserved for Phase 10) |

The matrix settled on the first poll; no retry budget was consumed.

## The served page is the rewrite

| Check | Value |
|---|---|
| `data-lang-block` occurrences | `4` (expected `4`) |
| `cdn.tailwindcss.com` occurrences | `0` (expected `0`) |
| `hero-title-fr` lines | `2` — see deviation 1 |
| `<title>` | `Ayoub Hidri : Consultant IA & automatisation pour PME, ingénieur full stack senior` |
| `<title>` before | `Ayoub Hidri - Full Stack Engineer \| React/TypeScript Expert` |
| sha256 served | `cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` |
| sha256 committed `index.html` | `cec4a98358684891d4c27d964c135324f0aeb6b0d0fde8c8b5fb9b18f8bce9ad` |
| `diff served committed` | identical |

ROADMAP criterion 4 is met by digest, not by inference.

## Control plane

**OPS-04 adjacency control.** Newest `event: dynamic` (`pages build and deployment`) run:

| | Timestamp |
|---|---|
| Before the phase's first push (`01-01`) | `2026-01-27T11:29:22Z` |
| **After this push** | `2026-01-27T11:29:22Z` |

Identical across the largest push of the phase. The legacy builder stayed silent; exactly one
publisher targets the site.

```json
{ "build_type": "workflow", "cname": "ayoub-hidri.dev", "https_enforced": true, "status": "built" }
```

The custom domain and TLS enforcement survived — T-01-17 mitigated.

## Commit-series anchors — carried forward verbatim for plan 01-05

**Read these from here. Do not re-derive them.**

### `PHASE_BASE`

```
4b6f8ef5df80e4688fe0f8bb7828aee8a6fe65e3
```

`git rev-parse main` at the start of the phase — the **local** pre-phase tip, deliberately not
`origin/main`. Local `main` was 15 commits ahead of the origin with pre-existing planning and
codebase-mapping history; an `origin/main` anchor would sweep all of it into this phase's range.

### Bookkeeping filter

```
^docs\((state|phase-[0-9.]+|[0-9]{2}(\.[0-9]+)?(-[0-9]{2})?)\): 
```

```bash
git log --format='%s' "$PHASE_BASE"..origin/main | grep -vE '^docs\((state|phase-[0-9.]+|[0-9]{2}(\.[0-9]+)?(-[0-9]{2})?)\): '
```

A bare `wc -l` over the raw range is never valid.

### The eleven filtered subjects, newest first

Plan `01-05` should diff its own filtered list against this one rather than re-deriving the
arithmetic. Its list is expected to be longer by whatever `01-05` itself authors.

```
docs(claude): correct the deployment scope and custom domain constraints
docs(readme): describe the v2 site
feat(js): v2 language switch, accordions and print hook
feat(content): v2 English mirror
feat(content): v2 French page tree
feat(style): v2 design tokens and global stylesheet
feat(head): v2 metadata, OpenGraph and JSON-LD
chore: ignore local agent state and CI staging output
ci(deploy): verify staged artifact contents with a stdlib-only checker
ci(deploy): split verify and deploy jobs, publish only the staged artifact
ci(deploy): add production allowlist staging script
```

| Assertion | Expected | Measured |
|---|---|---|
| total | `11` | `11` |
| `^ci(deploy): ` | `3` | `3` |
| `^chore: ` | `1` | `1` |
| `^feat(` | `5` | `5` |
| `^docs(` | `2` | `2` |
| oldest (`tail -1`) | `ci(deploy): add production allowlist staging script` | matched — D-04 holds |
| raw range (not asserted) | — | `14` |

3 + 1 + 5 + 2 = 11; the prefix counts and the total corroborate each other.

## The snapshot branch

`wip/v2-snapshot` (`0f652f8`) was deleted **after** the live matrix and the byte-identity check
passed, not before. It was never pushed: `git ls-remote --exit-code --heads origin wip/v2-snapshot`
exits `2`. `git rev-parse --verify wip/v2-snapshot` now exits `128`.

**The reflog retains it.** The commit object `0f652f8be8f376355ee9a6ebcf13708e700e394e` is still
resolvable and will remain so until git's reflog expiry (90 days by default). Recovery is
`git branch wip/v2-snapshot 0f652f8`. That is now belt-and-braces — the content it protected is
published and in `origin/main`.

## What changed in `.claude/CLAUDE.md`

Ten lines, each an in-place replacement. No restructuring, no reflow, 328 lines before and after.

| Line | Was | Now |
|---|---|---|
| 51 | "The repository root is published verbatim." | Names `_site/` and `stage-site.sh`; the copied files are published verbatim |
| 66 | "`CNAME` … binds the custom domain to GitHub Pages" | The domain is bound in repository settings; the file is kept per D-06 as belt-and-braces and is fetchable at `/CNAME` |
| 77 | "the whole repo root (`path: '.'`) is uploaded … `og-image.html` and `README.md` ship to production too" | Two jobs; the PR event reaches only `verify`; per-job `concurrency`; the allowlist, the published set, the excluded set, and the inverted warning |
| 201 | OG card generator row | adds "excluded from the published artifact" |
| 202 | "Uploads repo root as a Pages artifact" | "Stages the allowlist into `_site/` and uploads that directory"; cites both files |
| 263 | og-image.html entry point | adds "excluded from the production manifest, so it is not reachable at `/og-image.html`" |
| 265 | "`push` and `pull_request` on `main`" | adds "only a push to `main` reaches the deploy job" |
| 266 | "`configure-pages` → `upload-pages-artifact` with `path: '.'` → `deploy-pages`" | the full chain including staging and verification, in both jobs |
| 273 | "**Whole-repo deploy:** … every committed file at the root is published" | "**Allowlisted deploy:**" — nothing is published by default; a new asset does not ship until it is in the manifest |
| 274 | "**Custom domain:** … deleting it breaks the domain" | The binding lives in settings; under the workflow source GitHub creates no `CNAME` file and ignores a committed one |

Acceptance greps: `stage-site.sh` **5**, `_site` **5**, `every committed file at the root is
published` **0**, `deleting it breaks the domain` **0**, `path: '.'` **0**, trailing whitespace
**0**, terminating newline present.

## Decisions Made

- **Renamed the `**Whole-repo deploy:**` label.** The plan said not to remove either constraint
  heading; the bold label, however, *is* the false claim. Inverting the body while leaving the
  label would have left a self-contradiction at the exact spot a future agent skims. Both bullets
  remain, in place and in order — only the label was corrected.
- **Corrected two claims outside the five lines the plan named.** Line 51 and the `Deploy pipeline`
  component-table row both asserted whole-repo publishing. The orchestrator's success criterion is
  that the file no longer claims it, so leaving two live instances would have failed the criterion's
  intent while passing its literal greps.
- **Strengthened the live check to a digest comparison.** The plan's three discriminators would
  each pass against a stale edge copy that happened to share a marker. `sha256(served) ==
  sha256(committed)` cannot.

## Deviations from Plan

### 1. [Measurement] `hero-title-fr` on the served page reads 2, not 1

- **Found during:** Task 2, live verification
- **Issue:** The plan asserts `curl … | grep -c 'hero-title-fr'` outputs `1`. It outputs `2`.
- **Cause:** A planning-time miscount, not a delivery fault. `grep -c` counts *matching lines*, and
  the committed `index.html` carries the id on two lines — `index.html:143`
  (`<section aria-labelledby="hero-title-fr">`) and `index.html:155` (`<h1 id="hero-title-fr">`).
  The `aria-labelledby` reference was overlooked when the criterion was written.
- **Resolution:** Recorded as measured, not forced. The local file reads `2` as well, and the
  served bytes are sha256-identical to it — so the discriminator's *intent* (the served page is the
  rewrite) is satisfied by strictly stronger evidence than the criterion asked for.

### 2. [Scope] Two stale claims outside the plan's enumerated lines were corrected

- **Found during:** Task 1, pre-edit survey
- **Issue:** The plan names lines 66, 77, 266, 273 and 274. A `grep -n` for the same claim also hit
  line 51 ("The repository root is published verbatim.") and line 202 (`| Deploy pipeline | Uploads
  repo root as a Pages artifact …`).
- **Fix:** Both corrected in the same commit, in place.
- **Rationale:** Rule 2 — leaving a false architectural claim in the file every future agent reads
  is the defect this task exists to remove, and the orchestrator's success criterion is stated over
  the file, not over five line numbers.
- **Files modified:** `.claude/CLAUDE.md` — **Commit:** `a6e32d2`

### 3. [Interpretation] The "every remaining `og-image.html` occurrence" criterion was read by intent

- **Found during:** Task 1, acceptance check
- **Issue:** The plan asks that `grep -c 'og-image.html'` be at least `1` and that *every* remaining
  occurrence describe it as excluded from the published artifact. Nine occurrences remain, and five
  of them (lines 38, 52, 57, 87, 122) are about the file's line count, its font imports, its CSS
  formatting style and the repo's flat naming convention — nothing to do with publication.
- **Resolution:** Read as: no remaining occurrence may claim it is published, and the file must state
  the exclusion where publication is discussed. Verified — four occurrences (77, 201, 263, 273) now
  state the exclusion explicitly, and none claims publication. Rewriting the five content-facing
  mentions to recite the manifest would be noise, not accuracy.

---

**Total deviations:** 3 — one measurement discrepancy recorded rather than forced, one scope
widening under Rule 2, one criterion read by intent. No auto-fix under Rule 1 or 3 was needed and
no architectural decision arose.
**Impact on plan:** none. Every substantive assertion passed, several by stronger evidence than the
criterion requested.

## Issues Encountered

None. The push, the run, and edge propagation all behaved as researched — the live matrix had
settled by the first poll, roughly 20 s after the deploy job finished.

The run carried two `actions/checkout@v4` Node 20 deprecation annotations. They are GitHub-side
notices on pinned action versions, unrelated to this plan's changes and out of scope per the
executor's scope boundary. Logged below rather than fixed.

## Known Stubs

None. No code was written in this plan; the only file changed is documentation, corrected in full.

## Deferred Issues

- **Node 20 deprecation annotations** on `actions/checkout@v4`, `actions/configure-pages@v4`,
  `actions/deploy-pages@v4` and `actions/upload-artifact@v4`. Informational today; a version bump
  is a separate ops change and touches no file in this plan's `files_modified`.
- **T-01-08, the Mixpanel project token at `0650811` in public git history.** Unchanged by this
  plan — the token was already in public history before the push, and the v2 page no longer
  references Mixpanel. The exposure remains live and unmitigated, disposition `accept`, recorded in
  `01-CONTEXT.md` §Deferred Ideas and `.planning/STATE.md` §Blockers/Concerns. Re-raise at
  milestone close.

## Threat Flags

None. No new security-relevant surface. T-01-01 (information disclosure once `specs/` and
`.planning/` reached the origin) is now mitigated by observation rather than by construction:
those directories are on `origin/main` and return 404. T-01-16, T-01-14, T-01-17 and T-01-18 are
each evidenced above.

## Next Phase Readiness

ROADMAP criteria 3 and 4 are both met. What remains in this phase is plan `01-05`: the throwaway
pull request that proves the D-08/D-09 gate empirically — deploy reports `skipped`, no deployment
fires — plus the end-of-phase human readability review of the six-slice series and of the corrected
`.claude/CLAUDE.md` prose.

**Notes for `01-05`:**

- `main` and `origin/main` are level at `a6e32d2`; the tree is clean.
- OPS-01 remains `Pending` by design. Its pull-request half has still never been exercised — this
  plan pushed, it did not open a PR. `01-05` owns that flip.
- Use the eleven subjects listed above as the diff base for the closing series assertion. `01-05` is
  expected to add `chore:` commits from the throwaway branch; the `PHASE_BASE` and filter are
  unchanged.
- `wip/v2-snapshot` is gone. If `01-05` needs the pre-slice rewrite for any reason, it is
  `git branch <name> 0f652f8` while the reflog holds.

---
*Phase: 01-reviewable-baseline-and-safe-delivery*
*Completed: 2026-08-20*

## Self-Check: PASSED

- `.claude/CLAUDE.md` — present, 328 lines, corrected
- `.planning/phases/01-reviewable-baseline-and-safe-delivery/01-04-SUMMARY.md` — present
- Commit `a6e32d2` — present in `git log --all`, and is `origin/main`
- Run `32359625065` — present, conclusion `success`
