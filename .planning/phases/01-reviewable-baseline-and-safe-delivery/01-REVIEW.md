---
phase: 01-reviewable-baseline-and-safe-delivery
reviewed: 2026-08-20T10:55:40Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - .github/scripts/stage-site.sh
  - .github/scripts/verify_site.py
  - .github/workflows/deploy.yml
  - .gitignore
  - index.html
  - README.md
  - .claude/CLAUDE.md
findings:
  critical: 1
  warning: 3
  info: 5
  total: 9
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-08-20T10:55:40Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

The highest-value area of this phase — the `pull_request` / `push` privilege boundary in
`deploy.yml` — is sound. I attacked it from every angle in the focus brief (job `permissions`,
the `if:` condition, `needs:`, `environment:`, `pull_request_target`, concurrency cross-cancel,
`${{ }}` interpolation into `run:`) and found no route by which a pull request reaches
`pages: write` / `id-token: write`, and no route by which a PR run cancels an in-flight
production deploy. That part of the work holds up.

The staging half of the delivery guarantee also holds: `stage-site.sh` copies exactly the D-06
manifest, fails loudly on a missing REQUIRED entry, skips `en/` silently per D-07, and is
idempotent. I ran it and confirmed `_site/` contains precisely the five manifest files.

The defect is in the *verification* half. `verify_site.py` documents itself as a "default-deny
backstop" that holds "even if a future edit to the staging script lets one through". It is not
one. It is an eight-entry, exact-name, depth-1 denylist, and I proved by construction that a
poisoned artifact containing a top-level unlisted file *and* a complete nested copy of
`.planning/` passes with `0 problem(s)` and exit 0. The leak path that turns this from theory
into production is already on the roadmap: `stage-site.sh` copies `en/` wholesale with `cp -R`,
and D-07 schedules `en/` for Phase 10.

Secondary findings: the `rm -rf "$DEST"` guard in `stage-site.sh` blocks three literal strings
and has one unreachable arm; and the `beforeprint` handler in `index.html` leaves ARIA state
desynchronised from what is on screen. Per the scope note I have raised nothing that amounts to
"this HTML could be structured better", and nothing about Action versions.

## Critical Issues

### CR-01: `verify_site.py` does not enforce the allowlist — the "default-deny backstop" is a shallow denylist

**File:** `.github/scripts/verify_site.py:26-28`, `.github/scripts/verify_site.py:114-116`
**Also:** `.github/scripts/stage-site.sh:31-38`

**Issue:**

Lines 26-28 claim: *"Default-deny backstop. None of these may ever reach the published artifact,
even if a future edit to the staging script lets one through."* The implementation at lines
114-116 is the opposite of default-deny:

```python
for name in FORBIDDEN:
    if (root / name).exists():
        errors.append("forbidden entry present in artifact: %s" % name)
```

That is a fixed list of eight exact names, compared only at the top level of `_site/`. Anything
not literally named in `FORBIDDEN`, and anything at any depth below the top level, passes.

I verified this rather than reasoning about it. Given a `_site/` staged normally, I added:

- `_site/leaked-secret.txt` (top-level, unlisted)
- `_site/en/README.md` (a `FORBIDDEN` name, one level down)
- `_site/en/.planning/` (the entire planning tree, one level down)

Result:

```
$ python3 .github/scripts/verify_site.py probe/_site
0 problem(s)
EXIT=0
```

Three concrete failure scenarios:

1. **The scheduled one (D-07 / Phase 10).** `stage-site.sh:33` runs `cp -R "$entry" "$DEST/"`
   for `en`. That copies *everything* inside `en/` — drafts, notes, a stray `og-image.html`, a
   `.DS_Store`, an editor backup. The manifest is enforced at entry granularity; the contents of
   a directory entry are never checked by either script. The moment Phase 10 lands `en/`, the
   publish-nothing-by-default guarantee stops covering the largest part of the artifact.
2. **The stated one.** A future edit to `stage-site.sh` that appends `docs`, `notes.md`, or a
   mistyped entry to `REQUIRED`/`OPTIONAL` publishes it, and `verify_site.py` reports
   `0 problem(s)` — precisely the case the docstring promises to catch.
