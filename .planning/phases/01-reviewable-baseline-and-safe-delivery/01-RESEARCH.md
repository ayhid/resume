# Phase 1: Reviewable Baseline and Safe Delivery - Research

**Researched:** 2026-08-19
**Domain:** Git history surgery on a single-file rewrite + GitHub Pages delivery hardening
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Commit slicing**

- **D-01:** Slice the v2 rewrite **by concern, in dependency order** — roughly: head/SEO + JSON-LD, design tokens and the `<style>` block, FR content tree, EN mirror, JS controller, README. Each commit touches a distinct region of the single file so diffs stay local and reviewable despite the monolith.
- **D-02:** **Intermediate commits may render imperfectly.** Only the final commit of the series must leave the page correct. Readability of the series wins over per-commit renderability.
- **D-03:** The commit series lands **directly on `main`** — no feature branch for the rewrite itself. — **Reversibility:** costly — once pushed, rewriting the series means a force-push to a public deployed branch.
- **D-04:** **Ordering is mandatory: the deploy workflow change is the first commit**, before any rewrite commit. Every push to `main` deploys, so until the allowlist exists an intermediate push would publish `specs/`, `README.md` and `.planning/` to the live domain.

**Deploy pipeline and artifact**

- **D-05:** Limit the artifact with an **allowlist copy into `_site/`**: a CI step copies the named production files into `_site/`, and `upload-pages-artifact` uploads that directory instead of `.`. Anything new must be added deliberately — nothing leaks by default. The repo root stays flat, so opening `index.html` from disk remains the dev loop.
- **D-06:** Production manifest: `index.html`, `CNAME`, `robots.txt`, `sitemap.xml`, `og-image.png`, and `en/` (reserved for Phase 10). **`og-image.html` is excluded** — it is a dev-only artboard and should not be reachable at `/og-image.html`.
- **D-07:** The copy step **tolerates missing entries** (copy `en/` if present, skip silently otherwise), so Phase 10 can add `/en/` without editing `deploy.yml`.
- **D-08:** Split the workflow into a `pull_request` **verify-only** job and a `push`-to-`main` **deploy** job. The deploy job must not be reachable from a `pull_request` trigger.
- **D-09:** Prove criterion 2 with **one throwaway pull request** after the workflow change is on `main` — a trivial change (e.g. a README typo), confirming the check reports pass/fail and no deployment fires. Merge or close it afterwards.

**Repo hygiene**

- **D-10:** Fix `.gitignore`: split the malformed final line (`*.temp.claude/settings.local.json` is currently one concatenated pattern), and add `.claude/settings.local.json` and `.playwright-mcp/`.
- **D-11:** Leave `.playwright-mcp/og-image.png` on disk, untracked and ignored. Root `og-image.png` remains the real asset.

### Claude's Discretion

- **PR verification content** (not discussed; scoped by Claude): keep it minimal — an artifact manifest check (every allowlisted file present in `_site/`; `specs/`, `.planning/`, `README.md`, `.github/`, `og-image.html` absent) plus an HTML parse of `index.html`. Link checking and Lighthouse are explicitly out of scope here; Lighthouse budgets belong to Phase 11.
- Exact commit boundaries and messages within D-01's concern ordering.

### Deferred Ideas (OUT OF SCOPE)

- **Mixpanel token in git history** — a project token was committed in plain text (commit `0650811`) and remains reachable in this public repo. Rotating/revoking it and any history rewrite is out of scope here; flagged in `.planning/codebase/CONCERNS.md` §Security.
- **Link checking and Lighthouse CI in the PR job** — belongs with Phase 11 (accessibility and performance bars).
- **Promoting repeated inline styles into classes / de-duplicating the FR-EN trees** — real tech debt, but a refactor phase of its own; this phase commits the rewrite as written, it does not improve it.
- **Branch protection on `main`** — D-03 pushes directly to `main`, so enforcement is by convention here; making it a rule is a later ops decision.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OPS-01 | A pull request runs verification without deploying to production | §Pattern 2 (two-job split with `if:` + `needs:`), §Pattern 4 (dependency-free verify script), §Pitfall 3 (environment branch policy is the second line of defence), §Validation Architecture criterion 2 |
| OPS-02 | Only production assets are published — `specs/`, `README.md`, and `.planning/` never ship to the live site | §**Finding 1** (Pages source is `legacy` — the allowlist alone does NOT fix this), §Pattern 3 (allowlist staging script), §Code Example 2, §Validation Architecture criterion 3 |
| OPS-03 | The v2 rewrite is committed in reviewable increments rather than one undifferentiated change | §Pattern 1 (snapshot-branch + structural reconstruction), §Verified slice boundaries, §Pitfall 1 (`git add -p` unavailable), §Don't Hand-Roll |
| OPS-04 | Deployment to production happens on merge to `main` | §Pattern 2, §**Finding 1** (must switch `build_type` to `workflow` or the legacy builder keeps publishing), §Code Example 1 |
</phase_requirements>

## Summary

Three facts discovered this session change the shape of this phase.

**First, and most important: this repository's GitHub Pages publishing source is still the legacy branch builder, not GitHub Actions.** `GET /repos/ayhid/resume/pages` returns `"build_type": "legacy"` with `"source": {"branch": "main", "path": "/"}`, and the run history shows a `pages build and deployment` run (event `dynamic`) firing on every push alongside the repo's own `Deploy to GitHub Pages` workflow. That legacy builder publishes the whole `main` root and **completely ignores `deploy.yml`**. Rewriting the workflow with an allowlist — the entirety of D-05/D-06/D-07 — would not stop a single byte from leaking while `build_type` stays `legacy`. Switching the source to GitHub Actions is a repository-settings change (`PUT /repos/{owner}/{repo}/pages` with `build_type=workflow`, or Settings → Pages → Source), and it must land **before or with** the first commit of the series, ahead of D-04's workflow commit. Verified live: `https://ayoub-hidri.dev/README.md` returns `200` today.

**Second, the leak is about to get worse.** `main` is 8 commits ahead of `origin/main`, and those unpushed commits are exactly the ones that added `specs/` and `.planning/`. That is why `https://ayoub-hidri.dev/specs/design.md` currently 404s — not because the pipeline excludes it, but because it has never been pushed. The first `git push` of this phase carries `specs/` to the origin; if the legacy builder is still active at that moment, it publishes it.

**Third, the commit-slicing mechanics need a non-interactive technique.** The agent harness forbids interactive git (`git add -i`/`git add -p`). The reliable substitute is a *snapshot branch plus structural reconstruction*: commit the dirty tree to a throwaway branch so the work is safe in the object store, return to `main` (which restores the v1 file), then derive each intermediate file state from the snapshot by absolute line ranges in the frozen v2 file and marker-based insert points in the mutating working file. The v2 file's region boundaries are exact and verified — `<style>` 78–115, `</head>` 116, FR block 120–550, EN block 551–980, `<script>` 982–1052 — which makes D-01's concern ordering mechanically executable and the final state byte-verifiable with `git diff --quiet <snapshot>`.

