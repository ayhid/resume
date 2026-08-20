#!/usr/bin/env bash
# The production manifest. This is an allowlist: anything not named below is
# never published, so a new file at the repo root stays private until someone
# adds it here deliberately. og-image.html is excluded on purpose — it is a
# dev-only artboard and must not be reachable at /og-image.html.
# Run locally exactly as CI does:  bash .github/scripts/stage-site.sh _site
set -euo pipefail

DEST="${1:-_site}"
case "$DEST" in
  ""|"/"|"."|"..") echo "refusing to stage into '$DEST'" >&2; exit 2 ;;
esac

# Required — a missing entry is a failure, not a warning.
REQUIRED=(index.html CNAME robots.txt sitemap.xml og-image.png)
# Optional — copied when present. `en/` arrives in Phase 10.
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
