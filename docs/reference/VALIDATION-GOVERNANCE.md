# VALIDATION-GOVERNANCE.md — Validation Engine Rules and Scoring

This document defines every validation check implemented in `src/core/validator.ts`, its pass/warn/fail conditions, and the scoring model.

---

## 1. Scoring model

```
score = Math.round((passCount / totalChecks) * 100)
```

Only `pass` results contribute to the score. `warn` and `fail` both reduce the score.

The total number of checks varies based on whether a `MermaidArtifact` is provided. When running `heuristic` mode with both analysis and Mermaid, the full check set applies.

---

## 2. Score thresholds

| Score | Level | Interpretation |
|---|---|---|
| 90–100 | Excellent | Artifact is fully review-ready |
| 70–89 | Good | Minor gaps; artifact is usable |
| 50–69 | Marginal | Material gaps; address FAIL items before use |
| 0–49 | Poor | Spec is too sparse or malformed; enrich and re-run |

---

## 3. Analysis checks

### C1 — Goal is defined

| Status | Condition |
|---|---|
| `pass` | `analysis.goal` does not contain "unknown" or "needs confirmation" |
| `fail` | Goal contains "unknown" or "needs confirmation" |

**Fix:** Add a `## Goal` section to the spec with a clear statement of the business objective.

---

### C2 — Actors are defined

| Status | Condition |
|---|---|
| `pass` | At least one actor that does not contain "unknown" |
| `fail` | No actors, or all actors contain "unknown" |

**Fix:** Add an `## Actors` section listing all roles and systems involved.

---

### C3 — Trigger is defined

| Status | Condition |
|---|---|
| `pass` | `analysis.trigger` does not contain "unknown" |
| `warn` | Trigger contains "unknown" |

**Fix:** Add a trigger statement in the spec (e.g., "The flow starts when...").

---

### C4 — Outcomes are defined

| Status | Condition |
|---|---|
| `pass` | At least one outcome that does not contain "unknown" |
| `warn` | No outcomes, or all outcomes contain "unknown" |

**Fix:** Add an `## Outcomes` section listing expected end states.

---

### C5 — Steps are present

| Status | Condition |
|---|---|
| `pass` | `analysis.steps.length > 0` |
| `fail` | No steps extracted |

**Fix:** Add a numbered list or `## Steps` section to the spec.

---

### C6 — Every step has evidence

| Status | Condition |
|---|---|
| `pass` | All steps have a non-empty `evidence` field |
| `warn` | One or more steps have missing evidence |

Evidence is automatically assigned from the source line. This check fails only if a step was constructed with no traceable source line.

---

### C7 — Decisions have branches

| Status | Condition |
|---|---|
| `pass` | All steps with a `decision` have a non-"-" outcome or notes |
| `warn` | One or more decision steps lack any branch outcome |

**Fix:** For each decision point in the spec, describe both the positive and negative branch.

---

### C8 — Exceptions have notes

| Status | Condition |
|---|---|
| `pass` | All exception steps have a non-"-" notes field |
| `warn` | One or more exception steps lack notes |

**Fix:** Document what happens when each exception occurs.

---

### C9 — No orphan steps

| Status | Condition |
|---|---|
| `pass` | All steps are in sequence (no index gaps) |
| `warn` | Step index sequence has gaps |

This check detects deduplication issues or steps that were silently dropped.

---

### C10 — Async events have callbacks

| Status | Condition |
|---|---|
| `pass` | All async events have `hasCallback = true`, or no async events |
| `warn` | One or more async events are missing callback definition |

**Fix:** For every webhook, queue, or async trigger in the spec, document the callback or response handler.

---

### C11 — Permissions are complete

| Status | Condition |
|---|---|
| `pass` | Permission matrix has entries and no gaps, or no permission-relevant content in spec |
| `warn` | Permission matrix has gaps (actions without any role definition) |

**Fix:** For each action in the flow, specify which roles are allowed, denied, or require conditions.

---

### C12 — State machine is consistent

| Status | Condition |
|---|---|
| `pass` | No invalid transitions, or no state machine data |
| `warn` | One or more invalid transitions detected |

Invalid transitions are transitions where the `from` or `to` state ID cannot be resolved to a known state node.

---

### C13 — Risk scoring is complete

| Status | Condition |
|---|---|
| `pass` | `analysis.risks` is present and `risks.total > 0` |
| `warn` | No risk data present |

---

### C14 — Scenarios are present

| Status | Condition |
|---|---|
| `pass` | At least one scenario seed is present |
| `warn` | No scenarios |

---

### C15 — No contradictions

| Status | Condition |
|---|---|
| `pass` | `analysis.contradictions` is empty or undefined |
| `warn` | One or more contradictions detected |

**Fix:** Review the contradiction items in Section 15 and resolve conflicting rules in the source spec.

---

## 4. Mermaid checks (applied when a MermaidArtifact is provided)

### M1 — Flowchart is non-empty

| Status | Condition |
|---|---|
| `pass` | Flowchart string is non-empty and contains at least one node |
| `fail` | Flowchart is empty or missing |

### M2 — Traceability is complete

| Status | Condition |
|---|---|
| `pass` | Every step node (`N1` … `Nn`) has a traceability entry |
| `warn` | One or more nodes lack traceability |

### M3 — Icon selections are present

| Status | Condition |
|---|---|
| `pass` | At least one semantic icon selection is present |
| `warn` | No icon selections |

---

## 5. Validation result format

Written to `debug/validation.json`:

```json
{
  "checks": [
    { "rule": "Goal is defined", "status": "pass", "detail": "Goal: \"User submits order...\"" },
    { "rule": "Actors are defined", "status": "pass", "detail": "Actors: Customer, Payment Service, Admin" },
    { "rule": "Async events have callbacks", "status": "warn", "detail": "2 async event(s) missing callback definition" }
  ],
  "passCount": 13,
  "warnCount": 2,
  "failCount": 0,
  "score": 87
}
```

---

## 6. Governance rules

### Addition of new checks

New validation checks must:
1. Be added to `src/core/validator.ts` as a named function returning `ValidationCheck`.
2. Be called inside `runValidation()`.
3. Have a clear `rule` label, a meaningful `detail` message for both pass and fail/warn cases.
4. Be documented in this file under the appropriate section (Analysis checks or Mermaid checks).
5. Pass the smoke test in `tests/pipeline.test.ts`.

### Removal of checks

No check may be removed without:
1. Updating this document to reflect the removal.
2. Updating `tests/pipeline.test.ts` to remove dependent assertions.
3. Explaining the rationale in the PR description.

### Score floor

A score below 70 must be treated as a quality gate failure in automated contexts (CI). Artifacts with scores in the 50–69 range require human review before use.

### Evidence requirement

Every `fail` status must include a `detail` message that names the specific element that failed and provides actionable guidance. Generic messages like "check failed" are not acceptable.
