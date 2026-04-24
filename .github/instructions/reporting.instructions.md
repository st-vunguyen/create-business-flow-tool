---
applyTo: "**/business-flow/**"
description: "Execution evidence, report structure, and artifact hygiene rules for local business-flow outputs."
---

# Business Flow Reporting Rules

## Report layers

| Layer | Purpose | Canonical location |
|---|---|---|
| Run summary | Machine-readable run metadata | `business-flow/<slug>/10-reports/run-summary.json` |
| Human-readable artifacts | Analysis and Mermaid outputs | `business-flow/<slug>/02-analysis/` and `business-flow/<slug>/03-mermaid/` |
| Rendered prompts | Exact runtime prompt payloads | `business-flow/<slug>/04-prompts/` |

## Artifact hygiene

Commit:

- source code
- prompts
- rules
- tests
- documentation

Do not commit by default:

- files placed in `specs/`
- files generated under `business-flow/`
- local `.env` files
- one-off personal scratch notes

## Completion checklist

- [ ] `run-summary.json` exists under `business-flow/<slug>/10-reports/`
- [ ] Generated artifacts are local only
- [ ] Documentation and prompts explain the same canonical output root
- [ ] No generated output is treated as committed source of truth
