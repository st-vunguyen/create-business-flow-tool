# EXECUTION-LIFECYCLE.md — Pipeline Execution Lifecycle

This document describes precisely what happens during a `runPipeline()` call, in execution order.

---

## Phase 0: Initialization

**Triggered by:** `pnpm run tool -- run --spec-dir <path> --slug <slug> --mode <mode>`

**Entrypoint:** `src/cli.ts` → `runPipeline()` in `src/pipeline.ts`

Actions:
1. `slug` is resolved from `--slug` or from the last path segment of `--spec-dir`, then `slugify()`'d.
2. `mode` is resolved: if `auto`, checks `process.env.OPENAI_API_KEY` → picks `llm` or `heuristic`.
3. `outputRoot` is resolved as `business-flow/<slug>/`.
4. Output directories are created (via `ensureDir()`):
   - `01-source/`
   - `02-analysis/`
   - `03-mermaid/`
   - `debug/`
   - `04-per-flow/` (only if `--per-flow` is set)

---

## Phase 1: Source extraction

**Module:** `src/core/extractors.ts`

1. `discoverSpecFiles(specDir)` — uses `fast-glob` to find all files matching supported extensions recursively under `specDir`.
2. For each file, `extractSource()` is called:
   - Extension is resolved.
   - `readContent()` dispatches to the correct reader:
     - `.md`, `.markdown`, `.txt` → UTF-8 read
     - `.json` → `JSON.parse` + re-stringify (normalized)
     - `.docx` → `mammoth` raw text extraction
     - `.doc` → `textutil -convert txt` (macOS only)
     - `.pdf` → `pdf-parse` buffer extraction
     - `.xlsx`, `.xls`, `.csv`, `.tsv` → `xlsx` to markdown table format
   - `normalizeWhitespace()` strips `\r`, tabs, and trailing spaces.
   - `numberLines()` produces `SourceLine[]` and `numberedContent` (`L1: text`).
3. Results are sorted by `relativePath` and returned as `ExtractedSource[]`.

**Error condition:** If no files are found in `specDir`, the pipeline throws immediately.

---

## Phase 2: Corpus normalization

**Module:** `src/core/prompts.ts`

1. `renderNormalizedCorpus(specRoot, sources)` produces a single Markdown document:
   - Header with `spec root` and `total files`.
   - One section per source file, prefixed with `## Source File: <relativePath>`.
   - Each section contains the `numberedContent` of that file.
2. The corpus is written to `01-source/normalized-spec.md`.

This file is the **single evidence anchor** for the entire pipeline. Every downstream reference traces back to a line in this file.

---

## Phase 3: Prompt composition

**Module:** `src/core/prompts.ts`

1. `loadPromptPair()` reads prompt 01 and prompt 02 from `.github/prompts/`.
2. `composeAnalysisPrompt()` injects:
   - The prompt 01 text
   - Runtime context: `SPEC_ROOT`, `OUTPUT_ROOT`, `RUN_MODE`, `NORMALIZED_CORPUS`
   - Source file listing
   - Normalized corpus body
   - Instruction: "Read the normalized corpus file above and generate the final markdown only."
3. The composed analysis prompt is written to `debug/analysis.prompt.md`.

In `dry-run` mode, execution stops after this phase.

---

## Phase 4a: Heuristic analysis (mode = heuristic)

**Module:** `src/core/heuristics.ts` — `buildHeuristicAnalysis()`

This is the core extraction pipeline. It runs entirely locally, with no external calls.

### Step 4a.1 — Candidate line collection

`collectCandidateLines(sources)` flattens all `SourceLine[]` from all sources into a single `CandidateLine[]`, filtering out lines shorter than 3 characters.

### Step 4a.2 — Structured section extraction

`extractStructuredFlowData(sources)` scans each source line-by-line tracking the current heading section. Lines under headings named `goal`, `actors`, `steps`, `touchpoints`, `outcomes` are collected separately.

### Step 4a.3 — Spreadsheet metadata extraction

`buildStepMetadataMap(sources)` reads tabular blocks from spreadsheet sources. It looks for columns named `step`, `touchpoint`, and `outcome` and builds a lookup map keyed by normalized action text.

### Step 4a.4 — Step building

`buildSteps()` selects the step source (structured steps → explicit list items → candidate lines). Capped at **20 steps**. For each line:
- `resolveActor()` + `extractActor()` determine the actor.
- `resolveStepMetadata()` enriches with spreadsheet-sourced touchpoint and outcome.
- `DECISION_PATTERN`, `OUTCOME_PATTERN`, `EXCEPTION_PATTERN` detect decision/outcome/notes.
- `summarizeSentence()` produces concise labels.

### Step 4a.5 — Domain resolution and gap taxonomy

`resolveBusinessDomain()` matches against 15 domain patterns. `loadDomainPack()` retrieves the matching domain pack. `buildTypedGaps()` generates `GapItem[]` from the extracted content. `getDomainGapItems()` appends domain-specific required gap checks.

### Step 4a.6 — Analytical engines (run in order)

