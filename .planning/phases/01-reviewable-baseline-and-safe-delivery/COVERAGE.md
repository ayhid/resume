# API Coverage — Phase 1: Reviewable Baseline and Safe Delivery

No external API integration: this phase changes how the site is delivered, not what the site
talks to. The shipped product remains one static HTML file with no runtime dependency, no network
call to any third party at request time, and no SDK. The `gh` CLI and the GitHub REST endpoints
appear only as *operator tooling* used at plan-execution time — to flip the Pages publishing
source, watch workflow runs, count deployments and open the D-09 probe pull request — and none of
that code ships or executes in production.

## Detector result

The deterministic detector (`gsd-core/bin/lib/api-coverage.cjs`) was run at planning time against
the phase scope — `01-CONTEXT.md` plus the ROADMAP Phase 1 section — and returned:

```json
{ "detected": false, "signals": [] }
```

This declaration is written anyway, because the finished PLAN.md files necessarily contain the
words `gh api`, "REST API" and "endpoint" while describing operator tooling, and the seal-time
re-run of the detector fires on scope text rather than on runtime behaviour. Recording the
reasoned outcome now prevents a seal-time block on a false positive.

## Scope confirmation

Re-read of the phase scope confirms the absence of any product-level integration:

| Surface | Present in this phase? | Notes |
|---|---|---|
| Third-party SDK or client library | no | The repository has no `package.json`, no lockfile, and this phase adds none. |
| Runtime network call from the shipped page | no | The only third-party asset the live page loads is the Google Fonts stylesheet, which predates this phase and is removed in Phase 4 (PERF-01). |
| Webhook receiver or callback endpoint | no | There is no server. |
| OAuth or authentication flow | no | The site has no accounts. |
| Analytics or telemetry integration | no | The Umami snippet is committed inside an HTML comment with unresolved placeholders; wiring it is Phase 2 (CONV-01). |
| MCP, gRPC or GraphQL client | no | — |
| CI-time use of the GitHub REST API | yes, operator tooling only | `gh api` calls to `repos/ayhid/resume/pages`, `.../deployments`, `.../actions/runs/*/jobs` and `.../environments/github-pages/deployment-branch-policies` are executed by the plan operator and by assertions. They are not shipped, not committed as product code, and hold no credential beyond the operator's own `gh` token and the ephemeral `GITHUB_TOKEN` inside a job. |

## Deferred integration, tracked

Phase 2 (CONV-01 … CONV-03) integrates a self-hosted Umami instance and *is* an API-integrating
phase. Its coverage matrix belongs to that phase, not this one — `.planning/STATE.md` already
records the operational dependency as a blocker.
