# CONTRACTS.md — Canonical TypeScript Schemas

This document describes every TypeScript interface and type defined in `src/types.ts`.
These contracts define the data flowing through the entire pipeline — from extraction to rendering.

---

## 1. RunOptions

Options passed to `runPipeline()`.

| Field | Type | Required | Description |
|---|---|---|---|
| `specDir` | `string` | yes | Path to the spec input directory (relative to workspace root) |
| `slug` | `string` | no | Output slug. Defaults to the last segment of `specDir`, slugified |
| `outputRoot` | `string` | no | Root output directory. Defaults to `business-flow` |
| `mode` | `RunMode` | yes | Execution mode: `auto`, `llm`, `heuristic`, `dry-run` |
| `includeSwimlane` | `boolean` | yes | Whether to generate the swimlane diagram |
| `model` | `string` | no | LLM model name (only used in `llm` mode) |
| `perFlow` | `boolean` | no | If `true`, creates `04-per-flow/` directory |

```typescript
type RunMode = "auto" | "llm" | "heuristic" | "dry-run";
```

---

## 2. ExtractedSource

Represents a single normalized spec file after extraction.

| Field | Type | Description |
|---|---|---|
| `filePath` | `string` | Absolute path |
| `relativePath` | `string` | Path relative to `specDir` |
| `extension` | `string` | File extension (`.md`, `.xlsx`, etc.) |
| `title` | `string` | Title-cased filename without extension |
| `content` | `string` | Normalized whitespace content |
| `numberedContent` | `string` | Line-numbered content (`L1: ...`) |
| `lines` | `SourceLine[]` | Structured line array |

```typescript
interface SourceLine {
  relativePath: string;
  lineNumber: number;
  text: string;
}
```

---

## 3. BusinessFlowStep

One row in the business flow table (Section 3).

| Field | Type | Description |
|---|---|---|
| `index` | `number` | 1-based step number |
| `actor` | `string` | Role or system performing the action |
| `action` | `string` | The business action (summarized sentence) |
| `decision` | `string` | Decision condition, or `"-"` if none |
| `touchpoint` | `string` | System or channel involved |
| `outcome` | `string` | Expected result of this step |
| `notes` | `string` | Exception or risk note, or `"-"` if none |
| `evidence` | `string` | Source file + line reference |

---

## 4. GapItem

One typed gap identified in the analysis.

| Field | Type | Description |
|---|---|---|
| `category` | `GapCategory` | Typed gap category |
| `description` | `string` | Human-readable gap description |
| `evidence` | `string` (optional) | Source evidence for the gap |

```typescript
type GapCategory =
  | "missing-rule"
  | "missing-permission"
  | "missing-retry"
  | "missing-timeout"
  | "missing-rollback"
  | "missing-async-callback"
  | "missing-state-detail"
  | "unresolved-actor"
  | "undefined-branch"
  | "general";
```

---

## 5. DataContract

A structured data format extracted from spec code blocks.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Short label (first N field names joined) |
| `format` | `string` | `JSON`, `CSV`, `string`, etc. |
| `fields` | `string[]` | Top-level field names parsed from the block |
| `example` | `string` (optional) | Raw code block, truncated to 300 chars |
| `source` | `string` | Relative path of the spec file containing the block |

---

## 6. ImplementationConstraint

An explicit implementation rule extracted from spec text.

| Field | Type | Description |
|---|---|---|
| `severity` | `ConstraintSeverity` | `"never"`, `"always"`, or `"warning"` |
| `rule` | `string` | The rule text, lightly normalized |
| `context` | `string` | Module or file title the rule appears in |
| `source` | `string` | Relative path of the spec file |

```typescript
type ConstraintSeverity = "never" | "always" | "warning";
```

Severity mapping:

| Keywords found | Severity |
|---|---|
| `never`, `must not`, `do not`, `do not use` | `"never"` |
| `always`, `must be` | `"always"` |
| `critical`, `important`, `warning` | `"warning"` |

