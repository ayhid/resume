---
phase: 01-reviewable-baseline-and-safe-delivery
reviewed: 2026-08-20T17:05:00Z
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
  critical: 3
  warning: 7
  info: 8
  total: 18
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-08-20T17:05:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

This review replaces the 2026-08-20T10:55Z review of the same phase, taken after plan 01-06
hardened `verify_site.py`.

**Previously reported, now fixed — CR-01 (symlink / shallow-denylist hazard).** `verify_site.py`
no longer compares eight names at depth 1. `check_manifest` is now a genuine positive allowlist
over `root.iterdir()`, and `check_tree` walks `rglob("*")` rejecting every symlink by
`is_symlink()` and every forbidden basename at any depth. I re-ran the original exploit end to
end: `en/leak.txt -> ../../../../etc/passwd` staged through `cp -R` and the checker failed with
`::error::symlink in artifact: en/leak.txt -> ../../../../etc/passwd`, exit 1. A top-level
unlisted file now fails as `unlisted entry in artifact`. That finding is closed and is not
re-reported below.

**What I found instead is worse and is not in the CI code at all: the page itself shipped with
eight unreplaced content placeholders.** `index.html` renders `[CHIFFRE_A_VALIDER]` as the
headline result figure of all three case-study cards in both locales, and
`[MENTION_FINANCEMENT_A_VALIDER]` as the financing line of the AI offer. `origin/main` already
carries this file, `deploy.yml` publishes `index.html` verbatim, and neither `stage-site.sh` nor
`verify_site.py` looks at page text — so the production site currently reads
"Résultat / [CHIFFRE_A_VALIDER] / de temps récupéré sur la clôture mensuelle." The phase built a
gate that proves the *right files* arrived and never asked whether the file was *finished*.

That gap generalises. I proved by construction that a `_site/` containing a **zero-byte
`index.html`, a zero-byte `og-image.png`, a zero-byte `CNAME` and a zero-byte `robots.txt`**
passes with `0 problem(s)` and exit 0 — a blank homepage deploys green. And a `_site/en/.env`
holding `AWS_KEY=…` also passes green, because the `en/` subtree is deliberately unenumerated;
the comment at `verify_site.py:42-45` calling the basename check "the strongest assertion
available without knowing the contents" is not accurate — a no-dotfiles rule and an extension
allowlist are both available without knowing a single filename.

The staging script's `rm -rf "$DEST"` guard was raised as WR-01 in the previous round and is
unchanged. I re-tested it: `./` and `../` are refused by `rm` itself, so the reachable hazard is
narrower than "any string" — but it is still an unbounded recursive delete of an arbitrary
absolute path, reachable by a single mistyped argument to a command the README tells you to
type. It is classified Critical here under the data-loss rule rather than left at Warning.

The privilege boundary in `deploy.yml` continues to hold; I did not find a route by which a pull
request reaches `pages: write` / `id-token: write`. Two hardening gaps remain there (mutable
action tags, `persist-credentials` at its default).

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Eight unreplaced content placeholders are live on the production page

**File:** `index.html:219`, `index.html:247`, `index.html:269`, `index.html:291`,
`index.html:649`, `index.html:677`, `index.html:699`, `index.html:721`

**Issue:**

These are not comments and not attributes. They are visible page text inside `<p>` elements
inside the rendered content tree of both language blocks:

```
219:  <p>[MENTION_FINANCEMENT_A_VALIDER]</p>          (FR, AI offer, financing line)
247:  <p>[CHIFFRE_A_VALIDER]</p>                      (FR, case card 1, "Résultat")
269:  <p>[CHIFFRE_A_VALIDER]</p>                      (FR, case card 2)
291:  <p>[CHIFFRE_A_VALIDER]</p>                      (FR, case card 3)
649,677,699,721: the same four in the EN block
```

Each `[CHIFFRE_A_VALIDER]` carries `font-weight:800;font-size:clamp(28px,2.6vw,32px)` — it is
the largest, boldest element in its card, and it is followed by a caption that turns it into a
broken sentence:

```
Résultat
[CHIFFRE_A_VALIDER]
de temps récupéré sur la clôture mensuelle.
```

