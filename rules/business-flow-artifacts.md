# Business Flow Artifact Rules

## Required artifact set — business-flow pipeline

```text
business-flow/<slug>/
├── 01-source/normalized-spec.md
├── 02-analysis/business-flow-document.md
├── 03-mermaid/business-flow-mermaid.md
└── debug/
    ├── analysis.prompt.md
    ├── mermaid.prompt.md
    ├── validation.json
    ├── permissions.json
    ├── risk.json
    ├── scenario-seeds.md
    └── run-summary.json
```

## Analysis document structure (02-analysis)

The `business-flow-document.md` must contain all 19 sections:

| # | Section | Required |
|---|---|---|
| 0 | Scope | Always |
| 1 | Source | Always |
| 2 | Business Flow Summary | Always |
| 3 | Business Flow Table | Always |
| 4 | Narrative Flow | Always |
| 5 | Decisions and Exceptions | Always |
| 6 | Traceability | Always |
| 7 | Questions | Always |
| 8 | Assumptions | Always |
| 9 | Gap Taxonomy | P0 |
| 10 | State Machine | P0 |
| 11 | Permissions | P1 |
| 12 | Async Events | P1 |
| 13 | Risk Hotspots | P1 |
| 14 | Scenario Seeds | P1 |
| 15 | Contradictions + Cross-Flow Impact | P2 |
| 16 | Validation Report | P0 |
| 17 | Checklist | Always |
| 18 | Data Contracts | P3 |
| 19 | Implementation Constraints | P3 |

## Global quality bar

- Output in English only.
- Every claim traceable to source evidence.
- If evidence is missing, use `Unknown / needs confirmation`.
- Final acceptance must pass verification using the `business-flow-verifier` agent.

> **Canonical source:** `rules/business-flow-artifacts.md`