**Primary recommendation:** Order the work as (0) switch Pages `build_type` to `workflow` and confirm the custom domain survives, (1) commit the two-job workflow + shared staging script + verify script, (2) commit the `.gitignore` fix, (3) commit the rewrite in five structural slices plus README, all locally, then **push once**; finally open the throwaway PR of D-09. Keep the currently-working action versions in this phase — bumping `configure-pages`/`upload-pages-artifact`/`deploy-pages` majors is an orthogonal risk that does not serve any success criterion here.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| What is served at `ayoub-hidri.dev` | Pages control plane (repo settings, `build_type`) | CI (artifact contents) | The publishing *source* decides which producer wins; the artifact only matters once the source is `workflow` |
| Artifact contents (the allowlist) | CI job — shell staging step | — | Not a build step; a `cp` into `_site/` inside the runner, invisible to the local dev loop |
| Publish gating (PR vs merge) | CI job graph (`on:` triggers + `if:` + `needs:`) | Pages control plane (`github-pages` environment branch policy) | Trigger gating is the intent; the environment policy is the backstop if the gate is ever mis-edited |
| Pre-publish verification | CI job — `python3` stdlib script | Local shell (same script runnable offline) | Zero dependency, matches the project's "no build step, no runtime dependency" constraint |
| Custom domain binding | Pages control plane (`cname` field in settings) | Repo `CNAME` file (authoritative only under `legacy`) | Verified: settings already hold `"cname": "ayoub-hidri.dev"` |
| Commit history shape | Local git (working tree + object store) | — | No CI involvement; verified by `git log` / `git diff` |
| HTTPS / certificate | Pages control plane | — | Already `https_enforced: true`, cert approved through 2026-09-30 |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `actions/checkout` | `v4` (in use) — latest `v7.0.1` | Fetch the repo into the runner | Official; the only way to get files for the staging step |
| `actions/configure-pages` | `v4` (in use) — starter uses `v5`, latest `v6.0.0` | Reads Pages site metadata, exposes `base_url` | Official; optional for a plain static upload but harmless and conventional |
| `actions/upload-pages-artifact` | `v3` (in use, also what the official starter pins) — latest `v5.0.0` | Tars `_site/` into the `github-pages` artifact | Official; produces the exact artifact shape `deploy-pages` expects |
| `actions/deploy-pages` | `v4` (in use) — starter uses `v5`, latest `v5.0.0` | Creates the Pages deployment from the artifact | Official; requires `pages: write` + `id-token: write` and the `github-pages` environment |
| `python3` | 3.10–3.14 preinstalled on `ubuntu-latest` | PR verification (manifest + HTML parse) | Zero install, zero lockfile, stdlib-only — respects the project's no-dependency constraint |
| `bash` / coreutils | runner default | Allowlist staging (`cp` into `_site/`) | D-05 is a copy, not a build |

**Version verification (run 2026-08-19 against the GitHub Releases API):**

```
actions/checkout               v7.0.1  published 2026-07-20
actions/configure-pages        v6.0.0  published 2026-03-25
actions/upload-pages-artifact  v5.0.0  published 2026-04-10
actions/deploy-pages           v5.0.0  published 2026-03-25
```
[VERIFIED: `curl https://api.github.com/repos/<action>/releases/latest`]

The official starter workflow `actions/starter-workflows/pages/static.yml` — GitHub's own known-good combination — currently pins a *mixed* set: `checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v5`. [VERIFIED: raw.githubusercontent.com/actions/starter-workflows/main/pages/static.yml]

**Recommendation: do not bump action versions in this phase.** The repo's current pins (`checkout@v4`, `configure-pages@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4`) have 19 successful `push` runs behind them [VERIFIED: `gh run list`]. This phase's success criterion 4 is "the live site shows v2" — introducing a major-version bump of the deploy toolchain in the same series is uncorrelated risk. `upload-pages-artifact@v5` internally wraps `actions/upload-artifact@v7.0.1` [VERIFIED: raw upload-pages-artifact/main/action.yml], and no source I could reach states which `deploy-pages` versions can consume a v7-uploaded artifact — the fact that GitHub's own starter still ships `upload-pages-artifact@v3` next to `deploy-pages@v5` is a signal to leave this alone. If a bump is wanted later, do it as its own commit with its own deploy to observe.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `gh` CLI | 2.86.0 locally, authenticated as `ayhid` with `repo`+`workflow` scopes, `admin: true` on the repo | Flip `build_type`, watch runs, open the D-09 PR, assert deployment counts | Every step of this phase that touches the Pages control plane or verifies criterion 2 |
| `jq` | 1.7.1 on the runner | JSON assertions in shell steps | Only if you prefer shell over python for a check |
| `shellcheck` | 0.9.0 on the runner | Lint the staging script | Optional nicety; the staging script is ~20 lines |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Allowlist `cp` into `_site/` | Keep `path: '.'` and rely on tar exclusions | `upload-pages-artifact` already excludes `.git`, `.github` and (unless `include-hidden-files: true`) every dot-prefixed entry — so `.planning/` would not ship anyway. But `specs/`, `README.md` and `og-image.html` are not dot-prefixed and *would*. Denylisting is the wrong default; D-05 is right. |
| `python3` stdlib HTML check | `xmllint --html --noout` | `libxml2-utils` is **not** in the documented `ubuntu-latest` package list — do not assume `xmllint` exists |
| `python3` stdlib HTML check | `npx html-validate` / `htmlhint` | Introduces npm + network + a lockfile-less dependency on a no-`package.json` repo; contradicts the project constraint |
| `python3` stdlib HTML check | `apt-get install tidy` | `tidy` is not preinstalled; adds ~15s and a network dependency per run |
| Structural reconstruction of commits | `git add -p` | Interactive; unavailable to the executing agent |
| Structural reconstruction of commits | Split the unified diff, `git apply --cached --3way` | Viable and non-interactive, but the intermediate file states are a mechanical hunk-mix rather than a state you chose; harder to review and to reason about |
| Snapshot branch | `git stash push -u` | Also recoverable, but a stash entry is easy to drop by accident and carries no name in `git log`; a branch is greppable and survives |

**Installation:** None. No `package.json`, no `pip install`, no `cargo`. This phase adds zero runtime and zero build dependencies — consistent with `.claude/CLAUDE.md`.

## Package Legitimacy Audit

This phase installs **no npm, PyPI or crates packages**. The only third-party code executed is GitHub Actions, audited below.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `actions/checkout` | GitHub Actions (first-party `actions/` org) | since 2019 | ubiquitous | github.com/actions/checkout | OK | Approved — already in use |
| `actions/configure-pages` | GitHub Actions (`actions/` org) | since 2022 | ubiquitous | github.com/actions/configure-pages | OK | Approved — already in use |
| `actions/upload-pages-artifact` | GitHub Actions (`actions/` org) | since 2022 | ubiquitous | github.com/actions/upload-pages-artifact | OK | Approved — already in use |
| `actions/deploy-pages` | GitHub Actions (`actions/` org) | since 2022 | ubiquitous | github.com/actions/deploy-pages | OK | Approved — already in use |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

Supply-chain note: all four are referenced by mutable major tags (`@v4`). Tag references are re-pointable by the publisher; SHA pinning (`uses: actions/checkout@<40-char-sha>`) is the hardened form. All four repos now publish to GitHub's immutable action packages (visible in their release changelogs) [CITED: github.com/actions/deploy-pages releases]. Since these are first-party `actions/` publications on a public personal site with no secrets in the workflow, tag pinning is an acceptable residual risk — but see §Security Domain for the one case where it matters.

## Architecture Patterns

### System Architecture Diagram

