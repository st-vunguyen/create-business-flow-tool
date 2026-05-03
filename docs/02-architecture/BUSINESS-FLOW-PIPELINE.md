# Business-Flow Pipeline

## What it does

Takes spec files in `specs/<project>/` and produces a 19-section business-flow analysis pack under `business-flow/<slug>/`.

## Run it

```bash
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
```

## Output structure

```
business-flow/<slug>/
├── 01-source/
│   └── normalized-spec.md       ← numbered corpus (evidence anchor)
├── 02-analysis/
│   └── business-flow-document.md  ← 19-section analysis
├── 03-mermaid/
│   └── business-flow-mermaid.md   ← flowchart + swimlane + state diagram
└── debug/
    ├── validation.json
    ├── permissions.json
    ├── risk.json
    ├── scenario-seeds.md
    ├── analysis.prompt.md
    ├── mermaid.prompt.md
    └── run-summary.json
```

## Pipeline stages

```
specs/<project>/
    │
    ▼  src/core/extractors.ts
    │  Read .md, .txt, .json, .csv, .pdf, .docx, .xlsx
    │  Assign line numbers
    │
    ▼  01-source/normalized-spec.md
    │  Single numbered corpus for all sources
    │
    ▼  src/core/heuristics.ts
    │  Pattern-based extraction:
    │  - actors, steps, decisions, outcomes, touchpoints
    │  - state machine (state-machine.ts)
    │  - permissions (permissions.ts)
    │  - async events (async-model.ts)
    │  - risk scoring (risk.ts)
    │  - scenario seeds (scenario-seeds.ts)
    │  - contradiction detection (contradiction.ts)
    │  - domain pack resolution (domain-packs.ts)
    │
    ▼  src/core/validator.ts
    │  Runs 19 quality checks, scores 0–100
    │
    ▼  src/core/renderers.ts
    │  Renders 19-section Markdown document
    │
    ▼  02-analysis/business-flow-document.md
    │
    ▼  src/core/heuristics.ts (Mermaid pass)
    │  Builds flowchart, swimlane, state diagram
    │
    ▼  03-mermaid/business-flow-mermaid.md
```

## 19 sections

See [../03-how-it-works/19-SECTION-ANALYSIS.md](../03-how-it-works/19-SECTION-ANALYSIS.md).

## AI enrichment

After the heuristic run, use the AI agent to enrich the output:
- **Agent:** `agents/business-flow/expert-qc-business-flow.agent.md`
- **Prompt:** `prompts/business-flow/03-full-pipeline.prompt.md`
- **Claude adapter:** `.claude/agents/expert-qc-business-flow.agent.md`
- **Copilot adapter:** `.github/prompts/03-full-pipeline.prompt.md`
