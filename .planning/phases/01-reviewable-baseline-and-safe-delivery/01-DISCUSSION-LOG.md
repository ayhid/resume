# Phase 1: Reviewable Baseline and Safe Delivery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 1-Reviewable Baseline and Safe Delivery
**Areas discussed:** Commit slicing strategy, Production-asset exclusion, Repo hygiene scope

---

## Area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Commit slicing strategy | How to split a one-file 1036+/1662− rewrite into readable commits | ✓ |
| What PR verification runs | HTML validity, links, Lighthouse, or a minimum artifact check | |
| Production-asset exclusion | Keeping specs/, README.md, .planning/ out of the published artifact | ✓ |
| Repo hygiene scope | Untracked .claude/.playwright-mcp, malformed .gitignore | ✓ |

---

## Commit slicing strategy

| Option | Description | Selected |
|--------|-------------|----------|
| By concern, in dependency order | 5-7 commits: head/SEO+JSON-LD, tokens/style, FR tree, EN mirror, JS, README | ✓ |
| By page section | One commit per section, FR+EN together; mixes CSS/JS/markup each time | |
| Single rewrite commit + follow-ups | Honest big commit, then small scoped ones; arguably fails OPS-03 | |

**User's choice:** By concern, in dependency order.

| Option | Description | Selected |
|--------|-------------|----------|
| Intermediate commits may render imperfectly | Only the final commit must be correct | ✓ |
| Every commit must render correctly | Forces coarser slices | |

**User's choice:** Readability wins; intermediate inconsistency is acceptable.

| Option | Description | Selected |
|--------|-------------|----------|
| Feature branch → PR → merge | Exercises the new verify-only workflow on a real PR | |
| Commit series directly on main | Simpler; leaves criterion 2 unproven by itself | ✓ |

**User's choice:** Directly on main.
**Notes:** This raised two follow-ups. Because every push to main deploys, ordering became load-bearing — the workflow fix must be the first commit (chosen over "rewrite first", which would have published specs/ and .planning/ to the live domain in the interim). And since no PR carries the rewrite, criterion 2 is proven by one throwaway PR after the workflow change lands (chosen over inspecting deploy.yml config alone).

---

## Production-asset exclusion

| Option | Description | Selected |
|--------|-------------|----------|
| Allowlist copy into _site/ | CI copies named files; nothing leaks by default; root stays flat | ✓ |
| Denylist — delete before upload | Shorter diff; new private files ship silently until remembered | |
| Move site into site/ subdir | Clean, but breaks flat root and the open-from-disk dev loop | |

**User's choice:** Allowlist copy into `_site/`.

| Option | Description | Selected |
|--------|-------------|----------|
| index.html, CNAME, robots.txt, sitemap.xml, og-image.png | The minimum the live site needs | ✓ |
| og-image.html | Dev-only artboard | ✓ then reversed |
| en/index.html (reserved for Phase 10) | Reserve the entry now | ✓ |

**User's choice:** The five core assets plus a reserved `en/` entry; `og-image.html` excluded.
**Notes:** The og-image.html option label and its description disagreed, so it was re-asked; the user confirmed **exclude** — no stray public page at /og-image.html. Missing allowlist entries are tolerated rather than fatal, so Phase 10 can add /en/ without touching deploy.yml.

---

## Repo hygiene scope

| Option | Description | Selected |
|--------|-------------|----------|
| Fix .gitignore, ignore both | Split the malformed line; ignore settings.local.json and .playwright-mcp/ | ✓ |
| Ignore artifacts, commit .claude/ shared config | Distinguishes shared config from local machine state | |
| Leave hygiene out of this phase | Defer to backlog | |

**User's choice:** Fix .gitignore and ignore both.

| Option | Description | Selected |
|--------|-------------|----------|
| Ignore the directory, leave the file | .playwright-mcp/og-image.png stays on disk, untracked | ✓ |
| Delete .playwright-mcp/ entirely | Only one og-image.png anywhere | |

**User's choice:** Ignore the directory, leave the file.

---

## Claude's Discretion

- **PR verification content** — the area the user did not select. Scoped minimally: artifact manifest check (allowlisted files present, forbidden paths absent) plus an HTML parse of index.html. Lighthouse deferred to Phase 11.
- Exact commit boundaries and messages inside the concern-ordered series.

## Deferred Ideas

- Mixpanel token still reachable in public git history (commit `0650811`) — rotation/history rewrite out of scope.
- Link checking and Lighthouse CI in the PR job — Phase 11.
- Promoting inline styles to classes; de-duplicating the FR/EN trees — its own refactor phase.
- Branch protection on `main` — a later ops decision, given commits land directly on main here.