---

## 7. StateMachine

The lifecycle state model extracted from the flow.

| Field | Type | Description |
|---|---|---|
| `states` | `StateNode[]` | All state nodes |
| `transitions` | `StateTransition[]` | Valid transitions |
| `invalidTransitions` | `string[]` | Suspicious or impossible transitions detected |
| `rollbackPaths` | `string[]` | Rollback or reversal paths |
| `stateDiagram` | `string` | Rendered `stateDiagram-v2` Mermaid block |

```typescript
interface StateNode {
  id: string;        // e.g. "S0", "S1"
  label: string;     // e.g. "Created", "Submitted"
  isTerminal: boolean;
  isInitial: boolean;
}

interface StateTransition {
  from: string;       // StateNode.id
  to: string;         // StateNode.id
  trigger: string;    // Action that causes the transition
  guard?: string;     // Optional condition
  isRollback: boolean;
  isException: boolean;
  evidence: string;
}
```

---

## 8. PermissionMatrix

Role-based access control extracted from the flow.

| Field | Type | Description |
|---|---|---|
| `entries` | `PermissionEntry[]` | All role-action-access pairs |
| `conflicts` | `PermissionConflict[]` | Contradictory access rules for the same role+action |
| `gaps` | `PermissionGap[]` | Actions without any permission definition |

```typescript
type AccessLevel = "allowed" | "denied" | "conditional" | "unknown";

interface PermissionEntry {
  role: string;
  action: string;
  access: AccessLevel;
  condition?: string;
  evidence: string;
}
```

---

## 9. AsyncEvent + ExternalDependency

Async behavior modeled from the flow.

```typescript
type AsyncEventKind =
  | "webhook" | "callback" | "queue-consumer"
  | "retry-loop" | "timeout-branch" | "polling" | "event-emit";

interface AsyncEvent {
  kind: AsyncEventKind;
  name: string;
  description: string;
  hasCallback: boolean;
  hasRecovery: boolean;
  retryPolicy?: RetryPolicy;
  evidence: string;
}

interface RetryPolicy {
  maxAttempts: number | "unknown";
  backoffStrategy: "immediate" | "linear" | "exponential" | "unknown";
  timeoutSeconds: number | "unknown";
}

interface ExternalDependency {
  name: string;
  kind: "api" | "queue" | "database" | "email" | "sms" | "webhook" | "service" | "other";
  hasFailureHandling: boolean;
  evidence: string;
}
```

---

## 10. RiskScore + RiskItem

Weighted risk analysis output.

```typescript
type RiskCategory =
  | "async-dependency" | "payment-flow" | "permission-gap"
  | "missing-recovery" | "exception-density" | "external-coupling" | "state-ambiguity";

interface RiskItem {
  category: RiskCategory;
  label: string;
  description: string;
  score: number;     // 0–10 per item
  evidence: string;
}

interface RiskScore {
  total: number;     // 0–100 weighted aggregate
  level: "low" | "medium" | "high" | "critical";
  hotspots: RiskItem[];   // top 10
}
```

---

## 11. ScenarioSeed

A structured test scenario seed.

```typescript
type ScenarioKind = "happy-path" | "edge-case" | "abuse-failure" | "regression";

interface ScenarioSeed {
  kind: ScenarioKind;
  title: string;
  given: string;
  when: string;
  then: string;
  linkedStep?: number;   // step index this scenario targets
}
```

---

## 12. ValidationResult + ValidationCheck

Structured output of the validation engine.

```typescript
type ValidationStatus = "pass" | "fail" | "warn";

interface ValidationCheck {
  rule: string;
  status: ValidationStatus;
  detail: string;
}

interface ValidationResult {
  checks: ValidationCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
  score: number;     // 0–100 = (passCount / totalChecks) * 100
}
```

---

## 13. ContradictionItem + CrossFlowImpactItem

