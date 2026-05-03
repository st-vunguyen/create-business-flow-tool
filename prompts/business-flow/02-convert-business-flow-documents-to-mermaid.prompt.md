---
description: "Convert a completed 19-section business-flow analysis document into a full Mermaid diagram pack: main flowchart, swimlane, and state diagram."
tools: ['edit', 'search']
---

# Prompt 02 — Business Flow Document → Mermaid Pack

## Mission

Read `business-flow/<slug>/02-analysis/business-flow-document.md` and produce a review-ready Mermaid pack at `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`.

## Rules

1. Every node and edge must trace to a row in Section 3 of the analysis document
2. Never add nodes, actors, or branches that are not in the analysis document
3. Swimlane only when actor ownership is explicitly stated in source
4. State diagram only when Section 10 has confirmed states and transitions

## Required diagram sections

### Section 1 — Main flowchart (`flowchart TD`)

- Covers the full end-to-end flow from Section 3
- Uses the exact init block from `rules/mermaid-visual-standards.md`
- Uses classDef: `startEnd`, `process`, `decision`, `exception`, `external`, `note`
- Happy path links: `stroke:#2563EB,stroke-width:2.5px`
- Exception links: `stroke:#DC2626,stroke-width:2px,stroke-dasharray: 4 2`
- Select ≥3 semantic icon tokens: `domain.object.state` from `assets/mermaid-icons/library/icon-manifest.json`

### Section 2 — Swimlane (`flowchart LR`)

- Group nodes by actor from Section 3
- Each actor gets a subgraph lane
- Only include if actor ownership is explicit

### Section 3 — State diagram (`stateDiagram-v2`)

- Translate Section 10 state machine directly
- Include all transitions with guards labeled
- Use `direction LR` for clarity

### Section 4 — Traceability

- Table: node ID → analysis Section 3 row → source evidence

## Verify before output

- [ ] Init block matches `src/core/mermaid-style.ts` exactly
- [ ] All classDef classes present
- [ ] ≥3 semantic tokens validated against `icon-manifest.json`
- [ ] No nodes invented beyond analysis document

> **Canonical source:** `prompts/business-flow/02-convert-business-flow-documents-to-mermaid.prompt.md`
> Tool adapter: `.github/prompts/02-convert-business-flow-documents-to-mermaid.prompt.md`
