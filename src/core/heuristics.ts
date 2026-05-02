import type { AnalysisArtifact, BusinessFlowStep, CrossFlowImpactItem, DataContract, ExtractedSource, GapItem, ImplementationConstraint, MermaidArtifact, MermaidIconSelection, MermaidNodeTrace } from "../types.js";
import { compactLines, dedupe, titleCase } from "./utils.js";
import {
  buildSwimlaneStyleLine,
  MERMAID_CLASS_DEFINITIONS,
  MERMAID_INIT_BLOCK,
  escapeMermaidLabel,
  isExternalTouchpoint,
  wrapMermaidLabel,
} from "./mermaid-style.js";
import { extractStateMachine } from "./state-machine.js";
import { extractPermissions } from "./permissions.js";
import { extractAsyncEvents } from "./async-model.js";
import { scoreRisks } from "./risk.js";
import { generateScenarioSeeds } from "./scenario-seeds.js";
import { detectContradictions } from "./contradiction.js";
import { loadDomainPack, getDomainGapItems } from "./domain-packs.js";
import { extractImplementationNotes, extractDataFormats } from "./extractors.js";

const ACTOR_PATTERN = /\b(admin|administrator|user|customer|staff|manager|approver|reviewer|operator|guest|buyer|seller|agent|owner|system|service)\b/i;
const DECISION_PATTERN = /\b(if|when|unless|whether|otherwise|approved|rejected|valid|invalid|eligible|ineligible|matched|mismatch|unavailable)\b/i;
const EXCEPTION_PATTERN = /\b(error|fail|failure|invalid|exception|timeout|forbidden|denied|retry|reject|rejected|cancel|cancelled|unavailable|stops)\b/i;
const TOUCHPOINT_PATTERN = /\b(ui|screen|form|page|api|endpoint|route|service|job|event|queue|database|db|batch|portal|dashboard|sheet|system)\b/i;
const GOAL_PATTERN = /\b(goal|objective|purpose|overview|summary|business goal|outcome|context)\b/i;
const TRIGGER_PATTERN = /\b(trigger|start|begin|submit|request|create|login|launch|open|receive)\b/i;
const OUTCOME_PATTERN = /\b(result|outcome|success|complete|completed|approved|rejected|created|updated|recorded|sent|available|confirmed|authorized)\b/i;

interface CandidateLine {
  text: string;
  evidence: string;
}

interface StructuredFlowData {
  goal?: CandidateLine;
  actors: CandidateLine[];
  steps: CandidateLine[];
  touchpoints: CandidateLine[];
  outcomes: CandidateLine[];
}

interface StepMetadata {
  touchpoint?: string;
  outcome?: string;
}

interface EdgeTracker {
  nextIndex: number;
  happyPath: number[];
  neutral: number[];
  exception: number[];
}

