# Business Flow Artifact Rules

## Purpose

This repository produces evidence-backed business-flow artifacts from source specifications.

## Required artifact set

- `business-flow/<slug>/01-source/normalized-spec.md`
- `business-flow/<slug>/02-analysis/business-flow-document.md`
- `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`
- `business-flow/<slug>/10-reports/run-summary.json`

## Global quality bar

- Output must be English only.
- Output must be business-friendly and easy to review.
- Do not use emoji, jokes, or decorative language.
- Every business claim must be traceable to source evidence.
- If evidence is missing, use `Unknown / needs confirmation` or record a question or assumption.

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

## Visual standard requirements

- Use `docs/mermaid-visual-standard.md`
- Use `docs/mermaid-icon-library.md`
- Use the SVG assets in `assets/mermaid-icons/`
- Keep Mermaid source text-first for compatibility

## Out of scope by default

- product implementation
- API testing packs
- Postman collections
- end-to-end automation suites
- deployment workflows
