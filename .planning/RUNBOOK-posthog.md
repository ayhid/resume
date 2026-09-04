# Runbook — self-hosted PostHog

The branding page is fully instrumented but measures nothing until a PostHog
instance exists. This is the shortest path from "no analytics" to "the
visits→Calendly ratio is readable", and it is the last blocker on CONV-01.

Decision (2026-09-04): PostHog, self-hosted, replacing the self-hosted Umami
plan of 2026-08-30. Owning the data outright is still the reason to self-host;
what changed is the tool, and with it the size of the thing being hosted.

## 1. Stand up the instance

Be honest about the cost before starting: this is not the Umami swap it looks
like. Umami was one container plus Postgres. PostHog's Docker Compose runs
ClickHouse, Kafka, Zookeeper, Redis, Postgres and several application workers.
PostHog's own docs put the floor at 4 vCPU / 16 GB RAM and explicitly state
that self-hosted deployments are community-supported, with no migration path to
Cloud later.

```sh
git clone https://github.com/PostHog/posthog.git
cd posthog
# Follow docker-compose.hobby.yml in the repo — it is the supported entry point
# and it changes often enough that copying it into this runbook would rot.
```

Put it behind a reverse proxy on a subdomain you control. `ph.ayoub-hidri.dev`
is the obvious one, and a first-party subdomain is also what keeps the loader
clear of the ad blockers that eat third-party analytics hosts.

Then: create the admin account on first visit, create a project, and copy the
**project API key** (`phc_…`) from Settings → Project. That key and the instance
URL are the two values the page needs.

The key is public by design — it ships in the page and only permits writes. It
is not a secret. The instance's own admin credentials are.

## 2. Wire it into the page

In `index.html`, inside the analytics comment near the top of `<head>`:

1. In the `<script>` block, replace `[POSTHOG_KEY]` with the project API key and
   `[POSTHOG_HOST]` with the instance URL (scheme included, no trailing slash).
2. Uncomment that block.
3. Put both tokens back into `PLACEHOLDERS` in `.github/scripts/verify_site.py`,
   in the same commit.

Step 3 exists because those two tokens were removed from that list on
2026-09-04, so the site could ship while the instance did not exist. Until they
go back, nothing catches a block uncommented with the brackets still in it —
that mistake now breaks the measurement silently instead of breaking the
deploy. Hence the order: 1 before 2, and 3 alongside them.

`api_host` must point at the instance. The Cloud snippet rewrites that host to
an assets CDN; the loader used here concatenates `api_host + "/static/array.js"`
directly, so a wrong value fails silently rather than loudly.

## 3. Prove it before publishing

```sh
bash .github/scripts/stage-site.sh _site
python3 .github/scripts/verify_site.py _site   # must print "0 problem(s)"
```

`verify_site.py` no longer fails on the PostHog brackets — they were taken out
of `PLACEHOLDERS` so the page could ship without analytics. It still fails on
`_A_VALIDER`. Once step 3 above is done, the bracket gate is back and a
half-done replacement breaks the deploy rather than the measurement.

Then check the events themselves, which needs no instance at all:

```sh
python3 -m http.server 8787     # then open with ?debug=analytics
```

Every event prints to the console as `[analytics] <name> {…}`. Nine are wired:
`cta_calendly`, `cta_mailto`, `download_pdf`, `track_card`, `nav_click`,
`section_view`, `cv_open`, `lang_switch`, `outbound`. Each payload carries
`lang`. Confirm the same events land in the PostHog activity feed once the
block is live — the page calls `posthog.capture(name, payload)`, so each one
arrives as a custom event with `lang` as a property.

## Open point — CONV-03

CONV-03 asks for the visits→Calendly ratio to be readable "with no manual
arithmetic". PostHog closes this more directly than Umami could: an insight
with a funnel or a formula (`cta_calendly / pageview`) computes the ratio and
can be pinned to a dashboard, so the number is read rather than divided. Build
that insight as part of closing CONV-03 — the instance alone does not close it.

## Privacy — this changed, and it is not done

`persistence: 'cookie'` was chosen deliberately: the recurring visitor is what
makes the visits→Calendly ratio meaningful. The consequence is that the site now
sets a first-party cookie and autocaptures clicks and pageviews, where the Umami
plan set no cookie at all.

That moves the page out of the "no banner required" regime it was designed for:

- **A consent banner is required and does not exist.** Nothing in `index.html`
  asks for consent today. PostHog supports this via `opt_out_capturing_by_default`
  plus `opt_in_capturing()` on accept, but the banner itself is unbuilt UI — and
  `design.md` forbids border-radius, box-shadow and gradients, so it needs a
  deliberate design pass rather than a generic cookie dialog.
- **The privacy notice needs updating.** First-party cookie, autocapture, and a
  self-hosted processor are all disclosable facts.
- `disable_session_recording: true` is set, so no session replay is collected.

Until the banner ships, the honest options are to keep the block commented out
(the current state), or to switch `persistence` to `'memory'` and drop
autocapture, which returns the page to the cookieless posture and needs no
banner — at the cost of not distinguishing a returning visitor.