`git log origin/main` confirms the rewritten `index.html` is already on `main`, and
`deploy.yml` publishes it byte-for-byte on push, so this is on the live site now, not pending.
It is also the precise failure the CLAUDE.md content-integrity constraint exists to prevent:
the placeholders were written *because* the figures are unverified, and then published anyway.
The delivery gate this phase built cannot see it — `verify_site.py` checks tag balance, ids,
`<h1>` distribution and the file manifest, never page text.

**Fix (two parts — remove the text, then close the hole that let it through):**

1. In `index.html`, either supply verified figures or delete the placeholder paragraph and its
   dependent caption in all eight places. A card with no "Résultat" block is honest; a card
   whose result is `[CHIFFRE_A_VALIDER]` is not.
2. Make the gate refuse to publish an unfinished page. Add to `verify_site.py`:

```python
import re

# Authoring placeholders must never reach production. Deployment-time
# placeholders ([UMAMI_HOST], [UMAMI_WEBSITE_ID]) live inside an HTML comment
# and are matched by name so the check does not fire on them.
PLACEHOLDER = re.compile(r"\[[A-Z][A-Z0-9_]{3,}\]")
DEPLOY_TIME = {"[UMAMI_HOST]", "[UMAMI_WEBSITE_ID]"}


class Checker(HTMLParser):
    ...
    def handle_data(self, data):
        for hit in PLACEHOLDER.findall(data):
            if hit not in DEPLOY_TIME:
                errors.append("unreplaced placeholder in page text: %s at line %d"
                              % (hit, self.getpos()[0]))
```

`handle_data` is not called for comment content, so the Umami block at `index.html:71-77`
is untouched by this check even without the `DEPLOY_TIME` set; the set is belt-and-braces for
the day that snippet is uncommented.

---

### CR-02: The gate green-lights a completely empty artifact

**File:** `.github/scripts/verify_site.py:127-142`, `.github/scripts/verify_site.py:181-198`

**Issue:**

`check_manifest` asserts `(root / name).exists()`. Nothing asserts that any required asset has
content. Reproduced against the committed checker:

```
$ : > _site/index.html ; : > _site/og-image.png ; : > _site/CNAME ; : > _site/robots.txt
$ printf '<?xml version="1.0"?><urlset xmlns="…"/>' > _site/sitemap.xml
$ python3 .github/scripts/verify_site.py _site
::warning::heading structure: 0 <h1> total, 0 [data-lang-block] element(s) … Reported only …
0 problem(s)
$ echo $?
0
```

A blank homepage, a zero-byte social card, an empty `CNAME` and an empty `robots.txt` all deploy
green. The `<h1>` observation that would have caught it is a `::warning::` by design
(`check_headings`, deliberately non-failing until Phase 11), so the one signal present is
explicitly muted.

This is the most common real-world artifact failure — a truncated copy, a bad merge, a
half-written file — and it is exactly what a delivery gate is for. Note the gate *does* catch a
mid-document truncation (unclosed tags), so the hole is specifically the empty and the
content-free document.

**Fix:** assert a floor on size and a marker on content, next to the existence check:

```python
# Non-empty is not a style preference: an empty index.html publishes a blank
# homepage and every other check in this file passes over it in silence.
MIN_BYTES = {"index.html": 2048, "og-image.png": 1024,
             "CNAME": 5, "robots.txt": 10, "sitemap.xml": 100}

for name in REQUIRED:
    path = root / name
    if not path.exists():
        errors.append("missing required asset: %s" % name)
        continue
    size = path.stat().st_size
    floor = MIN_BYTES.get(name, 1)
    if size < floor:
        errors.append("required asset is too small to be real: %s (%d bytes, expected >= %d)"
                      % (name, size, floor))

if (root / "og-image.png").exists():
    with open(root / "og-image.png", "rb") as handle:
        if handle.read(8) != b"\x89PNG\r\n\x1a\n":
            errors.append("og-image.png is not a PNG")
```

And in `main`, once `index.html` is parsed, require the document to contain at least one
`[data-lang-block]` and at least one `<h1>` as *errors* — those two assertions do not depend on
the Phase 11 decision about how many `<h1>` are correct, only that the document is not vacuous.

