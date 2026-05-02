export type RunMode = "auto" | "llm" | "heuristic" | "dry-run";

export interface RunOptions {
  specDir: string;
  slug?: string;
  outputRoot?: string;
  mode: RunMode;
  includeSwimlane: boolean;
  model?: string;
  perFlow?: boolean;
}

export interface ExtractedSource {
  filePath: string;
  relativePath: string;
  extension: string;
  title: string;
  content: string;
  numberedContent: string;
  lines: SourceLine[];
}

export interface SourceLine {
  relativePath: string;
  lineNumber: number;
  text: string;
}

export interface BusinessFlowStep {
  index: number;
  actor: string;
  action: string;
  decision: string;
  touchpoint: string;
  outcome: string;
  notes: string;
  evidence: string;
}

// ─── Canonical Schema: Gap Taxonomy ──────────────────────────────────────────

export type GapCategory =
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

export interface GapItem {
  category: GapCategory;
  description: string;
  evidence?: string;
}

// ─── Canonical Schema: Data Contracts ───────────────────────────────────────

export interface DataContract {
  name: string;
  format: string; // e.g. JSON, CSV, string
  fields: string[];
  example?: string;
  source: string;
}

// ─── Canonical Schema: Implementation Constraints ────────────────────────────

export type ConstraintSeverity = "never" | "always" | "warning";

export interface ImplementationConstraint {
  severity: ConstraintSeverity;
  rule: string;
  context: string;
  source: string;
}

// ─── Canonical Schema: State Machine ─────────────────────────────────────────

export interface StateNode {
  id: string;
  label: string;
  isTerminal: boolean;
  isInitial: boolean;
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  guard?: string;
  isRollback: boolean;
  isException: boolean;
  evidence: string;
}

export interface StateMachine {
  states: StateNode[];
  transitions: StateTransition[];
  invalidTransitions: string[];
  rollbackPaths: string[];
  stateDiagram: string;
}

// ─── Canonical Schema: Permissions ───────────────────────────────────────────

export type AccessLevel = "allowed" | "denied" | "conditional" | "unknown";

export interface PermissionEntry {
  role: string;
  action: string;
  access: AccessLevel;
  condition?: string;
  evidence: string;
}

export interface PermissionConflict {
  action: string;
  roles: string[];
  description: string;
}

export interface PermissionGap {
  action: string;
  description: string;
}

export interface PermissionMatrix {
  entries: PermissionEntry[];
  conflicts: PermissionConflict[];
  gaps: PermissionGap[];
}

// ─── Canonical Schema: Async & Dependencies ───────────────────────────────────

export type AsyncEventKind =
  | "webhook"
  | "callback"
  | "queue-consumer"
  | "retry-loop"
  | "timeout-branch"
  | "polling"
  | "event-emit";

export interface AsyncEvent {
  kind: AsyncEventKind;
  name: string;
  description: string;
  hasCallback: boolean;
  hasRecovery: boolean;
  retryPolicy?: RetryPolicy;
  evidence: string;
}

export interface RetryPolicy {
  maxAttempts: number | "unknown";
  backoffStrategy: "immediate" | "linear" | "exponential" | "unknown";
  timeoutSeconds: number | "unknown";
}

export interface ExternalDependency {
  name: string;
  kind: "api" | "queue" | "database" | "email" | "sms" | "webhook" | "service" | "other";
  hasFailureHandling: boolean;
  evidence: string;
}

// ─── Canonical Schema: Risk Scoring ──────────────────────────────────────────

export type RiskCategory =
  | "async-dependency"
  | "payment-flow"
  | "permission-gap"
  | "missing-recovery"
  | "exception-density"
  | "external-coupling"
  | "state-ambiguity";

export interface RiskItem {
  category: RiskCategory;
  label: string;
  description: string;
  score: number; // 0–10
  evidence: string;
}

export interface RiskScore {
  total: number; // 0–100 weighted
  level: "low" | "medium" | "high" | "critical";
  hotspots: RiskItem[];
}

// ─── Canonical Schema: Scenario Seeds ────────────────────────────────────────

export type ScenarioKind = "happy-path" | "edge-case" | "abuse-failure" | "regression";

export interface ScenarioSeed {
  kind: ScenarioKind;
  title: string;
  given: string;
  when: string;
  then: string;
  linkedStep?: number;
}

// ─── Canonical Schema: Validation ────────────────────────────────────────────

export type ValidationStatus = "pass" | "fail" | "warn";

export interface ValidationCheck {
  rule: string;
  status: ValidationStatus;
  detail: string;
}

export interface ValidationResult {
  checks: ValidationCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
  score: number; // 0–100
}

// ─── Canonical Schema: Contradiction Detection ───────────────────────────────

export interface ContradictionItem {
  description: string;
  statementA: string;
  statementB: string;
  sourceA: string;
  sourceB: string;
}

export interface CrossFlowImpactItem {
  area: string;
  impact: string;
  reason: string;
}

// ─── Core Artifact Types ──────────────────────────────────────────────────────

export interface AnalysisArtifact {
  title: string;
  topic: string;
  goal: string;
  scope: string;
  sourceFiles: string[];
  trigger: string;
  outcomes: string[];
  actors: string[];
  touchpoints: string[];
  steps: BusinessFlowStep[];
  narrative: string[];
  decisions: string[];
  exceptions: string[];
  /** Legacy compatibility: flattened gap descriptions */
  questions: string[];
  assumptions: string[];
  /** P0: enhanced typed gaps */
  gaps: GapItem[];
  /** P0: state machine */
  stateMachine?: StateMachine;
  /** P1: permission matrix */
  permissions?: PermissionMatrix;
  /** P1: async events */
  asyncEvents?: AsyncEvent[];
  /** P1: external dependencies */
  externalDependencies?: ExternalDependency[];
  /** P1: risk score */
  risks?: RiskScore;
  /** P1: scenario seeds */
  scenarios?: ScenarioSeed[];
  /** P2: contradiction detection */
  contradictions?: ContradictionItem[];
  /** P2: cross-flow impact hints */
  crossFlowImpacts?: CrossFlowImpactItem[];
  /** P0: validation result */
  validationResult?: ValidationResult;
  /** Domain resolved for this flow */
  domain?: string;
  /** Domain pack resolved for this flow */
  domainPack?: string;
  /** P3: data contracts extracted from spec code blocks */
  dataContracts?: DataContract[];
  /** P3: implementation constraints (never/always/warning rules) */
  implementationConstraints?: ImplementationConstraint[];
}

export interface MermaidNodeTrace {
  nodeId: string;
  text: string;
  evidence: string;
}

export interface MermaidIconSelection {
  token: string;
  mermaidClass: "startEnd" | "process" | "decision" | "exception" | "external" | "note";
  fallbackExportIcon: string;
  physicalSvgPath: string;
  reason: string;
}

export interface MermaidArtifact {
  facts: {
    trigger: string;
    outcomes: string[];
    actors: string[];
    decisions: string[];
    exceptions: string[];
  };
  flowchart: string;
  swimlane?: string;
  stateDiagram?: string;
  iconSelections: MermaidIconSelection[];
  traceability: MermaidNodeTrace[];
  gaps: string[];
}

export interface RunResult {
  slug: string;
  mode: Exclude<RunMode, "auto">;
  processedFiles: string[];
  outputRoot: string;
  normalizedCorpusPath: string;
  analysisPath?: string;
  mermaidPath?: string;
  validationPath?: string;
  permissionsPath?: string;
  riskPath?: string;
  scenariosPath?: string;
  promptPaths: string[];
  reportPath: string;
}
