#!/usr/bin/env python3
"""Verify the staged Pages artifact. No dependencies: stdlib only.

Run locally exactly as CI does:  python3 .github/scripts/verify_site.py _site

Every check below is written out explicitly, and that is deliberate:
html.parser.HTMLParser has no strict mode (`strict` was removed in Python 3.5)
and never raises on malformed markup, so "the parser produced no error" proves
nothing. Silence from the parser is not evidence; only an assertion is.

The project has no build step and no runtime dependency, and this check must
not cost it that: standard library only, no package manifest, no install step.
"""
import sys
import pathlib
import collections
from html.parser import HTMLParser
import xml.etree.ElementTree as ET

# The production manifest, mirroring the REQUIRED array of stage-site.sh.
# The two lists are the same D-06 manifest expressed once per side of the check:
# the staging script decides what is copied, this script asserts what arrived.
REQUIRED = ["index.html", "CNAME", "robots.txt", "sitemap.xml", "og-image.png"]

# The optional half of that same manifest, mirroring the OPTIONAL array of
# stage-site.sh: `en/` is copied when present and tolerated when absent (D-07).
OPTIONAL = ["en"]

# Three rules run over the staged tree, and they are deliberately different at
# different depths.
#
# At the top level the rule is a positive allowlist: every entry directly under
# the staged root must appear in REQUIRED or OPTIONAL, so an unlisted file fails
# the run instead of shipping.
#
# At every depth the rule is the denylist of basenames below, plus a blanket
# refusal of symlinks. Symlinks are rejected by name rather than resolved
# because upload-pages-artifact tars with --dereference: a link inside en/
# pointing at ../../.planning would publish its target's contents while a
# name-only comparison saw nothing wrong.
#
# The contents of `en/` are deliberately not enumerated against an allowlist.
# Phase 10 authors them and they do not exist yet, so inside an allowed
# directory the rule is the basename-and-symlink check rather than a full
# allowlist -- the strongest assertion available without knowing the contents.
FORBIDDEN = ["README.md", "og-image.html", "specs", ".planning",
             ".github", ".claude", ".playwright-mcp", "_site"]

# Authoring placeholders that must never reach a visitor. Two kinds, one rule.
#
# [UMAMI_HOST] and [UMAMI_WEBSITE_ID] stand in for a self-hosted Umami instance
# that does not exist yet. The page is instrumented and the loader sits
# commented out in the head; the failure this guards against is not the missing
# instance but the half-done fix -- uncommenting the tag while leaving the
# placeholders, which publishes a request to a host named "[UMAMI_HOST]" on
# every visit and measures nothing at all.
#
# _A_VALIDER marks copy nobody has verified: an unverifiable case-study figure,
# or a training-financing claim the current Qualiopi/portage status may not
# support. specs/experience.md forbids publishing either, and a substring match
# is a cheap way to make that forbidding real rather than aspirational.
PLACEHOLDERS = ["[UMAMI_HOST]", "[UMAMI_WEBSITE_ID]", "_A_VALIDER"]

# Void elements never close, so they must not be pushed onto the tag stack.
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}

errors = []
notices = []


class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.ids = collections.Counter()
        self.h1 = 0
        # Per-[data-lang-block] <h1> tallies, plus the bookkeeping needed to
        # know which block (if any) is currently open.
        self.lang_blocks = []
        self.open_lang = []
        self.lang_depth = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d:
            self.ids[d["id"]] += 1
        if tag == "h1":
            self.h1 += 1
            if self.open_lang:
                self.lang_blocks[self.open_lang[-1]] += 1
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))
            if "data-lang-block" in d:
                self.lang_blocks.append(0)
                self.open_lang.append(len(self.lang_blocks) - 1)
                self.lang_depth.append(len(self.stack))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            errors.append("stray </%s> at line %d" % (tag, self.getpos()[0]))
            return
        if self.stack[-1][0] != tag:
            open_tag, line = self.stack[-1]
            errors.append("</%s> at line %d closes <%s> opened at line %d"
                          % (tag, self.getpos()[0], open_tag, line))
        self.stack.pop()
        if self.lang_depth and len(self.stack) < self.lang_depth[-1]:
            self.lang_depth.pop()
            self.open_lang.pop()


