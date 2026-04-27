# Analysis Extraction Skill

## Use this skill when

- the task derives actors, triggers, steps, decisions, outcomes from spec files
- heuristic logic in `src/core/heuristics.ts` needs to change
- the 17-section business-flow document is being reviewed or improved

## Goal

Turn normalized source evidence into a complete canonical business-flow analysis without overstating certainty.

## Canonical schema extracted

The analysis must populate all of the following:
- **goal, trigger, outcomes, actors, touchpoints** — from explicit text
- **BusinessFlowStep[]** — one step per business action, with actor, action, decision, touchpoint, outcome, notes, evidence
- **GapItem[]** — typed gaps: `missing-rule`, `missing-permission`, `missing-retry`, `missing-timeout`, `missing-rollback`, `missing-async-callback`, `missing-state-detail`, `unresolved-actor`, `undefined-branch`
- **StateMachine** — states, transitions, invalid transitions, rollback paths, `stateDiagram-v2`
- **PermissionMatrix** — entries (role/action/access), conflicts, gaps
- **AsyncEvent[]** — kind, name, hasCallback, hasRecovery, retryPolicy
- **ExternalDependency[]** — name, kind, hasFailureHandling
- **RiskScore** — total (0–100), level, sorted hotspots
- **ScenarioSeed[]** — happy-path, edge-case, abuse-failure, regression
- **ContradictionItem[]** — conflicting allow/deny statements or numeric constants
- **CrossFlowImpactItem[]** — downstream areas likely affected if this flow changes
- **ValidationResult** — 16 checks with pass/warn/fail, score

## Workflow

The user should not need to drive this step-by-step.

When invoked by an agent:

1. Start from numbered source lines in `01-source/normalized-spec.md`, not from memory.
2. Identify the business domain first — it drives domain pack gap checks and risk scoring.
3. Extract explicit structure: goal → actors → steps → touchpoints → decisions → exceptions.
4. Build the canonical schema objects above, not just a flat text output.
5. Use inference only when narrowly supported by nearby text.
6. Emit `GapItem` entries for missing rules — do not invent rules to fill them.
7. Render all 17 sections to `02-analysis/business-flow-document.md`.
8. Also write focused JSON files under `debug/`: `validation.json`, `permissions.json`, `risk.json`.
9. Write `debug/scenario-seeds.md` as readable Markdown.
10. Write `debug/run-summary.json` with all generated artifact paths.

Return a short summary to the user instead of asking them to perform intermediate inspection by default.

## Domain pack check

After resolving domain, check known failure patterns:
- `finance/commerce` → payments domain pack
- `identity` → auth domain pack
- `fulfillment` → fulfillment domain pack
- `content/cms` → cms domain pack

Add the pack's `requiredGapChecks` to Section 9 when relevant keywords are present.
