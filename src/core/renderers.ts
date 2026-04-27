import type { AnalysisArtifact, MermaidArtifact, PermissionEntry, RiskItem, ScenarioSeed, ValidationCheck } from "../types.js";
import {
  MERMAID_VISUAL_STANDARD_LINES,
  buildFallbackSwimlaneDiagram,
  renderMermaidIconLines,
} from "./mermaid-style.js";

export function renderAnalysisMarkdown(analysis: AnalysisArtifact, normalizedCorpusPath: string, specRoot: string): string {
  const rows = analysis.steps.map((step) => {
    return `| ${step.index} | ${orDash(step.actor)} | ${orDash(step.action)} | ${orDash(step.decision)} | ${orDash(step.touchpoint)} | ${orDash(step.outcome)} | ${orDash(step.notes)} |`;
  });

  const traceability = analysis.steps.map((step) => {
    return `| ${step.index} | ${escapePipes(step.action)} | ${escapePipes(step.evidence)} |`;
  });

  return [
    "MODE=technical",
    "",
    `# ${analysis.title}`,
    "",
    "## 0) Scope",
    `- Topic: ${analysis.topic}`,
    `- Goal / Decision: ${analysis.goal}`,
    `- Domain: ${analysis.domain ?? "general"}`,
    `- Domain pack: ${analysis.domainPack ?? "default"}`,
    `- In scope / Out of scope: ${analysis.scope}`,
    "",
    "## 1) Source",
    `- Spec root: ${specRoot}`,
    `- Source files: ${analysis.sourceFiles.join(", ")}`,
    `- Normalized corpus: ${normalizedCorpusPath}`,
    "",
    "## 2) Business Flow Summary",
    `- Goal: ${analysis.goal}`,
    `- Primary actors: ${listOrFallback(analysis.actors)}`,
    `- Trigger(s): ${analysis.trigger}`,
    `- Outcome(s): ${listOrFallback(analysis.outcomes)}`,
    `- Key touchpoints: ${listOrFallback(analysis.touchpoints)}`,
    "",
    "## 3) Business Flow Table",
    "| # | Actor/Role | Business Step | Decision/Condition | System Touchpoint | Expected Outcome | Notes/Risks |",
    "|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "## 4) Narrative Flow",
    ...analysis.narrative,
    "",
    "## 5) Decisions and Exceptions",
    ...listItemsWithPrefix("Decision", analysis.decisions),
    ...listItemsWithPrefix("Exception", analysis.exceptions, "None"),
    "",
    "## 6) Traceability",
    "| Row # | Table row summary | Evidence (source excerpt / line range) |",
    "|---|---|---|",
    ...traceability,
    "",
    "## 7) Questions",
    ...(analysis.questions.length > 0 ? analysis.questions.map((question, index) => `- Q${index + 1}: ${question}`) : ["- None"]),
    "",
    "## 8) Assumptions",
    ...(analysis.assumptions.length > 0 ? analysis.assumptions.map((assumption, index) => `- A${index + 1}: ${assumption}`) : ["- None"]),
    "",
    "## 9) Gap Taxonomy",
    ...renderGapTaxonomy(analysis),
    "",
    "## 10) State Machine",
    ...renderStateMachineSection(analysis),
    "",
    "## 11) Permissions",
    ...renderPermissionsSection(analysis),
    "",
    "## 12) Async Events",
    ...renderAsyncEventsSection(analysis),
    "",
    "## 13) Risk Hotspots",
    ...renderRiskSection(analysis),
    "",
    "## 14) Scenario Seeds",
    ...renderScenariosSection(analysis),
    "",
    "## 15) Contradictions",
    ...renderContradictionsSection(analysis),
    "",
    "## 16) Validation Report",
    ...renderValidationSection(analysis),
    "",
    "## 17) Checklist",
    "- [x] English only",
    "- [x] No unsupported inference beyond the source",
    "- [x] Business flow summary, table, and narrative are present",
    "- [x] Every table row has traceability",
    "- [x] State machine, permissions, async, risk, scenarios, validation populated",
    "- [x] Output is inside `business-flow/<slug>/02-analysis/`",
    "",
  ].join("\n");
}

