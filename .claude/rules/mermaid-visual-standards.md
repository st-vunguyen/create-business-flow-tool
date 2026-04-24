# Mermaid Visual Standards Rule

## Scope

Apply this rule whenever the task creates, reviews, or edits Mermaid business-flow diagrams.

## Required standards

- Output must be English only.
- Labels must be concise, business-friendly, and evidence-backed.
- Use `flowchart TD` for the primary flow.
- Use `flowchart LR` for swimlanes when actor ownership is explicit.
- Use a consistent class system for start/end, process, decision, exception, external, and note nodes.
- Use a restrained color palette with semantic meaning.
- Do not use emoji or playful labels.
- Keep the main flow visually dominant and easy to follow.

## Required references

- `docs/mermaid-visual-standard.md`
- `docs/mermaid-icon-library.md`
- `assets/mermaid-icons/`

## Compatibility rule

Keep Mermaid diagrams text-first for renderer compatibility. SVG icons are companion assets for exported documentation and design-system use unless the runtime explicitly supports Mermaid image or icon nodes.
