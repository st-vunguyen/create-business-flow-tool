import type { AnalysisArtifact, MermaidArtifact } from "../types.js";
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
    "## 9) Checklist",
    "- [x] English only",
    "- [x] No unsupported inference beyond the source",
    "- [x] Business flow summary, table, and narrative are present",
    "- [x] Every table row has traceability",
    "- [x] Output is inside `business-flow/<slug>/02-analysis/`",
    "",
  ].join("\n");
}

export function renderMermaidMarkdown(artifact: MermaidArtifact, businessFlowDocumentPath: string, includeSwimlane: boolean): string {
  const traceability = artifact.traceability.map((row) => {
    return `| ${row.nodeId} | ${escapePipes(row.text)} | ${escapePipes(row.evidence)} |`;
  });

  const swimlaneDiagram = includeSwimlane
    ? artifact.swimlane ?? buildFallbackSwimlaneDiagram("Swimlane omitted because actor ownership is not explicit in the source evidence.")
    : buildFallbackSwimlaneDiagram("Swimlane output was disabled for this run.");

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
    "- [x] Output is inside `business-flow/<slug>/03-mermaid/`",
    "",
  ].join("\n");
}

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