```text
                       ┌─────────────────────── LOCAL ───────────────────────┐
                       │                                                     │
 working tree (v2)     │  git switch -c wip/v2-snapshot                       │
 M index.html ─────────┼──▶ commit ──▶ [snapshot branch]  (v2 safe in objects)│
 M README.md           │                     │                                │
                       │  git switch main    │  (working tree reverts to v1)  │
                       │        │            │                                │
                       │        ▼            ▼                                │
                       │   index.html ◀── git show wip/v2-snapshot:index.html │
                       │        │        (frozen source, absolute line ranges)│
                       │        │                                             │
                       │   slice loop: derive state ▶ git add ▶ git commit    │
                       │   C1 workflow │ C2 gitignore │ C3 head │ C4 style    │
                       │   C5 FR │ C6 EN │ C7 JS │ C8 README                  │
                       │        │                                             │
                       │  assert: git diff --quiet wip/v2-snapshot -- <files> │
                       └────────┼─────────────────────────────────────────────┘
                                │  ONE push
                                ▼
        ┌───────────────── github.com/ayhid/resume ──────────────────┐
        │                                                            │
        │  push:main ──┐                    ┌── pull_request:main    │
        │              ▼                    ▼                        │
        │        ┌───────────────────────────────┐                   │
        │        │ job: verify (contents: read)  │  runs on BOTH     │
        │        │  stage-site.sh _site          │                   │
        │        │  verify_site.py _site         │                   │
        │        └───────────┬───────────────────┘                   │
        │                    │ needs:                                │
        │       if: event != pull_request                            │
        │                    ▼                                       │
        │        ┌───────────────────────────────┐                   │
        │        │ job: deploy                   │  push:main ONLY   │
        │        │  pages:write + id-token:write │                   │
        │        │  environment: github-pages ───┼── branch policy:  │
        │        │  configure-pages              │   main, gh-pages  │
        │        │  stage-site.sh _site          │   (backstop)      │
        │        │  upload-pages-artifact _site  │                   │
        │        │  deploy-pages                 │                   │
        │        └───────────┬───────────────────┘                   │
        │                    │                                       │
        │  ⚠ build_type must be "workflow" — while it is "legacy",   │
        │    a parallel `pages build and deployment` (event:dynamic) │
        │    publishes the ENTIRE main root and wins/races.          │
        └────────────────────┼───────────────────────────────────────┘
                             ▼
                    https://ayoub-hidri.dev/
                    (index.html, CNAME, robots.txt,
                     sitemap.xml, og-image.png [, en/])
```

### Recommended Project Structure

```
/                          # flat root, unchanged — still the dev loop
├── index.html             # published
├── CNAME                  # published (see Pitfall 5: ignored under build_type=workflow)
├── robots.txt             # published
├── sitemap.xml            # published
├── og-image.png           # published
├── og-image.html          # NOT published (D-06)
├── README.md              # NOT published
├── specs/                 # NOT published
├── .planning/             # NOT published
└── .github/
    ├── workflows/
    │   └── deploy.yml     # two jobs: verify, deploy
    └── scripts/
        ├── stage-site.sh  # the allowlist — single source of truth (D-05/D-06/D-07)
        └── verify_site.py # manifest + HTML checks, stdlib only
```

`.github/` is excluded from the artifact tar unconditionally by `upload-pages-artifact` [VERIFIED: action.yml `--exclude=.github`], and it is not in the allowlist either — the scripts can never ship.

### Pattern 1: Snapshot branch + structural reconstruction (OPS-03)

**What:** Park the dirty working tree on a throwaway branch, return to `main` (restoring v1), then rebuild the v2 file one concern at a time, taking content from the frozen snapshot by absolute line range and inserting it into the mutating working file by structural marker.

**When to use:** A large single-file rewrite that must become several readable commits, without interactive git.

**Why it beats hunk staging here:** every commit's file content is a state you chose and can inspect, the final state is provably byte-identical to the snapshot, and nothing depends on diff hunk alignment.

**Verified slice boundaries in the v2 working-tree `index.html`** — quoted verbatim from `grep -n` / `sed -n` output this session:

```
3:<head>
31:<script type="application/ld+json">
70:</script>
74:  <script defer src="https://[UMAMI_HOST]/script.js" data-website-id="[UMAMI_WEBSITE_ID]"></script>
78:<style>
115:</style>
116:</head>
117:<body>
120:<div data-lang-block="fr">
550: </div>
551:<div data-lang-block="en" hidden lang="en">
980: </div>
982:<script>
1052:</script>
```
[VERIFIED: /Users/ayoub/projects/resume/index.html — lines 3, 31, 70, 74, 78, 115, 116, 117, 120, 550, 551, 980, 982, 1052, read this session]

Line 981 is empty; line 1052 is the last line of the file.

> Note: `.claude/CLAUDE.md` documents these regions as "FR L121-552, EN L553-980, JS L982-1052". The FR/EN numbers there are stale by one to two lines. **Use the numbers above**, and better still, have the slice script locate `<div data-lang-block="en"` and `<script>` by search rather than by constant.

**Skeleton:**

```bash
# 0. Park the rewrite where git can always get it back.
git switch -c wip/v2-snapshot
git add index.html README.md
git commit -m "wip: v2 rewrite snapshot (throwaway)"
git switch main            # working tree returns to v1, clean

# 1..N. Each slice: derive a file state, stage it, commit it.
git show wip/v2-snapshot:index.html > /tmp/v2.html   # frozen source
python3 /tmp/slice.py <step-name>                    # writes ./index.html
git add index.html
git commit -m "feat(head): v2 metadata, OpenGraph and JSON-LD"

# Final assertion — the series must reproduce the snapshot exactly.
git diff --quiet wip/v2-snapshot -- index.html README.md && echo "IDENTICAL"
git status --porcelain          # must be empty
git branch -D wip/v2-snapshot   # recoverable from reflog if needed
```

**Slice derivations (D-01 order):**

| # | Commit | Derivation from the frozen v2 file |
|---|--------|------------------------------------|
| 1 | head / SEO / JSON-LD | Replace everything from `<!DOCTYPE` through `</head>` in the working file with v2 lines `1..77` + v2 line `116` (`</head>`) — i.e. the v2 head **minus** the `<style>` block |
| 2 | design tokens + global stylesheet | Insert v2 lines `78..115` immediately before `</head>` |
| 3 | FR content tree | Replace everything from `<body` through `</html>` with `<body>` + v2 lines `118..550` + `</body>\n</html>` |
| 4 | EN mirror | Insert v2 lines `551..980` immediately after the line `</div>` that closes the FR block |
| 5 | JS controller | Insert v2 lines `981..1052` immediately before `</body>` |
| 6 | README | `git checkout wip/v2-snapshot -- README.md` |

After slice 5 the file must be byte-identical to `/tmp/v2.html`. Slices 1–4 will render badly — D-02 permits this explicitly.

### Pattern 2: One workflow file, two jobs, gated by event (OPS-01, OPS-04)

**What:** A single `deploy.yml` with a `verify` job that runs on both events and a `deploy` job that runs only on `push` to `main`, chained with `needs:` so a failing verification blocks publication.

**Key mechanics:**

- `if: github.event_name != 'pull_request'` on the deploy job. Prefer the explicit positive form `github.event_name == 'push' && github.ref == 'refs/heads/main'` — it reads as the intent and survives someone later adding `workflow_dispatch` or `schedule` without thinking.
- **Job-level `permissions`.** Today `permissions:` is workflow-level, so the PR job would also receive `pages: write` and `id-token: write`. Set `permissions: {}` at the top and grant per job: `contents: read` on verify, `contents: read` + `pages: write` + `id-token: write` on deploy.
- **Job-level `concurrency`.** Today `group: "pages"` with `cancel-in-progress: false` is workflow-level, so PR runs would queue in the same lane as production deploys and could delay one. Give verify its own cancellable group (`verify-${{ github.ref }}`, `cancel-in-progress: true`) and keep `pages` / `cancel-in-progress: false` on the deploy job only.
- **`environment: github-pages` stays on the deploy job only.** `deploy-pages` requires it, and it is the enforcement point for the branch policy backstop.
- For `pull_request`, the workflow file that runs is the one on **the PR merge commit** (`refs/pull/N/merge`), not the base branch [CITED: docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows]. So the D-09 throwaway PR, branched from a `main` that already carries the fix, exercises the fixed workflow — that test is valid.

