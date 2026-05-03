# Mermaid Pack Skill

## Use this skill when

- Mermaid flowcharts or swimlanes are created, reviewed, or changed
- `src/core/mermaid-style.ts` or Mermaid rendering logic is edited
- Icon tokens are being selected or reviewed

## Goal

Produce Mermaid diagrams that are readable, visually consistent, evidence-backed, and annotated with the correct semantic icon tokens.

## Workflow

1. Start from the analysis document (`02-analysis/business-flow-document.md`), not raw specs
2. Read `## 0) Scope > Domain` to know the business domain for icon selection
3. Apply the exact init block and classDef from `src/core/mermaid-style.ts`
4. Build the primary flowchart (`flowchart TD`)
5. Add swimlane (`flowchart LR`) only when actor ownership is explicit in source
6. Add state diagram (`stateDiagram-v2`) when Section 10 has confirmed states
7. Select semantic icon tokens for major node families
8. Write section traceability for every node and decision

## Icon selection — see `rules/mermaid-visual-standards.md`

Token pattern: `<domain>.<object>.<state>`
Validation: token must exist in `assets/mermaid-icons/library/icon-manifest.json`

> **Canonical source:** `skills/mermaid-pack/SKILL.md`
