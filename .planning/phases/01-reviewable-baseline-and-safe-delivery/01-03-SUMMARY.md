---
phase: 01-reviewable-baseline-and-safe-delivery
plan: 03
subsystem: site
tags: [git-history, commit-slicing, snapshot-branch, single-file-site, reviewability]

# Dependency graph
requires:
  - "01-01 — PHASE_BASE watermark, the bookkeeping commit filter, and .github/scripts/stage-site.sh"
  - "01-02 — .github/scripts/verify_site.py and the .gitignore that makes the clean-tree assertion reachable"
provides:
  - "The v2 rewrite in git history as six scoped commits, one per concern of the single-file site"
  - "wip/v2-snapshot — a local-only branch holding the rewrite verbatim, the recovery net plan 01-04 verifies the push against"
  - "A clean working tree: git status --porcelain produces no output"
  - "A proof technique — snapshot branch + structural reconstruction + byte-identity assertion — reusable whenever a monolith has to be sliced without git add -p"
affects: [01-04, 01-05, phase-02-analytics, phase-03-design-system]

actuals:
  tokens: 24256
  tasks: 3
  commits: 7

tech-stack:
  added: []
  patterns:
    - "Snapshot branch before mutation: unbacked working-tree state goes into the object store under a named ref before any technique that rewrites the file under it"
    - "Structural reconstruction: each intermediate state is derived from a frozen copy by absolute line range and inserted at a marker found in the mutating file, never by splitting a unified diff"
    - "Byte-identity as the acceptance test: git diff --quiet <snapshot> is the gate, so the series is provably the rewrite rather than an approximation of it"

key-files:
  created: []
  modified:
    - index.html
    - README.md

key-decisions:
  - "The insert point for each slice was located at run time with grep -n on a structural marker rather than a hardcoded line number — the working file's length changes under the series, and only the frozen snapshot's offsets are stable"
  - "Slice 6 took README.md with git checkout wip/v2-snapshot -- README.md rather than a derived write: the whole file moves as one concern, so no line arithmetic is warranted"
  - "The artifact checker emitted no heading warning against the reconstructed page, not the warning the plan's prose anticipated — 01-02's block-aware rule is silent when each [data-lang-block] carries exactly one <h1>, which the v2 page does. The plan's own acceptance criterion asked only for exit 0; the prose was describing the v1 page it was written against"

patterns-established:
  - "Verify the snapshot captured what you think before relying on it — a snapshot that silently caught the wrong content is worse than no snapshot"
  - "Assert byte-identity before the last slice, not only at the end, so drift is caught while a reset is still cheap"

requirements-completed: [OPS-03]

coverage:
  - id: D1
    description: "The v2 rewrite is in history as six commits, each scoped to one concern of the single-file site"
    requirement: "OPS-03"
    verification:
      - kind: unit
        ref: "git log --oneline -6 --format='%s' -> the six slice subjects in D-01's concern order"
        status: pass
      - kind: unit
        ref: "per-commit git show --numstat --format= | wc -l -> 1 for all six; no commit touches a second file"
        status: pass
      - kind: unit
        ref: "git diff --quiet between each adjacent pair -> 1 (non-empty) for all five pairs"
        status: pass
    human_judgment: true
    rationale: "Completeness, scoping and non-emptiness are proven mechanically. Whether a human finds each diff *readable* is the unclassified edge flagged in the plan; 01-05's end-of-phase human check owns it."
  - id: D2
    description: "The rewrite is committed as written — the reconstruction is byte-identical to what the developer produced"
    requirement: "OPS-03"
    verification:
      - kind: unit
        ref: "git diff --quiet wip/v2-snapshot -- index.html README.md -> exit 0"
        status: pass
      - kind: unit
        ref: "diff index.html <frozen snapshot> -> identical; wc -l -> 1054"
        status: pass
    human_judgment: false
    rationale: "Byte equality against the frozen source is total evidence; nothing is left to judgement."
  - id: D3
    description: "The reconstructed page passes the artifact checker built in 01-01/01-02"
    requirement: "OPS-03"
    verification:
      - kind: integration
        ref: "bash .github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site -> '0 problem(s)', exit 0"
        status: pass
    human_judgment: false
    rationale: "The same script CI runs, run locally against the same file CI will stage."

status: complete
metrics:
  duration: 5min
  completed: 2026-08-20
---

# Phase 01 Plan 03: Reviewable Commit Series Summary