| Engine | Function | Output |
|---|---|---|
| State machine | `extractStateMachine()` | `StateMachine` with up to 15 states |
| Permissions | `extractPermissions()` | `PermissionMatrix` |
| Async events | `extractAsyncEvents()` | `AsyncEvent[]`, `ExternalDependency[]` |
| Contradictions | `detectContradictions()` | `ContradictionItem[]` |
| Gap enrichment | `dedupeGapItems()` + `buildDerivedGapsFromAnalysis()` | Enriched `GapItem[]` |
| Risk scoring | `scoreRisks()` | `RiskScore` (0–100 weighted) |
| Scenario seeds | `generateScenarioSeeds()` | `ScenarioSeed[]` (up to 20) |
| Data contracts | `extractDataFormats()` | `DataContract[]` |
| Implementation constraints | `extractImplementationNotes()` | `ImplementationConstraint[]` |

### Step 4a.7 — Return

Returns a fully populated `AnalysisArtifact`.

---

## Phase 4b: LLM analysis (mode = llm)

**Module:** `src/core/llm.ts`

1. The analysis prompt composed in Phase 3 is sent to OpenAI's `chat/completions` endpoint.
2. Model defaults to `gpt-4.1-mini`. Configurable via `OPENAI_MODEL`.
3. Temperature is `0.1` for determinism.
4. The response content is used directly as `analysisMarkdown`.

Note: LLM mode does **not** call the heuristic engine. The heuristic analysis artifact is built first for corpus normalization but the LLM provides the final analysis document.

---

## Phase 5: Validation

**Module:** `src/core/validator.ts`

1. `runValidation(analysis, mermaid)` runs 15+ structured checks across the `AnalysisArtifact`.
2. Returns `ValidationResult` with individual `ValidationCheck[]` items (pass/warn/fail) and a 0–100 score.
3. The result is merged into `heuristicAnalysis.validationResult`.

See `docs/reference/VALIDATION-GOVERNANCE.md` for the full check list.

---

## Phase 6: Analysis rendering

**Module:** `src/core/renderers.ts`

`renderAnalysisMarkdown(analysis, normalizedCorpusPath, specRoot)` renders all 19 sections to Markdown:

- Sections 0–8: summary fields, table, narrative, decisions, traceability, questions, assumptions
- Sections 9–16: gap taxonomy, state machine, permissions, async events, risk, scenarios, contradictions, validation
- Section 17: checklist
- Section 18: data contracts
- Section 19: implementation constraints

Written to `02-analysis/business-flow-document.md`.

---

## Phase 7: Mermaid prompt composition

`composeMermaidPrompt()` injects the analysis document into prompt 02. Written to `debug/mermaid.prompt.md`.

---

## Phase 8: Mermaid artifact build

**Module:** `src/core/heuristics.ts` — `buildHeuristicMermaid()`

1. `buildFlowchartDiagram()` — produces `flowchart TD` with:
   - Start/End nodes
   - Step nodes (`N1` … `Nn`)
   - Decision diamonds (`D1` … `Dn`)
   - Exception nodes (`E1` … `En`)
   - Happy path edges (blue), neutral edges (slate), exception edges (red dashed)
2. `buildSwimlaneDiagram()` — produces `flowchart LR` with one subgraph per actor. Each subgraph is styled using the `MERMAID_SWIMLANE_PALETTE` (6 alternating colors).
3. `buildSemanticIconSelections()` — resolves up to 8 `domain.object.state` tokens from step content.
4. `buildTraceability()` — maps each node ID to its evidence line.

Rendered by `renderMermaidMarkdown()` to a 9-section Mermaid pack.

Written to `03-mermaid/business-flow-mermaid.md`.

---

## Phase 9: Debug artifact writes

Written in parallel:

| File | Content |
|---|---|
| `debug/validation.json` | `ValidationResult` JSON |
| `debug/permissions.json` | `PermissionMatrix` JSON |
| `debug/risk.json` | `RiskScore` JSON |
| `debug/scenario-seeds.md` | Scenario seed table Markdown |

---

## Phase 10: Run summary

`debug/run-summary.json` is written as a `RunResult` JSON containing all output paths, mode, slug, and processed file list.

This file is the canonical audit trail for the run.

---

## Lifecycle diagram

```
CLI args
  │
  ▼
Phase 0: Init         → create output dirs
Phase 1: Extract      → ExtractedSource[]
Phase 2: Corpus       → normalized-spec.md
Phase 3: Prompt       → debug/analysis.prompt.md
  │
  ├── [dry-run] STOP
  │
Phase 4: Analyze      → AnalysisArtifact
Phase 5: Validate     → ValidationResult merged
Phase 6: Render       → 02-analysis/business-flow-document.md
Phase 7: Mermaid prompt → debug/mermaid.prompt.md
Phase 8: Mermaid build  → 03-mermaid/business-flow-mermaid.md
Phase 9: Debug writes   → debug/*.json + scenario-seeds.md
Phase 10: Summary       → debug/run-summary.json
  │
  ▼
RunResult returned to caller / printed to stdout
```
