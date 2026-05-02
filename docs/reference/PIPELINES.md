# PIPELINES.md — Execution Modes and Pipeline Details

This document describes each execution mode, its behavior, use cases, and trade-offs.

---

## 1. Mode overview

| Mode | Command flag | External dependency | Output |
|---|---|---|---|
| `heuristic` | `--mode heuristic` | None | Full artifact pack (deterministic) |
| `llm` | `--mode llm` | `OPENAI_API_KEY` | Full artifact pack (LLM-generated analysis) |
| `auto` | `--mode auto` | Optional | `llm` if key present, else `heuristic` |
| `dry-run` | `--mode dry-run` | None | Corpus + analysis prompt only |

---

## 2. Heuristic mode

### Overview

The primary production path. Runs entirely locally with no external service calls.

### What it does

1. Extracts and normalizes all spec files into a numbered corpus.
2. Runs the full heuristic analysis engine (`buildHeuristicAnalysis()`).
3. Runs the validation engine against the analysis output.
4. Renders all 19 sections to Markdown.
5. Builds flowchart, swimlane, and state diagram Mermaid outputs.
6. Writes all primary and debug artifacts.

### Strengths

- Fully deterministic. Same input always produces the same output.
- Fast. No network latency.
- No API cost.
- Suitable for CI.

### Limitations

- Quality ceiling is bounded by pattern matching. Nuanced language and deeply nested requirements may not be fully captured.
- Step count limited to 20 per flow.
- Actor detection relies on keyword matching (15+ role keywords).
- Domain resolution uses first-match against 15 patterns.

### When to use

- Default choice for all local and CI runs.
- When reproducibility and speed are the priority.
- As the baseline before an LLM-enriched pass.

---

## 3. LLM mode

### Overview

Uses OpenAI's chat completions API to generate the analysis document from the composed analysis prompt.

### What it does

1. Runs Phase 1–3 of the heuristic pipeline (extraction, corpus, prompt composition).
2. Sends the composed analysis prompt to the LLM.
3. Writes the LLM response directly as `02-analysis/business-flow-document.md`.
4. Composes the Mermaid prompt and writes `debug/mermaid.prompt.md`.
5. Note: the Mermaid diagram is still produced by the **heuristic** engine (`buildHeuristicMermaid()`), not the LLM. The current LLM mode does not produce Mermaid from the LLM's analysis.

### Configuration

```bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4.1-mini   # optional
export OPENAI_BASE_URL=https://... # optional, for compatible providers
```

### Prompt contract

The LLM receives `.github/prompts/01-analyze-spec-to-business-flow-documents.prompt.md` enriched with runtime context and the full normalized corpus. The system message instructs: "Return only the final markdown artifact requested."

### Model behavior

- Temperature: `0.1` (near-deterministic)
- The model is expected to produce a `MODE=technical` Markdown document matching the 19-section spec in prompt 01.

### Strengths

- Can capture nuanced language, ambiguous intent, and cross-paragraph inference.
- Better at identifying implicit actors and unstated decisions.
- May surface higher-quality narrative and questions.

### Limitations

- Requires internet access and API key.
- Response quality depends on model and prompt version.
- Not deterministic — same input may produce slightly different output on repeated runs.
- Incurs API cost.

### When to use

- When spec quality is high but content is complex, verbose, or deeply nested.
- As a second-pass enrichment after a heuristic run.
- When section 7 (Questions) quality matters and needs human-level inference.

---

## 4. Auto mode

Selects the execution mode at runtime:

```
OPENAI_API_KEY set → llm
OPENAI_API_KEY not set → heuristic
```

Implemented in `src/core/llm.ts` as `resolveExecutionMode("auto")`.

Use `auto` in shared environments where the key may or may not be present (e.g., shared scripts used by both local developers and CI).

---

## 5. Dry-run mode

### What it does

Runs only the corpus normalization and prompt composition phases:

1. Extracts and normalizes spec files.
2. Renders and writes the normalized corpus.
3. Composes and writes the analysis prompt to `debug/analysis.prompt.md`.
4. Composes and writes the Mermaid prompt to `debug/mermaid.prompt.md`.

No analysis document, Mermaid file, or debug JSON artifacts are produced.

### When to use

- To preview what the LLM would receive before running the actual LLM call.
- To inspect and manually review the normalized corpus.
- To test spec file discovery without running the full pipeline.
- To generate the prompt payload for manual submission to an LLM interface.

---

## 6. Optional flags

### `--no-swimlane`

Skips `buildSwimlaneDiagram()`. The flowchart TD diagram is still produced. The Mermaid pack Section 6 will contain a fallback note instead of the swimlane diagram.

Use when:
- Actor ownership is ambiguous or unpopulated.
- The spec describes a single-actor flow.
- Swimlane rendering is causing layout issues in your Mermaid viewer.

### `--per-flow`

Creates the `04-per-flow/` output directory in the output root.

Currently reserves the directory for per-sub-flow diagram output. The directory is created but no additional files are written by the current heuristic engine. This flag is reserved for future per-sub-flow rendering.

---

## 7. The heuristic analysis engine — internals

The heuristic engine operates in three logical layers:

### Layer 1: Content extraction

| Function | Role |
|---|---|
| `collectCandidateLines()` | Flat pool of all content lines |
| `extractStructuredFlowData()` | Section-aware extraction (goal, actors, steps, etc.) |
| `buildStepMetadataMap()` | Spreadsheet touchpoint/outcome enrichment |

### Layer 2: Flow assembly

| Function | Role |
|---|---|
| `buildSteps()` | Assembles up to 20 `BusinessFlowStep[]` |
| `buildNarrativeSentence()` | Natural language step description |
| `buildTypedGaps()` | Gap items from content analysis |
| `getDomainGapItems()` | Domain pack required gap checks |

### Layer 3: Analytical sub-engines

Each sub-engine is a separate module with a single public function:

| Module | Function | Output type |
|---|---|---|
| `state-machine.ts` | `extractStateMachine()` | `StateMachine` |
| `permissions.ts` | `extractPermissions()` | `PermissionMatrix` |
| `async-model.ts` | `extractAsyncEvents()` | `{ asyncEvents, externalDependencies }` |
| `contradiction.ts` | `detectContradictions()` | `ContradictionItem[]` |
| `risk.ts` | `scoreRisks()` | `RiskScore` |
| `scenario-seeds.ts` | `generateScenarioSeeds()` | `ScenarioSeed[]` |
| `extractors.ts` | `extractDataFormats()` | `DataContract[]` |
| `extractors.ts` | `extractImplementationNotes()` | `ImplementationConstraint[]` |

### Layer 4: Rendering

`src/core/renderers.ts` consumes the complete `AnalysisArtifact` and produces Markdown. It has no dependencies on analysis engines — all logic is rendering only.

---

## 8. Domain packs

Five domain packs are defined in `src/core/domain-packs.ts`:

| Pack name | Display name | Trigger keywords |
|---|---|---|
| `payments` | Payments & Billing | payment, charge, refund, invoice, billing, wallet, settlement |
| `auth` | Authentication & Identity | login, authenticate, token, session, mfa, oauth, role, identity |
| `fulfillment` | Order Fulfillment & Shipping | shipment, delivery, warehouse, dispatch, carrier, pack |
| `cms` | Content Management | publish, draft, content, document, article, approval |
| `default` | General Operations | (fallback when no domain matches) |

Each pack provides:
- `knownFailurePatterns`: risk-awareness text
- `knownBusinessRules`: rules agents should flag if violated
- `riskKeywords`: words that increase risk scores in this domain
- `requiredGapChecks`: typed `GapItem[]` automatically injected when the pack is active

Domain resolution uses `resolveBusinessDomain()` which matches the combined corpus text against 15 patterns (first match wins). The resolved domain is stored in `AnalysisArtifact.domain` and the pack name in `AnalysisArtifact.domainPack`.
