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

# Default-deny backstop. None of these may ever reach the published artifact,
# even if a future edit to the staging script lets one through.
FORBIDDEN = ["README.md", "og-image.html", "specs", ".planning",
             ".github", ".claude", ".playwright-mcp", "_site"]

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


def main(dest):
    root = pathlib.Path(dest)

    for name in REQUIRED:
        if not (root / name).exists():
            errors.append("missing required asset: %s" % name)
    for name in FORBIDDEN:
        if (root / name).exists():
            errors.append("forbidden entry present in artifact: %s" % name)

    index = root / "index.html"
    if index.exists():
        checker = Checker()
        checker.feed(index.read_text(encoding="utf-8"))
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
