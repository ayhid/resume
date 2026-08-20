---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-08-20T10:14:41.065Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 1 | deviation | .gitignore |  | gitignore must absorb .gsd/, .planning/research/ and _site/ on top of D-10's list — plan 01-02 Task 2 | open |  | 2026-08-20T10:14:40.997Z |  |
| 2 | 1 | unmet-truth | .github/workflows/deploy.yml |  | OPS-01 pull-request half asserted structurally but never exercised; empirical proof owed by plan 01-05 | open |  | 2026-08-20T10:14:41.065Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "1",
    "file": ".gitignore",
    "line": null,
    "description": "gitignore must absorb .gsd/, .planning/research/ and _site/ on top of D-10's list — plan 01-02 Task 2",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-20T10:14:40.997Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "unmet-truth",
    "phase": "1",
    "file": ".github/workflows/deploy.yml",
    "line": null,
    "description": "OPS-01 pull-request half asserted structurally but never exercised; empirical proof owed by plan 01-05",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-20T10:14:41.065Z",
    "resolved_at": null
  }
]
````
