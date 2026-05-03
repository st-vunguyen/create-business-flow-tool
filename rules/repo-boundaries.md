# Repo Boundaries

> **Applies to:** all agents, all pipelines

## This repository is

- a QC-focused spec clarification tool
- a business-flow extraction pipeline
- a test-strategy extraction pipeline
- a Mermaid generation tool with traceability
- a local-first CLI that turns source specs into reviewable artifact packs

## Allowed scope

- Read inputs from `specs/`
- Read prompt contracts from `prompts/` (canonical) and `.github/prompts/` (Copilot adapter)
- Treat `src/` as the runtime source of truth for heuristic logic
- Improve extraction quality, evidence quality, artifact quality, and verification quality
- Generate business-flow outputs only under `business-flow/<slug>/`
- Generate test-strategy outputs only under `test-strategy/<slug>/`

## Canonical directory rule

| Directory | Role |
|-----------|------|
| `agents/` | Canonical agent definitions (source of truth) |
| `rules/` | Canonical governance rules (source of truth) |
| `skills/` | Canonical skill definitions (source of truth) |
| `prompts/` | Canonical prompt files (source of truth) |
| `.claude/` | Adapter layer — mirrors canonical dirs for Claude Code compatibility |
| `.github/prompts/` | Adapter layer — mirrors prompts/ for GitHub Copilot Chat |

## Local-only data rule

- `specs/` — local input data, stays out of Git
- `business-flow/` — local generated output, stays out of Git
- `test-strategy/` — local generated output, stays out of Git
- `.env` files — stay out of Git

## Out of scope by default

- Product implementation beyond this analysis tool
- Generic architecture design for other systems
- Database schema design
- Deployment or CI/CD work not related to this tool
- Modifying test-strategy artifacts to describe behavior not in the spec

## Decision rule

If a task does not directly improve spec clarity, business-flow extraction, test-strategy extraction, traceable Mermaid generation, or final verification — do not expand into it unless the user explicitly asks.

> **Canonical source:** `rules/repo-boundaries.md`