---

### CR-03: `rm -rf "$DEST"` deletes an arbitrary path behind a four-literal guard

**File:** `.github/scripts/stage-site.sh:9-20`

**Issue:** (raised as WR-01 in the previous round, unchanged, re-classified)

```bash
DEST="${1:-_site}"
case "$DEST" in
  ""|"/"|"."|"..") echo "refusing to stage into '$DEST'" >&2; exit 2 ;;
esac
...
rm -rf "$DEST"
```

The guard matches four exact strings. I tested the near-misses: `./` and `../` are in fact
refused, but by `rm` itself ("`.` and `..` may not be removed"), not by this script — the guard
contributes nothing there. What the guard does not cover is every other spelling of a directory
someone cares about. `bash .github/scripts/stage-site.sh ~` recursively deletes the user's home
directory. `bash .github/scripts/stage-site.sh .planning` deletes the planning tree that this
very workflow depends on. The delete also runs *before* the REQUIRED assets are validated, so a
run from the wrong directory destroys the destination and only then exits 1.

The argument is not hypothetical input: `README.md:22` instructs the reader to invoke this
script with an explicit destination argument, so the hazardous parameter is typed by hand on a
routine basis. The author already recognised the risk — the guard exists — and under-implemented
it, which is worse than no guard because it reads as protection.

**Fix:** stop deleting arbitrary paths. Only remove a directory this script created, identified
by a marker it drops:

```bash
DEST="${1:-_site}"
case "$DEST" in
  ""|"/"|"."|".."|"./"|"../"|"$HOME"|"$HOME/") echo "refusing to stage into '$DEST'" >&2; exit 2 ;;
  /*) echo "refusing an absolute staging destination: '$DEST'" >&2; exit 2 ;;
  *..*) echo "refusing a staging destination containing '..': '$DEST'" >&2; exit 2 ;;
esac

# Only ever delete a directory this script made. The marker is the proof:
# without it, DEST belongs to someone else and rm -rf is not ours to run.
if [ -e "$DEST" ]; then
  if [ ! -f "$DEST/.staged-by-stage-site" ]; then
    echo "refusing to delete '$DEST': not created by this script" >&2
    exit 2
  fi
  rm -rf "$DEST"
fi
mkdir -p "$DEST"
touch "$DEST/.staged-by-stage-site"
```

If the marker file is used, add `.staged-by-stage-site` to the `check_manifest` allowlist in
`verify_site.py`, or `rm` it as the script's last line so the artifact stays clean — the second
is preferable, since it keeps the two manifests identical.

## Warnings

### WR-01: The `en/` subtree is unenumerated, so `en/.env` publishes green

**File:** `.github/scripts/verify_site.py:42-45`, `.github/scripts/stage-site.sh:31-38`

**Issue:**

The comment states:

> The contents of `en/` are deliberately not enumerated against an allowlist. Phase 10 authors
> them and they do not exist yet, so inside an allowed directory the rule is the
> basename-and-symlink check rather than a full allowlist -- the strongest assertion available
> without knowing the contents.

The last clause is false, and the cost of it being false is a published secret. Reproduced:

```
$ printf 'AWS_KEY=AKIAtest\n' > _site/en/.env
$ printf 'draft' > _site/en/notes.bak
$ python3 .github/scripts/verify_site.py _site
0 problem(s)        # exit 0
```

`stage-site.sh` copies `en/` wholesale with `cp -R`, so anything a future author leaves in that
directory — a dotfile, an editor backup, a scratch note — reaches
`https://ayoub-hidri.dev/en/.env` with the gate reporting success. Two assertions that require
no knowledge of the filenames are available right now: reject dotfiles, and allow only the
extensions a static site serves.

This is latent only because `en/` does not exist yet. **It becomes Critical the moment Phase 10
lands**, and the fix is cheaper to make now than to remember then.

**Fix:**

