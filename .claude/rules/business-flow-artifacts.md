# Business Flow Artifact Rules

## Required artifact set

- `business-flow/<slug>/01-source/normalized-spec.md`
- `business-flow/<slug>/02-analysis/business-flow-document.md`
- `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`
- `business-flow/<slug>/04-prompts/01-analysis.prompt.md`
- `business-flow/<slug>/04-prompts/02-mermaid.prompt.md`
- `business-flow/<slug>/10-reports/run-summary.json`

## Global quality bar

- Output must be English only.
- Output must be business-friendly and easy to review.
- Every business claim must be traceable to source evidence.
- If evidence is missing, use `Unknown / needs confirmation` or record a question or assumption.
- Final acceptance should include one verification pass against evidence and artifact completeness.

## Source of truth

All generated artifacts must be based on:

1. source documents placed in `specs/`
2. committed prompts in `.github/prompts/`
3. committed runtime logic in `src/`
4. direct evidence extracted from the normalized corpus

If evidence is incomplete:

- write `Unknown / needs confirmation`
- record the gap in `Questions`, `Assumptions`, or `Gaps`
- do not invent actors, branches, rules, or outcomes

## Analysis artifact requirements

The business-flow document must contain:

- scope
- source list
- summary of actors, triggers, outcomes, and touchpoints
- business-flow table
- narrative flow text
- decisions and exceptions
- traceability table
- questions and assumptions

## Mermaid artifact requirements

The Mermaid pack must contain:

- the explicit diagram standard
- the repository icon set used for export consistency
- the primary flowchart
- the swimlane diagram when ownership evidence is sufficient
- node traceability
- gaps or assumptions

## Output scope

### Allowed root

- `business-flow/<slug>/01-source/**`: normalized source corpus
- `business-flow/<slug>/02-analysis/**`: business-flow document pack
- `business-flow/<slug>/03-mermaid/**`: Mermaid diagram pack
- `business-flow/<slug>/04-prompts/**`: rendered runtime prompts
- `business-flow/<slug>/10-reports/**`: run summary and supporting execution evidence

### Forbidden by default

- `src/**`: product code is not generated output
- `.env` and `.env.*`: real runtime environment files must not be overwritten
- `.github/workflows/**`: this repo does not generate CI workflows by default
- any path outside `business-flow/<slug>/`: generated artifacts must stay local and grouped under one slug

## Report layers

- Run summary: machine-readable run metadata in `business-flow/<slug>/10-reports/run-summary.json`
- Human-readable artifacts: analysis and Mermaid outputs in `02-analysis/` and `03-mermaid/`
- Rendered prompts: exact runtime prompt payloads in `04-prompts/`

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

## Verification gate

- Verify that the analysis table, narrative, and Mermaid pack remain mutually consistent.
- Verify that every decision and branch is supported by source evidence.
- Verify that unresolved gaps remain clearly labeled, not silently resolved.

## Completion checklist

- Output only exists under `business-flow/<slug>/`
- Every claim is evidence-backed
- Missing data is clearly marked as unresolved
- `specs/` and `business-flow/` remain local-only and gitignored
- `run-summary.json` exists under `business-flow/<slug>/10-reports/`
