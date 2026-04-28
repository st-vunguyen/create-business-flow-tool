# Business Flow Tool

Turn messy specifications into a traceable business-flow document pack and Mermaid diagram pack.

This repository is a **spec-first QC and analysis tool** for teams who need to understand business behavior before implementation. It reads mixed-format source files from `specs/`, normalizes them into an evidence-backed corpus, extracts a structured business flow, and renders review-friendly Markdown plus Mermaid outputs.

## Why this repository exists

Real-world requirements rarely arrive as one clean PRD. They are usually spread across:

- product documents
- meeting notes
- spreadsheets
- API contracts
- PDFs and Word files
- clarification files added later

This tool helps convert that fragmented input into a consistent artifact pack that answers questions such as:

- what starts the flow?
- who does what?
- what decisions and exception paths exist?
- what states and permissions matter?
- where are the gaps, risks, and contradictions?

## What you get

For each run, the repository produces three primary artifacts:

- `business-flow/<slug>/01-source/normalized-spec.md`
- `business-flow/<slug>/02-analysis/business-flow-document.md`
- `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`

It also writes supporting audit and runtime artifacts under:

- `business-flow/<slug>/debug/`

## Quick example

```text
specs/sample/
  checkout-flow.md
  touchpoints.csv

↓

business-flow/sample/
├── 01-source/
│   └── normalized-spec.md
├── 02-analysis/
│   └── business-flow-document.md
├── 03-mermaid/
│   └── business-flow-mermaid.md
└── debug/
    ├── analysis.prompt.md
    ├── mermaid.prompt.md
    ├── validation.json
    ├── permissions.json
    ├── risk.json
    ├── scenario-seeds.md
    └── run-summary.json
```

## Core capabilities

- normalize multi-format spec inputs into a numbered source corpus
- extract a structured business-flow analysis artifact
- generate Mermaid flow diagrams from that analysis
- surface validation, permissions, risk, and scenario-supporting artifacts
- keep outputs traceable to the source material
- support semantic icon metadata for Mermaid-oriented outputs

## Supported input formats

- `md`, `markdown`, `txt`
- `doc`, `docx`
- `pdf`
- `xlsx`, `xls`, `csv`, `tsv`
- `json`

## How the pipeline works

```text
specs/
  ↓
normalized source corpus
  ↓
business-flow analysis
  ↓
Mermaid diagram pack
  ↓
debug and validation artifacts
```

Canonical flow:

```text
specs/ -> business-flow/<slug>/01-source -> business-flow/<slug>/02-analysis -> business-flow/<slug>/03-mermaid
```

## Installation

`node_modules/` and `dist/` are intentionally not committed.

- `node_modules/` is recreated from `package.json` and `pnpm-lock.yaml`
- `dist/` is generated automatically by the `prepare` script during `pnpm install`

