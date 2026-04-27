# Product Requirement Document
## Business Flow Tool

## 1. Purpose

The Business Flow Tool exists to turn messy, multi-format specifications into a reviewable, traceable business-flow artifact set.

Its purpose is not to replace the original specification. Its purpose is to make the specification easier to understand, validate, discuss, and refine.

## 2. Problem statement

Real-world requirements are often fragmented across:

- PRDs
- meeting notes
- API contracts
- spreadsheets
- docs and PDFs
- ad hoc clarification files

This makes it hard to answer basic questions consistently:

- what starts the flow?
- who does what?
- what decisions exist?
- what happens on failure?
- which permissions matter?
- what states can the business entity move through?
- which parts are still unclear?

The repository solves this by creating a consistent business-flow package from the source evidence.

## 3. Primary users

The repository is built for:

- business analysts
- QC / QA analysts
- solution designers
- product managers clarifying requirements
- engineers who need a reliable functional summary before implementation

## 4. Core value proposition

The tool should help a user go from:

> “I have messy requirements and I do not trust my understanding of the flow.”

to:

> “I now have a traceable source corpus, a structured business-flow document, and a diagram pack I can review with confidence.”

## 5. Primary outputs

### User-facing outputs

- `01-source/normalized-spec.md`
- `02-analysis/business-flow-document.md`
- `03-mermaid/business-flow-mermaid.md`

### Supporting outputs

Grouped under `debug/`:

- `analysis.prompt.md`
- `mermaid.prompt.md`
- `validation.json`
- `permissions.json`
- `risk.json`
- `scenario-seeds.md`
- `run-summary.json`

## 6. Functional requirements

### 6.1 Input normalization

The system must:

- read spec files from `specs/<project>/`
- support mixed input formats
- normalize them into a single numbered corpus with source traceability

### 6.2 Business-flow extraction

The system must produce a structured analysis with:

- topic and goal
- actors and roles
- trigger and outcomes
- business-flow steps
- decisions and exceptions
- questions and assumptions
- gap taxonomy
- state machine
- permissions
- async events
- risk hotspots
- scenario seeds
- contradictions
- validation report

### 6.3 Diagram generation

The system must produce Mermaid artifacts with:

- consistent visual standards
- traceable nodes
- optional swimlanes
- optional state diagrams
- semantic icon-token metadata

### 6.4 Auditability

The system must also expose machine-readable supporting artifacts for:

- validation
- risk
- permissions
- scenario seeds
- prompt/runtime inspection

## 7. Non-goals

This repository does not aim to:

- generate product implementation code
- replace the original specification repository
- invent missing requirements automatically
- claim business certainty where evidence does not exist

## 8. Quality requirements

All generated outputs should follow these rules:

- English only
- evidence-backed claims
- clear separation between fact and uncertainty
- no unsupported actors, branches, or rules
- explicit `Unknown / needs confirmation` when evidence is insufficient

## 9. Output contract

The main analysis document should be understandable by a human reviewer without opening the codebase.

The main Mermaid document should be understandable by a visual reviewer without needing to infer hidden semantics.

The `debug/` folder should help advanced users, auditors, or agents inspect how the outputs were derived.

## 10. Current product stance

Today, the strongest and most trustworthy path is:

- deterministic normalization
- heuristic analysis
- Mermaid rendering
- optional prompt-assisted enrichment using the committed prompt contracts

This means the product is already useful as a spec-to-artifact QC tool, even though some deeper reasoning ambitions are still evolving.

## 11. Success criteria

The repository is successful when a new user can:

1. place source files under `specs/<project>/`
2. run a single command
3. understand the resulting flow from the three primary outputs
4. identify important gaps and risks without reading raw specs line by line
5. trace every major claim back to the normalized source corpus

## 12. Acceptance criteria for a good run

A run is considered good when:

- `normalized-spec.md` is complete and readable
- `business-flow-document.md` contains all required sections
- `business-flow-mermaid.md` reflects the analysis accurately
- validation and risk artifacts exist in `debug/`
- unresolved ambiguity is surfaced explicitly rather than hidden

## 13. Future direction

The long-term direction is to push the repository closer to a full Business Flow AI Kit with stronger:

- rule extraction
- state reasoning
- permission analysis
- async reasoning
- contradiction detection
- domain packs
- quality scoring

That roadmap is detailed in `docs/implement-plan/implement-plan.md` and assessed in `docs/implement-plan/implement-plan-assessment.md`.