```python
# Inside an allowed directory the filenames are unknown, but the *shape* of a
# publishable file is not. Dotfiles and editor debris are never page assets.
PUBLISHABLE_SUFFIXES = {".html", ".css", ".js", ".png", ".jpg", ".jpeg",
                        ".svg", ".webp", ".woff2", ".xml", ".txt", ".json"}

def check_tree(root):
    ...
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root)
        ...
        if path.name.startswith("."):
            errors.append("dotfile in artifact: %s" % relative)
        if path.is_file() and relative.parent != pathlib.Path("."):
            if path.suffix.lower() not in PUBLISHABLE_SUFFIXES:
                errors.append("non-publishable file type in artifact: %s" % relative)
```

Also correct the comment: the rule is a *shape* check, not "the strongest assertion available".

---

### WR-02: `/en/` is advertised to crawlers and users but does not exist, and the gate permits it

**File:** `index.html:11`, `index.html:135`, `index.html:547`,
`.github/scripts/stage-site.sh:17`, `.github/scripts/verify_site.py:27`

**Issue:**

`index.html:11` declares `<link rel="alternate" hreflang="en" href="https://ayoub-hidri.dev/en/">`
unconditionally, and the language toggles at `index.html:135` and `547` are
`<a href="/en/" data-act="setEn">`. `en/` is `OPTIONAL` in both manifests and is absent, so the
advertised URL is a GitHub Pages 404.

Two concrete consequences, not just an SEO abstraction:

- Search engines follow `hreflang` directly. A 404 alternate is a live indexing defect.
- `PREVENT_DEFAULT` (`index.html:1029`) suppresses navigation on the delegated **`click`**
  handler only. A middle-click fires `auxclick`, not `click`, so the delegated listener never
  runs and the browser navigates to `/en/` for real. Middle-clicking the EN toggle lands on the
  404 today.

The phase's own gate is the right place to catch this, and it currently cannot: `en/` optional
in `verify_site.py:27` means "absent is fine", with no cross-check against what the page claims.

**Fix:** make the two facts consistent by assertion rather than by memory. In `verify_site.py`,
record `<link rel="alternate" hreflang=…>` targets in `Checker.handle_starttag`, then:

```python
# The page's own hreflang is the contract. If it advertises /en/, the artifact
# owes the world an en/index.html; publishing the claim without the file is a
# 404 with our name on it.
if "en" in checker.hreflangs and not (root / "en" / "index.html").exists():
    errors.append("index.html advertises hreflang=en -> /en/ but the artifact has no en/index.html")
```

Until `en/` ships, the alternative is to remove `index.html:11` and point the toggles at
`/?lang=en` (which works today) instead of `/en/`.

---

### WR-03: `beforeprint` permanently desynchronises accordion ARIA state, and is redundant

**File:** `index.html:1046-1050`, `index.html:101-105`

**Issue:** (raised as WR-02 in the previous round, unchanged)

```js
window.addEventListener('beforeprint', function () {
  blocks[lang].querySelectorAll('[data-cv-panel]').forEach(function (panel) {
    panel.hidden = false;
  });
});
```

Two problems.

First, it is redundant: the print stylesheet at `index.html:103` already forces
`[data-cv-panel]{display:block !important}`, which is what actually makes the panels appear on
paper. The JS handler is not what produces the printed output.

Second, it mutates live DOM state with no counterpart and never restores it. After the print
dialog closes, all eight CV panels are permanently expanded on screen while every trigger still
reports `aria-expanded="false"` (`index.html:366`, `383`, `400`, …) and still displays `+`
(`toggle` at `index.html:1015-1016` is the only thing that maintains the sign). A screen reader
is told the section is collapsed while its content is exposed to the accessibility tree — and
the next click on the trigger sets `aria-expanded="true"` and `hidden = false`, i.e. it appears
to do nothing, because the panel was already open.

**Fix:** delete the handler — the print stylesheet already covers the requirement. If explicit
JS is preferred, drive it through the same code path that owns the state, and restore:

```js
function setPanel(button, open) {
  button.setAttribute('aria-expanded', String(open));
  var panel = document.getElementById(button.getAttribute('aria-controls'));
  if (panel) panel.hidden = !open;
  var sign = button.querySelector('[aria-hidden="true"]');
  if (sign) sign.textContent = open ? '-' : '+';
}

var restore = [];
window.addEventListener('beforeprint', function () {
  restore = [];
  blocks[lang].querySelectorAll('[aria-controls][aria-expanded]').forEach(function (button) {
    restore.push([button, button.getAttribute('aria-expanded') === 'true']);
    setPanel(button, true);
  });
});
window.addEventListener('afterprint', function () {
  restore.forEach(function (pair) { setPanel(pair[0], pair[1]); });
  restore = [];
});
```

