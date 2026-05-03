# 16-Section Test Strategy Document

Every test-strategy pipeline run produces a `test-strategy-document.md` with these 16 sections.

| # | Section | Purpose |
|---|---|---|
| 0 | Scope | Topic, goal, domain, source files |
| 1 | Source | Source file inventory |
| 2 | Test Strategy Summary | Counts: TCs, gaps, ACs, regressions, risks |
| 3 | Test Scope Matrix | Per-area in-scope / out-of-scope with rationale |
| 4 | Test Case Catalog | Full TC table: ID, type, flow, precondition, steps, expected result, evidence, priority |
| 5 | Traceability Matrix | TC ID → evidence mapping |
| 6 | Acceptance Criteria | AC ID → feature → criterion → linked TCs → evidence |
| 7 | Coverage Gaps | Behaviors in spec with no TC: gap ID, description, evidence, suggested type, priority |
| 8 | Regression Inventory | Lines referencing regressions, bugs, or existing behaviors |
| 9 | Test Data Requirements | Data fixtures or seeds needed per TC |
| 10 | Environment & Tool Requirements | Hardware, software, network needs |
| 11 | Risk & Priority Assessment | Risk score 0–100, level, evidence |
| 12 | Assumptions | Minimal assumptions only |
| 13 | Questions for Stakeholders | Missing or ambiguous spec text |
| 14 | Contradiction Register | Conflicting behaviors in spec |
| 15 | Verification Checklist | Pass/warn/fail gates for the artifact |

---

## TC ID convention

```
TC-<FLOW-LETTER><nn>-<type>
```

- `<FLOW-LETTER>` — first letter of the source file (e.g. `A` for the first source)
- `<nn>` — zero-padded sequential number per source (01, 02, …)
- `<type>` — one of: `e2e`, `integration`, `unit`, `regression`, `negative`

Examples: `TC-A01-e2e`, `TC-B02-integration`, `TC-C03-negative`

---

## Test type rules

| Type | Use when |
|---|---|
| `e2e` | Spec describes a user-facing happy path with actor, steps, and observable outcome |
| `integration` | Spec describes component interaction, API contract, or message exchange |
| `unit` | Spec describes an isolated rule, formula, or condition |
| `regression` | Spec flags a known bug or explicitly references "existing behavior" |
| `negative` | Spec describes an error branch, rejection condition, or forbidden action |

**Never infer a test type** not supported by the spec text.

---

## Coverage gap convention

A coverage gap is any spec line that:
1. Describes a behavioral requirement (uses must/shall/should/error language)
2. Has no test case generated for it

Gaps are documented in Section 7 with: gap ID (`GAP-nn`), description, evidence, suggested test type, and priority.
