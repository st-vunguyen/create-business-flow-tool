# ARCHITECTURE.md — Business Flow Tool

## 1. Mission

The architecture supports one clear, bounded mission:

> Ingest mixed-format specification files → normalize them into a numbered evidence corpus → extract a trustworthy business-flow representation → render review-ready Markdown and Mermaid artifacts.

The system is intentionally **spec-first**, **artifact-oriented**, and **traceability-driven**.

---

## 2. Architectural principles

### 2.1 Evidence first

Every output element — every actor, step, decision, touchpoint, outcome, gap, risk, and Mermaid node — must be traceable to a line in `01-source/normalized-spec.md`. Nothing is invented.

### 2.2 Heuristic core, LLM optional

The primary execution path uses deterministic TypeScript logic in `src/core/`. This gives:

- reproducible outputs with no external service dependency
- fast local execution and test coverage
- consistent behavior across CI environments

LLM enrichment is an optional, additive layer. When `OPENAI_API_KEY` is present and `--mode auto` or `--mode llm` is used, the pipeline delegates analysis generation to the LLM using a versioned prompt contract. The heuristic engine still runs first to produce the normalized corpus and the debug prompt.

### 2.3 Prompt contracts are first-class assets

Prompt files in `.github/prompts/` are versioned alongside source code. They define the exact behavior expected of any AI-assisted pass. They are not templates — they are specifications.

### 2.4 Primary vs debug outputs

The architecture separates:

- **Primary review artifacts** in `01-source/`, `02-analysis/`, `03-mermaid/`
- **Supporting audit artifacts** in `debug/`

This keeps the main output clean while preserving full reproducibility and traceability.

---

## 3. Repository layout

```text
src/
  cli.ts                     # Commander.js CLI entrypoint
  index.ts                   # Public re-exports
  pipeline.ts                # Top-level orchestrator
  types.ts                   # All canonical TypeScript interfaces
  ambient.d.ts               # Module declarations for untyped packages
  core/
    extractors.ts            # Multi-format file reading and corpus normalization
    heuristics.ts            # Business-flow extraction + Mermaid artifact build
    renderers.ts             # Markdown rendering for all 19 sections
    validator.ts             # Structured validation (15+ checks, scored 0–100)
    risk.ts                  # Weighted risk scoring (7 categories, 0–100 scale)
    permissions.ts           # Role-action-access matrix extraction
    async-model.ts           # Async event and external dependency detection
    state-machine.ts         # State node and transition extraction
    contradiction.ts         # Conflicting rule detection across files
    scenario-seeds.ts        # Test scenario seed generation (4 kinds)
    domain-packs.ts          # Domain-specific gap checks and failure patterns
    mermaid-style.ts         # Visual palette, CSS init block, icon constants
    prompts.ts               # Corpus rendering and prompt composition
    llm.ts                   # OpenAI API adapter
    utils.ts                 # Shared: slugify, titleCase, dedupe, numberLines, etc.

.github/prompts/
  01-analyze-spec-to-business-flow-documents.prompt.md
  02-convert-business-flow-documents-to-mermaid.prompt.md
  03-full-pipeline.prompt.md

assets/mermaid-icons/
  library/                   # Physical SVG files (domain/token.svg)
  icon-manifest.json         # Token manifest
  semantic-icon-taxonomy.json

docs/
  README.md                  # Documentation index
  ROADMAP.md                 # Product roadmap
  WORKFLOWS.md               # End-to-end usage workflows
  UNIVERSAL_USAGE_GUIDELINES.md
  architecture/
    ARCHITECTURE.md          # This file
  reference/
    CONTRACTS.md             # TypeScript interface specifications
    EXECUTION-LIFECYCLE.md   # 10-phase pipeline lifecycle
    INTEROPERABILITY-STANDARD.md
    PIPELINES.md             # Execution modes and internals
    RECOVERY-POLICY.md       # Failure handling and recovery
    VALIDATION-GOVERNANCE.md # Validation checks and scoring
  icons/
    mermaid-visual-standard.md
    mermaid-icon-guidelines.md
    mermaid-icon-library.md
    mermaid-icon-catalog.md
    mermaid-icon-gallery.md / .html
  implement-plan/
  requirements/

tests/
  pipeline.test.ts           # End-to-end smoke test (Node.js built-in test runner)
  fixtures/specs/sample/     # Sample spec files for smoke test

tools/
  generate-semantic-icon-library.mjs  # Regenerates SVG icon library from taxonomy
```

---

## 4. Runtime data flow