---

### WR-04: The HTML checker rejects valid HTML5 and cascades one fault into many

**File:** `.github/scripts/verify_site.py:84-98`, `.github/scripts/verify_site.py:186-187`

**Issue:** (raised as IN-01 in the previous round; escalated — this can block a correct deploy)

The tag stack treats every non-void element as requiring an explicit end tag. HTML5 makes end
tags optional for `li`, `p`, `tr`, `td`, `th`, `thead`, `tbody`, `dt`, `dd`, `option` and
others, and `html.parser` does not synthesise them. Reproduced against a document that is valid
HTML5:

```
input: <ul><li>a<li>b</ul><p>one<p>two<table><tr><td>x</table><h1>t</h1>
output: 10 errors, exit 1
  ::error::</ul> at line 1 closes <li> opened at line 1
  ::error::</table> at line 1 closes <td> opened at line 1
  ::error::</body> at line 1 closes <tr> opened at line 1
  ::error::</html> at line 1 closes <table> opened at line 1
  ::error::unclosed <html> …  <body> …  <ul> …  <li> …  <p> …  <p> …
```

Three legal constructs produced ten annotations, nine of them describing elements that are
perfectly fine, including a bogus "unclosed `<html>`". `handle_endtag` pops the stack even when
the tag does not match (`verify_site.py:90-94`), which is what turns one genuine mismatch into a
cascade of derived noise. The committed `index.html` closes everything explicitly today, so the
gate is green — but any future author who writes idiomatic list or table markup gets a red
deploy on correct code, and the annotation list will not point at the real cause.

**Fix:** model the optional-end-tag rules, and stop reporting derived faults. Minimum viable
version:

```python
# HTML5 lets these close implicitly. Not modelling that makes the gate red on
# correct markup, and a gate that is red on correct markup is a gate people
# start ignoring.
IMPLIED = {"li": {"li"}, "p": {"p"}, "dt": {"dt", "dd"}, "dd": {"dt", "dd"},
           "option": {"option"}, "tr": {"tr"}, "td": {"td", "th"},
           "th": {"td", "th"}, "thead": {"tbody", "tfoot"}, "tbody": {"tbody", "tfoot"}}
CLOSED_BY_PARENT = {"li": {"ul", "ol"}, "td": {"tr", "table"}, "th": {"tr", "table"},
                    "tr": {"tbody", "thead", "tfoot", "table"},
                    "p": {"div", "section", "article", "body", "main", "footer", "header"}}
```

In `handle_starttag`, pop any open tag in `IMPLIED[top]` before pushing; in `handle_endtag`, pop
any open tag whose `CLOSED_BY_PARENT` entry contains the closing tag before comparing. Then, on
the first genuine mismatch, record the error and **stop reporting further structural errors for
that document** — one accurate annotation beats ten derived ones.

---

### WR-05: The page loads a third-party font stylesheet, contradicting both the constraint and the README

**File:** `index.html:28-30`, `README.md:9`, `README.md:17`

