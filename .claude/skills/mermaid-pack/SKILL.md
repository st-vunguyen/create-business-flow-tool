# Mermaid Pack Skill

## Use this skill when

- Mermaid flowcharts or swimlanes are created, reviewed, or changed
- `src/core/mermaid-style.ts` or Mermaid rendering logic is edited
- the user asks for better visual consistency or node traceability

## Goal

Produce Mermaid diagrams that are readable, visually consistent, and traceable back to source evidence.

## Workflow

1. Start from the analysis artifact, not directly from raw specs.
2. Keep the primary flow in `flowchart TD`.
3. Generate swimlanes only when actor ownership is explicit enough.
4. Reuse the shared init block, class definitions, and icon references.
5. Preserve node traceability for every process or decision node.