### Pattern 3: Allowlist staging as a shared script (OPS-02, D-05/D-06/D-07)

**What:** One `.github/scripts/stage-site.sh` invoked identically by both jobs. The manifest lives in exactly one place, and the verify job checks the same output the deploy job uploads — so the PR check is a real rehearsal, not an approximation.

**Why a script, not two inline `run:` blocks:** duplicating the manifest in a verify block and a deploy block is how the two drift, and a drifted manifest means the PR check passes on a `_site/` that is not the one published.

**Required vs optional entries (D-07):** `en/` does not exist yet — verified: `/Users/ayoub/projects/resume/en` is absent, and `https://ayoub-hidri.dev/en/` returns 404. The script must copy it only when present, and the verify script must not require it.

### Pattern 4: Dependency-free verification (Claude's discretion)

Two checks, both `python3` stdlib:

1. **Manifest check** — every required entry present in `_site/`; every forbidden entry absent (`README.md`, `og-image.html`, `specs/`, `.planning/`, `.github/`, `.claude/`, `.playwright-mcp/`, `_site/`).
2. **HTML structural parse of `_site/index.html`** — tag balance, exactly one `<h1>`, and **no duplicate `id`**. The duplicate-`id` check is the highest-value one on this specific page: the FR and EN trees mirror each other and every id must stay locale-suffixed and unique document-wide (`.claude/CLAUDE.md` §Anti-Patterns "Editing one language block only"). It is also exactly the class of bug the coming content phases will introduce.

A free third check: `xml.etree.ElementTree.parse('_site/sitemap.xml')` for well-formedness.

### Anti-Patterns to Avoid

- **Trusting `deploy.yml` while `build_type` is `legacy`.** The workflow can be perfect and the site will still publish the whole repo root. Fix the source first.
- **Using `pull_request_target`.** It runs base-branch workflow code with a *write* token and repo secrets against untrusted head content. There is no reason to reach for it here; `pull_request` is correct.
- **Adding an npm dev-dependency for HTML linting.** `.claude/CLAUDE.md` lists "no build step, no runtime dependency" as a credibility signal; a `package.json` appearing in Phase 1 to lint HTML undermines the phase that is supposed to make delivery boring.
- **Pushing the series commit by commit.** Each push is a deploy. One push at the end means one production deploy of the final state.
- **Rewriting the pushed series.** D-03 puts these commits on public `main`. Once pushed, fixing a commit boundary means a force-push to a deployed branch. Get the boundaries right locally — that is what the snapshot branch buys you.
- **Deleting the `github-pages` environment's branch policy** because it "seems redundant" once `if:` gating exists. It is the only thing that stops a mis-edited workflow from deploying off a PR ref.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Producing a Pages-compatible artifact | A hand-rolled `tar` + `actions/upload-artifact` | `actions/upload-pages-artifact` | The artifact must be named `github-pages`, be a single gzip containing a single tar, contain no symlinks or hardlinks, and stay under 1 GB — the action encodes all of it [VERIFIED: upload-pages-artifact README] |
| Creating the deployment | REST calls to the Pages deployment API | `actions/deploy-pages` | It mints and passes the OIDC token that proves the run's ref to the Pages API; hand-rolling this means reimplementing the trust handshake |
| Splitting a rewrite into commits | A bespoke diff-hunk parser | `git show <ref>:<path>` + line slicing, or `git apply --cached --3way` | git already stores the frozen source and already knows how to apply a subset of hunks with three-way fallback |
| Keeping the rewrite safe while slicing | Copying `index.html` to `/tmp` and hoping | A snapshot branch (git object store + reflog) | `/tmp` is not backed up, is cleared on reboot, and is invisible to `git fsck`; a branch survives a mistaken `git checkout .` |
| HTML well-formedness | A regex tag matcher | `html.parser.HTMLParser` subclass with an explicit stack | Void elements, CDATA in `<script>`/`<style>`, attribute quoting and charrefs are all handled by the stdlib parser; a regex gets `<script>` content wrong immediately |
| Excluding dotfiles from the artifact | A manual find/prune | `upload-pages-artifact` default (`include-hidden-files: false`) | The action already passes `--exclude=.git --exclude=.github` and, by default, `--exclude=.[^/]*` [VERIFIED: action.yml] |

**Key insight:** every "clever" shortcut in this phase trades a reversible local mistake for an irreversible public one — a force-push to a deployed branch, or a production deploy that serves the wrong bytes. Prefer the boring mechanism that leaves an artifact you can diff.

## Runtime State Inventory

This phase changes deployment configuration and git history, so runtime state matters.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — the site has no datastore, no server, no session state. Verified: no `package.json`, no backend, `.planning/codebase/STACK.md` records "no server-side runtime". | none |
| Live service config | **`build_type: "legacy"`, `source: {branch: main, path: "/"}` in GitHub Pages repo settings** — not in git, not visible in `deploy.yml`. Also the `github-pages` environment with a custom branch policy allowing exactly `main` and `gh-pages`, created 2025-09-04. Also `cname: "ayoub-hidri.dev"` and `https_enforced: true` held in Pages settings. [VERIFIED: `gh api repos/ayhid/resume/pages`, `gh api repos/ayhid/resume/environments`, `.../deployment-branch-policies`] | **`build_type` → `workflow` (control-plane change, must precede the pushes).** Leave the branch policy and cname alone; assert they survive. |
| OS-registered state | None — no scheduled task, no daemon, no pm2, no launchd entry. | none |
| Secrets / env vars | None used by the workflow (`${{ github.token }}` only). Two deployment-time placeholders live as literal text inside an HTML comment: `[UMAMI_HOST]` and `[UMAMI_WEBSITE_ID]` at `index.html:74` — Phase 2 wires them, this phase commits them verbatim. Local `gh` token scopes: `gist, read:org, repo, workflow`, repo `admin: true`. | none in this phase |
| Build artifacts | `.playwright-mcp/og-image.png` (untracked, D-11 leaves it). `_site/` will exist locally after any local run of the staging script. No egg-info, no `node_modules`, no compiled output. | Add `_site/` and `.playwright-mcp/` to `.gitignore` |
| Unpushed history | **`main` is 8 commits ahead of `origin/main`** — `9a8d0ba, ef66b50, be96494, dad0757, cb82acc, 32ec445, 669ab11, 52ac455` — including `669ab11 docs: initialize project`, which added `specs/`. [VERIFIED: `git rev-list --left-right --count origin/main...main` → `0  8`; `git log --oneline origin/main..main`] | These ride along on the first push. They are the reason the Pages source must be fixed first. |

**The canonical question — after every file in the repo is updated, what runtime systems still have the old behaviour?** Exactly one: the GitHub Pages control plane, which will keep running the legacy branch builder on every push regardless of what `deploy.yml` says.

## Common Pitfalls

### Pitfall 1: The allowlist is written, merged, deployed — and `specs/` still ships