From a fresh clone:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run doctor
```

If `corepack` is already enabled on your machine, `pnpm install --frozen-lockfile` is enough.

## Quick start

1. Put your source material under `specs/<project>/`
2. Use the repository prompt with `Copilot Chat` or `Claude`
3. Let the assistant run the workflow and produce the artifact pack under `business-flow/<slug>/`

That is the default user experience. The assistant should handle the intermediate steps.

## Start in one command

If you want to run the local pipeline yourself, this is the main command:

```bash
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
```

If you prefer the built artifact after install, use the compiled CLI because `pnpm install` generates `dist/` automatically:

```bash
pnpm run tool:dist -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
```

For a quick runtime summary:

```bash
pnpm run doctor
```

## Advanced CLI usage

Use `docs/UNIVERSAL_USAGE_GUIDELINES.md` for:

- all CLI modes and options
- `auto`, `heuristic`, `llm`, and `dry-run`
- detailed output interpretation
- iteration and review guidance

## Execution modes

- `heuristic`: local deterministic pipeline, no API key required
- `auto`: resolves to `llm` when `OPENAI_API_KEY` is present, otherwise falls back to `heuristic`
- `llm`: uses an OpenAI-compatible chat completions configuration
- `dry-run`: prepares normalized inputs and prompt/debug artifacts without a full final generation path

## Using `Copilot Chat` or `Claude`

If you already work inside `Copilot Chat`, `Claude`, or a similar agentic coding assistant, you usually do **not** need these environment variables.

The intended experience is:

1. put specs in `specs/<project>/`
2. give one short instruction to the assistant
3. the assistant runs the pipeline, reads the artifacts, applies the prompts, performs verification, and leaves the final outputs in `business-flow/<slug>/`

The repository is designed so the assistant handles the intermediate steps for you.

### Recommended instruction for `Copilot Chat` or `Claude`

Use a short instruction like this:

```text
Run the full business-flow pipeline for `specs/<project>` and produce the final artifact pack under `business-flow/<slug>/`.
Use the repository prompts, rules, and verifier automatically. Do the intermediate steps yourself and only return the final status, key gaps, and output paths.
```

### Best practice when using assistants

- keep your human instruction short
- let the assistant run `heuristic`, inspect artifacts, apply prompts, and verify results on its own
- treat `01-source/normalized-spec.md` as the evidence anchor whenever reviewing output quality
- only ask for manual deep review when you intentionally want to override the default autonomous run

Optional `llm` configuration is documented in `docs/UNIVERSAL_USAGE_GUIDELINES.md`.

## Understanding the output pack

| Output | Purpose |
|---|---|
| `01-source/normalized-spec.md` | Traceable normalized source corpus |
| `02-analysis/business-flow-document.md` | Main business-flow analysis document |
| `03-mermaid/business-flow-mermaid.md` | Main Mermaid diagram pack |
| `debug/` | Supporting validation, risk, permissions, scenarios, and prompt snapshots |

Use the first three as the primary review pack. Use `debug/` only when you need deeper audit, automation, or prompt inspection.

## Project structure

```text
src/                         # CLI and runtime pipeline
src/core/                    # extractors, heuristics, renderers, validators, risk, permissions, async modeling
specs/                       # local input specs (gitignored)
business-flow/               # local generated artifacts (gitignored)
tests/fixtures/specs/sample/ # sample specs for smoke tests
docs/                        # onboarding, requirements, architecture, implementation plan, icon guidance
.github/prompts/             # prompt source of truth
.claude/                     # repo-local business-flow rules, skills, agents
```

## Development commands

```bash
pnpm run lint
pnpm run build
pnpm run test
```

## Extractor notes

- `.docx` uses `mammoth`
- `.pdf` uses `pdf-parse`
- `.xlsx`, `.xls`, `.csv`, `.tsv` use `xlsx`
- `.doc` uses `textutil` on macOS

## Documentation map

If you are new to the repository, read these next:

1. `docs/README.md`
2. `docs/requirements/PRODUCT_REQUIREMENT_DOCUMENT.md`
3. `docs/architecture/SYSTEM_ARCHITECTURE.md`
4. `docs/UNIVERSAL_USAGE_GUIDELINES.md`
5. `docs/implement-plan/implement-plan.md`
6. `docs/implement-plan/implement-plan-assessment.md`

## Visual standards and icon system

Key references:

- `docs/icons/mermaid-icon-library.md`
- `docs/icons/mermaid-icon-guidelines.md`
- `docs/icons/mermaid-icon-catalog.md`
- `docs/icons/mermaid-icon-gallery.md`
- `docs/icons/mermaid-icon-gallery.html`
- `assets/mermaid-icons/semantic-icon-taxonomy.json`
- `assets/mermaid-icons/library/`

Generated business-flow and Mermaid artifacts should remain English-only, easy to review, visually consistent, and semantically traceable.

## Local-only directories

- `specs/` is local input only and must not be pushed
- `business-flow/` is local generated output only and must not be pushed
- `.gitignore` enforces both conventions for normal local use

## Current product stance

Today, the strongest path is the local heuristic pipeline plus clear prompt contracts and debug artifacts. The repository already works well as a **spec-to-business-flow QC tool**, while the longer-term roadmap continues to push toward deeper reasoning and richer analysis.