**Issue:** (raised as WR-03 in the previous round, unchanged)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin">
<link href="https://fonts.googleapis.com/css2?family=Archivo…&display=swap" rel="stylesheet">
```

Three documents disagree about this one fact:

- `.claude/CLAUDE.md` (Constraints): "fonts self-hosted woff2 with `font-display: swap`".
- `README.md:9`: "One HTML file, no build step, **no runtime dependency**".
- `README.md:17`: "Archivo and IBM Plex Mono (Google Fonts)" — which is the truth, and is a
  runtime dependency, contradicting line 9 of the same file.

Beyond the doc contradiction, this is a render-blocking cross-origin stylesheet followed by a
second-hop font fetch, on a page whose stated target is Lighthouse performance >95; and for a
site whose declared audience is French PMEs, `fonts.gstatic.com` transmits every visitor's IP to
Google, which German courts have already treated as a GDPR violation absent consent.

**Fix:** self-host. Download the two woff2 subsets, add them to the `REQUIRED` array in
`stage-site.sh` and to `REQUIRED` in `verify_site.py` (so they cannot silently stop shipping),
and replace the three `<link>` tags with `@font-face` rules carrying `font-display: swap` in the
existing `<style>` block. If self-hosting is deferred, then `.claude/CLAUDE.md` must be amended
to state the Google Fonts dependency and `README.md:9` corrected — a constraint nobody intends
to meet is worse than no constraint.

---

### WR-06: `stage-site.sh` silently depends on the caller's working directory

**File:** `.github/scripts/stage-site.sh:15-29`

**Issue:**

`REQUIRED=(index.html CNAME robots.txt sitemap.xml og-image.png)` are bare relative paths
resolved against `$PWD`, and `DEST` defaults to the relative `_site`. The script never anchors
itself to the repository root. Run from anywhere but the root — `bash ../.github/scripts/stage-site.sh`
from `specs/`, or with an absolute path from a sibling checkout — it first executes
`rm -rf _site` **in the caller's directory** (compounding CR-03) and then fails with
`missing required production asset: index.html`, an error message that describes the symptom and
hides the cause. CI happens to be safe because `actions/checkout` leaves `$PWD` at the root, so
the fragility is invisible in the place it is exercised most.

**Fix:** anchor to the script's own location, which is unambiguous and needs no `git`:

```bash
# Anchor to the repo root: every manifest entry below is relative to it, and a
# run from a subdirectory would otherwise rm -rf the wrong _site and then blame
# a missing index.html.
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit 2
```

Note this makes a relative `DEST` resolve against the repo root rather than the caller's cwd;
document that in the header comment alongside the existing usage line.

---

### WR-07: Deploy job holds `pages: write` + `id-token: write` while using mutable action tags and a persisted token

**File:** `.github/workflows/deploy.yml:22-23`, `.github/workflows/deploy.yml:50-71`

**Issue:**

The privilege boundary itself is correct — `permissions: {}` at workflow level, per-job grants,
and the `github.event_name == 'push' && github.ref == 'refs/heads/main'` condition together keep
a pull request away from `pages: write`. Two hardening gaps remain around it:

1. **Mutable tags.** `actions/checkout@v4`, `actions/configure-pages@v4`,
   `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` are all floating tags. A tag
   can be repointed. The job that consumes them is the one holding `pages: write` and
   `id-token: write` — the highest-privilege context in the repository.
2. **`persist-credentials` at its default (`true`).** `actions/checkout` writes the job's
   `GITHUB_TOKEN` into `.git/config`, where it stays for every subsequent step. In the deploy
   job, that means `stage-site.sh` and `verify_site.py` both execute with a `pages`-writing token
   sitting on disk that neither of them needs. Nothing in this repo pushes with git, so the
   credential has no purpose here at all.

**Fix:**

```yaml
      - name: Checkout
        # No step in either job pushes with git, so the token has no reason to
        # persist into .git/config where later steps can reach it.
        uses: actions/checkout@<full-40-char-sha>  # v4.2.2
        with:
          persist-credentials: false
