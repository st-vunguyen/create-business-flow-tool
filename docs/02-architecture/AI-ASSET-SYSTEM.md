# AI Asset System

## Overview

The platform's AI behavior is defined by four types of assets, all living in canonical top-level directories:

| Asset type | Directory | Purpose |
|---|---|---|
| Agents | `agents/` | Orchestrator AI personas with mission, rules, and output models |
| Rules | `rules/` | Hard governance constraints shared across pipelines |
| Skills | `skills/` | Reusable extraction and rendering procedures |
| Prompts | `prompts/` | End-user-facing prompt files for AI chat tools |

---

## Agents

Agents are AI persona definitions. Each agent has:
- **Mission** — what it is responsible for
- **Hard rules** — what it must and must not do
- **Output model** — what it produces and in what format
- **CLI command** — how to invoke the TypeScript engine

### Current agents

| Agent | File | Pipeline |
|---|---|---|
| Expert QC Business Flow | `agents/business-flow/expert-qc-business-flow.agent.md` | business-flow |
| Business Flow Verifier | `agents/business-flow/business-flow-verifier.agent.md` | business-flow |
| Expert QC Test Strategy | `agents/test-strategy/expert-qc-test-strategy.agent.md` | test-strategy |

---

## Rules

Rules are hard constraints. They are not suggestions. Agents and skills must follow them.

### Current rules

| Rule file | Applies to |
|---|---|
| `rules/evidence-and-traceability.md` | All pipelines |
| `rules/business-flow-artifacts.md` | Business-flow pipeline |
| `rules/test-strategy-governance.md` | Test-strategy pipeline |
| `rules/repo-boundaries.md` | All pipelines |
| `rules/mermaid-visual-standards.md` | Mermaid generation |
| `rules/spec-clarity-review.md` | Spec intake |

---

## Skills

Skills are reusable procedures that agents invoke. Each skill has a `SKILL.md` with:
- Input/output contract
- Step-by-step procedure
- Quality gates

### Current skills

| Skill | Directory | Purpose |
|---|---|---|
| Spec Intake | `skills/spec-intake/` | Normalize and number source files |
| Analysis Extraction | `skills/analysis-extraction/` | Business-flow 19-section extraction |
| Test Strategy Extraction | `skills/test-strategy-extraction/` | Test-strategy 16-section extraction |
| Mermaid Pack | `skills/mermaid-pack/` | Generate Mermaid diagrams |
| Verification | `skills/verification/` | Final artifact QC |

---

## Prompts

Prompts are the user-facing entry points for AI chat tools. Each prompt file:
- Has a YAML frontmatter `description` for tool autocomplete
- Gives the AI a complete step-by-step workflow
- References the canonical CLI command
- Is mirrored to tool adapter paths by `sync-adapters.mjs`

### Current prompts

| Prompt | File | Mirrors to |
|---|---|---|
| BF: Spec → Analysis | `prompts/business-flow/01-analyze-spec-to-business-flow-documents.prompt.md` | `.github/prompts/` |
| BF: Analysis → Mermaid | `prompts/business-flow/02-convert-business-flow-documents-to-mermaid.prompt.md` | `.github/prompts/` |
| BF: Full pipeline | `prompts/business-flow/03-full-pipeline.prompt.md` | `.github/prompts/` |
| TS: Spec → Strategy | `prompts/test-strategy/01-analyze-spec-to-test-strategy.prompt.md` | `.github/prompts/` |
| TS: Full pipeline | `prompts/test-strategy/02-full-test-strategy-pipeline.prompt.md` | `.github/prompts/` |

---

## How to add a new agent

1. Create `agents/<pipeline>/my-agent.agent.md`
2. Include: mission, hard rules, output model, CLI reference
3. Run `node tools/sync-adapters.mjs` to sync to `.claude/agents/`

## How to add a new rule

1. Create `rules/my-rule.md`
2. Reference it from the relevant agent's "rules" section
3. Run `node tools/sync-adapters.mjs`

## How to add a new prompt

1. Create `prompts/<pipeline>/my-prompt.prompt.md` with YAML frontmatter `description`
2. Run `node tools/sync-adapters.mjs` to mirror to `.github/prompts/`