The v2 rewrite — one uncommitted 1036-insertion / 1662-deletion working-tree diff — is now six
scoped commits on local `main`, reconstructed from a frozen snapshot branch and proven
byte-identical to what the developer wrote.

## Reading order for the human review in plan 01-05

Read them oldest first; each one assumes the one below it.

| # | SHA | Subject | Diff | What to look at |
|---|-----|---------|------|-----------------|
| 1 | `41c11c7` | `feat(head): v2 metadata, OpenGraph and JSON-LD` | +73 / −603 `index.html` | Title, description, canonical, hreflang, OG/Twitter cards, font preconnects, the `Person` + `ProfessionalService` JSON-LD graph, and the commented Umami block. The large deletion count is the v1 Tailwind-CDN head leaving. |
| 2 | `fd08fcf` | `feat(style): v2 design tokens and global stylesheet` | +38 / −0 `index.html` | The whole `:root` token set, resets, print stylesheet, `prefers-reduced-motion` overrides and the `!important` pseudo-class states. Pure addition — the smallest commit and the one that defines the vocabulary every later inline style resolves through. |
| 3 | `ad6884b` | `feat(content): v2 French page tree` | +417 / −1059 `index.html` | The largest commit and the one worth the most reading time. `<body>`, the background grid, and the entire French block. The deletions are the last of the v1 markup leaving the file. |
| 4 | `932e461` | `feat(content): v2 English mirror` | +430 / −0 `index.html` | Pure addition. Read it as a diff *against* commit 3's French tree — every id is locale-suffixed, which is what keeps document ids unique. |
| 5 | `cc0c41c` | `feat(js): v2 language switch, accordions and print hook` | +72 / −0 `index.html` | The single IIFE: the delegated `data-act` listener, the FR/EN toggle, the accordions, the feature-detected analytics dispatch, the `beforeprint` hook. This is where the page becomes correct again. |
| 6 | `7272bbf` | `docs(readme): describe the v2 site` | +19 / −13 `README.md` | The only commit that does not touch `index.html`. |

Commits 1 through 4 leave a page that renders imperfectly — D-02 permits this explicitly, and
nothing was pushed, so no imperfect state was ever reachable by a visitor.

Recovery net: `wip/v2-snapshot` at `0f652f8`, local only, never pushed. Plan `01-04` deletes it
after the push has published and the live page has been verified — not before.

## What Was Built

**Task 1 — the snapshot.** `wip/v2-snapshot` was branched from `main` with the dirty tree intact
and the rewrite committed to it as `wip: v2 rewrite snapshot (throwaway)` (`0f652f8`, exactly the
expected 1036 insertions / 1662 deletions). This happened before any other operation, because the
reconstruction technique deliberately rewrites `index.html` under itself and until the snapshot
existed a reflexive `git restore` would have destroyed roughly a thousand lines of unbacked work.

The snapshot was then verified rather than assumed: 4 `data-lang-block` occurrences (the committed
v1 page has 0), 1054 lines, and the six structural markers read back from the frozen file at 78,
115, 116, 117, 1053 and 1054. `git show wip/v2-snapshot:index.html` was extracted once to a scratch
file outside the repository; every slice read its content from that frozen copy by absolute line
range, which is why the ranges stayed valid across the whole series while the working file changed
length under them.

Returning to `main` restored the committed page — 1686 lines, `</head>` at 608, `<body class="…">`
at 609 — and the working tree went quiet.

**Tasks 2 and 3 — the six slices.** Each state was derived from the frozen file, written to
`index.html`, staged by exact path and committed. The file's length after each slice was asserted
against the plan's slice algebra and hit every predicted value: 1156, 1194, 552, 982, 1054.

Byte-identity was asserted immediately after slice 5, before the README slice, so any drift would
have been caught while a reset back to the pre-series commit was still the cheap fix. It exited 0
on the first attempt; no reset was needed and no line was hand-patched.

## Key Implementation Details

The one technique worth carrying forward: **insert points were located at run time, content came
from fixed offsets.** Each slice ran `grep -n` for a structural marker in the mutating working file
(`^</head>$`, `^<body`, the last `^</body>$`) and read its payload from the frozen snapshot by
absolute line number. Hardcoding both sides would have been wrong — the working file's line numbers
shift with every slice, and only the snapshot's are stable. The markers resolved to exactly the
lines the plan predicted (78, 117, 551, 981), which is itself corroboration that no slice had gone
astray.

