# Spec Clarity Review Rules

> **Applies to:** both `business-flow` and `test-strategy` pipelines

## Before writing any artifact

1. Read every file under `specs/<project>/` before starting.
2. Identify source conflicts (same rule stated differently in two files) — log them.
3. Identify gaps (rule referenced but never defined) — log them.
4. Do not start extraction until the full corpus is read.

## During extraction

- One step or one test case per business action — do not compress.
- Do not skip steps or test cases because they "seem obvious."
- If a step cannot be traced to source, mark it as `Unknown / needs confirmation` and log a question.

## Terminology discipline

- Use source terminology, not paraphrased terminology.
- If source uses both English and Japanese/Chinese terms, preserve both.
- Normalize only for sentence structure, not for meaning.

## When the spec is thin

- Do not invent structure to make the document look complete.
- More gaps and questions are better than invented completeness.
- A short honest document is better than a long invented one.

> **Canonical source:** `rules/spec-clarity-review.md`