def check_headings(checker):
    """Report on <h1> distribution WITHOUT failing the run.

    Measured before this check was written: both the committed page and the
    incoming v2 rewrite carry two <h1> elements. On v2 that is correct -- one
    per [data-lang-block], with the inactive locale tree hidden. An
    unconditional single-<h1> assertion would therefore be red on arrival, on
    markup this phase is forbidden from editing, and a gate that is red before
    any change is a gate nobody trusts.

    So this emits a ::warning:: and leaves the exit code alone. Phase 11
    (A11Y-01) owns the decision to promote it to a failure.
    """
    if checker.lang_blocks:
        healthy = (checker.h1 == len(checker.lang_blocks)
                   and all(n == 1 for n in checker.lang_blocks))
    else:
        healthy = checker.h1 == 1
    if not healthy:
        notices.append(
            "heading structure: %d <h1> total, %d [data-lang-block] element(s), "
            "per-block <h1> counts %s -- expected exactly one <h1> per language "
            "block, or exactly one document-wide when there are none. Reported "
            "only; Phase 11 (A11Y-01) owns making this fail."
            % (checker.h1, len(checker.lang_blocks), checker.lang_blocks or "[]"))


def check_placeholders(text):
    """Fail on any unresolved authoring placeholder left in the page.

    Deliberately a plain substring scan over the raw source rather than a check
    on rendered text: a placeholder inside an HTML comment still ships to every
    visitor who views source, and the comment is exactly where the analytics one
    lives.
    """
    for token in PLACEHOLDERS:
        count = text.count(token)
        if count:
            errors.append("unresolved placeholder in index.html: %s (%d occurrence(s))"
                          % (token, count))


def check_manifest(root):
    """Assert the required assets are present and that nothing else arrived.

    The second half is the positive assertion: stage-site.sh decides what is
    copied, and this decides that anything it did not copy is a failure rather
    than a silent publish. Sorted so annotation order is stable across runs.
    """
    for name in REQUIRED:
        if not (root / name).exists():
            errors.append("missing required asset: %s" % name)
    if not root.is_dir():
        return
    allowed = set(REQUIRED) | set(OPTIONAL)
    for entry in sorted(root.iterdir()):
        if entry.name not in allowed:
            errors.append("unlisted entry in artifact: %s" % entry.name)


def check_tree(root):
    """Reject every symlink, and every forbidden basename at any depth.

    rglob yields a dangling symlink as an entry and does not descend into a
    symlinked directory, so rejecting the link itself is sufficient: the tree
    behind it is never walked and the link never reaches the artifact. This is
    also why is_symlink() is the test and exists() is not -- exists() follows
    the link and answers False for a dangling one.

    The two rules are independent on purpose. A top-level dangling README.md
    symlink trips both of them and check_manifest as well, producing three
    annotations; each must be able to fail the run on its own, so neither is
    gated behind the other.
    """
    if not root.is_dir():
        return
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root)
        if path.is_symlink():
            errors.append("symlink in artifact: %s -> %s"
                          % (relative, path.readlink()))
        if path.name in FORBIDDEN:
            errors.append("forbidden entry present in artifact: %s" % relative)


def main(dest):
    root = pathlib.Path(dest)

    # Guard both walks. An absent directory has to stay a report rather than
    # become a traceback: a checker that crashes instead of reporting is a
    # checker whose exit code stops meaning anything.
    if not root.is_dir():
        errors.append("staged directory not found: %s" % dest)
    check_manifest(root)
    check_tree(root)

    index = root / "index.html"
    if index.exists():
        markup = index.read_text(encoding="utf-8")
        check_placeholders(markup)
        checker = Checker()
        checker.feed(markup)
        checker.close()
        for tag, line in checker.stack:
            errors.append("unclosed <%s> opened at line %d" % (tag, line))
        for element_id, count in sorted(checker.ids.items()):
            if count > 1:
                errors.append("duplicate id: %s (%d occurrences)" % (element_id, count))
        check_headings(checker)

    sitemap = root / "sitemap.xml"
    if sitemap.exists():
        try:
            ET.parse(sitemap)
        except ET.ParseError as exc:
            errors.append("sitemap.xml is not well-formed: %s" % exc)

    for message in notices:
        print("::warning::%s" % message)
    for message in errors:
        print("::error::%s" % message)
    print("%d problem(s)" % len(errors))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "_site"))
