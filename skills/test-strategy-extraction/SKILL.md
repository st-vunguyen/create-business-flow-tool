# Test Strategy Extraction Skill

## Use this skill when

- The task produces test cases from a spec corpus
- The 16-section test-strategy document is being generated or reviewed
- `src/core/test-strategy-heuristics.ts` needs change

## Goal

Turn numbered source evidence into a complete, evidence-backed test strategy without inventing behavior or test cases.

## Canonical schema extracted

| Schema object | Contents |
|--------------|----------|
| `goal`, `actors`, `domain` | From explicit text only |
| `TestCase[]` | One test case per testable spec behavior: ID, type, precondition, steps, expected result, evidence |
| `TestScopeEntry[]` | Feature × test-type × priority derived from spec structure |
| `RiskArea[]` | Risk areas that drive test priority (derived from spec gaps and explicit risk statements) |
| `CoverageGap[]` | Features or behaviors that cannot be tested given current spec completeness |
| `AcceptanceCriteria[]` | WHEN condition + THEN expected output — both from spec, not invented |
| `RegressionItem[]` | Critical flows that must not regress — traced to spec invariants or NEVER/ALWAYS rules |
| `TestDataRequirement[]` | Input states, boundary values, edge-case data — derived from spec states and constraints |
| `ValidationResult` | Checks with pass/warn/fail and score |

## Workflow

1. Start from numbered lines in `01-source/normalized-spec.md`
2. Identify business domain and product under test
3. Identify all testable behaviors: explicit outcomes, decision branches, error paths, state transitions
4. For each testable behavior, write one test case with source citation
5. Derive risk-based priority: behaviors with HIGH risk hotspots → must-test P0
6. Identify coverage gaps: ambiguous expected outcomes, missing state definitions, no error behavior specified
7. Extract acceptance criteria only from spec-stated outcomes — do not invent
8. Extract regression items from NEVER/ALWAYS/WARNING constraints and known failure modes
9. Render all 16 sections to `02-strategy/test-strategy-document.md`
10. Write `debug/coverage-matrix.json`, `debug/risk-areas.json`, `debug/scenario-seeds.md`, `debug/run-summary.json`

## Test case ID convention

```
TC-<FLOW-LETTER><zero-padded-number>-<type>
Examples: TC-A01-e2e, TC-B03-integration, TC-E02-regression
```

## Test types and when to use each

| Type | Use when |
|------|----------|
| `e2e` | Full user flow is described end-to-end |
| `integration` | Two components interact at a defined interface |
| `unit` | A single rule or constraint is stated precisely |
| `regression` | A NEVER/ALWAYS/WARNING constraint or known-failure-mode is described |
| `negative` | An explicit invalid path or error condition is described |

> **Canonical source:** `skills/test-strategy-extraction/SKILL.md`