export function buildHeuristicAnalysis(slug: string, sources: ExtractedSource[]): AnalysisArtifact {
  const candidateLines = collectCandidateLines(sources);
  const structured = extractStructuredFlowData(sources);
  const stepMetadataMap = buildStepMetadataMap(sources);
  const topic = titleCase(slug);
  const goal = cleanGoalText(
    structured.goal?.text
      ?? findFirstMatching(candidateLines.filter((line) => !isMarkdownTableNoise(line.text)), GOAL_PATTERN)
      ?? candidateLines.find((line) => !isMarkdownTableNoise(line.text))?.text
      ?? "Unknown / needs confirmation",
  );
  const explicitActors = dedupe(structured.actors.map((line) => titleCase(stripListMarker(line.text)))).filter(Boolean);
  const inferredActors = dedupe(candidateLines.map((line) => extractActor(line.text)).filter(Boolean) as string[]);
  const actors = explicitActors.length > 0 ? explicitActors.slice(0, 6) : inferredActors.slice(0, 6);
  const touchpointCandidates = dedupe([
    ...structured.touchpoints.map((line) => titleCase(stripListMarker(line.text))),
    ...[...stepMetadataMap.values()].map((value) => value.touchpoint).filter(Boolean) as string[],
  ]).slice(0, 6);
  const steps = buildSteps(candidateLines, structured.steps, actors, touchpointCandidates, stepMetadataMap);
  const trigger = steps[0]?.action ?? findFirstMatching(candidateLines, TRIGGER_PATTERN) ?? "Unknown / needs confirmation";
  const outcomes = dedupe([
    ...structured.outcomes.map((line) => summarizeSentence(stripListMarker(line.text))),
    ...steps.map((step) => step.outcome).filter((value) => value !== "Expected result needs confirmation"),
    ...[...stepMetadataMap.values()].map((value) => value.outcome).filter(Boolean) as string[],
  ]).slice(0, 5);
  const touchpoints = dedupe([
    ...touchpointCandidates,
    ...steps.map((step) => step.touchpoint).filter(Boolean),
  ]).slice(0, 6);
  const decisions = dedupe(steps.filter((step) => step.decision !== "-").map((step) => step.decision)).slice(0, 6);
  const exceptions = dedupe(steps.filter((step) => step.notes !== "-").map((step) => step.notes)).slice(0, 6);
  const narrative = steps.map((step) => `${step.index}. ${buildNarrativeSentence(step)}`);
  const questions = buildQuestions(goal, actors, steps, decisions);
  const assumptions = buildAssumptions(actors, touchpoints, decisions);

  // ── P0: Resolve domain and build domain-contextualized gap taxonomy ──────────
  const resolvedDomain = resolveBusinessDomain({ topic, goal, trigger, outcomes, touchpoints, actors } as AnalysisArtifact);
  const domainPack = loadDomainPack(resolvedDomain);
  const corpus = [goal, trigger, ...outcomes, ...touchpoints, ...actors, ...steps.map((s) => `${s.action} ${s.notes}`)].join(" ");
  const gaps: GapItem[] = [
    ...buildTypedGaps(goal, actors, steps, decisions),
    ...getDomainGapItems(domainPack, corpus),
  ];

  // Partial artifact for passing into dependent engines
  const partialArtifact = {
    topic, goal, trigger, outcomes, actors, touchpoints, steps, decisions, exceptions, domain: resolvedDomain,
    gaps, questions, assumptions, narrative, scope: "", title: "", sourceFiles: sources.map((s) => s.relativePath),
  } as AnalysisArtifact;

  // ── P0: State machine extraction ─────────────────────────────────────────────
  const stateMachine = extractStateMachine(sources, steps);

  // ── P1: Permission analysis ───────────────────────────────────────────────────
  const permissions = extractPermissions(sources, steps, actors);

  // ── P1: Async event modeling ──────────────────────────────────────────────────
  const { asyncEvents, externalDependencies } = extractAsyncEvents(sources, steps);

  // ── P2: Contradiction detection ───────────────────────────────────────────────
  const contradictions = detectContradictions(sources);
  const enrichedGaps = dedupeGapItems([
    ...gaps,
    ...buildDerivedGapsFromAnalysis({
      permissions,
      asyncEvents,
      stateMachine,
      contradictions,
      steps,
    }),
  ]);

  // Build the enriched artifact for risk/scenario engines
  const enrichedArtifact: AnalysisArtifact = {
    ...partialArtifact,
    domainPack: domainPack.name,
    stateMachine,
    permissions,
    asyncEvents,
    externalDependencies,
    contradictions,
    gaps: enrichedGaps,
  };

  // ── P1: Risk scoring ──────────────────────────────────────────────────────────
  const risks = scoreRisks(enrichedArtifact);

  // ── P1: Scenario seed generation ──────────────────────────────────────────────
  const scenarios = generateScenarioSeeds({ ...enrichedArtifact, risks });

  // ── P3: Data contracts and implementation constraints ─────────────────────
  const dataContracts: DataContract[] = extractDataFormats(sources);
  const implementationConstraints: ImplementationConstraint[] = extractImplementationNotes(sources);

  return {
    title: `${topic} Business Flow Document`,
    topic,
    goal,
    scope: "In scope: business process steps stated in the source corpus. Out of scope: inferred rules, hidden branches, and unsupported system behavior.",
    sourceFiles: sources.map((source) => source.relativePath),
    trigger,
    outcomes: outcomes.length > 0 ? outcomes : ["Unknown / needs confirmation"],
    actors: actors.length > 0 ? actors : ["Unknown / needs confirmation"],
    touchpoints: touchpoints.length > 0 ? touchpoints : ["Unknown / needs confirmation"],
    steps,
    narrative,
    decisions: decisions.length > 0 ? decisions : ["Unknown / needs confirmation"],
    exceptions,
    questions,
    assumptions,
    gaps: enrichedGaps,
    domain: resolvedDomain,
    domainPack: domainPack.name,
    stateMachine,
    permissions,
    asyncEvents,
    externalDependencies,
    risks,
    scenarios,
    contradictions,
    crossFlowImpacts: buildCrossFlowImpacts({
      domain: resolvedDomain,
      asyncEvents,
      externalDependencies,
      permissions,
      risks,
    }),
    dataContracts: dataContracts.length > 0 ? dataContracts : undefined,
    implementationConstraints: implementationConstraints.length > 0 ? implementationConstraints : undefined,
  };
}

export function buildHeuristicMermaid(analysis: AnalysisArtifact, includeSwimlane: boolean): MermaidArtifact {
  const traceability = buildTraceability(analysis.steps);
  const flowchart = buildFlowchartDiagram(analysis);
  const swimlane = includeSwimlane ? buildSwimlaneDiagram(analysis) : undefined;
  const iconSelections = buildSemanticIconSelections(analysis);
  const stateDiagram = analysis.stateMachine?.stateDiagram;

  // Flatten typed gaps for backward-compatible mermaid gaps field
  const gapStrings = (analysis.gaps ?? []).map((g) => `[${g.category}] ${g.description}`);
  const fallbackGaps = analysis.questions.length > 0 ? analysis.questions : analysis.assumptions;

  return {
    facts: {
      trigger: analysis.trigger,
      outcomes: analysis.outcomes,
      actors: analysis.actors,
      decisions: analysis.decisions,
      exceptions: analysis.exceptions,
    },
    flowchart,
    swimlane,
    stateDiagram,
    iconSelections,
    traceability,
    gaps: gapStrings.length > 0 ? gapStrings : fallbackGaps,
  };
}

function buildSemanticIconSelections(analysis: AnalysisArtifact): MermaidIconSelection[] {
  const selections = new Map<string, MermaidIconSelection>();
  const domain = resolveBusinessDomain(analysis);

  for (const step of analysis.steps) {
    const object = resolveBusinessObject(step);
    const state = resolveLifecycleState(step);
    const mermaidClass = resolveSelectionClass(step);
    const fallbackExportIcon = resolveFallbackExportIcon(mermaidClass);
    const token = `${domain}.${object}.${state}`;

    if (!selections.has(token)) {
      selections.set(token, {
        token,
        mermaidClass,
        fallbackExportIcon,
        physicalSvgPath: `assets/mermaid-icons/library/${domain}/${token}.svg`,
        reason: summarizeSelectionReason(step, domain, object, state),
      });
    }
  }

  return [...selections.values()].slice(0, 8);
}

