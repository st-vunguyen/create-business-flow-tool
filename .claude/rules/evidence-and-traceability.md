```markdown
# Evidence and Traceability Rules

## Evidence-first

- Every extracted fact must come from the provided source corpus.
- If no evidence exists, use `Unknown / needs confirmation`.
- Keep source terminology whenever possible.

## Traceability requirements

- Every business-flow table row must map to source evidence.
- Every Mermaid node or decision must map to source evidence.
- Evidence should reference normalized corpus lines when available.

## Allowed labels

- `Observed`: directly stated in source text
- `Inferred`: only when logically unavoidable from adjacent explicit text, without adding new facts
- `Assumption`: temporary placeholder to unblock output, clearly labeled

## Do not do

- Do not convert assumptions into facts.
- Do not merge separate steps unless the source clearly treats them as one step.
- Do not add hidden branches or exception paths that are not present in the source.

```