```

Apply the SHA pin to all four actions, keeping the human-readable version in a trailing comment
so Dependabot can still bump them.

## Info

### IN-01: `actions[act]` resolves through `Object.prototype`, so unknown values are not all ignored

**File:** `index.html:1031-1039`

**Issue:** `var fn = actions[act]; if (!fn) return;` — `actions` is an object literal, so
`data-act="toString"`, `"valueOf"`, `"constructor"` or `"hasOwnProperty"` all resolve to an
inherited function, pass the truthiness guard, and are invoked as `fn(el, event)`.
`PREVENT_DEFAULT[act]` has the same shape, so `data-act="toString"` on an anchor would also
swallow its navigation. Nothing is exploitable — every `data-act` value is author-written and
there is no user-controlled path into that attribute — but `.claude/CLAUDE.md` documents the
behaviour as "unknown values are ignored", which is not what the code does.

**Fix:** `if (!Object.prototype.hasOwnProperty.call(actions, act)) return;` before the lookup,
and the same guard for `PREVENT_DEFAULT`.

---

### IN-02: `[data-grid]` background overlay is permanently hidden and unreachable

**File:** `index.html:118`

**Issue:** (raised as IN-05 in the previous round, unchanged) The fixed grid overlay carries the
`hidden` attribute and no code path ever removes it — `data-grid` appears exactly once in the
file and is not referenced by the IIFE. It is dead markup. `.claude/CLAUDE.md` lists `data-grid`
in its data-attribute table as "The fixed background grid overlay", i.e. documents it as a live
feature, so the drift is now in two places.

**Fix:** decide and record. Either drop the `hidden` attribute (if the grid is wanted) or delete
the element and its CLAUDE.md row (if it is not). Leaving a hidden element with a documented
purpose invites someone to "fix" it later without knowing why it was disabled.

---

### IN-03: The language switch updates neither the URL nor the scroll position meaningfully

**File:** `index.html:999-1008`

**Issue:** `setLang` flips `hidden`, sets `document.title` and `documentElement.lang`, then calls
`window.scrollTo(0, 0)`. It never touches the address bar, so a visitor who switches to English
and copies the URL shares the French page — the `?lang=en` deep link at `index.html:1042-1043`
exists precisely to make that shareable, and the toggle does not use it. The unconditional scroll
to top also discards the reader's position mid-page, and with `html{scroll-behavior:smooth}`
(`index.html:86`) it animates a full-page scroll on every toggle.

**Fix:**

```js
if (window.history && history.replaceState) {
  history.replaceState(null, '', lang === 'en' ? '?lang=en' : location.pathname);
}
```

and scroll only when the current section has no counterpart in the incoming locale, rather than
unconditionally.

---

### IN-04: A non-UTF-8 `index.html` produces a traceback instead of an annotation

**File:** `.github/scripts/verify_site.py:184`

**Issue:** The module docstring argues that "a checker that crashes instead of reporting is a
checker whose exit code stops meaning anything", and `main` guards the directory walks
accordingly — but `index.read_text(encoding="utf-8")` is unguarded. Reproduced with a byte
`0xff` in the file: `UnicodeDecodeError`, full traceback, no `::error::` annotation, none of the
later checks (`sitemap.xml`, the notices) run. It fails closed, so nothing unsafe publishes; the
cost is a CI failure whose log shows a Python stack trace rather than the stated problem.

**Fix:**

```python
try:
    markup = index.read_text(encoding="utf-8")
except UnicodeDecodeError as exc:
    errors.append("index.html is not valid UTF-8: %s" % exc)
    markup = None
if markup is not None:
    ...
