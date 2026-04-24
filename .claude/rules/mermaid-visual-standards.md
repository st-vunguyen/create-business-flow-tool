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
- Follow the class names and init block defined in `src/core/mermaid-style.ts`.
- Use fallback swimlane messaging when ownership evidence is insufficient.

## Required references

- `src/core/mermaid-style.ts`
- `assets/mermaid-icons/`

## Verification rule

- Mermaid labels must not introduce facts, actors, or branch outcomes that the analysis document does not support.
- If swimlane ownership is uncertain, use the fallback note instead of a guessed lane assignment.