**What goes wrong:** `deploy.yml` gets the `_site/` allowlist, the run goes green, and `curl https://ayoub-hidri.dev/README.md` still returns 200.
**Why it happens:** `build_type` is `legacy`. GitHub's built-in `pages build and deployment` workflow (event `dynamic`, 23 runs in this repo's history) publishes the `main` root and does not read `deploy.yml`. Both producers target the same site; the Actions deployment and the legacy build race on every push.
**How to avoid:** Switch the publishing source to GitHub Actions **before** the first push of this phase — Settings → Pages → Build and deployment → Source: GitHub Actions, or `gh api -X PUT repos/ayhid/resume/pages -f build_type=workflow`. Note that `actions/configure-pages` will **not** do this for you: its `enablement` input only *creates* a Pages site when none exists (`if (!pageObject && enablement)`), it never updates an existing site's `build_type` [VERIFIED: raw.githubusercontent.com/actions/configure-pages/main/src/api-client.js].
**Warning signs:** a `pages build and deployment` run appearing in `gh run list` after your push; two deployments to the `github-pages` environment per push.

### Pitfall 2: Pushing the series one commit at a time

**What goes wrong:** Six production deploys, four of which serve a half-rewritten page to real visitors.
**Why it happens:** every push to `main` triggers the deploy job; D-02 explicitly allows intermediate commits to render imperfectly, which is fine in history and not fine in production.
**How to avoid:** commit all slices locally, verify `git diff --quiet wip/v2-snapshot`, then `git push` once. A single push fires one workflow run at the tip commit — the intermediate states never reach the runner.
**Warning signs:** more than one `Deploy to GitHub Pages` run for this phase.

### Pitfall 3: The PR check goes green but a deployment fires anyway

**What goes wrong:** OPS-01 looks satisfied because the check is green, while `deploy-pages` also ran on the PR.
**Why it happens:** the deploy job's `if:` was written as `if: github.ref == 'refs/heads/main'` without the event test — for a `pull_request`, `GITHUB_REF` is `refs/pull/N/merge`, so this happens to work; but a `workflow_dispatch` or a `push` of a tag would slip through other formulations.
**How to avoid:** assert on the event, not only the ref, and prove it empirically during D-09: `gh api repos/ayhid/resume/deployments --jq 'length'` before and after the PR must be equal, and `gh run list --event pull_request` must show the verify job with the deploy job skipped.
**Warning signs:** a new entry at `https://github.com/ayhid/resume/deployments/activity_log?environments_filter=github-pages` timed to the PR.

### Pitfall 4: `.gitignore` gets a concatenated pattern

**What goes wrong:** appending to `.gitignore` produces `*.temp.claude/settings.local.json` — a single meaningless pattern that ignores nothing, so `git status` is never clean and D-11 fails.
**Why it happens:** **the file has no trailing newline.** Verified byte-exactly: the last 12 bytes are `*   .   t   m   p  \n   *   .   t   e   m   p` — it ends at `*.temp` with no `\n`, and `wc -l` reports 21 for a 22-line file. Any `>>` append lands on the same line. [VERIFIED: `/Users/ayoub/projects/resume/.gitignore` via `od -c` and `wc -l`, this session]
**How to avoid:** the corrective action is *not* "split a malformed line" (D-10's premise describes the outcome of the naive fix, not the current file state — the concatenated pattern does not exist yet). Rewrite the file with a terminating newline and append the three patterns as their own lines:

```gitignore
# Temporary files
*.tmp
*.temp

# Local agent + tool state
.claude/settings.local.json
.playwright-mcp/

# CI staging output
_site/
```

**Warning signs:** `git check-ignore -v .claude/settings.local.json` returns nothing.

### Pitfall 5: Assuming the `CNAME` file holds the custom domain

**What goes wrong:** the manifest is treated as load-bearing for the domain, and a future change is over-constrained by a file that is inert.
**Why it happens:** true under the *current* legacy source, false after the switch. GitHub's docs: "If you are publishing from a custom GitHub Actions workflow, no `CNAME` file is created, and any existing `CNAME` file is ignored and is not required." [CITED: docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site]. The domain actually lives in Pages settings — verified present today as `"cname": "ayoub-hidri.dev"`, `"protected_domain_state": "verified"`, `"https_enforced": true`, certificate approved through 2026-09-30.
**How to avoid:** keep `CNAME` in the manifest (D-06 is a locked decision and shipping it is harmless — it just makes `/CNAME` fetchable), but record that the switch to `build_type: workflow` does **not** depend on it, and that `.claude/CLAUDE.md`'s "deleting `CNAME` breaks the domain" becomes stale after this phase.
**Warning signs:** a certificate re-provisioning notice, or `gh api repos/ayhid/resume/pages --jq .cname` returning null after the switch — check immediately after flipping the source, before pushing the rewrite.

### Pitfall 6: `HTMLParser(strict=True)`

**What goes wrong:** `TypeError: __init__() got an unexpected keyword argument 'strict'`, and the verify job fails for a reason unrelated to the HTML.
**Why it happens:** `strict` was deprecated in Python 3.3 and removed in 3.5; `html.parser.HTMLParser` is permanently non-strict and never raises on malformed markup. The checks must be implemented explicitly on top of it.
**How to avoid:** subclass and maintain your own tag stack; treat "parser produced no error" as meaningless.
**Warning signs:** a verify script that passes on deliberately broken HTML — test it once by feeding it `<div><p></div>`.

### Pitfall 7: Losing the rewrite mid-slice

**What goes wrong:** a stray `git checkout -- index.html` or `git restore .` during slicing destroys ~1000 lines of unbacked work.
**Why it happens:** the reconstruction pattern deliberately makes the working file mutate; a reflexive "reset to clean" is fatal if the only copy is the working tree.
**How to avoid:** the snapshot branch is step zero, not step three. Once committed there, the content is in the object store and survives every working-tree operation.
**Warning signs:** `git stash list` empty *and* no snapshot branch *and* `git status` clean before the series is finished.

### Pitfall 8: `ubuntu-latest` moving under the workflow

**What goes wrong:** a green pipeline starts failing on a Tuesday.
**Why it happens:** `actions/runner-images` now carries `Ubuntu2604-Readme.md` alongside 22.04 and 24.04 [VERIFIED: `gh api repos/actions/runner-images/contents/images/ubuntu`], so `ubuntu-latest` will migrate.
**How to avoid:** this phase's jobs depend only on `bash`, coreutils and `python3` — all three survive any Ubuntu migration, so `ubuntu-latest` is fine here. Do not add a step that depends on a specific preinstalled package version without pinning the image.

## Code Examples

### Example 1: `.github/workflows/deploy.yml` (two jobs, least privilege)

```yaml
# Source: structure per actions/starter-workflows/pages/static.yml and
# actions/deploy-pages README ("we recommend this action to be used in a dedicated job")
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# No ambient permissions; each job asks for what it needs.
permissions: {}

jobs:
  verify:
    name: Verify production artifact
    runs-on: ubuntu-latest
    permissions:
      contents: read
    concurrency:
      group: verify-${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Stage production artifact
        run: .github/scripts/stage-site.sh _site

      - name: Verify artifact contents
        run: python3 .github/scripts/verify_site.py _site

  deploy:
    name: Deploy to production
    needs: verify
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    concurrency:
      group: "pages"
      cancel-in-progress: false
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Stage production artifact
        run: .github/scripts/stage-site.sh _site

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Notes: `needs: verify` + a false `if:` on `deploy` means the deploy job is *skipped*, not failed, on pull requests — the PR's check run reports only `verify`. The script must be committed with the executable bit (`git update-index --chmod=+x` or `chmod +x` before `git add`), otherwise use `run: bash .github/scripts/stage-site.sh _site`.

### Example 2: `.github/scripts/stage-site.sh` (the allowlist, D-05/D-06/D-07)

```bash
#!/usr/bin/env bash
# The production manifest. Anything not listed here is never published.
# Run locally exactly as CI does:  .github/scripts/stage-site.sh _site
set -euo pipefail

DEST="${1:-_site}"
case "$DEST" in
  ""|"/"|"."|"..") echo "refusing to stage into '$DEST'" >&2; exit 2 ;;
