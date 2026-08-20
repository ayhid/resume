---
status: testing
phase: 01-reviewable-baseline-and-safe-delivery
source: [01-VERIFICATION.md]
started: 2026-08-20T15:15:37Z
updated: 2026-08-20T15:15:37Z
---

## Current Test

number: 1
name: Read plan 01-03's six slice commits one at a time
expected: |
  Each diff can be understood on its own and its message describes the one
  concern it touches. Note in particular 41c11c7 (`feat(head)`), whose diff also
  carries a 603-line deletion of the v1 body — judge whether folding that removal
  into the head slice still reads cleanly, or whether it should have been its own
  commit.
awaiting: user response

## Tests

### 1. Read plan 01-03's six slice commits one at a time
expected: Run `git show 41c11c7`, `fd08fcf`, `ad6884b`, `932e461`, `cc0c41c`, `7272bbf`. Each diff can be understood on its own and its message describes the one concern it touches. 41c11c7 (`feat(head)`) also carries a 603-line deletion of the v1 body — judge whether that reads cleanly folded in. This is ROADMAP SC1's operative clause and is human judgement by definition.
result: [pending]

### 2. Decide the exposure window for the eight live content placeholders
expected: Either an explicit acceptance that `[CHIFFRE_A_VALIDER]` (×6) and `[MENTION_FINANCEMENT_A_VALIDER]` (×2) stay on production until Phases 7 and 8 land, or a decision to remove the placeholder paragraphs ahead of their owning phases. Confirmed live; Phase 1 was prohibited from editing `index.html`, and PROOF-04 / IA-04 own the copy.
result: [pending]

### 3. Decide whether `main` should require the verify check before publishing
expected: Either branch protection enabled on `main` requiring `Verify production artifact`, or an explicit acceptance that direct pushes to `main` may publish. The goal reads "can only reach production through a merge to `main`", but `main` is unprotected and commit `ed4fd4a` reached production by direct push. No ROADMAP Success Criterion requires protection, so this is a wording gap, not a scored failure.
result: [pending]

### 4. Load the live site and exercise the interactive surface
expected: Load https://ayoub-hidri.dev/ in a browser. Toggle FR→EN and back. Expand and collapse a CV panel. Print-preview the page. The bilingual v2 page renders correctly, the language switch flips the visible tree without a reload, and a CV panel opens and closes. Served bytes are confirmed identical to committed `index.html` (sha256 `cec4a983…bce9ad`).
result: [pending]

### 5. Decide how to settle the uptime claim for the delivery window
expected: Either an uptime record covering 2026-08-20T10:10Z–14:51Z, or an explicit acceptance that the claim is unfalsifiable now. 01-01 asserts the site returned 200 *throughout* the delivery change; no continuous probe exists, only six successful deploy runs and a 200 now.
result: [pending]

### 6. Reconcile Phase 1's `Mode: mvp` marker with its non-User-Story goal
expected: Either the mode marker is corrected on the phase, or MVP-mode verification is explicitly waived for Phase 1. ROADMAP.md:39 marks the phase `**Mode:** mvp`, but its goal is a conventional goal statement rather than the `As a …, I want to …, so that ….` form MVP mode requires. Carried forward unresolved from the previous verification.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