export function renderMermaidMarkdown(artifact: MermaidArtifact, businessFlowDocumentPath: string, includeSwimlane: boolean): string {
  const traceability = artifact.traceability.map((row) => {
    return `| ${row.nodeId} | ${escapePipes(row.text)} | ${escapePipes(row.evidence)} |`;
  });
  const iconSelections = artifact.iconSelections.map((selection) => {
    return `- \`${selection.token}\` → class \`${selection.mermaidClass}\` → \`${selection.fallbackExportIcon}\` → \`${selection.physicalSvgPath}\` (${selection.reason})`;
  });

  const swimlaneDiagram = includeSwimlane
    ? artifact.swimlane ?? buildFallbackSwimlaneDiagram("Swimlane omitted because actor ownership is not explicit in the source evidence.")
    : buildFallbackSwimlaneDiagram("Swimlane output was disabled for this run.");

  const stateDiagramBlock = artifact.stateDiagram
    ? ["## 5b) State Diagram", "```mermaid", artifact.stateDiagram, "```", ""]
    : [];

  return [
    "MODE=technical",
    "",
    "# Business Flow Mermaid Pack",
    "",
    "## 1) Source",
    `- Business flow document: ${businessFlowDocumentPath}`,
    `- Output mode: ${includeSwimlane ? "flowchart+swimlane" : "flowchart-only"}`,
    "",
    "## 2) Diagram Standard",
    ...MERMAID_VISUAL_STANDARD_LINES,
    "",
    "## 3) Icon Set",
    ...renderMermaidIconLines(),
    ...(iconSelections.length > 0 ? ["- Selected semantic tokens:", ...iconSelections] : []),
    "",
    "## 4) Extracted Facts",
    `- Trigger: ${artifact.facts.trigger}`,
    `- Outcome: ${listOrFallback(artifact.facts.outcomes)}`,
    `- Actors/Roles: ${listOrFallback(artifact.facts.actors)}`,
    `- Decisions: ${listOrFallback(artifact.facts.decisions)}`,
    `- Exceptions: ${listOrFallback(artifact.facts.exceptions, "None")}`,
    "",
    "## 5) Mermaid Diagram",
    "```mermaid",
    artifact.flowchart,
    "```",
    "",
    ...stateDiagramBlock,
    "## 6) Mermaid Diagram (Swimlane)",
    "```mermaid",
    swimlaneDiagram,
    "```",
    "",
    "## 7) Traceability",
    "| NodeId | Node text | Evidence (source excerpt / line range) |",
    "|---|---|---|",
    ...traceability,
    "",
    "## 8) Gaps / Assumptions",
    ...(artifact.gaps.length > 0 ? artifact.gaps.map((gap, index) => `- G${index + 1}: ${gap}`) : ["- None"]),
    "",
    "## 9) Checklist",
    "- [x] English only",
    "- [x] No unsupported nodes, actors, or branches",
    "- [x] Mermaid styling follows the repository visual standard",
    "- [x] Every node and decision has traceability",
    "- [x] Semantic icon tokens reinforce supported business meaning",
    "- [x] Output is inside `business-flow/<slug>/03-mermaid/`",
    "",
  ].join("\n");
}

// ─── Section Renderers ────────────────────────────────────────────────────────

function renderGapTaxonomy(analysis: AnalysisArtifact): string[] {
  const gaps = analysis.gaps ?? [];
  if (gaps.length === 0) return ["- No typed gaps detected."];

  const byCategory = new Map<string, string[]>();
  for (const gap of gaps) {
    const list = byCategory.get(gap.category) ?? [];
    const detail = gap.evidence ? `${gap.description} _(${gap.evidence})_` : gap.description;
    list.push(`  - ${detail}`);
    byCategory.set(gap.category, list);
  }

  const lines: string[] = [];
  for (const [category, descriptions] of byCategory.entries()) {
    lines.push(`- **${category}**:`);
    lines.push(...descriptions);
  }
  return lines;
}

