# Repo Boundaries

## This repository is

- a QC-focused spec clarification tool
- a business-flow extraction tool
- a Mermaid generation tool with traceability
- a local-first CLI that turns source specs into reviewable artifact packs

## Allowed scope

- read inputs from `specs/`
- read prompt contracts from `.github/prompts/`
- treat committed runtime logic in `src/` and prompt files in `.github/prompts/` as the source of truth
- improve extraction quality, evidence quality, artifact quality, and final verification quality
- generate outputs only under `business-flow/<slug>/`

## Local-only data rule

- `specs/` is local input data and must stay out of Git
- `business-flow/` is local generated output and must stay out of Git
- `result/` is legacy local output and must stay out of Git
- local `.env` files and personal scratch notes must stay out of committed source by default

## Runtime contract

- `package.json` defines the CLI entry, scripts, and supported extractor dependencies
- `src/` contains the runtime pipeline and fallback heuristic mode
- the tool must support `md`, `markdown`, `txt`, `doc`, `docx`, `pdf`, `xlsx`, `xls`, `csv`, `tsv`, and `json`
- execution modes remain `auto`, `llm`, `heuristic`, and `dry-run`

## Out of scope by default

- product implementation
- generic architecture design
- database work
- API testing packs
- deployment or CI/CD work

## Decision rule

If a task does not directly improve spec clarity, business-flow extraction, traceable Mermaid generation, or final verification, do not expand into it unless the user explicitly asks.
