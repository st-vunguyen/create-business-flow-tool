# Expert QC Business Flow Skill

## Mission

This skill is for Expert QC work only:

- clarify spec meaning
- identify ambiguity and missing information
- extract a standard business flow
- convert that flow into a traceable Mermaid diagram

## Shared Contract

This file mirrors `.github/testing/SKILL.md`.
Copilot and Claude should follow the same QC-oriented business-flow contract.

## Canonical flow

```text
specs/ → normalized corpus → spec clarity review → business-flow document → Mermaid pack → business-flow/<slug>/
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

## Trigger

Use this skill when asked to:

- read unclear or fragmented specs
- clarify business meaning from source documents
- extract actors, triggers, steps, decisions, and outcomes
- generate business-flow documents with traceability
- generate Mermaid business-flow diagrams from those documents

## Working rules

- read source specs only from `specs/`
- write generated artifacts only to `business-flow/<slug>/`
- preserve source wording where possible
- never invent actors, branches, or outcomes
- prefer `Unknown / needs confirmation` over guessing
- ask at most 5 clarification questions when critical evidence is missing
- support `llm`, `heuristic`, and `dry-run` execution modes

## QC deliverables

- normalized source corpus with line markers
- business-flow document pack with summary, table, narrative, decisions, and traceability
- Mermaid pack with node traceability
- report describing processed files, mode, and open gaps

## Out of scope by default

- product implementation
- API automation packs
- E2E testing assets
- deployment or infrastructure work
