# Phase 01: Reviewable Baseline and Safe Delivery - Pattern Map

**Mapped:** 2026-08-19
**Files analyzed:** 6 (2 modified config, 2 new scripts, 2 content files committed-not-authored)
**Analogs found:** 2 / 6 (this is a delivery/ops phase in a repo with one workflow and no scripts directory)

## Scope note

This phase creates the repository's **first** `.github/scripts/` directory and its **first**
automated check. For `stage-site.sh` and `verify_site.py` there is genuinely **no analog in this
codebase** — nothing else in the repo is a shell script or a Python file. Rather than inventing a
false match, §"No Analog Found" below records the *conventions* those files must respect, which is
what the planner actually needs.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `.github/workflows/deploy.yml` | config (CI) | event-driven | itself (in-place restructure) — `.github/workflows/deploy.yml` L1-38 | exact (self) |
| `.gitignore` | config | n/a | itself — `.gitignore` L1-22 | exact (self) |
| `.github/scripts/stage-site.sh` | utility (build/staging) | file-I/O | **none** | no analog |
| `.github/scripts/verify_site.py` | test (verification) | file-I/O + transform | **none** | no analog |
| `index.html` | content (committed, not authored) | n/a | `git show HEAD:index.html` (v1) + working tree (v2) | exact (self) |
| `README.md` | docs (committed, not authored) | n/a | itself | exact (self) |
| `.claude/CLAUDE.md` | docs (constraint correction) | n/a | itself | exact (self) |

## Pattern Assignments

### `.github/workflows/deploy.yml` (config, event-driven) — MODIFIED

**Analog:** itself. The existing file is the only workflow in the repo and is the shape to preserve.

**Current file, verbatim and complete** (`.github/workflows/deploy.yml` L1-38):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Conventions to preserve (copy these exactly):**

| Convention | Evidence |
|------------|----------|
| Workflow `name:` string `Deploy to GitHub Pages` | L1 — keep; `gh run list` history and the research's regression assertions key on it |
| `on:` block shape — `branches: [ main ]` inline-array style, spaces inside brackets | L3-7 |
| Two-space indent, step blocks separated by a blank line | L24-38 |
| `- name:` on every step (no bare `uses:`) | L25, 28, 31, 36 |
| Action pins at existing majors: `checkout@v4`, `configure-pages@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4` | L26, 29, 32, 38 — research §Standard Stack: do **not** bump in this phase |
| `environment: {name: github-pages, url: ${{ steps.deployment.outputs.page_url }}}` with `id: deployment` on the deploy step | L20-22 + L37 — the `url` output wiring must stay intact |
| `concurrency: group: "pages"` (quoted) / `cancel-in-progress: false` | L14-16 — move to job level, keep values |

**Two file-level defects to fix while editing** (not in CONTEXT.md, cheap and observed):
- The file has **no trailing newline** — verified: last bytes are `deploy-pages@v4` + a space, no `\n`. Rewrite with a terminating newline.
- Lines 27, 30, 35 carry **trailing whitespace** on otherwise-blank separator lines. `.claude/CLAUDE.md` §Code Style says "No trailing whitespace; file ends with a newline" — the current file violates its own project convention.

**What changes** (per RESEARCH §Code Example 1): `permissions: {}` at workflow level, per-job
`permissions`, `verify` job (both events) + `deploy` job (`if: github.event_name == 'push' && github.ref == 'refs/heads/main'`, `needs: verify`), `path: _site` instead of `path: '.'`, job-level `concurrency`.

---

### `.gitignore` (config) — MODIFIED

**Analog:** itself. Established section style, verbatim (`.gitignore` L1-22):

```gitignore
# macOS
.DS_Store
...

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Node modules (if using any build tools)
node_modules/
npm-debug.log*

# Temporary files
*.tmp
*.temp
```

**Pattern to copy:** `# Sentence-case comment header` → blank-line-separated group → patterns one per
line, directories with a trailing `/`.

**Critical, verified:** the file ends at `*.temp` with **no trailing newline** (research §Pitfall 4,
confirmed this session via `od -c`). Any `>>` append concatenates onto line 22. The fix is a full
rewrite of the file with a terminating newline, not an append. New groups follow the same style:

```gitignore
# Local agent + tool state
.claude/settings.local.json
.playwright-mcp/

# CI staging output
_site/
```

---

### `index.html` / `README.md` (content) — COMMITTED, NOT AUTHORED

**No pattern to copy — this phase must not edit these files.** The v2 rewrite already exists in the
working tree; the phase slices it into commits and must reproduce it byte-for-byte
(`git diff --quiet wip/v2-snapshot -- index.html README.md`).

