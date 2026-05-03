# Analysis Extraction Skill

## Use this skill when

- The task derives actors, triggers, steps, decisions, outcomes from spec files
- The 19-section business-flow document is being generated or reviewed
- Heuristic logic in `src/core/heuristics.ts` needs change

## Goal

Turn numbered source evidence into a complete canonical business-flow analysis without overstating certainty.

## Canonical schema extracted

| Schema object | Contents |
|--------------|----------|
| `goal`, `trigger`, `outcomes`, `actors`, `touchpoints` | From explicit text only |
| `BusinessFlowStep[]` | One step per business action: actor, action, decision, touchpoint, outcome, notes, evidence |
| `GapItem[]` | Typed gaps: `missing-rule`, `missing-permission`, `missing-retry`, `missing-timeout`, `missing-rollback`, `missing-async-callback`, `missing-state-detail`, `unresolved-actor`, `undefined-branch` |
| `StateMachine` | States, transitions, invalid transitions, rollback paths, `stateDiagram-v2` |
| `PermissionMatrix` | Role-action-access entries, conflicts, gaps |
| `AsyncEvent[]` | Kind, name, hasCallback, hasRecovery, retryPolicy |
| `ExternalDependency[]` | Name, kind, hasFailureHandling |
| `RiskScore` | Total (0–100), level, sorted hotspots |
| `ScenarioSeed[]` | happy-path, edge-case, abuse-failure, regression |
| `ContradictionItem[]` | Conflicting rules or numeric constants |
| `ValidationResult` | Checks with pass/warn/fail and score |

## Workflow

1. Start from numbered lines in `01-source/normalized-spec.md` — not from memory
2. Identify business domain first (drives domain-pack gap checks and risk scoring)
3. Extract: goal → actors → steps → touchpoints → decisions → exceptions
4. Build canonical schema objects above
5. Use inference only when narrowly supported by nearby text
6. Emit `GapItem` entries for missing rules — do not invent rules to fill them
7. Render all 19 sections to `02-analysis/business-flow-document.md`
8. Write focused JSON under `debug/`: `validation.json`, `permissions.json`, `risk.json`
9. Write `debug/scenario-seeds.md` as readable Markdown
10. Write `debug/run-summary.json` with all generated artifact paths

> **Canonical source:** `skills/analysis-extraction/SKILL.md`
