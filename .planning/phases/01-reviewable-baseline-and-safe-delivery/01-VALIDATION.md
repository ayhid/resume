---
phase: 1
slug: reviewable-baseline-and-safe-delivery
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-19
reconciled_with_plans: 2026-08-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `01-RESEARCH.md` §Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None today — `.planning/codebase/TESTING.md` records no test runner, no test files, no assertions. This phase introduces the project's first automated check. Python 3 stdlib only (no `package.json`, no npm deps — project constraint). |
| **Config file** | none — Wave 0 creates the scripts |
| **Quick run command** | `.github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site` |
| **Full suite command** | quick run, plus `gh run watch` on the pushed run, plus the live `curl` matrix below |
| **Estimated runtime** | ~2 seconds local; ~30 seconds for the CI `verify` job |

---

## Sampling Rate

- **After every task commit:** `git status --porcelain` is empty; for slice commits, `git show --stat HEAD` touches only the file that commit's concern owns.
- **After every plan wave:** `.github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site` locally — the identical command CI runs.
- **Before `/gsd-verify-work`:** the full live `curl` matrix must match the expected column below, and the D-09 throwaway PR must show `verify` completed with zero new deployments.
- **Max feedback latency:** ~2 s local, ~60 s for a CI round-trip.

---

## Per-Task Verification Map

Task IDs and waves below are the ones the finished plan set actually uses, read back from
`01-01-PLAN.md` through `01-05-PLAN.md`. The `Plan · Task` column names the task whose
`<verify><automated>` or `<acceptance_criteria>` carries the command, and the `Introduced By`
column names the task that creates the file the command needs.

| Plan · Task | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Introduced By | Status |
|-------------|------|-------------|------------|-----------------|-----------|-------------------|---------------|--------|
| `01-02` T1 | 2 | OPS-02 | T-01-09 | Staged artifact contains only allowlisted production assets | unit | `python3 .github/scripts/verify_site.py _site` | `01-02` T1 creates `verify_site.py`; `01-01` T3 creates `stage-site.sh` | ⬜ pending |
| `01-02` T1 | 2 | OPS-01 | — | `index.html` parses; no duplicate `id`; heading count reported as a warning (see `01-02` §research_decision) | unit | `python3 .github/scripts/verify_site.py _site` | `01-02` T1 creates `verify_site.py` | ⬜ pending |
| `01-03` T3 | 3 | OPS-03 | T-01-13 | Rewrite lands as scoped commits; tree clean; series byte-identical to the rewrite | structural | `git status --porcelain` empty; `git diff --quiet wip/v2-snapshot -- index.html README.md` | ✅ git | ⬜ pending |
| `01-05` T3 | 5 | OPS-03 | — | Each commit is scoped to one concern | manual | `git show --stat <sha>` per slice commit — reviewer reads the diff (`<human-check>` item 1) | ✅ git | ⬜ pending |
| `01-05` T2 | 5 | OPS-01 | — | A pull request runs verification | integration | `gh pr checks <n>` shows `verify` completed; `gh run list --event pull_request --limit 1 --json conclusion` → `success` | ✅ gh | ⬜ pending |
| `01-05` T2 | 5 | OPS-01 | T-01-02 | A pull request publishes nothing | integration | `gh api repos/ayhid/resume/deployments --jq '.[0].id'` identical across the PR's open window (newest-id watermark, not `length` — that endpoint paginates); jobs payload shows `Deploy to production` skipped or absent | ✅ gh | ⬜ pending |
| `01-04` T2, `01-05` T2 | 4, 5 | OPS-04 | — | Push to `main` publishes, and merge to `main` publishes | integration | `gh run list --event push --limit 1` conclusion `success`; `gh api repos/ayhid/resume/pages --jq .status` → `built`; after the merge a *new* deployment id appears | ✅ gh | ⬜ pending |
| `01-01` T3, re-asserted `01-04` T2 and `01-05` T3 | 1, 4, 5 | OPS-04 | T-01-18 | Only the Actions workflow publishes | regression | `gh run list --event dynamic --limit 1 --json createdAt` identical to the timestamp recorded in `01-01` T1, before and after every push of the phase | ✅ gh | ⬜ pending |
| `01-01` T3, re-asserted `01-04` T2 | 1, 4 | OPS-02 | T-01-01 | The **published** site exposes nothing but production assets | smoke | live `curl` matrix below | `01-01` T3 creates `stage-site.sh` and performs the first publish | ⬜ pending |
| `01-04` T2 | 4 | criterion 4 | — | The live page is v2, not the v1 CV | smoke | `curl -s https://ayoub-hidri.dev/ \| grep -c 'data-lang-block'` = 4 **and** `grep -c 'cdn.tailwindcss.com'` = 0 | `01-03` T3 commits the rewrite; `01-04` T2 publishes it | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Sampling continuity (checks 8a–8d), verified against the finished plans.** Every task in all five
plans carries a `<verify><automated>` block, including the two checkpoint-adjacent ones; no task
uses a watch-mode flag; there is no run of three consecutive tasks without an automated verify; and
both files the map depends on are created by named tasks (`stage-site.sh` by `01-01` T3,
`verify_site.py` by `01-02` T1) rather than left as unresolved Wave 0 references. Hence
`nyquist_compliant: true`.

