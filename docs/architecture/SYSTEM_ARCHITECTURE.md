# System Architecture
## Business Flow Tool

## 1. Architecture goal

The architecture is designed to support one clear mission:

> ingest mixed specification files, extract a trustworthy business-flow representation, and render review-ready Markdown and Mermaid artifacts.

The repository is intentionally spec-first, artifact-oriented, and traceability-driven.

## 2. Architectural principles

### 2.1 Evidence first

Everything starts from source files under `specs/<project>/`.

Generated artifacts must remain traceable to those sources.

### 2.2 Heuristic core first

The current production path is centered on heuristic TypeScript logic in `src/core/`.

This gives the repository:

- deterministic local behavior
- predictable outputs
- easier testability
- less dependence on external services

### 2.3 Prompt contracts are source-of-truth assets

Prompt files in `.github/prompts/` are versioned alongside the codebase.

They define how an AI-assisted pass should behave, but they do not replace the deterministic pipeline.

### 2.4 Main outputs vs debug outputs

The architecture intentionally separates:

- primary review artifacts in `01-source/`, `02-analysis/`, `03-mermaid/`
- supporting audit/debug artifacts in `debug/`

This keeps the main output clean while preserving reproducibility.

## 3. Runtime flow

The end-to-end runtime path is:

1. read source specs
2. normalize them into a numbered corpus
3. build a heuristic analysis artifact
4. run validation against that artifact
5. render the analysis document
6. render the Mermaid document
7. write supporting debug artifacts

## 4. Module map

### 4.1 Entry points

#### `src/cli.ts`

Owns the CLI surface.

Main commands:

- `run`
- `doctor`

#### `src/pipeline.ts`

Owns orchestration of a full run.

Responsibilities:

- resolve paths and slug
- create output directories
- call extraction and rendering logic
- write both primary and debug artifacts
- return the run summary object

### 4.2 Core extraction and analysis

#### `src/core/extractors.ts`

Reads and normalizes mixed-format spec files.

#### `src/core/heuristics.ts`

Builds the main `AnalysisArtifact` and `MermaidArtifact` heuristically.

This is the heart of the repository today.

#### `src/core/state-machine.ts`

Extracts states, transitions, rollback paths, and Mermaid state diagrams.

#### `src/core/permissions.ts`

Builds the permission matrix and detects conflicts and gaps.

#### `src/core/async-model.ts`

Detects async events, callback patterns, retry hints, and external dependencies.

#### `src/core/risk.ts`

Calculates heuristic risk hotspots and a weighted risk score.

#### `src/core/scenario-seeds.ts`

Generates scenario seeds for happy path, edge cases, abuse/failure, and regression.

#### `src/core/contradiction.ts`

Detects conflicting access rules and conflicting numeric constraints.

#### `src/core/validator.ts`

Runs structured validation checks over analysis and Mermaid artifacts.

### 4.3 Rendering and prompt preparation

#### `src/core/renderers.ts`

Renders the main Markdown artifacts.

#### `src/core/prompts.ts`

Loads committed prompts from `.github/prompts/` and expands them into runtime snapshots stored in `debug/`.

#### `src/core/llm.ts`

Contains the scaffolding for OpenAI-compatible chat-completions usage and mode resolution.

### 4.4 Shared contracts and helpers

#### `src/types.ts`

Defines the canonical TypeScript interfaces for the pipeline.

This is the central contract file for:

- run options
- extracted sources
- analysis artifacts
- Mermaid artifacts
- validation, risk, state, permissions, async, scenarios, contradictions

#### `src/core/utils.ts`

Provides shared utility functions used across the pipeline.

## 5. Output architecture

For each project slug:

```text
business-flow/<slug>/
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

### Primary artifact intent

- `01-source/` → traceable source normalization
- `02-analysis/` → human-readable business reasoning
- `03-mermaid/` → human-readable diagrams and diagram metadata

### Debug artifact intent

- `*.prompt.md` → runtime prompt snapshots
- `validation.json` → machine-readable checks
- `permissions.json` → machine-readable ACL summary
- `risk.json` → machine-readable risk summary
- `scenario-seeds.md` → QA-oriented extracted scenarios
- `run-summary.json` → automation and scripting manifest

## 6. Prompt and agent architecture

### `.github/prompts/`

Contains committed prompt contracts:

- `01-analyze-spec-to-business-flow-documents.prompt.md`
- `02-convert-business-flow-documents-to-mermaid.prompt.md`
- `03-full-pipeline.prompt.md`

These are not ephemeral run outputs. They are part of the source-controlled behavior of the repository.

### `.claude/`

Contains repo-local assistant guidance:

- rules
- skills
- agents

Important roles:

- analyst / extraction guidance
- verifier guidance
- business-flow-specific constraints

## 7. Icon subsystem

The repository uses a semantic icon layer for Mermaid-oriented outputs.

Key assets:

- `assets/mermaid-icons/semantic-icon-taxonomy.json`
- `assets/mermaid-icons/library/icon-manifest.json`
- `assets/mermaid-icons/library/`
- `docs/icons/`

The architecture separates:

- Mermaid text rendering
- icon selection metadata
- physical SVG export assets

This keeps Mermaid compatible while allowing richer downstream exports.

## 8. Current strengths

The current architecture is strong at:

- local deterministic runs
- traceable normalization
- structured Markdown outputs
- Mermaid generation with standards
- debug artifact separation
- testable TypeScript modules

## 9. Current constraints

The current architecture still has limits.

Examples:

- rule extraction is still heuristic, not ontology-backed
- flow graph reasoning is still shallower than a full production-grade reasoning engine
- LLM mode scaffolding exists, but the heuristic path remains the most dependable operational path

These limitations are intentional to document honestly. They do not reduce the current usefulness of the tool as a QC-oriented business-flow generator.

## 10. Extension points

The cleanest extension points are:

- `src/types.ts` for schema evolution
- `src/core/heuristics.ts` for richer extraction logic
- specialized `src/core/*.ts` modules for domain reasoning
- `.github/prompts/` for AI-assisted refinement contracts
- `.claude/` for assistant behavior and verification rules

## 11. Reading order for engineers

If you want to understand the codebase from top to bottom, read in this order:

1. `src/cli.ts`
2. `src/pipeline.ts`
3. `src/types.ts`
4. `src/core/heuristics.ts`
5. specialized modules in `src/core/`
6. `src/core/renderers.ts`
7. `.github/prompts/`
8. `.claude/`
