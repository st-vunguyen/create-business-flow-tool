# Spec Clarity Review Rules

## Extraction checklist

For each spec corpus, try to extract:

- topic and goal
- actors or roles
- trigger or start condition
- ordered business steps
- decisions or branch conditions
- exceptions or alternate flows
- system touchpoints
- expected outcomes

## Ambiguity handling

- If an item is missing, leave it blank or mark `Unknown / needs confirmation`.
- Raise at most 5 clarification questions when ambiguity blocks a trustworthy flow.
- Keep assumptions to the absolute minimum and label them clearly.
- Never convert an assumption into a fact.

## Quality bar

- One business step should describe one business action where possible.
- Decisions should only appear when the source contains an explicit condition.
- Exceptions should only appear when the source mentions a failure or alternate path.
- Narrative text must not introduce new facts beyond the table.
- Final wording must be English only and easy for business stakeholders to review.
