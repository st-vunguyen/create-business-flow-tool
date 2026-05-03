# Documentation Index

Complete documentation for this **spec-first analysis platform** — reads your spec files and produces traceable, evidence-backed business-flow analysis and test strategy documents.

The repo-level [README](../README.md) is the quick start. This page is the deep-dive index.

> **New to this repo?** Start with [01-vision/WHAT-IS-THIS.md](01-vision/WHAT-IS-THIS.md).

## docs/ structure

```
docs/
├── README.md                          ← you are here
├── 01-vision/
│   ├── WHAT-IS-THIS.md               ← problem, users, design philosophy
│   └── DESIGN-PRINCIPLES.md          ← evidence-first, vendor-agnostic, spec-only
├── 02-architecture/
│   ├── PLATFORM-ARCHITECTURE.md      ← manifest, canonical dirs, adapter pattern
│   ├── BUSINESS-FLOW-PIPELINE.md     ← end-to-end business-flow pipeline
│   ├── TEST-STRATEGY-PIPELINE.md     ← end-to-end test-strategy pipeline (NEW)
│   └── AI-ASSET-SYSTEM.md            ← agents / rules / skills / prompts explained
├── 03-how-it-works/
│   ├── HEURISTIC-ENGINE.md           ← how heuristics.ts works
│   ├── 19-SECTION-ANALYSIS.md        ← what each analysis section means
│   ├── 16-SECTION-TEST-STRATEGY.md   ← what each test-strategy section means (NEW)
│   ├── MERMAID-GENERATION.md         ← how Mermaid artifacts are built
│   └── SYNC-ADAPTERS.md              ← how tool adapters are generated (NEW)
├── reference/                         ← contracts, governance, lifecycle
├── icons/                             ← Mermaid icon catalog and visual standard
└── ROADMAP.md
```

---

## Start here (recommended reading order)

| Step | File | What you learn |
|---|---|---|
| 1 | [requirements/PRODUCT_REQUIREMENT_DOCUMENT.md](requirements/PRODUCT_REQUIREMENT_DOCUMENT.md) | What problem the tool solves, who it is for, what outputs it produces |
| 2 | [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) | Repository structure, runtime pipeline, module dependencies |
| 3 | [UNIVERSAL_USAGE_GUIDELINES.md](UNIVERSAL_USAGE_GUIDELINES.md) | How to prepare specs, run the tool, read outputs, iterate |
| 4 | [WORKFLOWS.md](WORKFLOWS.md) | Step-by-step workflows for analysts, CI, LLM enrichment, verifiers |
| 5 | [ROADMAP.md](ROADMAP.md) | What is implemented today, what is planned, known limitations |

---

## What lives where

### Architecture

| File | Description |
|---|---|
| [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) | System architecture, principles, module graph, runtime data flow, heuristic engine design |

### Reference (technical specifications)

| File | Description |
|---|---|
| [reference/CONTRACTS.md](reference/CONTRACTS.md) | Every TypeScript interface in `src/types.ts` documented |
| [reference/EXECUTION-LIFECYCLE.md](reference/EXECUTION-LIFECYCLE.md) | The 10-phase pipeline lifecycle: phases, inputs, outputs, error conditions |
| [reference/PIPELINES.md](reference/PIPELINES.md) | All 4 execution modes, optional flags, heuristic engine internals, domain packs |
| [reference/INTEROPERABILITY-STANDARD.md](reference/INTEROPERABILITY-STANDARD.md) | External integration rules: file intake, LLM API contract, Mermaid output, CI, gitignore |
| [reference/VALIDATION-GOVERNANCE.md](reference/VALIDATION-GOVERNANCE.md) | All validation checks (C1–C15, M1–M3), scoring formula, governance rules |
| [reference/RECOVERY-POLICY.md](reference/RECOVERY-POLICY.md) | Failure categories, error messages, recovery steps, validation thresholds |

### Usage and planning

| File | Description |
|---|---|
| [UNIVERSAL_USAGE_GUIDELINES.md](UNIVERSAL_USAGE_GUIDELINES.md) | Day-to-day usage guide |
| [WORKFLOWS.md](WORKFLOWS.md) | End-to-end workflows for the analyst, CI gate, LLM enrichment, verifier |
| [ROADMAP.md](ROADMAP.md) | Product roadmap, current capabilities, planned improvements |

### Mermaid icon system

| File | Description |
|---|---|
| [icons/mermaid-visual-standard.md](icons/mermaid-visual-standard.md) | Canonical visual standard: palette, CSS classes, swimlane colors, style rules |
| [icons/mermaid-icon-guidelines.md](icons/mermaid-icon-guidelines.md) | Rules for selecting and using semantic icon tokens |
| [icons/mermaid-icon-library.md](icons/mermaid-icon-library.md) | Full token library listing with domain groupings |
| [icons/mermaid-icon-catalog.md](icons/mermaid-icon-catalog.md) | Catalog with usage examples |
| [icons/mermaid-icon-gallery.md](icons/mermaid-icon-gallery.md) | Visual gallery (Markdown) |
| `icons/mermaid-icon-gallery.html` | Visual gallery (HTML) |

### Implementation plan and requirements

| File | Description |
|---|---|
| [implement-plan/implement-plan.md](implement-plan/implement-plan.md) | Long-term product and engineering direction |
| [implement-plan/implement-plan-assessment.md](implement-plan/implement-plan-assessment.md) | Current maturity vs. target capability model |
| [requirements/PRODUCT_REQUIREMENT_DOCUMENT.md](requirements/PRODUCT_REQUIREMENT_DOCUMENT.md) | Full product requirements document |

---

## Root-level files (not in `docs/`)

| File | Description |
|---|---|
| [../README.md](../README.md) | Quick-start guide, command reference, output structure |
| [../AGENTS.md](../AGENTS.md) | Canonical instructions for AI agents operating in this repo |
| [../CLAUDE.md](../CLAUDE.md) | Claude-specific behavior rules (extends `AGENTS.md`) |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Development setup, how to add engines and domain packs, PR checklist |

---

## Folder map

```text
docs/
├── README.md                               ← this file
├── ROADMAP.md                              ← product roadmap
├── WORKFLOWS.md                            ← end-to-end workflows
├── UNIVERSAL_USAGE_GUIDELINES.md           ← day-to-day usage
├── architecture/
│   └── ARCHITECTURE.md                     ← system architecture
├── reference/
│   ├── CONTRACTS.md
│   ├── EXECUTION-LIFECYCLE.md
│   ├── INTEROPERABILITY-STANDARD.md
│   ├── PIPELINES.md
│   ├── RECOVERY-POLICY.md
│   └── VALIDATION-GOVERNANCE.md
├── icons/
│   ├── mermaid-visual-standard.md
│   ├── mermaid-icon-guidelines.md
│   ├── mermaid-icon-library.md
│   ├── mermaid-icon-catalog.md
│   ├── mermaid-icon-gallery.md
│   └── mermaid-icon-gallery.html
├── implement-plan/
│   ├── implement-plan.md
│   └── implement-plan-assessment.md
└── requirements/
    └── PRODUCT_REQUIREMENT_DOCUMENT.md
```

---

## Documentation principles

Every doc in this folder follows these rules:

- describe the repository **as it works today**, separating current behavior from future intent
- use **precise file paths** and source-of-truth references over vague descriptions
- prefer short tables and concrete examples over long prose
- keep the reading path easy for new contributors

If you find a stale reference, prefer fixing the doc to working around it.