esac

# Required — a missing entry is a failure, not a warning.
REQUIRED=(index.html CNAME robots.txt sitemap.xml og-image.png)
# Optional — copied when present. `en/` arrives in Phase 10 (D-07).
OPTIONAL=(en)

rm -rf "$DEST"
mkdir -p "$DEST"

for entry in "${REQUIRED[@]}"; do
  if [ ! -e "$entry" ]; then
    echo "::error::missing required production asset: $entry" >&2
    exit 1
  fi
  cp -R "$entry" "$DEST/"
  echo "staged   $entry"
done

for entry in "${OPTIONAL[@]}"; do
  if [ -e "$entry" ]; then
    cp -R "$entry" "$DEST/"
    echo "staged   $entry (optional)"
  else
    echo "skipped  $entry (optional, absent)"
  fi
done
```

Do **not** write the optional loop as `[ -e "$f" ] && cp -R "$f" "$DEST/" || echo skip` — that form swallows a genuine `cp` failure into the `||` branch.

### Example 3: `.github/scripts/verify_site.py` (stdlib only)

```python
#!/usr/bin/env python3
"""Verify the staged Pages artifact. No dependencies: stdlib only."""
import sys, pathlib, collections
from html.parser import HTMLParser
import xml.etree.ElementTree as ET

REQUIRED = ["index.html", "CNAME", "robots.txt", "sitemap.xml", "og-image.png"]
FORBIDDEN = ["README.md", "og-image.html", "specs", ".planning",
             ".github", ".claude", ".playwright-mcp", "_site"]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}

errors = []

class Checker(HTMLParser):
    # NB: HTMLParser has no strict mode (removed in Python 3.5) - every
    # check below is explicit; "it parsed" proves nothing.
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.ids, self.h1 = [], collections.Counter(), 0

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d:
            self.ids[d["id"]] += 1
        if tag == "h1":
            self.h1 += 1
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            errors.append(f"stray </{tag}> at line {self.getpos()[0]}")
        elif self.stack[-1][0] != tag:
            open_tag, line = self.stack[-1]
            errors.append(f"</{tag}> at line {self.getpos()[0]} closes <{open_tag}> opened at line {line}")
            self.stack.pop()
        else:
            self.stack.pop()

def main(dest):
    root = pathlib.Path(dest)
    for name in REQUIRED:
        if not (root / name).exists():
            errors.append(f"missing required asset: {name}")
    for name in FORBIDDEN:
        if (root / name).exists():
            errors.append(f"forbidden entry present in artifact: {name}")

    index = root / "index.html"
    if index.exists():
        checker = Checker()
        checker.feed(index.read_text(encoding="utf-8"))
        for tag, line in checker.stack:
            errors.append(f"unclosed <{tag}> opened at line {line}")
        if checker.h1 != 1:
            errors.append(f"expected exactly one <h1>, found {checker.h1}")
        for element_id, count in checker.ids.items():
            if count > 1:
                errors.append(f"duplicate id: {element_id} ({count} occurrences)")

    sitemap = root / "sitemap.xml"
    if sitemap.exists():
        try:
            ET.parse(sitemap)
        except ET.ParseError as exc:
            errors.append(f"sitemap.xml is not well-formed: {exc}")

    for message in errors:
        print(f"::error::{message}")
    print(f"{len(errors)} problem(s)")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "_site"))
```

**Caveat for the planner:** the `<h1>` count and the duplicate-`id` check are asserted against the *v2 page as written*. Run the script locally against the staged v2 before committing it — if the current markup has two `<h1>` (one per language block) or reuses an id, the check must be relaxed to a warning in this phase and tightened in Phase 11 (A11Y-01), not left to fail the first PR. Decide this from observation, not from assumption.

### Example 4: Switching the publishing source (control-plane, do this first)

```bash
# Before
gh api repos/ayhid/resume/pages --jq '{build_type, source, cname, https_enforced}'
# {"build_type":"legacy","source":{"branch":"main","path":"/"},"cname":"ayoub-hidri.dev","https_enforced":true}

gh api -X PUT repos/ayhid/resume/pages -f build_type=workflow