```

---

### IN-05: Inconsistent failure output between the two CI scripts

**File:** `.github/scripts/stage-site.sh:11`, `.github/scripts/stage-site.sh:24`,
`.github/scripts/verify_site.py:200-204`

**Issue:** Three conventions in two scripts for the same job. `stage-site.sh:24` emits
`::error::…` to **stderr**; `stage-site.sh:11` emits a bare sentence with no annotation prefix,
so the destination-guard rejection never surfaces as a GitHub annotation; `verify_site.py`
emits `::error::…` to **stdout**. Someone reading a red run sees the same class of failure
presented three different ways.

**Fix:** pick one — `::error::` on stdout — and apply it to `stage-site.sh:11` as well:
`echo "::error::refusing to stage into '$DEST'"`.

---

### IN-06: A missing staged directory reports six errors for one fault

**File:** `.github/scripts/verify_site.py:170-179`

**Issue:** When `root` is not a directory, `main` appends `staged directory not found`, then
calls `check_manifest`, whose `REQUIRED` loop appends five more `missing required asset` lines
before its own `root.is_dir()` guard is reached at line 137. The run reports `6 problem(s)` for
one cause. `check_tree` correctly returns early; `check_manifest` checks too late.

**Fix:** move the `if not root.is_dir(): return` guard in `check_manifest` above the `REQUIRED`
loop, or `return 1` from `main` immediately after appending the not-found error.

---

### IN-07: The removed Mixpanel token remains retrievable from git history

**File:** `index.html` (history: `mixpanel.init('[REDACTED — see commit 0650811]', …)`)

**Issue:** The v2 rewrite correctly removed the inline Mixpanel snippet. The token is still in
every clone of the repository's history, and it was configured with `autocapture: true` and
`record_sessions_percent: 100`. A Mixpanel project token is a client-side ingest credential and
is not a secret in the usual sense, but it does authorise anyone who has it to write events and
session recordings into the project, which can poison the analytics the repositioning is
supposed to be measured by.

**Fix:** archive or delete the Mixpanel project in the Mixpanel console. Mixpanel is obsolete for
this site — Umami is the analytics path (`index.html` head, currently commented out), so the project
has no remaining purpose and disabling it costs nothing. History rewriting is not warranted for a
public client-side token; revoking it is. The literal value is deliberately not reproduced in this
report — read it from commit `0650811` if it is needed to identify the project.

---

### IN-08: `.claude/CLAUDE.md` line references have drifted from the rewritten `index.html`

**File:** `.claude/CLAUDE.md` (Component Responsibilities, Layers, Key Abstractions)

**Issue:** The architecture tables cite `index.html` line ranges that no longer match: the FR
content tree is documented as `L121-552` and the EN tree as `L553-980`, while the actual blocks
open at `index.html:120` and `index.html:551`; the analytics stub is documented as `L71-76` and
is `71-77`. The design-token block (`78-115`) and the IIFE (`982-1052`) are correct. Small drift,
but these tables are the map an agent uses to find code without reading 1054 lines, and a map
that is wrong by two lines in one place and by nothing in another cannot be trusted anywhere.

**Fix:** correct the four ranges, or replace the line citations with anchors that survive edits
(`[data-lang-block="fr"]`, `[data-lang-block="en"]`, the `<style>` block, the trailing
`<script>`).

## Verified clean

Checked and found no defect — recorded so a later review does not re-derive them:

- **`deploy.yml` privilege boundary.** No route from `pull_request` to `pages: write` /
  `id-token: write`: the `verify` job grants only `contents: read`; `deploy` is gated on both
  `github.event_name == 'push'` and `github.ref == 'refs/heads/main'`; `permissions: {}` removes
  the ambient default; no `pull_request_target`; no `${{ }}` interpolation into any `run:` block.
- **Concurrency isolation.** `verify-${{ github.workflow }}-${{ github.ref }}` with
  `cancel-in-progress: true` cannot collide with the `"pages"` group
  (`cancel-in-progress: false`), because a PR ref (`refs/pull/N/merge`) and a push ref differ; a
  PR run cannot cancel an in-flight production deploy.
- **Symlink rejection (the previous CR-01).** Re-tested end to end through `cp -R`: a symlink at
  any depth fails the run. `is_symlink()` rather than `exists()` correctly catches dangling links,
  and `rglob` not descending into symlinked directories makes name-level rejection sufficient.
- **Top-level allowlist.** `check_manifest` now fails on any entry under the staged root that is
  not in `REQUIRED | OPTIONAL`, including dotfiles.
- **Staging fidelity.** `stage-site.sh` copies exactly the D-06 manifest, fails loudly on a
  missing REQUIRED entry, skips `en/` with a notice per D-07, and is idempotent. Verified by
  running it: `_site/` contained precisely the five manifest files, and `verify_site.py` returned
  `0 problem(s)`.
- **`deploy.yml` verify/publish consistency.** The deploy job re-stages and re-verifies
  immediately before `upload-pages-artifact`, so the uploaded tree is the checked tree.
- **ARIA wiring in `index.html`.** Every `aria-controls` and `aria-labelledby` resolves to an
  existing id, every `href="#…"` resolves to an existing id, and there are no duplicate ids
  across the two locale trees (all 16 CV panels are locale-suffixed).
- **External links.** All 16 `target="_blank"` anchors carry `rel="noopener"`.
- **`.gitignore`.** `_site/`, `.claude/settings.local.json`, `.gsd/`, `.planning/research/.cache/`
  and `.playwright-mcp/` are consistent with the `FORBIDDEN` list in `verify_site.py`; no tracked
  file is accidentally ignored.

---

_Reviewed: 2026-08-20T17:05:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