function resolveBusinessDomain(analysis: AnalysisArtifact): string {
  const corpus = [analysis.topic, analysis.goal, analysis.trigger, ...analysis.outcomes, ...analysis.touchpoints, ...analysis.actors]
    .join(" ")
    .toLowerCase();

  const domainPatterns: Array<[string, RegExp]> = [
    ["commerce", /checkout|cart|order|catalog|purchase|buyer|seller/],
    ["identity", /login|sign in|authenticate|identity|access|role|permission|mfa/],
    ["finance", /payment|invoice|refund|settlement|billing|charge|wallet/],
    ["risk", /fraud|risk|alert|watchlist|score|suspicious/],
    ["compliance", /kyc|policy|audit|compliance|regulation/],
    ["fulfillment", /shipment|delivery|warehouse|dispatch|carrier|pack/],
    ["support", /ticket|case|incident|support|escalation/],
    ["marketing", /campaign|audience|lead|consent|nurture/],
    ["analytics", /report|dashboard|metric|analytics|trend/],
    ["platform", /api|service|queue|job|event|integration|system/],
    ["data", /database|record|dataset|sync|storage|ledger/],
    ["operations", /review|task|workflow|intake|process|operator|staff/],
    ["customer", /customer|profile|account|user/],
    ["content", /document|publish|content|article|file/],
    ["sales", /lead|opportunity|quote|contract|proposal/],
  ];

  for (const [domain, pattern] of domainPatterns) {
    if (pattern.test(corpus)) {
      return domain;
    }
  }

  return "operations";
}

function resolveBusinessObject(step: BusinessFlowStep): string {
  const text = `${step.actor} ${step.action} ${step.touchpoint} ${step.outcome} ${step.notes}`.toLowerCase();
  const objectPatterns: Array<[string, RegExp]> = [
    ["approval", /approve|approval|authorize|authorized/],
    ["payment", /payment|pay|transaction|wallet|card|charge/],
    ["invoice", /invoice|bill|billing/],
    ["order", /order|cart|checkout|purchase/],
    ["shipment", /shipment|ship|delivery|carrier|dispatch/],
    ["ticket", /ticket|case|incident|issue|support/],
    ["document", /document|form|file|attachment/],
    ["notification", /notify|notification|email|mail|sms|message/],
    ["user", /user|customer|buyer|guest|staff|manager|reviewer/],
    ["role", /role|permission|access/],
    ["rule", /rule|policy|eligib|validate|check|decision/],
    ["report", /report|dashboard|metric|summary/],
    ["record", /record|database|db|ledger|store|save|archive/],
    ["review", /review|verify|inspect|assess/],
    ["task", /task|process|handle|perform|complete/],
    ["request", /request|submit|application|create|open|receive/],
  ];

  for (const [object, pattern] of objectPatterns) {
    if (pattern.test(text)) {
      return object;
    }
  }

  return "task";
}

function resolveLifecycleState(step: BusinessFlowStep): string {
  const text = `${step.action} ${step.decision} ${step.outcome} ${step.notes}`.toLowerCase();

  if (/reject|denied|failed|error|cancel|invalid|unavailable/.test(text)) {
    return "rejected";
  }
  if (/approve|authorized|accepted/.test(text)) {
    return "approved";
  }
  if (/verify|validated|confirmed|matched|checked/.test(text)) {
    return "verified";
  }
  if (/complete|completed|posted|fulfilled|delivered|archived|recorded/.test(text)) {
    return "completed";
  }
  if (/submit|sent|requested|created|opened|received/.test(text)) {
    return "submitted";
  }

  return "draft";
}

function resolveSelectionClass(step: BusinessFlowStep): MermaidIconSelection["mermaidClass"] {
  if (step.notes !== "-") {
    return "exception";
  }
  if (step.decision !== "-") {
    return "decision";
  }
  if (step.touchpoint && isExternalTouchpoint(step.touchpoint)) {
    return "external";
  }

  return "process";
}

function resolveFallbackExportIcon(mermaidClass: MermaidIconSelection["mermaidClass"]): string {
  switch (mermaidClass) {
    case "decision":
      return "assets/mermaid-icons/decision.svg";
    case "exception":
      return "assets/mermaid-icons/exception.svg";
    case "external":
      return "assets/mermaid-icons/external-system.svg";
    case "startEnd":
      return "assets/mermaid-icons/start-end.svg";
    case "note":
      return "assets/mermaid-icons/process.svg";
    case "process":
    default:
      return "assets/mermaid-icons/process.svg";
  }
}

function summarizeSelectionReason(step: BusinessFlowStep, domain: string, object: string, state: string): string {
  const reasons = [
    `domain \`${domain}\` matches the overall business context`,
    `object \`${object}\` matches the main noun or action target in the step`,
    `state \`${state}\` reflects the supported business status`,
  ];

  if (step.touchpoint) {
    reasons.push(`touchpoint evidence: ${step.touchpoint}`);
  }

  return reasons.join("; ");
}

function collectCandidateLines(sources: ExtractedSource[]): CandidateLine[] {
  const output: CandidateLine[] = [];

  for (const source of sources) {
    for (const line of source.lines) {
      const trimmed = line.text.trim();
      if (!trimmed || trimmed.length < 3) {
        continue;
      }

      output.push({
        text: trimmed,
        evidence: `${line.relativePath} L${line.lineNumber}: ${trimmed}`,
      });
    }
  }

  return output;
}

