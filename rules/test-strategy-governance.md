# Test Strategy Artifact Rules

## Required artifact set — test-strategy pipeline

```text
test-strategy/<slug>/
├── 01-source/normalized-spec.md
├── 02-strategy/test-strategy-document.md
└── debug/
    ├── coverage-matrix.json
    ├── risk-areas.json
    ├── scenario-seeds.md
    └── run-summary.json
```

## Test strategy document structure (02-strategy)

The `test-strategy-document.md` must contain all 16 sections:

| # | Section | Required |
|---|---|---|
| 0 | Scope | Always |
| 1 | Source | Always |
| 2 | Test Strategy Summary | Always |
| 3 | Test Scope Matrix | Always |
| 4 | Test Cases by Flow | Always |
| 5 | Risk-Based Priority | P0 |
| 6 | Test Data Requirements | P0 |
| 7 | Environment Requirements | P1 |
| 8 | Coverage Gaps | P0 |
| 9 | Out of Scope | Always |
| 10 | Traceability | Always |
| 11 | Assumptions | Always |
| 12 | Questions | Always |
| 13 | Acceptance Criteria | P1 |
| 14 | Regression Checklist | P1 |
| 15 | Validation Report | P0 |

## Test case rules

- Each test case must cite the spec source line it tests.
- Each test case must have: ID, type, precondition, steps, expected result, source evidence.
- Test types allowed only when supported by spec evidence: `unit`, `integration`, `e2e`, `regression`.
- Performance or security test cases only if spec mentions performance/security requirements.
- Never describe test steps that test behavior not stated in the spec.

## Global quality bar

- Output in English only.
- Every test case traceable to source evidence.
- If expected behavior is ambiguous, use `Unknown / needs confirmation` in expected result field.
- Coverage gaps must be explicitly listed — do not silently skip untestable areas.

> **Canonical source:** `rules/test-strategy-governance.md`
