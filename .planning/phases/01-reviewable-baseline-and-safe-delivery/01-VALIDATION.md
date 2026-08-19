---
phase: 1
slug: reviewable-baseline-and-safe-delivery
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-19
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

Task IDs are assigned by `01-*-PLAN.md`; this table binds each requirement to its
automated command. The executor fills the Task ID column as plans are written.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 0 | OPS-02 | — | Staged artifact contains only allowlisted production assets | unit | `python3 .github/scripts/verify_site.py _site` | ❌ W0 | ⬜ pending |
| TBD | 01 | 0 | OPS-01 | — | `index.html` parses; single `<h1>` per language block; no duplicate `id` | unit | `python3 .github/scripts/verify_site.py _site` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | OPS-03 | — | Rewrite lands as scoped commits; tree clean | structural | `git status --porcelain` empty; `git diff --quiet wip/v2-snapshot -- index.html README.md` | ✅ git | ⬜ pending |
| TBD | 01 | 1 | OPS-03 | — | Each commit is scoped to one concern | manual | `git show --stat <sha>` per commit — reviewer reads the diff | ✅ git | ⬜ pending |
| TBD | 01 | 2 | OPS-01 | — | A pull request runs verification | integration | `gh pr checks <n>` shows `verify` completed | ✅ gh | ⬜ pending |
| TBD | 01 | 2 | OPS-01 | T-01 | A pull request publishes nothing | integration | `gh api repos/ayhid/resume/deployments --jq 'length'` unchanged across the PR; `gh run list --event pull_request --json jobs` shows `deploy` skipped | ✅ gh | ⬜ pending |
| TBD | 01 | 2 | OPS-04 | — | Push/merge to `main` publishes | integration | `gh run list --event push --limit 1` conclusion `success`; `gh api repos/ayhid/resume/pages --jq .status` → `built` | ✅ gh | ⬜ pending |
| TBD | 01 | 2 | OPS-04 | T-02 | Only the Actions workflow publishes | regression | `gh run list --limit 10 --json event,name` contains no `pages build and deployment` / event `dynamic` run after the source switch | ✅ gh | ⬜ pending |
| TBD | 01 | 2 | OPS-02 | T-01 | The **published** site exposes nothing but production assets | smoke | live `curl` matrix below | ❌ W0 | ⬜ pending |
| TBD | 01 | 2 | criterion 4 | — | The live page is v2, not the v1 CV | smoke | `curl -s https://ayoub-hidri.dev/ \| grep -c 'data-lang-block'` ≥ 1 **and** `grep -c 'cdn.tailwindcss.com'` = 0 | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

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
| `/CNAME` | 404 | 404 |
| `/en/` | 404 | 404 (Phase 10) |

Baseline measured 2026-08-19 [VERIFIED: curl, research session]. `/specs/design.md` and
`/.planning/STATE.md` 404 today only because `main` is ahead of `origin/main` and the
commits that added them have never been pushed — the first push of this phase carries them,
so the allowlist must be in place before it.

---

## Wave 0 Requirements

- [ ] `.github/scripts/stage-site.sh` — the D-06 allowlist manifest copy into `_site/` (OPS-02); executable, locally runnable, tolerates a missing `en/` (D-07)
- [ ] `.github/scripts/verify_site.py` — manifest presence/absence + `index.html` HTML parse (OPS-01/OPS-02); Python 3 stdlib only (`html.parser`) — `xmllint` and `tidy` are **not** on `ubuntu-latest`
- [ ] Post-deploy smoke check — the live `curl` matrix above (criteria 3 and 4); may live in phase verification notes rather than the repo, since `.github/scripts/` does not ship
- [ ] No test framework install required — stdlib only

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Each commit in the series is independently readable and scoped to one concern | OPS-03 | "Readable" is a human judgement; no assertion can stand in for it | `git log --oneline origin/main..main`, then `git show --stat <sha>` for each; confirm one concern per commit and a message that describes it |
| GitHub Pages publishing source switched from "Deploy from a branch" to "GitHub Actions" | OPS-04 | A repo-settings change; `actions/configure-pages` cannot update `build_type` (verified in its `src/api-client.js`) | Repo → Settings → Pages → Build and deployment → Source → **GitHub Actions**. Confirm with `gh api repos/ayhid/resume/pages --jq .build_type` → `workflow` |
| The v2 page renders correctly in a browser after deploy | criterion 4 | Visual correctness is not assertable without a rendering budget this phase does not have (Phase 11) | Load https://ayoub-hidri.dev/ , confirm the bilingual v2 page, toggle FR/EN, expand a CV panel |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (`stage-site.sh`, `verify_site.py`)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60 s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