function extractStructuredFlowData(sources: ExtractedSource[]): StructuredFlowData {
  const structured: StructuredFlowData = {
    actors: [],
    steps: [],
    touchpoints: [],
    outcomes: [],
  };

  for (const source of sources) {
    let currentSection = "";

    for (const line of source.lines) {
      const trimmed = line.text.trim();
      if (!trimmed) {
        continue;
      }

      const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
      if (headingMatch) {
        currentSection = normalizeSection(headingMatch[1]);
        continue;
      }

      // Skip markdown table rows and dividers — they are layout, not flow content.
      if (isMarkdownTableNoise(trimmed)) {
        continue;
      }

      const candidate: CandidateLine = {
        text: stripListMarker(trimmed),
        evidence: `${line.relativePath} L${line.lineNumber}: ${trimmed}`,
      };

      if (currentSection === "goal" && !structured.goal) {
        structured.goal = candidate;
        continue;
      }

      if (currentSection === "actors") {
        structured.actors.push(candidate);
        continue;
      }

      if (currentSection === "steps" && /^([\-*]|\d+[.)])\s+/.test(trimmed)) {
        structured.steps.push(candidate);
        continue;
      }

      if (currentSection === "touchpoints") {
        structured.touchpoints.push(candidate);
        continue;
      }

      if (currentSection === "outcomes") {
        structured.outcomes.push(candidate);
      }
    }
  }

  return structured;
}

function buildStepMetadataMap(sources: ExtractedSource[]): Map<string, StepMetadata> {
  const metadata = new Map<string, StepMetadata>();

  for (const source of sources) {
    if (!isSpreadsheetSource(source.extension)) {
      continue;
    }

    for (const table of extractTabularBlocks(source)) {
      const header = table.header.map((value) => normalizeColumnName(value));
      const stepIndex = findColumnIndex(header, ["step", "business step", "action", "activity", "task", "flow step"]);
      const touchpointIndex = findColumnIndex(header, ["touchpoint", "system touchpoint", "channel", "screen", "page", "api", "service"]);
      const outcomeIndex = findColumnIndex(header, ["expected outcome", "outcome", "expected result", "result", "status"]);

      if (stepIndex === -1 || (touchpointIndex === -1 && outcomeIndex === -1)) {
        continue;
      }

      for (const row of table.rows) {
        const step = row[stepIndex]?.trim();
        if (!step) {
          continue;
        }

        const normalizedKey = normalizeActionKey(step);
        const existing = metadata.get(normalizedKey) ?? {};
        metadata.set(normalizedKey, {
          touchpoint: pickPreferredMetadata(existing.touchpoint, row[touchpointIndex]),
          outcome: pickPreferredMetadata(existing.outcome, row[outcomeIndex]),
        });
      }
    }
  }

  return metadata;
}

function buildSteps(
  candidateLines: CandidateLine[],
  structuredSteps: CandidateLine[],
  actors: string[],
  touchpoints: string[],
  stepMetadataMap: Map<string, StepMetadata>
): BusinessFlowStep[] {
  const explicitStepLines = candidateLines.filter((line) => /^([\-*]|\d+[.)])\s+/.test(line.text));
  const sourceLines = structuredSteps.length > 0 ? structuredSteps : explicitStepLines.length > 0 ? explicitStepLines : candidateLines.slice(0, 8);

  return sourceLines.slice(0, 20).map((line, index) => {
    const cleanText = stripListMarker(line.text);
    const metadata = resolveStepMetadata(cleanText, stepMetadataMap);
    const actor = resolveActor(cleanText, actors) ?? extractActor(cleanText) ?? actors[0] ?? "";
    const touchpoint = metadata.touchpoint ?? extractTouchpoint(cleanText) ?? "";
    const decision = DECISION_PATTERN.test(cleanText) ? summarizeSentence(cleanText) : "-";
    const outcome = metadata.outcome ?? (OUTCOME_PATTERN.test(cleanText) ? summarizeSentence(cleanText) : "Expected result needs confirmation");
    const notes = EXCEPTION_PATTERN.test(cleanText) ? summarizeSentence(cleanText) : "-";

    return {
      index: index + 1,
      actor,
      action: summarizeSentence(cleanText),
      decision,
      touchpoint,
      outcome,
      notes,
      evidence: line.evidence,
    };
  });
}

function resolveStepMetadata(action: string, metadataMap: Map<string, StepMetadata>): StepMetadata {
  const actionKey = normalizeActionKey(action);

  for (const [key, value] of metadataMap.entries()) {
    if (actionKey === key || actionKey.includes(key) || key.includes(actionKey) || haveHighTokenOverlap(actionKey, key)) {
      return value;
    }
  }

  return {};
}

function buildTraceability(steps: BusinessFlowStep[]): MermaidNodeTrace[] {
  const traceability: MermaidNodeTrace[] = [];
  let decisionIndex = 1;

  for (const step of steps) {
    traceability.push({
      nodeId: `N${step.index}`,
      text: step.actor ? `${step.actor}: ${step.action}` : step.action,
      evidence: step.evidence,
    });

    if (step.decision !== "-") {
      traceability.push({
        nodeId: `D${decisionIndex}`,
        text: step.decision,
        evidence: step.evidence,
      });
      traceability.push({
        nodeId: `E${decisionIndex}`,
        text: "Needs confirmation",
        evidence: `${step.evidence} | Alternate branch detail is not explicit in the source.`,
      });
      decisionIndex += 1;
    }
  }

  return traceability;
}