3. **Symlinks.** `Path.exists()` follows symlinks and returns `False` for a dangling one. I
   confirmed that `_site/README.md -> /nonexistent-target` yields `0 problem(s)` / exit 0. This
   matters more than it looks, because `actions/upload-pages-artifact` tars with
   `--dereference`: a symlink inside a future `en/` pointing at `../../.planning` would be
   resolved and its contents published, while the verifier compares names only.

**Fix:** Replace the denylist with a positive subset assertion over a full walk, and reject
symlinks. The manifest is already declared at line 23; add the optional entries beside it and
assert that nothing else exists.

```python
REQUIRED = ["index.html", "CNAME", "robots.txt", "sitemap.xml", "og-image.png"]
OPTIONAL = ["en"]                      # mirrors OPTIONAL in stage-site.sh

def check_allowlist(root):
    """Default-deny for real: every path under root must be inside the manifest."""
    allowed = set(REQUIRED) | set(OPTIONAL)
    for entry in sorted(root.iterdir()):
        if entry.name not in allowed:
            errors.append("unlisted entry in artifact: %s" % entry.name)
    # Nothing in the tree may be a symlink: upload-pages-artifact dereferences,
    # so a symlink is a hole straight out of the manifest.
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            errors.append("symlink in artifact: %s -> %s"
                          % (path.relative_to(root), os.readlink(path)))
    # Belt and braces: no forbidden name anywhere in the tree, at any depth.
    for path in sorted(root.rglob("*")):
        if path.name in FORBIDDEN:
            errors.append("forbidden entry present in artifact: %s"
                          % path.relative_to(root))
```

Call it from `main()` alongside the existing REQUIRED loop, and update the comment on lines 26-28
so it describes what the code now does. Re-run the probe above: it must exit 1 with four errors.

## Warnings

### WR-01: `rm -rf "$DEST"` guard blocks three literals and has one unreachable arm

**File:** `.github/scripts/stage-site.sh:9-12`, `.github/scripts/stage-site.sh:19`

**Issue:**

```bash
DEST="${1:-_site}"
case "$DEST" in
  ""|"/"|"."|"..") echo "refusing to stage into '$DEST'" >&2; exit 2 ;;
esac
...
rm -rf "$DEST"
```

Two problems, both verified by running the guard in isolation:

- The `""` arm is **unreachable**. `${1:-_site}` substitutes the default when `$1` is unset *or
  null*, so `bash stage-site.sh ""` sets `DEST=_site` and never reaches the empty case. Dead
  code that reads as protection.
