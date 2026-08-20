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

## Analytics
Umami is wired but commented out in the `<head>`: replace `[UMAMI_HOST]` and
`[UMAMI_WEBSITE_ID]` to enable it. Events already emitted: `cta_calendly`,
`cta_mailto`, `download_pdf`, `track_card`.