function buildFlowchartDiagram(analysis: AnalysisArtifact): string {
  const lines = [MERMAID_INIT_BLOCK, "flowchart TD", '  START(["Start"])', '  END(["End"])'];
  const tracker = createEdgeTracker();
  const nodeClasses = new Map<string, string>([
    ["START", "startEnd"],
    ["END", "startEnd"],
  ]);

  let previousNode = "START";
  let connectWithConfirmationLabel = false;
  let decisionIndex = 1;

  for (const step of analysis.steps) {
    const stepNodeId = `N${step.index}`;
    const stepLabel = buildStepDisplayLabel(step);
    lines.push(`  ${stepNodeId}["${escapeMermaidLabel(stepLabel)}"]`);
    nodeClasses.set(stepNodeId, resolveStepClass(step));
    addEdge(lines, tracker, previousNode, stepNodeId, connectWithConfirmationLabel ? "Confirmed" : undefined, "happyPath");
    connectWithConfirmationLabel = false;

    if (step.decision !== "-") {
      const decisionNodeId = `D${decisionIndex}`;
      const exceptionNodeId = `E${decisionIndex}`;
      lines.push(`  ${decisionNodeId}{"${wrapMermaidLabel(step.decision, 24)}"}`);
      lines.push(`  ${exceptionNodeId}["Needs confirmation"]`);
      nodeClasses.set(decisionNodeId, "decision");
      nodeClasses.set(exceptionNodeId, "exception");
      addEdge(lines, tracker, stepNodeId, decisionNodeId, undefined, "neutral");
      addEdge(lines, tracker, decisionNodeId, exceptionNodeId, "Needs confirmation", "exception");
      addEdge(lines, tracker, exceptionNodeId, "END", undefined, "exception");
      previousNode = decisionNodeId;
      connectWithConfirmationLabel = true;
      decisionIndex += 1;
      continue;
    }

    previousNode = stepNodeId;
  }

  addEdge(lines, tracker, previousNode, "END", connectWithConfirmationLabel ? "Confirmed" : undefined, "happyPath");
  lines.push(MERMAID_CLASS_DEFINITIONS);
  lines.push(...buildClassAssignments(nodeClasses));
  lines.push(...buildLinkStyleLines(tracker));

  return lines.join("\n");
}

function buildSwimlaneDiagram(analysis: AnalysisArtifact): string | undefined {
  const usableActors = analysis.actors.filter((actor) => actor !== "Unknown / needs confirmation");
  if (usableActors.length === 0) {
    return undefined;
  }

  const lines = [MERMAID_INIT_BLOCK, "flowchart LR", '  START(["Start"])', '  END(["End"])'];
  const tracker = createEdgeTracker();
  const nodeClasses = new Map<string, string>([
    ["START", "startEnd"],
    ["END", "startEnd"],
  ]);
  let decisionIndex = 1;

  usableActors.forEach((actor, actorIndex) => {
    const actorId = toMermaidId(actor);
    lines.push(`  subgraph ${actorId}["${escapeMermaidLabel(actor)}"]`);
    lines.push("    direction TB");

    for (const step of analysis.steps.filter((candidate) => candidate.actor.toLowerCase() === actor.toLowerCase())) {
      const stepNodeId = `N${step.index}`;
      lines.push(`    ${stepNodeId}["${escapeMermaidLabel(buildStepDisplayLabel(step, false))}"]`);
      nodeClasses.set(stepNodeId, resolveStepClass(step));

      if (step.decision !== "-") {
        const decisionNodeId = `D${decisionIndex}`;
        const exceptionNodeId = `E${decisionIndex}`;
        lines.push(`    ${decisionNodeId}{"${wrapMermaidLabel(step.decision, 24)}"}`);
        lines.push(`    ${exceptionNodeId}["Needs confirmation"]`);
        nodeClasses.set(decisionNodeId, "decision");
        nodeClasses.set(exceptionNodeId, "exception");
        decisionIndex += 1;
      }
    }

    lines.push("  end");
    lines.push(buildSwimlaneStyleLine(actorId, actorIndex));
  });

  let previousNode = "START";
  let connectWithConfirmationLabel = false;
  decisionIndex = 1;

  for (const step of analysis.steps) {
    const stepNodeId = `N${step.index}`;
    addEdge(lines, tracker, previousNode, stepNodeId, connectWithConfirmationLabel ? "Confirmed" : undefined, "happyPath");
    connectWithConfirmationLabel = false;

    if (step.decision !== "-") {
      const decisionNodeId = `D${decisionIndex}`;
      const exceptionNodeId = `E${decisionIndex}`;
      addEdge(lines, tracker, stepNodeId, decisionNodeId, undefined, "neutral");
      addEdge(lines, tracker, decisionNodeId, exceptionNodeId, "Needs confirmation", "exception");
      addEdge(lines, tracker, exceptionNodeId, "END", undefined, "exception");
      previousNode = decisionNodeId;
      connectWithConfirmationLabel = true;
      decisionIndex += 1;
      continue;
    }

    previousNode = stepNodeId;
  }

  addEdge(lines, tracker, previousNode, "END", connectWithConfirmationLabel ? "Confirmed" : undefined, "happyPath");
  lines.push(MERMAID_CLASS_DEFINITIONS);
  lines.push(...buildClassAssignments(nodeClasses));
  lines.push(...buildLinkStyleLines(tracker));

  return lines.join("\n");
}

function buildStepDisplayLabel(step: BusinessFlowStep, includeActor = true): string {
  const head = includeActor && step.actor ? `${step.actor}: ${step.action}` : step.action;
  const wrappedHead = wrapMermaidLabel(head, 28);

  if (step.touchpoint && step.touchpoint !== "-") {
    const wrappedTouchpoint = wrapMermaidLabel(step.touchpoint, 28);
    return `${wrappedHead}<br/>${wrappedTouchpoint}`;
  }
  return wrappedHead;
}

