# Personal site — Ayoub Hidri

Single-page bilingual (FR/EN) personal site, deployed on GitHub Pages.

## Live site
https://ayoub-hidri.dev/

## Features
- One HTML file, no build step, no runtime dependency
- FR and EN content in the same page, toggled client-side (`?lang=en` deep link)
- Collapsible resume entries, print stylesheet for the PDF export
- Responsive fluid layout, `prefers-reduced-motion` honoured
- Structured data (Person + ProfessionalService), OpenGraph and hreflang tags

## Technologies used
- HTML5 with inline styles (design tokens in `:root`)
- Archivo and IBM Plex Mono (Google Fonts)
- Vanilla JS for the language toggle, accordions and analytics events
- GitHub Pages deployment (`.github/workflows/deploy.yml`)

## Local rehearsal
Stage and check the production artifact exactly as CI does: `bash .github/scripts/stage-site.sh _site && python3 .github/scripts/verify_site.py _site`

## Analytics
PostHog (self-hosted) is wired but commented out in the `<head>`: replace
`[POSTHOG_KEY]` and `[POSTHOG_HOST]`, then uncomment the block. `verify_site.py`
refuses to publish a page where those placeholders survive.

Nine events are emitted, each carrying `lang`: `cta_calendly`, `cta_mailto`,
`download_pdf`, `track_card`, `nav_click`, `section_view`, `cv_open`,
`lang_switch`, `outbound`. Open any page with `?debug=analytics` to print them
to the console without an instance.

The block is configured with `persistence: 'cookie'` and autocapture on, which
requires a consent banner that does not exist yet — see
`.planning/RUNBOOK-posthog.md`.