```
CLI (cli.ts)
  │
  ▼
runPipeline() — pipeline.ts
  │
  ├─ 1. Slug and output directory resolution
  │       outputRoot = business-flow/<slug>/
  │       Dirs: 01-source, 02-analysis, 03-mermaid, debug (+ 04-per-flow if --per-flow)
  │
  ├─ 2. Source extraction — extractors.ts
  │       discoverSpecFiles()  → glob all supported extensions
  │       extractSource()      → readContent() per file type
  │                           → normalizeWhitespace()
  │                           → numberLines()         → SourceLine[]
  │       Output: ExtractedSource[]
  │
  ├─ 3. Corpus normalization — prompts.ts
  │       renderNormalizedCorpus()  → numbered Markdown
  │       Write: 01-source/normalized-spec.md
  │
  ├─ 4. Analysis prompt composition — prompts.ts
  │       composeAnalysisPrompt()   → inject corpus into prompt 01
  │       Write: debug/analysis.prompt.md
  │
  ├─ 5a. Heuristic analysis — heuristics.ts
  │       buildHeuristicAnalysis()
  │         collectCandidateLines()       → flat CandidateLine[]
  │         extractStructuredFlowData()  → goal, actors, steps, touchpoints, outcomes
  │         buildStepMetadataMap()       → spreadsheet-sourced step metadata
  │         buildSteps()                → BusinessFlowStep[] (up to 20)
  │         resolveBusinessDomain()     → domain string
  │         loadDomainPack()            → DomainPack with gap checks
  │         buildTypedGaps()            → GapItem[]
  │         extractStateMachine()       → StateMachine
  │         extractPermissions()        → PermissionMatrix
  │         extractAsyncEvents()        → AsyncEvent[], ExternalDependency[]
  │         detectContradictions()      → ContradictionItem[]
  │         dedupeGapItems()            → enriched GapItem[]
  │         scoreRisks()               → RiskScore (0–100 weighted)
  │         generateScenarioSeeds()    → ScenarioSeed[] (up to 20)
  │         extractDataFormats()        → DataContract[]
  │         extractImplementationNotes() → ImplementationConstraint[]
  │       Output: AnalysisArtifact
  │
  ├─ 5b. LLM analysis (optional, mode=llm) — llm.ts
  │       runLlmPrompt()  → POST to OpenAI chat/completions
  │       Output: raw Markdown string
  │
  ├─ 6. Validation — validator.ts
  │       runValidation(analysis, mermaid)  → ValidationResult
  │       15+ structured checks, scored 0–100
  │       Merged into AnalysisArtifact.validationResult
  │
  ├─ 7. Rendering — renderers.ts
  │       renderAnalysisMarkdown()  → 19-section Markdown
  │       Write: 02-analysis/business-flow-document.md
  │
  ├─ 8. Mermaid artifact build — heuristics.ts
  │       buildHeuristicMermaid()
  │         buildFlowchartDiagram()       → flowchart TD
  │         buildSwimlaneDiagram()        → flowchart LR (actor swimlanes)
  │         buildSemanticIconSelections() → MermaidIconSelection[] (up to 8)
  │         buildTraceability()           → MermaidNodeTrace[]
  │       renderMermaidMarkdown()  → 9-section Mermaid pack
  │       Write: 03-mermaid/business-flow-mermaid.md
  │
  ├─ 9. Debug artifact writes
  │       debug/validation.json
  │       debug/permissions.json
  │       debug/risk.json
  │       debug/scenario-seeds.md
  │       debug/mermaid.prompt.md
  │
  └─ 10. Run summary
         debug/run-summary.json  → RunResult
```

---

## 5. Module dependency graph

```
cli.ts
  └─ pipeline.ts
       ├─ extractors.ts     (no local deps except types, utils)
       ├─ heuristics.ts
       │    ├─ extractors.ts
       │    ├─ mermaid-style.ts
       │    ├─ state-machine.ts  → mermaid-style, utils
       │    ├─ permissions.ts    → utils
       │    ├─ async-model.ts    → utils
       │    ├─ risk.ts
       │    ├─ scenario-seeds.ts
       │    ├─ contradiction.ts
       │    └─ domain-packs.ts
       ├─ renderers.ts      (imports types only, no core peers)
       ├─ validator.ts      (imports types only)
       ├─ prompts.ts        → utils
       └─ llm.ts            (no local deps)
```

There are no circular dependencies. `types.ts` is imported by all modules but imports nothing from `src/`.

---

## 6. Heuristic extraction engine — design decisions

### Step extraction priority

1. Explicitly structured section named `Steps` or `steps` in the spec
2. Lines matching list syntax (`-`, `*`, `1.`, `1)`)
3. Any candidate lines (fallback, limited to 8)

Capped at **20 steps** per flow.

### Actor resolution

Explicit section `Actors` takes priority. Falls back to inline role-keyword matching (`admin`, `user`, `customer`, `staff`, etc.). Capped at 6 actors.

### Domain resolution

15 domain patterns matched against the combined corpus (topic + goal + trigger + outcomes + touchpoints + actors). First match wins. Falls back to `operations`.

### Risk scoring

7 category detectors each produce `RiskItem[]` scored 0–10. A weighted sum across categories produces a total 0–100 score with level: `low / medium / high / critical`.

| Category | Weight |
|---|---|
| payment-flow | 20 |
| async-dependency | 18 |
| permission-gap | 16 |
| missing-recovery | 16 |
| external-coupling | 14 |
| exception-density | 10 |
| state-ambiguity | 6 |

---

## 7. Icon system

The semantic icon system uses a `domain.object.state` token format:

- **domain**: resolved from the flow (e.g., `commerce`, `finance`, `identity`)
- **object**: resolved from step content (e.g., `order`, `payment`, `user`)
- **state**: resolved from step outcome/decision (e.g., `submitted`, `approved`, `rejected`)

Physical SVG files are stored at `assets/mermaid-icons/library/<domain>/<token>.svg`.

The heuristic engine selects up to 8 icon tokens per artifact.

---

## 8. Prompt contract architecture

The three prompt files define behavior for three distinct concerns:

| Prompt | Concern |
|---|---|
| `01-analyze-spec-to-business-flow-documents.prompt.md` | What a 19-section analysis document must contain |
| `02-convert-business-flow-documents-to-mermaid.prompt.md` | What a Mermaid diagram pack must contain |
| `03-full-pipeline.prompt.md` | How an autonomous agent should orchestrate the full run |

These are not generation prompts used at runtime. They are **behavioral specifications** that define the exact expected output for both the heuristic renderer and any LLM-assisted pass.

---

## 9. Local-only data policy

- `specs/` — gitignored. Input specs stay local to the analyst.
- `business-flow/` — gitignored. Generated artifacts are local QC outputs, not committed outputs.

This is enforced in `.gitignore`. Neither path should ever be pushed to the remote.
