---
phase: 01
slug: reviewable-baseline-and-safe-delivery
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
block_on: high
register_authored_at_plan_time: true
created: 2026-08-20
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Register source: `<threat_model>` blocks in all six PLAN files — 23 entries across 19 IDs.
Plans `01-06` reused four IDs (`T-01-12`, `T-01-14`, `T-01-15`, `T-01-16`) for subjects different
from `01-03`/`01-04`; they are disambiguated below with `a`/`b` suffixes and are distinct threats.

Verified by `gsd-security-auditor` against the implementation, the live site and the GitHub API —
not against SUMMARY claims. Three entries were re-tested rather than confirmed, because the code
review at `01-REVIEW.md` contradicted their claimed mitigations.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| repository content → public web | Every byte inside the uploaded artifact is world-readable at `ayoub-hidri.dev`. This is the boundary the phase exists to narrow. | Published site assets; anything mis-staged becomes public |
| pull request (possibly from a fork) → Actions runner | Untrusted branch content is checked out and staged by the verify job. It is read and copied, never executed. | Untrusted markup, filenames, symlinks |
| Actions job → Pages control plane | `pages: write` plus `id-token: write` mint a deployment. Only the deploy job may cross this boundary. | Deployment artifact, OIDC token |
| local developer → public `main` | A push is immediately a production publish; there is no staging environment between them. | Commits, and by extension the live page |
| developer workstation → staging script argument | **Undeclared by every plan in this phase.** `stage-site.sh` takes a destination path and deletes it. The omission of this boundary is why UF-01 was never assessed. | An arbitrary local filesystem path |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-01 | Information disclosure | Pages publishing source + artifact contents | critical | mitigate | `build_type: workflow`; `deploy.yml:64-67` uploads `_site`, not `.`. Live: `/README.md`, `/og-image.html`, `/specs/design.md`, `/.planning/STATE.md` → 404 while all four exist on `origin/main`; the five manifest paths → 200 | closed |
| T-01-02 | Elevation of privilege | `deploy` job reachable from a pull request | high | mitigate | `deploy.yml:37` gates on `github.event_name == 'push' && github.ref == 'refs/heads/main'`; environment branch policy live-confirmed as `{main, gh-pages}`; PR #2 probe measured in `01-05` | closed |
| T-01-03 | Information disclosure | `GITHUB_TOKEN` scope on pull-request runs | high | mitigate | `deploy.yml:10` `permissions: {}`; `:16-17` `contents: read` on verify; `:39-42` `pages: write` + `id-token: write` on deploy only | closed |
| T-01-04 | Injection | `run:` steps in either job | medium | mitigate | Zero `${{ }}` inside any `run:` block; `deploy.yml:26,29,59,62` are fixed-string invocations of committed scripts | closed |
| T-01-05 | Denial of service | `pages` concurrency lane shared by PRs and deploys | low | mitigate | `deploy.yml:18-20` ref-keyed cancellable verify group; `:46-48` `"pages"` with `cancel-in-progress: false` | closed |
| T-01-07 | Spoofing / DoS | custom domain binding during the source switch | medium | mitigate | Live API: `cname: ayoub-hidri.dev`, `https_enforced: true`, `status: built` | closed |
| T-01-08 | Information disclosure | Mixpanel project token in plain text at commit `0650811`, live in public history | high | **accept** | Developer-confirmed deferral, recorded in `01-CONTEXT.md:94` §Deferred Ideas and `.planning/STATE.md` §Blockers/Concerns. See Accepted Risks Log | closed (accepted) |
| T-01-09 | Information disclosure | `_site/` contents at publish time | high | mitigate | `check_manifest` (`verify_site.py:127-142`) + `check_tree` (`:145-167`), called at `:178-179`, ran and succeeded in **both** jobs of run `32382541400`. Reproduced: `notes.txt` → `unlisted entry`; `en/.planning/STATE.md` → `forbidden entry`; `en/leak -> ../../.planning` → `symlink in artifact`; exit 1 | closed — **scope narrowed**, see note 2 |
| T-01-10 | Tampering | parsing untrusted markup on the runner | low | mitigate | Imports exactly `sys, pathlib, collections, html.parser, xml.etree.ElementTree`; grep for `subprocess\|os.system\|eval(\|exec(\|shell=True` → 0 | closed |
| T-01-11 | Information disclosure | local agent state committed by accident | medium | mitigate | `.gitignore:28,29,31,35`, confirmed by `git check-ignore -v`; `git ls-files` matches → 0; `.github`/`.claude`/`.playwright-mcp` also in `FORBIDDEN` (`verify_site.py:46-47`) | closed |
| T-01-12a | DoS (loss of work) | uncommitted rewrite during reconstruction (plan 01-03) | high | mitigate | Snapshot commit `0f652f8` still reachable; all six slice commits on `origin/main` | closed |
| T-01-12b | Information disclosure | a symlink inside the staged tree (plan 01-06) | high | mitigate | `verify_site.py:163-165` `path.is_symlink()` over `rglob("*")`, rejecting by name via `readlink()`. `is_symlink()` not `exists()` — the latter returns `False` for a dangling link while `upload-pages-artifact` tars with `--dereference`. Reproduced end-to-end | closed |
| T-01-13 | Tampering | silent drift between the reconstruction and what the developer wrote | high | mitigate | Assertion **re-run** against the still-reachable snapshot: `git diff --quiet 0f652f8 HEAD -- index.html` → identical. `README.md` differs by +3 lines, attributable to a later authorised commit `9af8c71`, post-dating the assertion | closed |
| T-01-14a | Repudiation | force-push to a public deployed branch (plans 01-03/01-04) | medium | mitigate | `git reflog show main \| grep -ci forced-update` → 0; `git rev-list --left-right --count origin/main...main` clean at audit time | closed |
| T-01-14b | Tampering | `en/` contents arriving in Phase 10 (plan 01-06) | medium | mitigate | **Declared mitigation contradicts the code.** The plan names four artifacts it claims are caught; two — `.DS_Store` and editor backups — are not in `FORBIDDEN` (`verify_site.py:46-47`) and nothing else matches them | **open — below `high` threshold (non-blocking)** |
| T-01-15a | Information disclosure | `specs/` and `.planning/` riding the first push to origin | high | mitigate | Both on `origin/main`, both 404 live | closed |
| T-01-15b | Denial of service | the deploy pipeline itself, if a stricter checker is red on arrival | medium | mitigate | Run `32382541400` `success`; `Verify artifact contents` succeeded in both jobs; `deploy.yml:33` `needs: verify` keeps the failure mode fail-closed | closed |
| T-01-16a | Denial of service | serving a half-rewritten page to real visitors | high | mitigate | **No deployment exists at any of the six intermediate slice shas** — history jumps from pre-rewrite straight to `a6e32d2`. Live page sha256 `cec4a983…` == committed `index.html` | closed |
| T-01-16b | Repudiation | a false safety claim in shipped code | medium | mitigate | **Relocated, not closed.** Both negative greps pass and the old claim is gone, but the replacement at `verify_site.py:42-45` ends "the strongest assertion available without knowing the contents" — false by demonstration | **open — below `high` threshold (non-blocking)** |
| T-01-17 | Spoofing | custom domain or certificate lost across the largest push | medium | mitigate | `cname` + `https_enforced: true` + `status: built`; `/` → 200 over HTTPS | closed |
| T-01-18 | Tampering | a second publisher racing the Actions deployment | high | mitigate | Newest `event: dynamic` run is `2025-09-04T11:18:40Z`, predating the phase; no legacy-builder run since the switch. *Caveat: `01-06` recorded this baseline as `2026-01-27T11:29:22Z`; the API returns a different value. The assertion's substance holds, the recorded baseline does not* | closed |
| T-01-19 | Elevation of privilege | `pull_request_target` used in place of `pull_request` | high | mitigate | `grep -c pull_request_target` → 0; triggers are `push` + `pull_request` (`deploy.yml:3-7`) | closed |
| T-01-SC | Tampering (supply chain) | `actions/checkout@v4`, `configure-pages@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4` | medium | mitigate | Audit at `01-RESEARCH.md:129-143`, four rows, all verdict OK, no `[ASSUMED]`/`[SUS]`/`[SLOP]`; no package manifest tracked | closed — **scope narrowed**, see note 4 |
| T-01-20 | Denial of service / destruction of local data | `rm -rf "$DEST"` at `stage-site.sh:19` behind the four-literal guard at `:10-12` | medium | mitigate | **Newly registered from UF-01 — no mitigation implemented yet.** See Unregistered Flags | **open — below `high` threshold (non-blocking)** |