```typescript
interface ContradictionItem {
  description: string;
  statementA: string;
  statementB: string;
  sourceA: string;    // file + line reference
  sourceB: string;
}

interface CrossFlowImpactItem {
  area: string;
  impact: string;
  reason: string;
}
```

---

## 14. AnalysisArtifact (master output type)

The complete structured output of `buildHeuristicAnalysis()`.

Every field that can be undefined is marked optional because heuristic extraction may not find evidence for every category.

| Field | Type | Section |
|---|---|---|
| `title` | `string` | Document title |
| `topic` | `string` | Slug title-cased |
| `goal` | `string` | Extracted goal |
| `scope` | `string` | Scope description |
| `sourceFiles` | `string[]` | Source file paths |
| `trigger` | `string` | Flow trigger |
| `outcomes` | `string[]` | Expected outcomes |
| `actors` | `string[]` | Roles and systems |
| `touchpoints` | `string[]` | Systems and channels |
| `steps` | `BusinessFlowStep[]` | Section 3 |
| `narrative` | `string[]` | Section 4 |
| `decisions` | `string[]` | Section 5 |
| `exceptions` | `string[]` | Section 5 |
| `questions` | `string[]` | Section 7 |
| `assumptions` | `string[]` | Section 8 |
| `gaps` | `GapItem[]` | Section 9 |
| `stateMachine?` | `StateMachine` | Section 10 |
| `permissions?` | `PermissionMatrix` | Section 11 |
| `asyncEvents?` | `AsyncEvent[]` | Section 12 |
| `externalDependencies?` | `ExternalDependency[]` | Section 12 |
| `risks?` | `RiskScore` | Section 13 |
| `scenarios?` | `ScenarioSeed[]` | Section 14 |
| `contradictions?` | `ContradictionItem[]` | Section 15 |
| `crossFlowImpacts?` | `CrossFlowImpactItem[]` | Section 15 |
| `validationResult?` | `ValidationResult` | Section 16 |
| `domain?` | `string` | Resolved domain |
| `domainPack?` | `string` | Domain pack name |
| `dataContracts?` | `DataContract[]` | Section 18 |
| `implementationConstraints?` | `ImplementationConstraint[]` | Section 19 |

---

## 15. MermaidArtifact

Output of `buildHeuristicMermaid()`. Input to `renderMermaidMarkdown()`.

| Field | Type | Description |
|---|---|---|
| `facts` | `object` | Trigger, outcomes, actors, decisions, exceptions |
| `flowchart` | `string` | `flowchart TD` Mermaid string |
| `swimlane?` | `string` | `flowchart LR` actor swimlane string |
| `stateDiagram?` | `string` | `stateDiagram-v2` string |
| `iconSelections` | `MermaidIconSelection[]` | Up to 8 semantic token selections |
| `traceability` | `MermaidNodeTrace[]` | Node-to-evidence mapping |
| `gaps` | `string[]` | Gap strings for Section 8 |

---

## 16. RunResult

Return value of `runPipeline()`.

| Field | Type | Description |
|---|---|---|
| `slug` | `string` | Resolved slug |
| `mode` | `"heuristic" \| "llm" \| "dry-run"` | Actual execution mode used |
| `processedFiles` | `string[]` | Relative paths of all spec files read |
| `outputRoot` | `string` | Absolute output root path |
| `normalizedCorpusPath` | `string` | Path to `01-source/normalized-spec.md` |
| `analysisPath?` | `string` | Path to `02-analysis/business-flow-document.md` |
| `mermaidPath?` | `string` | Path to `03-mermaid/business-flow-mermaid.md` |
| `validationPath?` | `string` | Path to `debug/validation.json` |
| `permissionsPath?` | `string` | Path to `debug/permissions.json` |
| `riskPath?` | `string` | Path to `debug/risk.json` |
| `scenariosPath?` | `string` | Path to `debug/scenario-seeds.md` |
| `promptPaths` | `string[]` | Paths to debug prompt files |
| `reportPath` | `string` | Path to `debug/run-summary.json` |