function buildClassAssignments(nodeClasses: Map<string, string>): string[] {
  const order = ["startEnd", "process", "decision", "exception", "external", "note"];
  const lines: string[] = [];

  for (const className of order) {
    const nodeIds = [...nodeClasses.entries()]
      .filter(([, value]) => value === className)
      .map(([nodeId]) => nodeId);

    if (nodeIds.length > 0) {
      lines.push(`  class ${nodeIds.join(",")} ${className};`);
    }
  }

  return lines;
}

function buildLinkStyleLines(tracker: EdgeTracker): string[] {
  const lines: string[] = [];

  if (tracker.happyPath.length > 0) {
    lines.push(`  linkStyle ${tracker.happyPath.join(",")} stroke:#2563EB,stroke-width:2.5px;`);
  }
  if (tracker.neutral.length > 0) {
    lines.push(`  linkStyle ${tracker.neutral.join(",")} stroke:#64748B,stroke-width:1.75px;`);
  }
  if (tracker.exception.length > 0) {
    lines.push(`  linkStyle ${tracker.exception.join(",")} stroke:#DC2626,stroke-width:2px,stroke-dasharray: 4 2;`);
  }

  return lines;
}

function addEdge(
  lines: string[],
  tracker: EdgeTracker,
  from: string,
  to: string,
  label: string | undefined,
  kind: keyof Omit<EdgeTracker, "nextIndex">
): void {
  if (label) {
    lines.push(`  ${from} -->|${escapeMermaidLabel(label)}| ${to}`);
  } else {
    lines.push(`  ${from} --> ${to}`);
  }
  tracker[kind].push(tracker.nextIndex);
  tracker.nextIndex += 1;
}

function createEdgeTracker(): EdgeTracker {
  return {
    nextIndex: 0,
    happyPath: [],
    neutral: [],
    exception: [],
  };
}

function buildNarrativeSentence(step: BusinessFlowStep): string {
  const actorPrefix = step.actor && !step.action.toLowerCase().startsWith(step.actor.toLowerCase()) ? `${step.actor} ` : "";
  return `${actorPrefix}${step.action}. Expected outcome: ${step.outcome}.`;
}

function buildTypedGaps(goal: string, actors: string[], steps: BusinessFlowStep[], decisions: string[]): GapItem[] {
  const gaps: GapItem[] = [];

  if (goal === "Unknown / needs confirmation") {
    gaps.push({ category: "missing-rule", description: "The business goal is not explicit in the source corpus — add a Goal section." });
  }
  if (actors.length === 0) {
    gaps.push({ category: "unresolved-actor", description: "The primary actor or owner is not explicit in the source corpus." });
  }
  if (steps.length === 0) {
    gaps.push({ category: "missing-rule", description: "No ordered steps were detected — confirm the intended business-flow sequence." });
  }
  if (decisions.length === 0) {
    gaps.push({ category: "undefined-branch", description: "No explicit branching rule was detected — confirm whether the flow is fully linear." });
  }

  // Check for steps with exception notes but no recovery mention
  const exceptionStepsWithNoRecovery = steps.filter(
    (s) => s.notes !== "-" && !/\b(retry|recovery|fallback|cancel|notify|escalate|revert)\b/i.test(s.notes)
  );
  if (exceptionStepsWithNoRecovery.length > 0) {
    gaps.push({
      category: "missing-rollback",
      description: `${exceptionStepsWithNoRecovery.length} exception step(s) have no recovery/rollback behavior: ${exceptionStepsWithNoRecovery.map((s) => `Step ${s.index}`).join(", ")}`,
    });
  }

  // Check for async indicators without callback
  const hasAsyncIndicator = steps.some((s) => /\b(webhook|queue|callback|async|event|timeout)\b/i.test(`${s.action} ${s.touchpoint}`));
  const hasCallbackMention = steps.some((s) => /\b(callback|on.*success|on.*failure|on.*complete)\b/i.test(`${s.action} ${s.notes}`));
  if (hasAsyncIndicator && !hasCallbackMention) {
    gaps.push({ category: "missing-async-callback", description: "Async/event pattern detected but no explicit callback or failure handler defined." });
  }

  return gaps;
}

function buildDerivedGapsFromAnalysis(input: {
  permissions: NonNullable<AnalysisArtifact["permissions"]>;
  asyncEvents: NonNullable<AnalysisArtifact["asyncEvents"]>;
  stateMachine: NonNullable<AnalysisArtifact["stateMachine"]>;
  contradictions: NonNullable<AnalysisArtifact["contradictions"]>;
  steps: BusinessFlowStep[];
}): GapItem[] {
  const gaps: GapItem[] = [];

  if (input.permissions.gaps.length > 0) {
    for (const gap of input.permissions.gaps.slice(0, 4)) {
      gaps.push({ category: "missing-permission", description: gap.description });
    }
  }

  if (input.asyncEvents.some((event) => !event.hasCallback)) {
    gaps.push({ category: "missing-async-callback", description: "At least one async event has no explicit callback or completion signal." });
  }

  if (input.asyncEvents.length > 0 && !input.asyncEvents.some((event) => event.retryPolicy)) {
    gaps.push({ category: "missing-retry", description: "Async operations are present but retry/backoff policy is not explicit." });
  }

  if (input.asyncEvents.length > 0 && !input.asyncEvents.some((event) => event.retryPolicy?.timeoutSeconds !== "unknown")) {
    gaps.push({ category: "missing-timeout", description: "Async operations are present but timeout/deadline behavior is not explicit." });
  }

  if (input.stateMachine.states.length < 2 || input.stateMachine.transitions.length === 0) {
    gaps.push({ category: "missing-state-detail", description: "The spec does not provide enough lifecycle detail to form a trustworthy state machine." });
  }

  if (input.stateMachine.invalidTransitions.length > 0) {
    gaps.push({ category: "missing-state-detail", description: input.stateMachine.invalidTransitions[0] });
  }

  if (input.contradictions.length > 0) {
    gaps.push({ category: "missing-rule", description: `Contradictory statements detected: ${input.contradictions[0].description}` });
  }

  if (input.steps.some((step) => step.decision !== "-" && /needs confirmation/i.test(`${step.outcome} ${step.notes}`))) {
    gaps.push({ category: "undefined-branch", description: "One or more decision points still rely on an unresolved 'Needs confirmation' branch." });
  }

  return gaps;
}

