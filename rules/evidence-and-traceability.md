# Evidence and Traceability Rules

> **Applies to:** both `business-flow` and `test-strategy` pipelines

## Evidence-first

- Every extracted fact must come from the provided source corpus.
- If no evidence exists, use `Unknown / needs confirmation`.
- Keep source terminology whenever possible.

## Traceability requirements

- Every business-flow table row must map to source evidence.
- Every test case must map to source evidence.
- Every Mermaid node or decision must map to source evidence.
- Evidence should reference normalized corpus lines: `relativePath L<line>: excerpt`

## Allowed labels

| Label | When to use |
|-------|-------------|
| `Observed` | Directly stated in source text |
| `Inferred` | Logically unavoidable from adjacent explicit text — no new facts added |
| `Assumption` | Temporary placeholder to unblock output, clearly labeled |

## Do not do

- Do not convert assumptions into facts.
- Do not merge separate steps unless the source clearly treats them as one.
- Do not add hidden branches or exception paths not present in source.
- Do not fabricate ownership just to enable swimlane output.
- Do not invent test cases for scenarios not described in the spec.
- Do not collapse multiple source files into a single fake citation.

## Verification focus

A verifier must be able to trace each row, test case, and Mermaid node back to the corpus without guessing. If traceability is weak, fail verification and state the missing evidence explicitly.

> **Canonical source:** `rules/evidence-and-traceability.md`