# After - cname and https_enforced must be unchanged
gh api repos/ayhid/resume/pages --jq '{build_type, source, cname, https_enforced}'
```

Equivalent UI path: Settings → Pages → Build and deployment → Source → GitHub Actions. The local `gh` token carries `repo` scope and the account has `admin: true` on the repo, so the API form should succeed; if it 403s, fall back to the UI. Either way this is a human-visible, out-of-git change — worth a `checkpoint:human-verify` task.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages built from a branch by the built-in Jekyll pipeline (`build_type: legacy`) | Pages deployed from an Actions artifact (`build_type: workflow`) | GA in 2022 | The repo is still on the old model despite having an Actions workflow — the core finding of this research |
| `CNAME` file binds the custom domain | Pages settings (`cname`) bind it; the file is ignored under a workflow source | With the Actions source | `.claude/CLAUDE.md`'s "deleting `CNAME` breaks the domain" becomes false after this phase |
| Workflow-level `permissions:` | Job-level `permissions:` with `permissions: {}` default | Long available, now the recommended hardening | The PR job stops carrying `pages: write` |
| `upload-artifact` v3 API | v4+ artifact API (`upload-pages-artifact@v3` and later) | early 2025 | Already on the new side; `upload-pages-artifact@v5` now wraps `upload-artifact@v7.0.1` |
| `ubuntu-20.04` / `ubuntu-22.04` runners | `ubuntu-24.04` today, `ubuntu-26.04` images already published | ongoing | Keep the jobs dependent only on bash + python3 |

**Deprecated/outdated:**
- The `pages-build-deployment` legacy workflow for this repo — it should stop appearing in `gh run list` once the source is switched. Its continued presence is the regression signal.
- `HTMLParser(strict=...)` — removed in Python 3.5.
- The `preview` input on `actions/deploy-pages` — documented as "alpha currently and not available to the public"; do not attempt PR preview deployments in this phase.

## Project Constraints (from CLAUDE.md)

| Directive | Effect on this phase |
|-----------|----------------------|
| "One HTML file, no build step, no runtime dependency" | Verification must be stdlib `python3` + shell. No `package.json`, no npm dev-dependency, no linter install. |
| "Whole-repo deploy: `upload-pages-artifact` uses `path: '.'`, so every committed file at the root is published — including `og-image.html`. Do not commit anything that should stay private." | This is the constraint the phase removes. Update this line in CLAUDE.md when the allowlist lands (documentation drift is a real deliverable here). |
| "Custom domain: `CNAME` contains `ayoub-hidri.dev` and must survive every deploy; deleting it breaks the domain." | Becomes inaccurate after switching to a workflow source — see Pitfall 5. Keep `CNAME` in the manifest per D-06, but correct the claim. |
| "Content duplication: every copy edit must be applied twice... ids, `aria-controls` and `aria-labelledby` must stay locale-suffixed and unique across the whole document." | Directly motivates the duplicate-`id` check in the verify script. |
| "No `<script src>` or framework"; "no inline `onclick`"; "hardcoded colours forbidden" | This phase commits the rewrite **as written** and does not edit it (Deferred Ideas). The verify script must not enforce design rules — those are Phases 3/4. |
| "GSD Workflow Enforcement: do not make direct repo edits outside a GSD workflow" | All edits here happen under `/gsd-execute-phase`. |
| "Never add Claude/AI attribution to commits or PRs" (user global) | The ~8 commits of this series and the D-09 PR body must carry no `Co-Authored-By: Claude` trailer and no generation footer. |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `git` (local) | Commit slicing | ✓ | 2.52.0 | — |
| `python3` (local) | Writing/testing the verify script offline | ✓ | 3.14.6 | — |
| `python3` (runner) | Verify job | ✓ | 3.10.20 / 3.11.15 / 3.12.13 / 3.13.15 / 3.14.7 preinstalled | — |
| `bash` + coreutils (runner) | Staging script | ✓ | image default | — |
| `gh` CLI (local) | Flip `build_type`, watch runs, open D-09 PR, count deployments | ✓ | 2.86.0, authenticated as `ayhid`, scopes `gist, read:org, repo, workflow` | GitHub web UI |
| Repo admin rights | Changing the Pages publishing source | ✓ | `permissions.admin: true` | Owner does it in Settings |
| `curl` (local) | Post-deploy criterion 3/4 assertions | ✓ | 8.17.0 | `gh api` |
| `jq` (runner) | Optional JSON assertions | ✓ | 1.7.1 | `python3 -m json.tool` |
| `shellcheck` (runner) | Optional lint of the staging script | ✓ | 0.9.0 | skip |
| `xmllint` (runner) | HTML/XML validation | ✗ | — | `python3` stdlib (`html.parser`, `xml.etree`) — **use this** |
| `tidy` (runner) | HTML validation | ✗ | — | same as above |
| `node`/`npm` (runner) | — | ✓ (22.23.2 / 24.19.0) | — | not used; adding an npm dependency violates a project constraint |
| `en/` directory | D-06 manifest entry | ✗ | — | D-07 optional-copy path; Phase 10 creates it |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** `xmllint`, `tidy` — replaced by `python3` stdlib parsing, which is the recommended approach regardless.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None. `.planning/codebase/TESTING.md` records no test runner, no test files, no assertions. This phase introduces the project's first automated check. |
| Config file | none — see Wave 0 |
| Quick run command | `.github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site` |
| Full suite command | the quick run, plus `gh run watch` on the pushed run, plus the live `curl` matrix below |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| OPS-03 | The rewrite is a series of readable commits and the tree is clean | structural / git | `git log --oneline origin/main..main`, `git status --porcelain` (empty), `git diff --quiet wip/v2-snapshot -- index.html README.md` | ✅ git |
| OPS-03 | Each commit is scoped to one concern | manual review | `git show --stat <sha>` per commit; reviewer reads the diff | ✅ git |
| OPS-02 | Staged artifact contains only production assets | unit | `python3 .github/scripts/verify_site.py _site` | ❌ Wave 0 |
| OPS-02 | The **published** site exposes nothing else | smoke (post-deploy) | `curl -s -o /dev/null -w '%{http_code}' https://ayoub-hidri.dev/README.md` → `404` (and `/og-image.html`, `/specs/design.md`, `/.planning/STATE.md`) | ❌ Wave 0 (script) |
| OPS-01 | A PR runs verification | integration | `gh pr checks <n>` shows `verify` completed | ✅ gh |
| OPS-01 | A PR publishes nothing | integration | `gh api repos/ayhid/resume/deployments --jq 'length'` unchanged across the PR; `gh run list --event pull_request --json jobs` shows `deploy` skipped | ✅ gh |
| OPS-04 | Merge/push to `main` publishes | integration | `gh run list --event push --limit 1` conclusion `success`; `gh api repos/ayhid/resume/pages --jq .status` → `built` | ✅ gh |
| OPS-04 | Only the Actions workflow publishes | regression | `gh run list --limit 10 --json event,name` contains **no** `pages build and deployment` / event `dynamic` run after the switch | ✅ gh |
| criterion 4 | The live page is v2, not the v1 CV | smoke | `curl -s https://ayoub-hidri.dev/ \| grep -c 'data-lang-block'` ≥ 1 **and** `grep -c 'cdn.tailwindcss.com'` = 0 | ❌ Wave 0 (script) |

The v1/v2 discriminators are verified: HEAD's `index.html` contains `<script src="https://cdn.tailwindcss.com"></script>` at line 93 and has no `data-lang-block`; the v2 working tree has `data-lang-block` at lines 120 and 551 and no Tailwind CDN tag. [VERIFIED: `git show HEAD:index.html | grep -n`, `grep -n index.html`, this session]

### Sampling Rate

- **Per task commit:** `git status --porcelain` empty and, for slice commits, `git show --stat HEAD` touches only `index.html`.
- **Per wave merge:** `.github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site` locally — the same command CI runs.
- **Phase gate:** after the single push, `gh run watch`, then the full live `curl` matrix (200s for `/`, `/robots.txt`, `/sitemap.xml`, `/og-image.png`; 404s for `/README.md`, `/og-image.html`, `/specs/design.md`, `/.planning/STATE.md`), then the D-09 PR with the deployment-count assertion, then `/gsd-verify-work`.

**Baseline to capture before any change** (so criterion 3 is provable as a before/after, not asserted):

```bash
for u in / /README.md /og-image.html /specs/design.md /CNAME /en/ /.planning/STATE.md; do
  printf '%-28s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' -L "https://ayoub-hidri.dev$u"
done
```

Measured 2026-08-19: `/` 200, `/README.md` **200**, `/og-image.html` **200**, `/specs/design.md` 404, `/CNAME` 404, `/en/` 404, `/.planning/STATE.md` 404. [VERIFIED: curl, this session]

### Wave 0 Gaps

- [ ] `.github/scripts/stage-site.sh` — the manifest (OPS-02); must be executable and locally runnable
- [ ] `.github/scripts/verify_site.py` — manifest + HTML checks (OPS-01/OPS-02)
- [ ] A post-deploy smoke script or documented `curl` matrix (criteria 3 and 4) — may live in the phase's verification notes rather than the repo, since `.github/scripts/` content does not ship
- [ ] No test framework install required — stdlib only

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Static site, no accounts. CI authenticates with the ephemeral `GITHUB_TOKEN` only. |
| V3 Session Management | no | No sessions, no cookies set by the site (Umami stays commented out until Phase 2). |
| V4 Access Control | yes | Job-level `permissions`; the `github-pages` environment branch policy (`main`, `gh-pages`) restricting which refs may deploy |
| V5 Input Validation | partial | The only untrusted input in scope is a pull request's contents, which the verify job parses but never executes. Never interpolate `${{ github.event.* }}` into a `run:` block. |
| V6 Cryptography | no (managed) | TLS terminated by GitHub Pages; `https_enforced: true`, certificate approved to 2026-09-30. Nothing to implement. |
| V14 Configuration | yes | `permissions: {}` default, least-privilege per job, no `pull_request_target`, no secrets in the PR job, artifact allowlist |

