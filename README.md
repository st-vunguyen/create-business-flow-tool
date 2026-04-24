# Business Flow Tool

This CLI reads source specifications from `specs/`, normalizes multiple document formats, generates a `Business Flow Document Pack`, and converts that analysis into a `Mermaid Diagram Pack`.

## Supported input formats

- `md`, `markdown`, `txt`
- `doc`, `docx`
- `pdf`
- `xlsx`, `xls`, `csv`, `tsv`
- `json`

## Pipeline

```text
specs/ -> business-flow/<slug>/01-source/normalized-spec.md -> business-flow/<slug>/02-analysis/business-flow-document.md -> business-flow/<slug>/03-mermaid/business-flow-mermaid.md
```

## Output structure

```text
business-flow/<slug>/
├── 01-source/
├── 02-analysis/
├── 03-mermaid/
├── 04-prompts/
└── 10-reports/
```

## Execution modes

- `auto`: uses `llm` when `OPENAI_API_KEY` is available, otherwise falls back to `heuristic`
- `llm`: calls an OpenAI-compatible chat completions API
- `heuristic`: runs locally with no API key
- `dry-run`: generates only the normalized corpus and prompt artifacts

## Installation

```bash
pnpm install
```

## Main commands

```bash
pnpm run tool -- doctor
pnpm run tool -- run --spec-dir specs --slug my-flow --output-root business-flow --mode auto
pnpm run tool -- run --spec-dir specs --slug my-flow --output-root business-flow --mode heuristic
pnpm run tool -- run --spec-dir specs --slug my-flow --output-root business-flow --mode dry-run
```

## Environment variables for `llm`

```bash
export OPENAI_API_KEY="<your-key>"
export OPENAI_MODEL="gpt-4.1-mini"
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

## Build and test

```bash
pnpm run lint
pnpm run build
pnpm run test
```

## Extractor notes

- `.docx` uses `mammoth`
- `.pdf` uses `pdf-parse`
- `.xlsx/.xls/.csv/.tsv` use `xlsx`
- `.doc` uses `textutil` on macOS

## Visual standards

- `docs/mermaid-visual-standard.md`
- `docs/mermaid-icon-library.md`
- `assets/mermaid-icons/`

All generated business-flow and Mermaid artifacts must be English only, easy to review, and visually consistent.

## Local-only paths

- `specs/` is local input only and is gitignored.
- `business-flow/` is local generated output only and is gitignored.
- `result/` is also gitignored for backward compatibility with older local runs.

## Prompt source of truth

- `.github/prompts/01-analyze-spec-to-business-flow-documents.prompt.md`
- `.github/prompts/02-convert-business-flow-documents-to-mermaid.prompt.md`

## Test fixture

- `tests/fixtures/specs/sample/` contains a sample flow for the heuristic smoke test