- The guard blocks three literal strings and nothing else. I confirmed `$HOME`, `./` and `../`
  are all **accepted**. (`./` and `../` happen to survive because GNU `rm` independently refuses
  paths ending in `.`/`..`, and the non-zero status trips `set -e` — but that is `rm`'s guard,
  not this script's.) An arbitrary absolute or relative path has no protection at all:
  `rm -rf "$HOME/site"` runs before a single validation check.

Failure scenario: `README.md:23` instructs a human to run this script by hand. A local rehearsal
typed as `bash .github/scripts/stage-site.sh ~/site` or `... ../site` against an existing
directory destroys it recursively and irreversibly, before the script has verified anything. CI
is unaffected (it always passes the literal `_site`), which is exactly what makes this the kind
of hazard that survives review.

Related, same fix: the script uses relative paths (`index.html`, `CNAME`, …) but never anchors
its working directory, so its behaviour depends on the caller's cwd.

**Fix:** Anchor to the repo root, require a relative destination with no traversal, and drop the
dead arm.

```bash
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

DEST="${1:-_site}"
case "$DEST" in
  /*)        echo "refusing to stage into an absolute path: '$DEST'" >&2; exit 2 ;;
  *..*)      echo "refusing to stage into a path with '..': '$DEST'" >&2; exit 2 ;;
  .|./|"")   echo "refusing to stage into '$DEST'" >&2; exit 2 ;;
esac
```

### WR-02: `beforeprint` desynchronises accordion ARIA state and is never reverted

**File:** `index.html:1045-1051`
**Related:** `index.html:103` (print stylesheet), `index.html:1010-1017` (`toggle`)

**Issue:**

```js
window.addEventListener('beforeprint', function () {
  blocks[lang].querySelectorAll('[data-cv-panel]').forEach(function (panel) {
    panel.hidden = false;
  });
});
```

There is no `afterprint` handler anywhere in the file (verified by grep), so this mutation is
permanent, and it changes only the panel — not the button that is supposed to describe it. After
any print or PDF export (`data-act="downloadPdf"`, four call sites, calls `window.print()`):

1. All eight resume panels in the active locale stay expanded on screen.
2. Every button that was collapsed still carries `aria-expanded="false"` and still renders the
   `+` glyph, while its panel is visible. A screen reader announces "collapsed" for content that
   is on screen. The project targets Lighthouse accessibility 100 (`.claude/CLAUDE.md:19`);
   a false `aria-expanded` is an axe-detectable violation.
3. The next click on such a button is a visual no-op: `toggle` computes
   `open = getAttribute('aria-expanded') !== 'true'` → `true`, sets `aria-expanded="true"` and
   `panel.hidden = false` (already false). The user must click twice to collapse a panel.

The handler is also redundant. `index.html:103` already forces the panels open for print:

```css
@media print{ [data-cv-panel]{display:block !important} }
```

`!important` on an author rule beats the UA `[hidden]{display:none}`, so the print output is
correct with the JS removed. The inactive `[data-lang-block]` stays `display:none` on the
wrapper, so the hidden locale is still excluded from the printout.

**Fix:** Delete the handler — the CSS at line 103 already does the job, correctly and without
mutating live state.

```js
  // Panels are forced open for print by the [data-cv-panel] rule in <style>;
  // no JS mutation, so on-screen state and aria-expanded never diverge.
```

If the handler must stay for a reason not visible here, pair it with an `afterprint` that
restores each panel from its controlling button's `aria-expanded`.

### WR-03: `CLAUDE.md` font constraint contradicts what `index.html` actually ships

**File:** `.claude/CLAUDE.md:19`
**Contradicted by:** `index.html:28-30`

**Issue:** This phase edited `.claude/CLAUDE.md` to correct constraints, but left this one
stating the opposite of reality:

> **Performance**: Lighthouse targets — 100 accessibility, >95 performance; fonts self-hosted
> woff2 with `font-display: swap`

`index.html` self-hosts nothing:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin">
<link href="https://fonts.googleapis.com/css2?family=Archivo:...&family=IBM+Plex+Mono:..." rel="stylesheet">
```

Three consequences, all real:

- A constraints list that a reader can disprove in ten seconds stops being used as a constraints
  list. Every other line in that block loses authority — including the content-integrity and
  `--work-blue` rules, which have no automated enforcement at all.
- It contradicts `README.md:8` ("no runtime dependency") and `.claude/CLAUDE.md:56`, which
  correctly records Google Fonts as "the only runtime third-party asset on the live page". The
  same file states both.
- Every visitor's IP is disclosed to a third party before any content renders. For a site whose
  stated target is French PMEs, that is a GDPR consideration, not just a performance one — and
  self-hosting is the documented intent anyway.

**Fix:** Pick one and make the repo consistent. Either amend the constraint to describe the
current state and log self-hosting as future work:

```markdown
- **Performance**: Lighthouse targets — 100 accessibility, >95 performance. Fonts are currently
  loaded from Google Fonts with `display=swap`; self-hosted woff2 is the target (tracked, not yet
  done) and would remove the only third-party runtime request.
```

or self-host the two families and keep the constraint as written. Do not leave a binding
constraint that the shipped artifact violates.

## Info

### IN-01: The HTML checker rejects valid HTML5 that omits optional end tags

**File:** `.github/scripts/verify_site.py:65-79`, `.github/scripts/verify_site.py:123-124`

**Issue:** The stack checker requires every non-void element to be explicitly closed. HTML5
makes `</li>`, `</p>`, `</tr>`, `</td>`, `</option>`, `</thead>`, `</tbody>` optional. I fed it
a fully valid document:

```html
<ul>
<li>one
<li>two
</ul>
<p>para one
<p>para two
<table><tr><td>cell</table>
```

It produced ten errors and exit 1, including `</ul> at line 5 closes <li> opened at line 4` and
`unclosed <p> opened at line 6` — all false, and all phrased as if the markup were broken.

This fails *closed*, so no bad artifact can ship because of it, and the current `index.html`
closes everything, so the gate is green today. Raised as Info because the direction of failure
is safe. But it is a trap: a future author writing conformant markup gets a red CI with an error
message that misdescribes their code, and the natural response to a gate that lies is to weaken
it.

**Fix:** Either treat the optional-end-tag set as auto-closing (pop the open `li`/`p`/`td`/`tr`
when a sibling or parent close arrives), or keep the strict rule and say so in the message so it
is not mistaken for a conformance error:

```python
OPTIONAL_END = {"li", "p", "tr", "td", "th", "option", "thead", "tbody", "tfoot", "dt", "dd"}
# ... in the unclosed report:
errors.append("unclosed <%s> opened at line %d (this project requires explicit "
              "end tags even where HTML5 makes them optional)" % (tag, line))
```

### IN-02: Checkout persists credentials; PR-authored scripts execute in the verify job

**File:** `.github/workflows/deploy.yml:22-23`, `.github/workflows/deploy.yml:50-51`

**Issue:** Neither `actions/checkout` step sets `persist-credentials: false`, so the job's
`GITHUB_TOKEN` is written into `.git/config`. In the deploy job that token carries `pages: write`
and the job then executes two repository scripts (`stage-site.sh`, `verify_site.py`). Those
scripts come from `main` and are trusted, and they already run inside a process holding those
permissions, so this is defence in depth rather than a live hole — hence Info.

The related observation, which is the one worth writing down: the `verify` job runs
`stage-site.sh` and `verify_site.py` **as authored by the pull request**, including from a fork.
That is inherent to `pull_request` and is safe as configured — the job holds only
`contents: read`, fork PR tokens are read-only, and no secrets are referenced anywhere in the
file. It stops being safe the moment anyone adds a secret, a cache write, or a broader
`permissions:` block to that job. The current safety is load-bearing and undocumented.

**Fix:**

```yaml
      - name: Checkout
        uses: actions/checkout@v4
        with:
          persist-credentials: false
```

and a comment on the verify job recording the invariant:

```yaml
  verify:
    name: Verify production artifact
    # Runs PR-authored scripts, including from forks. It must never be given
    # secrets, cache writes, or any permission beyond contents: read.
```

### IN-03: `/en/` is advertised by `hreflang` and the EN toggle but returns 404

**File:** `index.html:11`, `index.html:135`, `index.html:547`

**Issue:** `<link rel="alternate" hreflang="en" href="https://ayoub-hidri.dev/en/">` and the two
EN links (`<a href="/en/" data-act="setEn">`) point at a path GitHub Pages does not serve. The
click is neutralised by `PREVENT_DEFAULT` (`index.html:1029`), so with JS the toggle works; a
crawler following `hreflang`, or a visitor whose JS did not execute, gets a 404.

Recorded here only because it is already known, documented (`.claude/CLAUDE.md:276`) and
explicitly owned by Phase 10 via D-06/D-07 — not as new scope. Listing it so the 404 is not
forgotten between now and then.

**Fix:** Phase 10, when `en/` lands. No action this phase.

### IN-04: `sitemap.xml` `lastmod` is stale after the v2 rewrite

**File:** `sitemap.xml:5`

**Issue:** `<lastmod>2026-01-26</lastmod>`, but `index.html` was fully rewritten in this phase.
The page whose content changed most now tells crawlers it has not changed since January.
`verify_site.py:130-135` parses the sitemap for well-formedness only, so nothing catches this.

**Fix:** Update to the rewrite date, and consider asserting freshness in the verifier since it
already opens the file:

```xml
    <lastmod>2026-08-20</lastmod>
```

### IN-05: `[data-grid]` background overlay is permanently hidden and unreachable

**File:** `index.html:118`

**Issue:** The decorative grid overlay carries the `hidden` attribute:

```html
<div style="position:fixed;inset:0;z-index:-1;...;background-size:24px 24px" data-grid hidden></div>
```

Nothing ever removes it — `data-grid` appears exactly once in the file and is not referenced
from the IIFE (verified by grep). The element therefore never renders under any condition, and
its `style` attribute is dead weight in every byte served.

**Fix:** Either drop the `hidden` attribute if the grid is meant to show, or delete the element
and its inline style if it is not. If it is deliberately parked for a later phase, say so, since
nothing in the markup communicates that:

```html
<!-- Grille de fond : desactivee, reactivee en phase 06 (voir design.md 4). -->
```

---

## Verified clean

Recorded so the negative results are not mistaken for unexamined areas.

- **`deploy.yml` privilege boundary.** No `pull_request_target`. Top-level `permissions: {}`.
  `verify` holds `contents: read` only; `pages: write` / `id-token: write` exist solely on
  `deploy`, which is gated by `needs: verify` *and*
  `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. A `pull_request` event
  always carries `refs/pull/N/merge`, so both halves of the condition independently exclude it;
  the `environment: github-pages` declaration adds a third gate. No route found from a PR — fork
  or branch — to a write-scoped token or to a deployment.
- **Concurrency cross-cancel.** `verify` uses `verify-${{ github.workflow }}-${{ github.ref }}`
  with `cancel-in-progress: true`; PR runs and pushes to `main` land in different groups, and
  distinct PRs land in distinct groups. `deploy` uses `"pages"` with `cancel-in-progress: false`,
  which PRs never enter. A PR run cannot cancel an in-flight production deploy, and a superseded
  push cancels only its own verify job (correctly skipping its own deploy).
- **Shell / YAML injection.** No `${{ }}` interpolation appears in any `run:` block. The only
  expressions are `github.workflow` / `github.ref` in a concurrency group and a step output in
  `environment.url`, none of which reach a shell. No use of `github.head_ref`, PR title, or
  author anywhere.
- **`stage-site.sh` manifest fidelity.** Ran it: staged exactly `index.html`, `CNAME`,
  `robots.txt`, `sitemap.xml`, `og-image.png`, and reported
  `skipped  en (optional, absent)` — REQUIRED fails loudly (`exit 1`), OPTIONAL skips silently,
  per D-06/D-07. `set -euo pipefail` is set, arrays are quoted (filenames with spaces safe), and
  `rm -rf "$DEST"` before `mkdir` makes repeated invocation idempotent. It copies nothing outside
  the manifest at entry level.
- **Verifier fails on a missing or empty directory.** `verify_site.py does-not-exist` reports
  five errors and exits 1. No path found where it reports success on nothing.
- **Verifier detects genuinely malformed markup.** A document with a duplicate `id` and an
  unclosed `<section>` produced five errors and exit 1.
- **`index.html` id and ARIA integrity.** All 16 `aria-controls` targets and all
  `aria-labelledby` targets resolve to exactly one element; both skip-link targets (`#main-fr`,
  `#main-en`) exist. The verifier's duplicate-id check passes on the real artifact — locale
  suffixing held through the rewrite.
- **`data-act` wiring.** All eight values used in markup have handlers; all eight handlers are
  used in markup. No dead handlers, no silently inert controls.
- **Reverse tabnabbing.** All 16 `target="_blank"` links carry `rel="noopener"` (16/16).
- **`.gitignore` breadth.** `git ls-files -i -c --exclude-standard` returns nothing — no tracked
  file is now shadowed by an ignore rule. `.planning/ROADMAP.md` and `.claude/CLAUDE.md` are both
  still tracked; `.planning/research/.cache/` matches nothing tracked. `_site/` is correctly
  ignored. D-10 is satisfied: the concatenated `*.temp.claude/settings.local.json` line is split.
- **No hardcoded secrets.** The only placeholders (`[UMAMI_HOST]`, `[UMAMI_WEBSITE_ID]`) are
  literal text inside an HTML comment. No `eval`, no `innerHTML`, no `document.write` in the
  IIFE; `track()` is feature-detected and degrades silently.

---

_Reviewed: 2026-08-20T10:55:40Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