Prefix-identity against the snapshot was checked after every slice, not only at the end: after
slice 1 lines 1–77 matched, after slice 2 lines 1–116, after slice 3 lines 1–550, after slice 4
lines 1–980. Each slice therefore proved itself before the next one was built on top of it.

## Deviations from Plan

None. The plan executed exactly as written — every acceptance criterion produced the predicted
value on the first run, and no deviation rule was invoked.

One observation worth recording, which is not a deviation: the plan's Task 3 prose said the
artifact checker "must now exit 0 with the heading warning and no errors", but the checker printed
`0 problem(s)` with no warning at all. That is the correct outcome and the plan's own acceptance
criterion asked only for exit 0. `01-02` built the heading rule to be block-aware — one `<h1>` per
`[data-lang-block]` emits nothing — and predicted in its own summary that the incoming v2 page
would pass silently while v1 warned. The prose was describing the v1 page it was written against.

## Verification Results

| Assertion | Expected | Observed |
|---|---|---|
| `git diff --quiet wip/v2-snapshot -- index.html README.md` | `0` | `0` |
| `git status --porcelain` | no output | no output |
| `wc -l < index.html` | `1054` | `1054` |
| `git log --oneline -6 --format='%s'` | the six subjects, newest first | matched exactly |
| files touched per slice commit | `1`, all in scope | `1` for all six |
| adjacent-pair `git diff --quiet` | `1` (non-empty) ×5 | `1` ×5 |
| slice commits ahead of `origin/main` (filtered) | `6` | `6` |
| phase delivery series `PHASE_BASE..origin/main` (filtered) | `4` — 3 `ci(deploy):`, 1 `chore:` | `4` — 3 and 1 |
| oldest phase commit (D-04 ordering) | `ci(deploy): add production allowlist staging script` | matched |
| AI attribution in the six messages | `0` | `0` |
| `grep -c 'data-lang-block'` / `grep -c '<h1'` | `4` / `2` | `4` / `2` |
| duplicate ids | `0` | `0` |
| `stage-site.sh` + `verify_site.py` | exit 0 | exit 0, `0 problem(s)` |
| `wip/v2-snapshot` exists locally | yes | yes (`0f652f8`) |
| `git ls-remote --heads origin wip/v2-snapshot` | `2` (absent) | `2` |
| anything pushed | nothing | nothing |

`PHASE_BASE` = `4b6f8ef5df80e4688fe0f8bb7828aee8a6fe65e3`, filter
`^docs\((state|phase-[0-9.]+|[0-9]{2}(\.[0-9]+)?(-[0-9]{2})?)\): `, both read from `01-01-SUMMARY.md`.

## Known Stubs

None. This plan committed existing content and wrote no new code.

The commented Umami block's `[UMAMI_HOST]` and `[UMAMI_WEBSITE_ID]` placeholders are in the
committed page verbatim, as the plan requires. They are Phase 2's deliverable, not a stub this
plan left behind — the analytics snippet is inside an HTML comment and inert.

## Threat Flags

None. No file created or modified here introduces network, auth, file-access or schema surface;
`index.html` and `README.md` moved from the working tree into git history without a line changing.

T-01-12 (loss of the unbacked rewrite) and T-01-13 (silent drift between the reconstruction and
what the developer wrote) were both mitigated as planned: the snapshot preceded every mutation, and
byte-identity was asserted before the README slice and again at the close. T-01-14 (force-push to
fix a boundary) does not arise — nothing was pushed.

## For the Next Plan

`01-04` pushes this series. Before it does:

- Local `main` is six slice commits plus one `docs(01-02)` bookkeeping commit ahead of
  `origin/main`; this plan's own SUMMARY commit adds one more.
- `wip/v2-snapshot` (`0f652f8`) must survive until the live page is verified. It is the only
  independent copy of the rewrite that does not depend on `main`'s history being correct.
- The reconstructed page already passes the artifact checker locally, so a CI failure on the push
  would point at the workflow or the Pages control plane, not at the page.

## Self-Check: PASSED

- `index.html` — FOUND (1054 lines, byte-identical to `wip/v2-snapshot`)
- `README.md` — FOUND (byte-identical to `wip/v2-snapshot`)
- `0f652f8` snapshot commit — FOUND
- `41c11c7`, `fd08fcf`, `ad6884b`, `932e461`, `cc0c41c`, `7272bbf` — all six FOUND on `main`