### Known Threat Patterns for GitHub Pages + Actions

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Information disclosure via whole-repo publish (`specs/`, `README.md`, `og-image.html` reachable) — **live today** | Information disclosure | The `_site/` allowlist (D-05) **plus** switching `build_type` to `workflow`; verified by the post-deploy 404 matrix |
| A pull request modifies `deploy.yml` and self-deploys | Elevation of privilege | `pull_request` gives fork PRs a read-only `GITHUB_TOKEN` and no secrets [CITED: docs.github.com events-that-trigger-workflows]; the `github-pages` environment branch policy rejects deployments from `refs/pull/N/merge`; the `if:` gate skips the deploy job |
| Script injection through `${{ github.event.pull_request.title }}` in a `run:` step | Injection / RCE on the runner | Never interpolate event data into shell; this phase's steps take no event input at all |
| Compromised third-party action | Supply chain / Tampering | All four actions are first-party `actions/`; SHA-pinning available if hardening further. No `pull_request_target`, so a compromised action in a PR run holds only a read-only token |
| Secret exfiltration from CI | Information disclosure | The workflow references no secrets; `GITHUB_TOKEN` is scoped per job |
| Live analytics token abuse | Spoofing | Out of scope here (Umami is commented out). The historic Mixpanel token in commit `0650811` remains reachable in public history — **accepted, deferred**, and unchanged by this phase. It is a real, currently-exploitable exposure: worth re-raising to the user even though it is deferred. |
| Force-push destroying published history | Tampering / repudiation | D-03 lands directly on public `main`; get boundaries right locally so no force-push is ever needed |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `deploy-pages@v5` can consume an artifact produced by `upload-pages-artifact@v5` (which wraps `upload-artifact@v7`) | Standard Stack | A failed deploy on the first push. Mitigated by the recommendation not to bump versions in this phase. |
| A2 | `gh api -X PUT repos/ayhid/resume/pages -f build_type=workflow` succeeds with the `repo` scope on an admin account | Code Example 4 | Falls back to the Settings UI — a two-click manual step, not a blocker |
| A3 | Switching `build_type` from `legacy` to `workflow` preserves the `cname` and the existing TLS certificate | Pitfall 5 | Custom-domain downtime on `ayoub-hidri.dev`. The settings already hold the cname, and the docs describe the domain as settings-resident, but the transition itself was not observed. **Assert immediately after the switch, before pushing anything.** |
| A4 | A single `git push` of N commits triggers exactly one `push`-event workflow run, at the tip commit | Pitfall 2 | Several production deploys of intermediate states. Cheap to confirm empirically with `gh run list` right after the push. |
| A5 | The v2 `index.html` has exactly one `<h1>` and no duplicate `id` | Code Example 3 | The first PR check fails on pre-existing markup rather than on the change under review. **Run the verify script locally against the staged v2 before committing it** and relax the assertion to a warning if it does not hold yet. |
| A6 | The `github-pages` environment branch policy blocks a deployment attempted from `refs/pull/N/merge` | Pitfall 3 / Security | The backstop is weaker than believed. The `if:` gate is the primary control regardless; D-09's deployment-count assertion measures the real behaviour. |
| A7 | The legacy `pages build and deployment` runs stop entirely once `build_type` is `workflow` | Pitfall 1 | A second publisher keeps racing. Directly observable in `gh run list` after the first push. |
| A8 | Committing the staging script with a non-executable mode is the likely default | Code Example 1 | `Permission denied` in CI. Trivially avoided with `bash <script>` in the `run:` line. |

## Open Questions

1. **Should the `deploy` job depend on `verify` (`needs: verify`)?**
   - What we know: D-08 specifies a split by trigger, not a chain. Chaining costs ~20 s per deploy and means a manifest regression can never publish.
   - What's unclear: whether the user wants a failing verify to block an urgent production push.
   - Recommendation: chain it. The check runs in seconds, and "the artifact was verified before it shipped" is the whole point of OPS-01/OPS-02. Surface it in the plan as an explicit choice.

2. **How strict should the HTML check be in Phase 1?**
   - What we know: tag balance and duplicate `id` are cheap, meaningful, and future-proof.
   - What's unclear: whether the v2 markup passes them today (A5). Phase 11 owns A11Y-01 (`one <h1>`).
   - Recommendation: run the script against the staged v2 during planning; ship the checks that pass, log the rest as Phase 11 input. Do not weaken the manifest check under any circumstances.

3. **Does the Pages source switch belong to Phase 1 at all, or is it a prerequisite?**
   - What we know: OPS-02 and OPS-04 are unachievable without it, and it is not in CONTEXT.md's decisions — it was not known at discuss time.
   - What's unclear: whether the user wants to perform the settings change themselves.
   - Recommendation: make it task 1 of the phase with a `checkpoint:human-verify` gate — it is an out-of-git, hard-to-reverse-by-agent change to a live public site, and every later criterion depends on it.

4. **Should `.claude/CLAUDE.md` be corrected in this phase?**
   - What we know: two of its architectural constraints ("whole-repo deploy", "deleting `CNAME` breaks the domain") become false when this phase lands.
   - What's unclear: whether documentation drift is in scope for a delivery phase.
   - Recommendation: yes — one small commit at the end of the series. Leaving a stale constraint in the file that every future agent reads is a defect with a long tail.

5. **What happens to the `gh-pages` branch policy entry?**
   - What we know: the `github-pages` environment allows deployments from `gh-pages` and `main`; no `gh-pages` branch is in active use.
   - Recommendation: leave it. Removing it is unrelated cleanup with a nonzero chance of breaking something unobserved.

## Sources

### Primary (HIGH confidence)
- `gh api repos/ayhid/resume/pages` — `build_type: legacy`, `source: {branch: main, path: /}`, `cname: ayoub-hidri.dev`, `https_enforced: true`, certificate to 2026-09-30
- `gh api repos/ayhid/resume/environments` and `.../environments/github-pages/deployment-branch-policies` — one `branch_policy` rule, custom policies `main` and `gh-pages`
- `gh run list` — 23 `dynamic` (legacy builder) runs and 19 `push` runs; zero `pull_request` runs ever
- `raw.githubusercontent.com/actions/upload-pages-artifact/main/action.yml` — inputs, tar exclusions (`--exclude=.git --exclude=.github`, dotfiles unless `include-hidden-files`), `upload-artifact@v7.0.1`
- `raw.githubusercontent.com/actions/deploy-pages/main/README.md` — required permissions, environment, dedicated-job recommendation, `preview` input alpha status
- `raw.githubusercontent.com/actions/configure-pages/main/action.yml` and `src/api-client.js` — `enablement` creates but never updates `build_type`
- `raw.githubusercontent.com/actions/starter-workflows/main/pages/static.yml` — GitHub's current known-good version combination
- `api.github.com/repos/<action>/releases/latest` — current tags for all four actions
- `raw.githubusercontent.com/actions/runner-images/main/images/ubuntu/Ubuntu2404-Readme.md` — Python/Node versions, apt package list (no `libxml2-utils`, no `tidy`)
- Local repository: `index.html` (region boundaries), `.gitignore` (`od -c` trailing bytes), `.github/workflows/deploy.yml`, `git log`, `git rev-list`, `git diff --stat`
- Live site probes via `curl` against `https://ayoub-hidri.dev/`

### Secondary (MEDIUM confidence)
- docs.github.com — "Managing a custom domain for your GitHub Pages site" (CNAME ignored under a workflow source)
- docs.github.com — "Events that trigger workflows" (`pull_request` runs from the merge commit; fork PRs get a read-only token)

### Tertiary (LOW confidence)
- None. Every claim in this document traces to a primary tool observation or an official GitHub docs page.

## Metadata

**Confidence breakdown:**
- Current repository/Pages state: HIGH — read directly from the GitHub REST API and the live site this session
- Commit-slicing mechanics: HIGH — boundaries read from the actual file; the technique uses only plumbing that exists locally
- Workflow structure: HIGH — matches the official starter and the `deploy-pages` README's own recommendation
- Action version bumps: MEDIUM — latest tags verified, but cross-version artifact compatibility is not documented anywhere reachable (hence the recommendation to defer)
- PR verification content: MEDIUM — the tooling availability is HIGH, but whether the current markup passes the assertions is unverified (A5)
- Pitfalls: HIGH — each one is grounded in an observed fact about this repo, not a general caution

**Research date:** 2026-08-19
**Valid until:** 2026-09-18 (30 days). Re-check sooner if `ubuntu-latest` migrates to 26.04 or if the Pages publishing source changes.