function dedupeGapItems(gaps: GapItem[]): GapItem[] {
  const seen = new Set<string>();

  return gaps.filter((gap) => {
    const key = `${gap.category}:${gap.description}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildCrossFlowImpacts(input: {
  domain: string;
  asyncEvents: NonNullable<AnalysisArtifact["asyncEvents"]>;
  externalDependencies: NonNullable<AnalysisArtifact["externalDependencies"]>;
  permissions: NonNullable<AnalysisArtifact["permissions"]>;
  risks: NonNullable<AnalysisArtifact["risks"]>;
}): CrossFlowImpactItem[] {
  const impacts: CrossFlowImpactItem[] = [];

  if (input.asyncEvents.length > 0) {
    impacts.push({
      area: "Status propagation",
      impact: "Async completion timing can change downstream confirmation and terminal-state timing.",
      reason: "Webhook, callback, queue, or polling patterns were detected.",
    });
  }

  if (input.externalDependencies.length > 0) {
    impacts.push({
      area: "External integration stability",
      impact: "Changes in dependency behavior may affect customer-facing completion, retries, and exception paths.",
      reason: "External dependencies were extracted from the source corpus.",
    });
  }

  if (input.permissions.entries.length > 0 || input.permissions.gaps.length > 0) {
    impacts.push({
      area: "Role boundary consistency",
      impact: "Role or action changes can alter approval, review, and management flow ownership across connected steps.",
      reason: "Permission matrix entries or permission gaps were identified.",
    });
  }

  if (input.domain === "commerce" || input.domain === "finance") {
    impacts.push({
      area: "Financial reconciliation",
      impact: "Order and payment state changes can affect downstream reconciliation, settlement, and confirmation messaging.",
      reason: "The resolved domain indicates a commerce or finance workflow.",
    });
  }

  if (input.domain === "identity") {
    impacts.push({
      area: "Access continuity",
      impact: "Authentication and role-state changes can affect session validity, approval paths, and audit expectations.",
      reason: "The resolved domain indicates an identity workflow.",
    });
  }

  if (input.risks.level === "high" || input.risks.level === "critical") {
    impacts.push({
      area: "Operational assurance",
      impact: "High-risk hotspots should trigger regression and abuse-failure coverage before downstream process changes are released.",
      reason: `Risk score is ${input.risks.total}/100 with level ${input.risks.level}.`,
    });
  }

  return impacts.slice(0, 5);
}

function buildQuestions(goal: string, actors: string[], steps: BusinessFlowStep[], decisions: string[]): string[] {
  const questions: string[] = [];

  if (goal === "Unknown / needs confirmation") {
    questions.push("The business goal is not explicit in the source corpus.");
  }
  if (actors.length === 0) {
    questions.push("The primary actor or owner is not explicit in the source corpus.");
  }
  if (steps.length === 0) {
    questions.push("No ordered steps were detected; confirm the intended business-flow sequence.");
  }
  if (decisions.length === 0) {
    questions.push("No explicit branching rule was detected; confirm whether the flow is fully linear.");
  }

  return questions;
}

function buildAssumptions(actors: string[], touchpoints: string[], decisions: string[]): string[] {
  const assumptions: string[] = [];

  if (actors.length === 0) {
    assumptions.push("Actor ownership is unknown and needs confirmation.");
  }
  if (touchpoints.length === 0) {
    assumptions.push("System touchpoints are not explicit in the source corpus.");
  }
  if (decisions.length === 0) {
    assumptions.push("No explicit branching was found, so the heuristic output keeps a mostly linear flow.");
  }

  return assumptions;
}

function resolveStepClass(step: BusinessFlowStep): string {
  if (step.notes !== "-") {
    return "exception";
  }

  if (step.touchpoint && isExternalTouchpoint(step.touchpoint)) {
    return "external";
  }

  if (/\b(system|service)\b/i.test(step.actor)) {
    return "external";
  }

  return "process";
}

function normalizeSection(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes("goal") || normalized.includes("objective")) {
    return "goal";
  }
  if (normalized.includes("actor") || normalized.includes("role")) {
    return "actors";
  }
  if (normalized.includes("step") || normalized.includes("flow")) {
    return "steps";
  }
  if (normalized.includes("touchpoint")) {
    return "touchpoints";
  }
  if (normalized.includes("outcome") || normalized.includes("result")) {
    return "outcomes";
  }
  return "";
}

function stripListMarker(value: string): string {
  return value.replace(/^([\-*]|\d+[.)])\s+/, "").trim();
}

function normalizeActionKey(value: string): string {
  return stripListMarker(value)
    .toLowerCase()
    .replace(/^step\s*\d+[:.)-]?\s*/i, "")
    .replace(/^customer\s+|^system\s+|^service\s+|^user\s+|^payment service\s+/, "")
    .replace(/\bopens\b/g, "open")
    .replace(/\bopenes\b/g, "open")
    .replace(/\breviews\b/g, "review")
    .replace(/\bvalidates\b/g, "validate")
    .replace(/\bshows\b/g, "show")
    .replace(/\bstops\b/g, "stop")
    .replace(/\bsubmits\b/g, "submit")
    .replace(/\bconfirms\b/g, "confirm")
    .replace(/\bcreates\b/g, "create")
    .replace(/\bchecks\b/g, "check")
    .replace(/\bselects\b/g, "select")
    .replace(/\bupdates\b/g, "update")
    .replace(/\benters\b/g, "enter")
    .replace(/\bpayments\b/g, "payment")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isSpreadsheetSource(extension: string): boolean {
  return [".csv", ".tsv", ".xlsx", ".xls"].includes(extension.toLowerCase());
}

function extractTabularBlocks(source: ExtractedSource): Array<{ header: string[]; rows: string[][] }> {
  const markdownTables = extractMarkdownTables(source);
  if (markdownTables.length > 0) {
    return markdownTables;
  }

  return extractDelimitedRows(source);
}

function extractMarkdownTables(source: ExtractedSource): Array<{ header: string[]; rows: string[][] }> {
  const tables: Array<{ header: string[]; rows: string[][] }> = [];
  const lines = source.lines.map((line) => line.text.trim());

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!looksLikeMarkdownRow(lines[index]) || !isMarkdownDivider(lines[index + 1])) {
      continue;
    }

    const header = parseMarkdownRow(lines[index]);
    const rows: string[][] = [];
    let rowIndex = index + 2;

    while (rowIndex < lines.length && looksLikeMarkdownRow(lines[rowIndex])) {
      rows.push(parseMarkdownRow(lines[rowIndex]));
      rowIndex += 1;
    }

    tables.push({ header, rows });
    index = rowIndex - 1;
  }

  return tables;
}

function extractDelimitedRows(source: ExtractedSource): Array<{ header: string[]; rows: string[][] }> {
  const rows = source.lines
    .map((line) => line.text.trim())
    .filter((line) => line && !line.startsWith("## Sheet:"));

  if (rows.length < 2) {
    return [];
  }

  const parsedRows = rows.map((row) => parseTabularRow(row, source.extension));
  return [{
    header: parsedRows[0],
    rows: parsedRows.slice(1),
  }];
}

function looksLikeMarkdownRow(value: string): boolean {
  return value.startsWith("|") && value.endsWith("|");
}

function isMarkdownDivider(value: string): boolean {
  return /^\|(?:\s*:?-{3,}:?\s*\|)+$/.test(value);
}

function parseMarkdownRow(value: string): string[] {
  return value
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function normalizeColumnName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findColumnIndex(header: string[], aliases: string[]): number {
  for (const alias of aliases) {
    const normalizedAlias = normalizeColumnName(alias);
    const exactIndex = header.indexOf(normalizedAlias);
    if (exactIndex !== -1) {
      return exactIndex;
    }
  }

  for (const alias of aliases) {
    const normalizedAlias = normalizeColumnName(alias);
    const fuzzyIndex = header.findIndex((value) => value.includes(normalizedAlias) || normalizedAlias.includes(value));
    if (fuzzyIndex !== -1) {
      return fuzzyIndex;
    }
  }

  return -1;
}

function pickPreferredMetadata(existing: string | undefined, candidate: string | undefined): string | undefined {
  const normalizedCandidate = candidate?.trim();
  if (!normalizedCandidate) {
    return existing;
  }

  if (!existing || normalizedCandidate.length > existing.length) {
    return normalizedCandidate;
  }

  return existing;
}

function parseTabularRow(row: string, extension: string): string[] {
  if (row.includes("|")) {
    return row
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const delimiter = extension.toLowerCase() === "tsv" ? "\t" : ",";
  return row.split(delimiter).map((value) => value.trim());
}

function resolveActor(value: string, actors: string[]): string | undefined {
  const lowered = value.toLowerCase();
  const sortedActors = [...actors].sort((left, right) => right.length - left.length);

  return sortedActors.find((actor) => lowered.includes(actor.toLowerCase()));
}

function haveHighTokenOverlap(left: string, right: string): boolean {
  const leftTokens = new Set(left.split(/\s+/).filter(Boolean));
  const rightTokens = right.split(/\s+/).filter(Boolean);
  const overlap = rightTokens.filter((token) => leftTokens.has(token)).length;
  return rightTokens.length > 0 && overlap / rightTokens.length >= 0.66;
}

function findFirstMatching(lines: CandidateLine[], pattern: RegExp): string | undefined {
  return lines.find((line) => pattern.test(line.text))?.text;
}

function extractActor(value: string): string | undefined {
  const match = value.match(ACTOR_PATTERN);
  return match ? titleCase(match[0]) : undefined;
}

function extractTouchpoint(value: string): string | undefined {
  const match = value.match(TOUCHPOINT_PATTERN);
  return match ? titleCase(match[0]) : undefined;
}

function summarizeSentence(value: string): string {
  const text = compactLines(value).join(" ");
  const cleaned = text.replace(/^#+\s*/, "").replace(/[.;]+$/, "");
  return cleaned.length > 140 ? `${cleaned.slice(0, 137)}...` : cleaned;
}

function toMermaidId(value: string): string {
  const normalized = value.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return normalized.length > 0 ? normalized : "Actor";
}

function isMarkdownTableNoise(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  // Markdown table row or divider: starts with `|` or is a `|---|---|` divider
  if (/^\|/.test(trimmed)) {
    return true;
  }
  if (/^[-:|\s]+$/.test(trimmed) && trimmed.includes("-")) {
    return true;
  }
  return false;
}

function cleanGoalText(value: string): string {
  return value
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[`*_]+|[`*_]+$/g, "")
    .replace(/\s+/g, " ")
    .trim() || "Unknown / needs confirmation";
}
