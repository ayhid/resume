# Runbook — self-hosted Umami

The branding page is fully instrumented but measures nothing until an Umami
instance exists. This is the shortest path from "no analytics" to "the
visits→Calendly ratio is readable", and it is the last blocker on CONV-01.

Decision (2026-08-30): self-hosted rather than Umami Cloud. The trade is an
instance to keep alive in exchange for owning the data outright.

## 1. Stand up the instance

Anywhere that runs Docker and terminates TLS. `POSTGRES_PASSWORD` and
`APP_SECRET` are secrets — generate them, do not commit them.

```yaml
# docker-compose.yml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://umami:${POSTGRES_PASSWORD}@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${APP_SECRET}
    depends_on: [db]
    restart: always
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes: ["umami-db:/var/lib/postgresql/data"]
    restart: always
volumes:
  umami-db:
```

Put it behind a reverse proxy on a subdomain you control — `analytics.ayoub-hidri.dev`
is the obvious one, and a first-party subdomain is also what keeps the script
clear of the ad blockers that eat `/umami.js` on shared hosts.

Then: log in at `/login` with `admin` / `umami`, **change that password
immediately**, and add the website. Settings → Websites → the site row exposes
the tracking code; the `data-website-id` UUID is the value you need.

## 2. Wire it into the page

In `index.html`, inside the analytics comment near the top of `<head>`:

1. On the `<script>` line, replace the two bracketed values with the instance
   domain and the website UUID.
2. Uncomment that line.

Do it in that order. The brackets are written exactly once, on the line you
edit, so that step 1 cannot be half-done — see step 3.

## 3. Prove it before publishing

```sh
bash .github/scripts/stage-site.sh _site
python3 .github/scripts/verify_site.py _site   # must print "0 problem(s)"
```

`verify_site.py` fails on a surviving bracketed placeholder, so a page that
still says `[UMAMI…]` cannot reach production — the deploy breaks instead of the
measurement silently breaking. This gate is why the branding page currently
fails verification: that is the intended state until this runbook is done.

Then check the events themselves, which needs no instance at all:

```sh
python3 -m http.server 8787     # then open with ?debug=analytics
```

Every event prints to the console as `[analytics] <name> {…}`. Nine are wired:
`cta_calendly`, `cta_mailto`, `download_pdf`, `track_card`, `nav_click`,
`section_view`, `cv_open`, `lang_switch`, `outbound`. Each payload carries
`lang`. Confirm the same events land in the Umami dashboard once the script is
live.

## Open point — CONV-03

CONV-03 asks for the visits→Calendly ratio to be readable "with no manual
arithmetic". Umami reports pageviews and event counts side by side but does not
compute a ratio between them, so as it stands the number is a division the
reader still performs. Closing CONV-03 literally means either accepting that
one division, or querying the Umami API for a small derived figure. Worth
deciding deliberately rather than assuming the dashboard covers it.

## Privacy

Umami sets no cookie and stores no personal data, so no consent banner is
required — which is also what keeps the page free of the cookie dialog that
`design.md` would otherwise have to accommodate.
