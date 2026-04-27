# Business Flow Artifact Rules

## Required artifact set

All runs in `heuristic` mode must produce:

```
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

The `business-flow-document.md` must begin with `MODE=technical` and contain all 17 sections:

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
| 15 | Contradictions (+ Cross-Flow Impact) | P2 |
| 16 | Validation Report | P0 |
| 17 | Checklist | Always |

## Global quality bar

- Output in English only.
- Every claim traceable to source evidence.
- If evidence is missing, use `Unknown / needs confirmation`.
- Final acceptance must pass verification using the `business-flow-verifier` agent.

## User experience rule

The default user workflow must stay minimal:

1. place specs in `specs/<project>/`
2. invoke the repository prompt or agent
3. receive the completed artifact pack under `business-flow/<slug>/`

Agents should perform the intermediate run, enrichment, and verification steps autonomously unless the user explicitly asks for manual step-by-step control.

## Source of truth

All generated artifacts must be based on:
1. Source documents from `specs/<project>/`
2. Committed prompts in `.github/prompts/`
3. Committed runtime logic in `src/`
4. Direct evidence from `01-source/normalized-spec.md`

## Allowed output paths

```
business-flow/<slug>/01-source/**
business-flow/<slug>/02-analysis/**
business-flow/<slug>/03-mermaid/**
business-flow/<slug>/debug/**
```

## Forbidden by default

- `src/**` — product source is not generated output
- `.env`, `.env.*` — never overwrite runtime environment files
- `.github/workflows/**` — no CI generation by default
- Any path outside `business-flow/<slug>/`

## Artifact hygiene

**Commit:**
- source code (`src/`)
- prompts (`.github/prompts/`)
- rules (`.claude/rules/`)
- skills (`.claude/skills/`)
- agents (`.claude/agents/`)
- tests (`tests/`)
- documentation (`docs/`)

**Do not commit:**
- `specs/` — local input only
- `business-flow/` — local generated output
- `.env` files

## Completion checklist

- [ ] Supplemental audit artifacts exist under `debug/`
- [ ] All 17 sections present in `02-analysis/business-flow-document.md`
- [ ] Every claim evidence-backed
- [ ] Missing data marked as `Unknown / needs confirmation`
- [ ] Section 16 validation score ≥ 60
- [ ] `specs/` and `business-flow/` remain local and gitignored
