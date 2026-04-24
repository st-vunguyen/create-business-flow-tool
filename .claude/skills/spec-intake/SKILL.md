# Spec Intake Skill

## Use this skill when

- the task starts from raw files in `specs/` or `tests/fixtures/specs/`
- the user asks what the source corpus contains
- extraction quality depends on understanding file types, headings, or spreadsheet structure

## Goal

Create a trustworthy view of the input corpus before any business-flow interpretation begins.

## Workflow

1. Identify the spec root and file mix.
2. Confirm each file type is supported by `src/core/extractors.ts`.
3. Prefer normalized text with numbered lines for downstream evidence.
4. Note empty, malformed, or unsupported inputs without inventing replacements.
5. Preserve relative file paths because traceability depends on them.

## Runtime handoff

- prompts in `.github/prompts/` remain the source of truth for LLM instructions
- normalized corpus is the handoff point into analysis and Mermaid generation
- supported source extensions are `md`, `markdown`, `txt`, `doc`, `docx`, `pdf`, `xlsx`, `xls`, `csv`, `tsv`, and `json`