*Status: open · closed · open — below `high` threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `block_on: high` count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Audit Notes

**1. T-01-08 — the deferral is real; the token must be presumed live.**
Documented in both declared locations: `01-CONTEXT.md:94` and `.planning/STATE.md` §Blockers/Concerns.
The repository is public (`gh api` → `visibility: public`), `0650811` is an ancestor of `origin/main`,
and no rotation evidence exists anywhere in the repo or state. The auditor did not query Mixpanel to
confirm — doing so would send the credential to a third party.

**2. T-01-09 — the mitigation covers a named subset, not the registered component.**
All three declared mechanisms are present and were demonstrated working. But the registered component
is "`_site/` contents at publish time" — all of it — while the implemented rule is a positive allowlist
**at depth 1 only**, an 8-name denylist at any depth, and a blanket symlink refusal. `en/` is a
top-level entry the allowlist permits, and `stage-site.sh:31-38` copies it wholesale with `cp -R`.
Reproduced:

```
$ printf 'AWS_KEY=AKIAtest\n' > _site/en/.env
$ printf 'draft' > _site/en/notes.bak ; : > _site/en/.DS_Store
$ python3 .github/scripts/verify_site.py _site
0 problem(s)        exit=0
```

This residual is **re-homed to T-01-14b rather than double-counted** against T-01-09, because the
register already carries an entry for exactly that surface at medium with "full enumeration is
deferred to Phase 10" written into its mitigation. What tips T-01-14b to open is narrower and not a
judgement call: its mitigation plan names four artifacts it claims are caught, and two are not.