---

## Live `curl` Matrix (criteria 3 and 4)

Run before any change to capture the baseline, and again after the deploy. Criterion 3
is proven as a before/after, not asserted.

```bash
for u in / /README.md /og-image.html /specs/design.md /CNAME /en/ /.planning/STATE.md \
         /robots.txt /sitemap.xml /og-image.png; do
  printf '%-28s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' -L "https://ayoub-hidri.dev$u"
done
```

| URL | Baseline (2026-08-19) | Expected after phase |
|-----|----------------------|----------------------|
| `/` | 200 | 200 (v2 markup) |
| `/robots.txt` | — | 200 |
| `/sitemap.xml` | — | 200 |
| `/og-image.png` | — | 200 |
| `/README.md` | **200** | **404** |
| `/og-image.html` | **200** | **404** |
| `/specs/design.md` | 404 (not yet pushed) | 404 |
| `/.planning/STATE.md` | 404 (not yet pushed) | 404 |
| `/CNAME` | 404 | **200** — corrected at plan time |
| `/en/` | 404 | 404 (Phase 10) |

**`/CNAME` correction (made during planning, see `01-01-PLAN.md` §measured_baseline).** This row
originally predicted 404. That is wrong: D-06 locks `CNAME` into the production manifest, so the
staging script copies it into the artifact and the file becomes fetchable — it returns **200**
after the phase. Harmless (its only content is the public domain name), and D-06 is a locked
decision so the entry stays. Under a workflow publishing source the file no longer binds the
domain in any case; the Pages settings hold `cname: ayoub-hidri.dev`.

Baseline re-measured at plan time (2026-08-19): `/` 200, `/README.md` **200**, `/og-image.html`
**200**, `/robots.txt` 200, `/sitemap.xml` 200, `/og-image.png` 200, `/specs/design.md` 404,
`/CNAME` 404, `/en/` 404, `/.planning/STATE.md` 404.

Baseline measured 2026-08-19 [VERIFIED: curl, research session]. `/specs/design.md` and
`/.planning/STATE.md` 404 today only because `main` is ahead of `origin/main` and the
commits that added them have never been pushed — the first push of this phase carries them,
so the allowlist must be in place before it.

---

## Wave 0 Requirements

The plan set has no separate Wave 0: both missing files are created by named tasks inside the
normal wave order, each with its own automated verify. `wave_0_complete` stays `false` because
neither file exists on disk until execution runs; the requirement it tracks is nonetheless
discharged by assignment.

- [ ] `.github/scripts/stage-site.sh` — the D-06 allowlist manifest copy into `_site/` (OPS-02); executable, locally runnable, tolerates a missing `en/` (D-07). **Created by `01-01` Task 3** (wave 1), verified by `bash .github/scripts/stage-site.sh _site` plus the exact-manifest `ls -A _site` criterion.
- [ ] `.github/scripts/verify_site.py` — manifest presence/absence + `index.html` HTML parse (OPS-01/OPS-02); Python 3 stdlib only (`html.parser`) — `xmllint` and `tidy` are **not** on `ubuntu-latest`. **Created by `01-02` Task 1** (wave 2), verified by a clean run plus seven demonstrated negative cases.
- [ ] Post-deploy smoke check — the live `curl` matrix above (criteria 3 and 4); may live in phase verification notes rather than the repo, since `.github/scripts/` does not ship. **Run by `01-01` Task 3 (baseline and first after-matrix), `01-04` Task 2 (full after-matrix) and `01-05` Task 3 (phase close).**
- [ ] No test framework install required — stdlib only. **Asserted by the `01-02` Task 1 import-allowlist and no-lockfile criteria.**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Each commit in the series is independently readable and scoped to one concern | OPS-03 | "Readable" is a human judgement; no assertion can stand in for it | `git log --oneline <PHASE_BASE>..origin/main`, then `git show --stat <sha>` for each of the six slice commits; confirm one concern per commit and a message that describes it. `<PHASE_BASE>` is the pre-phase `origin/main` SHA recorded in `01-01-SUMMARY.md`; by the time this review runs, local and remote `main` are level, so `origin/main..main` would be empty |
| GitHub Pages publishing source switched from "Deploy from a branch" to "GitHub Actions" | OPS-04 | A repo-settings change; `actions/configure-pages` cannot update `build_type` (verified in its `src/api-client.js`) | Repo → Settings → Pages → Build and deployment → Source → **GitHub Actions**. Confirm with `gh api repos/ayhid/resume/pages --jq .build_type` → `workflow` |
| The v2 page renders correctly in a browser after deploy | criterion 4 | Visual correctness is not assertable without a rendering budget this phase does not have (Phase 11) | Load https://ayoub-hidri.dev/ , confirm the bilingual v2 page, toggle FR/EN, expand a CV panel |

---

## Validation Sign-Off

Checked against the finished plan set, not against intent.

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — all 14 tasks across the five plans carry `<verify><automated>`
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (`stage-site.sh` → `01-01` T3, `verify_site.py` → `01-02` T1)
- [x] No watch-mode flags
- [x] Feedback latency < 60 s — ~2 s local, ~30 s for the CI `verify` job
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending — `status` stays `draft`; `validate-phase` owns the transition to `validated`.