**Commit message convention** (analog: `git log`, last 10 commits):

```
docs(phase-1): add validation strategy
docs(01): research phase domain
docs(state): record phase 1 context session
docs: create roadmap (11 phases)
chore: add project config
```

Conventional Commits, lowercase, no trailing period, optional scope in parentheses (scope is either a
concern word or a zero-padded phase number). Follow this for the ~8 slice commits. Per the user's
global instruction: **no `Co-Authored-By: Claude` trailer, no generation footer** — and `git log`
confirms no existing commit carries one.

---

## Shared Patterns

### Constraint: no build step, no runtime dependency
**Source:** `.claude/CLAUDE.md` §Constraints, §Technology Stack ("There is no `package.json`,
`requirements.txt`, `Cargo.toml`, `go.mod`, or `pyproject.toml`")
**Apply to:** both new scripts, and the workflow
The verify step must be `python3` **stdlib only**; the staging step must be `bash` + coreutils only.
No `package.json`, no `pip install`, no `setup-python`/`setup-node` action. Introducing a dependency
here contradicts the constraint the site itself is a credibility signal for.

### Convention: flat root, files served as-is
**Source:** `.claude/CLAUDE.md` §Naming Patterns ("Lowercase, hyphenated, at repo root… No
directories for source")
**Apply to:** `stage-site.sh`, `verify_site.py`
Filenames stay lowercase; `stage-site.sh` is hyphenated per the site-asset convention, and
`verify_site.py` uses an underscore per Python module convention (both appear in RESEARCH §Recommended
Project Structure and should be used as written — do not "harmonise" them).

### Convention: comment the *why*, not the *what*
**Source:** `.claude/CLAUDE.md` §Comments; live example `index.html:71-77` (the Umami block)
**Apply to:** both new scripts
The staging script's header comment should state *why* it is an allowlist ("Anything not listed here
is never published"), not narrate the `cp`. RESEARCH §Code Example 2 and 3 already model this.

### Convention: degrade silently on optional/absent things
**Source:** `index.html:994-997` (`track()` calls `window.umami.track` only when it exists),
`index.html:1013` (missing `aria-controls` target is skipped, not thrown), `index.html:1039`
(unknown `data-act` returns silently)
**Apply to:** `stage-site.sh` optional-entry loop (D-07: copy `en/` if present, skip otherwise)
The repo already has a house style of feature-detect-then-skip for optional things while failing hard
on required ones. The `REQUIRED` / `OPTIONAL` split in RESEARCH §Code Example 2 is the same shape.

### Convention: locale-suffixed, document-unique ids
**Source:** `.claude/CLAUDE.md` §Anti-Patterns "Editing one language block only"; `index.html:120`
(`fr`) / `index.html:551` (`en`)
**Apply to:** the duplicate-`id` assertion in `verify_site.py`
This is the codebase convention the check exists to defend.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.github/scripts/stage-site.sh` | utility (staging) | file-I/O | The repo contains **zero** shell scripts. `.github/` holds only `workflows/deploy.yml`; there is no `scripts/` directory. No shell style precedent exists. |
| `.github/scripts/verify_site.py` | test (verification) | file-I/O + transform | The repo contains **zero** Python files and **zero** tests (`.planning/codebase/TESTING.md`: no runner, no test files, no assertions). This is the project's first automated check. |

**Planner guidance for these two:** use RESEARCH.md §Code Example 2 and §Code Example 3 verbatim as
the starting point — they are already written against this repo's actual manifest and constraints —
subject to the shared patterns above and these two observations:

1. **`set -euo pipefail` + a `DEST` guard** (RESEARCH §Code Example 2) is the safety idiom to adopt;
   there is nothing in-repo to copy it from.
2. **The `<h1>` assertion will fail as written.** Verified this session: `grep -c '<h1' index.html`
   on the v2 working tree returns **2** — one `<h1>` per `[data-lang-block]`, which is correct for
   this page's architecture (the EN block is `hidden`). RESEARCH §Assumption A5 flagged this; it is
   now **confirmed false**. The check must either be scoped per-language-block or downgraded to a
   warning, and A11Y-01 (Phase 11) inherits the decision.
   Verified good news: `grep -o 'id="[^"]*"' index.html | sort | uniq -d` returns **nothing** — the
   duplicate-`id` check passes on the v2 markup today and can ship as a hard failure.

## Metadata

**Analog search scope:** repo root (flat), `.github/`, `.github/workflows/`, `git log`, `.claude/CLAUDE.md`
**Files scanned:** `.github/workflows/deploy.yml`, `.gitignore`, `index.html` (targeted greps), `git log -20`, root listing
**Pattern extraction date:** 2026-08-19
