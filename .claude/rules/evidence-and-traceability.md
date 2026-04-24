# Evidence and Traceability Rules

## Evidence-first

- Every extracted fact must come from the provided source corpus.
- If no evidence exists, use `Unknown / needs confirmation`.
- Keep source terminology whenever possible.

## Traceability requirements

- Every business-flow table row must map to source evidence.
- Every Mermaid node or decision must map to source evidence.
- Evidence should reference normalized corpus lines when available.
- Preserve the original relative file path in evidence strings.
- Prefer `relativePath L<line>: excerpt` formatting for consistency with numbered corpus output.

## Allowed labels

- `Observed`: directly stated in source text.
- `Inferred`: only when logically unavoidable from adjacent explicit text, without adding new facts.
- `Assumption`: temporary placeholder to unblock output, clearly labeled.

## Do not do

- Do not convert assumptions into facts.
- Do not merge separate steps unless the source clearly treats them as one step.
- Do not add hidden branches or exception paths that are not present in the source.
- Do not fabricate ownership just to enable swimlane output.
- Do not collapse multiple source files into a single fake source citation.

## Verification focus

- A verifier should be able to trace each row and Mermaid node back to the corpus without guessing.
- If traceability is weak, fail verification and state the missing evidence explicitly.