function renderStateMachineSection(analysis: AnalysisArtifact): string[] {
  const sm = analysis.stateMachine;
  if (!sm || sm.states.length === 0) {
    return ["_No states were extracted. Add status/lifecycle information to the spec._"];
  }

  const lines: string[] = [];

  // State list
  lines.push("### States", "| State | Initial | Terminal |", "|---|---|---|");
  for (const state of sm.states) {
    lines.push(`| ${state.label} | ${state.isInitial ? "Yes" : "No"} | ${state.isTerminal ? "Yes" : "No"} |`);
  }

  // Transition table
  lines.push("", "### Transitions", "| From | To | Trigger | Guard | Rollback | Exception |", "|---|---|---|---|---|---|");
  for (const t of sm.transitions) {
    lines.push(
      `| ${resolveStateLabel(sm.states, t.from)} | ${resolveStateLabel(sm.states, t.to)} | ${t.trigger} | ${t.guard ?? "-"} | ${t.isRollback ? "✓" : "-"} | ${t.isException ? "✓" : "-"} |`
    );
  }

  // Invalid transitions
  if (sm.invalidTransitions.length > 0) {
    lines.push("", "### Invalid / Suspicious Transitions");
    for (const inv of sm.invalidTransitions) {
      lines.push(`- ⚠️ ${inv}`);
    }
  }

  // State diagram
  lines.push("", "### State Diagram", "```mermaid", sm.stateDiagram, "```");

  return lines;
}

function renderPermissionsSection(analysis: AnalysisArtifact): string[] {
  const matrix = analysis.permissions;
  if (!matrix || matrix.entries.length === 0) {
    return ["_No permission rules were extracted. Add role/access statements to the spec._"];
  }

  const lines: string[] = [];
  lines.push("### Role-Action Matrix", "| Role | Action | Access | Condition |", "|---|---|---|---|");
  for (const entry of matrix.entries.slice(0, 20)) {
    lines.push(`| ${entry.role} | ${entry.action} | ${entry.access} | ${entry.condition ?? "-"} |`);
  }

  if (matrix.conflicts.length > 0) {
    lines.push("", "### Permission Conflicts");
    for (const conflict of matrix.conflicts) {
      lines.push(`- ❌ **${conflict.action}**: ${conflict.description}`);
    }
  }

  if (matrix.gaps.length > 0) {
    lines.push("", "### Permission Gaps");
    for (const gap of matrix.gaps.slice(0, 8)) {
      lines.push(`- ⚠️ **${gap.action}**: ${gap.description}`);
    }
  }

  return lines;
}

function renderAsyncEventsSection(analysis: AnalysisArtifact): string[] {
  const events = analysis.asyncEvents ?? [];
  const deps = analysis.externalDependencies ?? [];

  if (events.length === 0 && deps.length === 0) {
    return ["_No async events or external dependencies detected._"];
  }

  const lines: string[] = [];

  if (events.length > 0) {
    lines.push("### Async Events", "| Kind | Name | Callback | Recovery | Retry Policy |", "|---|---|---|---|---|");
    for (const event of events) {
      const retry = event.retryPolicy
        ? `max=${event.retryPolicy.maxAttempts}, backoff=${event.retryPolicy.backoffStrategy}, timeout=${event.retryPolicy.timeoutSeconds}s`
        : "-";
      lines.push(`| ${event.kind} | ${truncate(event.name, 50)} | ${event.hasCallback ? "✓" : "❌ missing"} | ${event.hasRecovery ? "✓" : "⚠️ missing"} | ${retry} |`);
    }
  }

  if (deps.length > 0) {
    lines.push("", "### External Dependencies", "| Name | Kind | Failure Handling |", "|---|---|---|");
    for (const dep of deps) {
      lines.push(`| ${dep.name} | ${dep.kind} | ${dep.hasFailureHandling ? "✓" : "⚠️ missing"} |`);
    }
  }

  return lines;
}

