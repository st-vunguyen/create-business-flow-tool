# Repo Boundaries

## This repository is

- a QC-focused spec clarification tool
- a business-flow extraction tool
- a Mermaid generation tool with traceability

## Allowed scope

- read inputs from `specs/`
- read prompt contracts from `.github/prompts/`
- update tool runtime in `src/`, `tests/`, `README.md`, `docs/`, and Claude support files when needed
- generate outputs only under `business-flow/<slug>/`

## Local-only data rule

- `specs/` is local input data and must stay out of Git
- `business-flow/` is local generated output and must stay out of Git
- committed source of truth belongs in source code, prompts, rules, tests, and documentation only

## Out of scope by default

- frontend or backend product implementation
- database schema design or migrations
- API automation packs and performance testing assets
- deployment, infrastructure, or CI/CD changes

## Decision rule

If a task does not directly improve spec clarity, business-flow extraction, or traceable diagram generation, do not expand into it unless the user explicitly asks.
