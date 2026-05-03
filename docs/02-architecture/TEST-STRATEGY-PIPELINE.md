# Test-Strategy Pipeline

## What it does

Takes spec files in `specs/<project>/` and produces a 16-section test strategy document under `test-strategy/<slug>/`.

This pipeline is **fully independent** of the business-flow pipeline. It shares only the normalized corpus format and the evidence rules.

## Run it

```bash
pnpm run tool -- test-strategy --spec-dir specs/<project> --slug <slug> --mode heuristic
```

## Output structure

```
test-strategy/<slug>/
├── 01-source/
│   └── normalized-spec.md           ← numbered corpus (evidence anchor)
├── 02-strategy/
│   └── test-strategy-document.md    ← 16-section test strategy
└── debug/
    ├── test-cases.json
    ├── coverage-gaps.json
    ├── risks.json
    └── run-summary.json
```

## Pipeline stages

```
specs/<project>/
    │
    ▼  src/core/extractors.ts
    │  Same extractor as business-flow pipeline
    │
    ▼  01-source/normalized-spec.md
    │
    ▼  src/core/test-strategy-heuristics.ts
    │  Pattern-based extraction:
    │  - test cases (step-like lines → TC-<FLOW><nn>-<type>)
    │  - test scope entries (one per source file)
    │  - coverage gaps (acceptance lines with no TC)
    │  - acceptance criteria (must/shall/should lines)
    │  - regression items (regression/bug keywords)
    │  - test data requirements (fixture/seed keywords)
    │  - environment requirements (hardware/tool keywords)
    │  - risks (gaps × priority)
    │
    ▼  src/core/test-strategy-renderers.ts
    │  Renders 16-section Markdown document
    │
    ▼  02-strategy/test-strategy-document.md
```

## 16 sections

See [../03-how-it-works/16-SECTION-TEST-STRATEGY.md](../03-how-it-works/16-SECTION-TEST-STRATEGY.md).

## TC ID convention

`TC-<FLOW-LETTER><nn>-<type>`

Examples: `TC-A01-e2e`, `TC-B02-integration`, `TC-C03-negative`

- Flow letter: derived from first letter of the source file
- nn: sequential per source file
- type: `e2e`, `integration`, `unit`, `regression`, `negative`

## AI enrichment

After the heuristic run, use the AI agent to enrich the output:
- **Agent:** `agents/test-strategy/expert-qc-test-strategy.agent.md`
- **Prompt:** `prompts/test-strategy/02-full-test-strategy-pipeline.prompt.md`

## What this pipeline does NOT do

- It does not suggest architecture changes
- It does not write production code
- It does not add test cases for behaviors not in the spec
- It does not combine output with the business-flow pipeline