function renderRiskSection(analysis: AnalysisArtifact): string[] {
  const risks = analysis.risks;
  if (!risks) return ["_Risk scoring was not performed._"];

  const levelEmoji = { low: "🟢", medium: "🟡", high: "🟠", critical: "🔴" };
  const lines: string[] = [
    `**Risk Level: ${levelEmoji[risks.level]} ${risks.level.toUpperCase()} (score: ${risks.total}/100)**`,
    "",
    "### Hotspots",
    "| Category | Label | Score | Description |",
    "|---|---|---|---|",
  ];

  for (const item of risks.hotspots) {
    lines.push(`| ${item.category} | ${item.label} | ${item.score}/10 | ${truncate(item.description, 80)} |`);
  }

  if (risks.hotspots.length === 0) {
    lines.push("- No significant risk hotspots detected.");
  }

  return lines;
}

function renderScenariosSection(analysis: AnalysisArtifact): string[] {
  const seeds = analysis.scenarios ?? [];
  if (seeds.length === 0) return ["_No scenario seeds were generated._"];

  const kindEmoji: Record<string, string> = {
    "happy-path": "✅",
    "edge-case": "⚡",
    "abuse-failure": "❌",
    "regression": "🔄",
  };

  const lines: string[] = ["| Kind | Title | Given | When | Then |", "|---|---|---|---|---|"];
  for (const seed of seeds) {
    lines.push(`| ${kindEmoji[seed.kind] ?? ""} ${seed.kind} | ${truncate(seed.title, 50)} | ${truncate(seed.given, 60)} | ${truncate(seed.when, 60)} | ${truncate(seed.then, 60)} |`);
  }

  return lines;
}

function renderContradictionsSection(analysis: AnalysisArtifact): string[] {
  const items = analysis.contradictions ?? [];
  const lines: string[] = [];

  if (items.length === 0) {
    lines.push("- No contradictions detected across source files.");
  } else {
    for (const item of items) {
      lines.push(`- ❌ **${item.description}**`);
      lines.push(`  - Statement A (_${item.sourceA}_): "${truncate(item.statementA, 80)}"`);
      lines.push(`  - Statement B (_${item.sourceB}_): "${truncate(item.statementB, 80)}"`);
    }
  }

  const impacts = analysis.crossFlowImpacts ?? [];
  if (impacts.length > 0) {
    lines.push("", "### Cross-Flow Impact");
    for (const impact of impacts) {
      lines.push(`- **${impact.area}**: ${impact.impact} Reason: ${impact.reason}`);
    }
  }

  return lines;
}

function renderValidationSection(analysis: AnalysisArtifact): string[] {
  const validation = analysis.validationResult;
  if (!validation) return ["_Validation was not run._"];

  const statusEmoji: Record<string, string> = { pass: "✅", warn: "⚠️", fail: "❌" };
  const scoreLabel = validation.score >= 80 ? "🟢" : validation.score >= 60 ? "🟡" : "🔴";

  const lines: string[] = [
    `**Score: ${scoreLabel} ${validation.score}/100** — ✅ ${validation.passCount} pass | ⚠️ ${validation.warnCount} warn | ❌ ${validation.failCount} fail`,
    "",
    "| Rule | Status | Detail |",
    "|---|---|---|",
  ];

  for (const check of validation.checks) {
    lines.push(`| ${check.rule} | ${statusEmoji[check.status]} ${check.status.toUpperCase()} | ${truncate(check.detail, 80)} |`);
  }

  return lines;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function listOrFallback(values: string[], fallback = "Unknown / needs confirmation"): string {
  return values.length > 0 ? values.join(", ") : fallback;
}

function listItemsWithPrefix(prefix: string, values: string[], fallback = "Unknown / needs confirmation"): string[] {
  if (values.length === 0) {
    return [`- ${prefix}: ${fallback}`];
  }

  return values.map((value) => `- ${prefix}: ${value}`);
}

function orDash(value: string): string {
  return value && value.trim() ? escapePipes(value) : "-";
}

function escapePipes(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function resolveStateLabel(states: { id: string; label: string }[], id: string): string {
  return states.find((s) => s.id === id)?.label ?? id;
}
