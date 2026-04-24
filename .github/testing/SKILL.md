---
name: business-flow
description: 'Read specs, clarify ambiguity, generate business-flow documents, and convert them to Mermaid diagrams with traceability'
---

# Expert QC Business Flow Skill

## Shared Contract

This file defines the shared Expert QC business-flow contract for both assistant layouts.

- Copilot reads `.github/testing/SKILL.md`
- Claude mirrors the same contract in `.claude/skills/testing/SKILL.md`

The two files can differ in wrapper text, but they must agree on flow, output roots, runtime tooling, and guardrails.

## Trigger

Use this skill when asked to:
- read specs from `specs/`
- clarify ambiguous business requirements
- extract actors, triggers, steps, decisions, exceptions, and outcomes
- generate business-flow documents with traceability
- convert business-flow documents into Mermaid diagrams
- run the QC-oriented business-flow pipeline locally

## Canonical flow

```text
specs/  →  normalized corpus  →  spec clarity review  →  .github/prompts/  →  business-flow/<slug>/
```

## Canonical structure

```text
business-flow/<slug>/
├── 01-source/
├── 02-analysis/
├── 03-mermaid/
├── 04-prompts/
└── 10-reports/
```

## Runtime toolchain contract

- `package.json` declares the CLI, build, test, and supported extractor dependencies
- `src/` contains the runtime pipeline and fallback heuristic mode
- prompts in `.github/prompts/` remain the source of truth for LLM instructions
- the tool must support `md`, `txt`, `doc`, `docx`, `pdf`, `xlsx`, `xls`, `csv`, `tsv`, and `json`
- output artifacts must stay under `business-flow/<slug>/`

## Working rules

- read source specs from `specs/`
- write generated artifacts only to `business-flow/<slug>/`
- keep evidence-backed claims only
- never invent actors, steps, branches, or outcomes
- prefer `Unknown / needs confirmation` over guessing
- ask at most 5 clarification questions when critical data is missing
- support `llm`, `heuristic`, and `dry-run` execution modes

## Expected deliverables

- normalized source corpus with line markers
- business-flow document pack with summary, table, narrative, decisions, traceability
- mermaid pack with primary flowchart, optional swimlane, and node traceability
- explicit gaps, questions, and assumptions
- run summary report describing mode, files processed, and generated outputs