**3. T-01-16b — deleting one false claim and writing a second does not close a repudiation threat.**
The registered harm is that "a Phase 10 author reading it has no reason to re-open the guard." The new
sentence sits at the same lines, describes the same guard, and tells the same author the guard is
already maximal. A no-dotfiles rule needs zero filenames and would have rejected the `en/.env` above.
The acceptance criteria asserted only that the *old* wording was gone; nothing asserted the *new*
wording was true.

**4. T-01-SC — documented residual, not an undeclared one.**
The mitigation's rationale ("a compromised action on a pull-request run holds only a read-only token")
is true of the verify job. It does not cover the deploy job, which runs the same four mutable
`@v4`/`@v3` tags while holding `pages: write` + `id-token: write`. `01-RESEARCH.md:143` concedes this
in writing, so it is a documented residual and closes at medium with the caveat on record.

---

## Unregistered Flags

| Flag | Description | Disposition |
|------|-------------|-------------|
| **UF-01** | `rm -rf "$DEST"` at `stage-site.sh:19`. The script is a phase-01 artifact (plan 01-01 Task 3), so **this phase introduced it**. `~`, `$HOME`, `.planning`, `src` and any absolute path all pass the four-literal guard; `README.md:22` instructs the reader to type that argument routinely, and that line was added by `9af8c71` **in this phase**; the delete at `:19` runs **before** the REQUIRED validation at `:22-29`, so a run from the wrong cwd destroys the destination and only then exits 1. Root cause is upstream: no threat model declares a "developer workstation → script argument" boundary | **Registered as T-01-20**, medium, mitigate |
| **UF-02** | `persist-credentials` at default `true` on both `actions/checkout` steps. The `deploy.yml:51` checkout runs in the job holding `pages: write` + `id-token: write` and writes that token into `.git/config`, where `stage-site.sh` and `verify_site.py` inherit it though neither uses git. T-01-03 covers grant scope only, not post-checkout token residency | Tracked; no registered threat covers it |
| **UF-03** | The Mixpanel token literal was re-committed verbatim into `01-REVIEW.md:671` by `c2ce26e` while reporting the exposure. Caught before it reached `origin` | **Resolved 2026-08-20.** The literal was replaced with `[REDACTED — see commit 0650811]` and the three unpushed commits were rewritten, so it appears in no commit destined for `origin`. Verified: the literal is absent from every commit in `origin/main..main` and from the `origin/main` tree |

**Explicitly not weighed** — named so the omission is not silent. `01-REVIEW.md` CR-01 (eight
`[CHIFFRE_A_VALIDER]` / `[MENTION_FINANCEMENT_A_VALIDER]` placeholders live on the production page)
and CR-02 (a zero-byte artifact passes the gate green). Neither maps to a registered threat: CR-01 is
content integrity, already tracked in `.planning/STATE.md` as the `[Phase 8] PROOF-04` blocker, and
CR-02 is a delivery-gate completeness gap rather than a STRIDE entry.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01 | T-01-08 | Mixpanel project token in plain text at commit `0650811`, reachable in the public repository's history. A project token is a client-side ingest credential — not a secret in the usual sense — but it authorises anyone holding it to write events and session recordings into the project, poisoning the analytics the repositioning is measured by. **Mixpanel is obsolete for this site**; Umami is the analytics path, so the project has no remaining purpose and archiving or deleting it costs nothing and voids the token. This phase neither introduced nor removed the exposure. Remediation is a console action, not a code change; history rewriting is not warranted for a public client-side token. Re-raise at milestone close | Developer (recorded in `01-CONTEXT.md:94` §Deferred Ideas and `.planning/STATE.md` §Blockers/Concerns) | 2026-08-20 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-20 | 24 | 21 | 3 (all medium, below `block_on: high`) | `gsd-security-auditor` (ASVS L1, `block_on: high`) |

Totals count the 23 plan-time register entries plus `T-01-20`, newly registered from UF-01.
`threats_open: 0` counts only open threats at or above the `high` blocking threshold.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed — three open threats, all medium, all below the `high` blocking threshold
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-20

**Carried into the next phase.** Closing T-01-14b and T-01-16b is one edit to
`.github/scripts/verify_site.py` — a dotfile rule inside `check_tree`, plus an honest final sentence
at `:42-45`. That edit also closes the `en/.env` case in note 2. T-01-20 should be mitigated before
any phase plans further work against `stage-site.sh`.
