import type { AnalysisArtifact, MermaidArtifact, ValidationCheck, ValidationResult } from "../types.js";

/**
 * Runs all validation checks against an analysis + mermaid artifact pair.
 * Returns a structured ValidationResult with pass/warn/fail checks.
 */
export function runValidation(analysis: AnalysisArtifact, mermaid?: MermaidArtifact): ValidationResult {
    const checks: ValidationCheck[] = [
        checkGoalDefined(analysis),
        checkActorsDefined(analysis),
        checkTriggerDefined(analysis),
        checkOutcomesDefined(analysis),
        checkStepsPresent(analysis),
        checkEveryStepHasEvidence(analysis),
        checkDecisionsHaveBranches(analysis),
        checkExceptionsHaveNotes(analysis),
        checkNoOrphanSteps(analysis),
        checkAsyncHasCallback(analysis),
        checkPermissionsComplete(analysis),
        checkStateMachineConsistency(analysis),
        checkRiskScoringComplete(analysis),
        checkScenariosPresent(analysis),
        checkNoContradictions(analysis),
        ...(mermaid ? checkMermaidArtifact(mermaid) : []),
    ];

    const passCount = checks.filter((c) => c.status === "pass").length;
    const warnCount = checks.filter((c) => c.status === "warn").length;
    const failCount = checks.filter((c) => c.status === "fail").length;
    const score = Math.round((passCount / checks.length) * 100);

    return { checks, passCount, warnCount, failCount, score };
}

// ─── Individual checks ────────────────────────────────────────────────────────

function checkGoalDefined(analysis: AnalysisArtifact): ValidationCheck {
    const isUnknown = analysis.goal.toLowerCase().includes("unknown") || analysis.goal.toLowerCase().includes("needs confirmation");
    return {
        rule: "Goal is defined",
        status: isUnknown ? "fail" : "pass",
        detail: isUnknown
            ? "The business goal was not extracted from the source. Add a 'Goal' heading to the spec."
            : `Goal: "${truncate(analysis.goal, 80)}"`,
    };
}

function checkActorsDefined(analysis: AnalysisArtifact): ValidationCheck {
    const unknownActors = analysis.actors.filter((a) => a.toLowerCase().includes("unknown"));
    if (analysis.actors.length === 0 || unknownActors.length === analysis.actors.length) {
        return {
            rule: "Actors are defined",
            status: "fail",
            detail: "No actors/roles were found. Add an 'Actors' section to the spec.",
        };
    }
    return {
        rule: "Actors are defined",
        status: "pass",
        detail: `Actors: ${analysis.actors.slice(0, 5).join(", ")}`,
    };
}

function checkTriggerDefined(analysis: AnalysisArtifact): ValidationCheck {
    const isUnknown = analysis.trigger.toLowerCase().includes("unknown");
    return {
        rule: "Trigger is defined",
        status: isUnknown ? "warn" : "pass",
        detail: isUnknown
            ? "Flow trigger was not inferred. Add a trigger statement to the spec."
            : `Trigger: "${truncate(analysis.trigger, 80)}"`,
    };
}

function checkOutcomesDefined(analysis: AnalysisArtifact): ValidationCheck {
    const unknownOutcomes = analysis.outcomes.filter((o) => o.toLowerCase().includes("unknown"));
    if (analysis.outcomes.length === 0 || unknownOutcomes.length === analysis.outcomes.length) {
        return {
            rule: "Outcomes are defined",
            status: "warn",
            detail: "No explicit outcomes detected. Add an 'Outcomes' section to the spec.",
        };
    }
    return {
        rule: "Outcomes are defined",
        status: "pass",
        detail: `${analysis.outcomes.length} outcome(s) extracted`,
    };
}

function checkStepsPresent(analysis: AnalysisArtifact): ValidationCheck {
    if (analysis.steps.length === 0) {
        return { rule: "Steps are present", status: "fail", detail: "No steps were extracted from the source corpus." };
    }
    return { rule: "Steps are present", status: "pass", detail: `${analysis.steps.length} step(s) extracted` };
}

function checkEveryStepHasEvidence(analysis: AnalysisArtifact): ValidationCheck {
    const missing = analysis.steps.filter((s) => !s.evidence || s.evidence.trim() === "");
    if (missing.length > 0) {
        return {
            rule: "Every step has evidence",
            status: "warn",
            detail: `${missing.length} step(s) are missing evidence: ${missing.map((s) => `Step ${s.index}`).join(", ")}`,
        };
    }
    return { rule: "Every step has evidence", status: "pass", detail: "All steps have source evidence" };
}

function checkDecisionsHaveBranches(analysis: AnalysisArtifact): ValidationCheck {
    const stepsWithDecision = analysis.steps.filter((s) => s.decision !== "-");
    const needsConfirmation = stepsWithDecision.filter((s) => s.notes.toLowerCase().includes("needs confirmation") || s.outcome.toLowerCase().includes("needs confirmation"));
    if (needsConfirmation.length > 0) {
        return {
            rule: "Every decision has defined branches",
            status: "warn",
            detail: `${needsConfirmation.length} decision(s) have unconfirmed branches`,
        };
    }
    return {
        rule: "Every decision has defined branches",
        status: stepsWithDecision.length > 0 ? "pass" : "warn",
        detail: stepsWithDecision.length > 0 ? `${stepsWithDecision.length} decision(s) have branches` : "No decisions found — verify flow has no branching logic",
    };
}

function checkExceptionsHaveNotes(analysis: AnalysisArtifact): ValidationCheck {
    if (analysis.exceptions.length === 0) {
        return {
            rule: "Exception paths are documented",
            status: "warn",
            detail: "No exceptions were detected. Verify the spec covers failure scenarios.",
        };
    }
    return {
        rule: "Exception paths are documented",
        status: "pass",
        detail: `${analysis.exceptions.length} exception path(s) found`,
    };
}

function checkNoOrphanSteps(analysis: AnalysisArtifact): ValidationCheck {
    const stepsWithoutActor = analysis.steps.filter((s) => !s.actor || s.actor.trim() === "");
    if (stepsWithoutActor.length > 0) {
        return {
            rule: "Every step has an actor",
            status: "warn",
            detail: `${stepsWithoutActor.length} step(s) have no actor: ${stepsWithoutActor.map((s) => `Step ${s.index}`).join(", ")}`,
        };
    }
    return { rule: "Every step has an actor", status: "pass", detail: "All steps have actor ownership" };
}

function checkAsyncHasCallback(analysis: AnalysisArtifact): ValidationCheck {
    const asyncEvents = analysis.asyncEvents ?? [];
    if (asyncEvents.length === 0) {
        return {
            rule: "Async events have callbacks",
            status: "warn",
            detail: "No async events detected. If the flow uses webhooks/queues, add them to the spec.",
        };
    }
    const missingCallback = asyncEvents.filter((e) => !e.hasCallback);
    if (missingCallback.length > 0) {
        return {
            rule: "Async events have callbacks",
            status: "fail",
            detail: `${missingCallback.length} async event(s) have no callback or recovery: ${missingCallback.map((e) => e.name).join(", ")}`,
        };
    }
    return { rule: "Async events have callbacks", status: "pass", detail: `${asyncEvents.length} async event(s) all have callbacks` };
}

function checkPermissionsComplete(analysis: AnalysisArtifact): ValidationCheck {
    const matrix = analysis.permissions;
    if (!matrix || matrix.entries.length === 0) {
        return {
            rule: "Permission matrix is complete",
            status: "warn",
            detail: "No permission rules were extracted. Add role/access statements to the spec.",
        };
    }
    if (matrix.gaps.length > 0) {
        return {
            rule: "Permission matrix is complete",
            status: "warn",
            detail: `${matrix.gaps.length} permission gap(s) found: ${matrix.gaps.map((g) => g.action).join(", ")}`,
        };
    }
    if (matrix.conflicts.length > 0) {
        return {
            rule: "Permission matrix is complete",
            status: "fail",
            detail: `${matrix.conflicts.length} permission conflict(s) detected`,
        };
    }
    return {
        rule: "Permission matrix is complete",
        status: "pass",
        detail: `${matrix.entries.length} permission entrie(s) with no conflicts`,
    };
}

function checkStateMachineConsistency(analysis: AnalysisArtifact): ValidationCheck {
    const sm = analysis.stateMachine;
    if (!sm || sm.states.length === 0) {
        return {
            rule: "State machine is consistent",
            status: "warn",
            detail: "No states were extracted. The spec may be missing status/lifecycle information.",
        };
    }
    if (sm.invalidTransitions.length > 0) {
        return {
            rule: "State machine is consistent",
            status: "fail",
            detail: `${sm.invalidTransitions.length} invalid transition(s): ${sm.invalidTransitions[0]}…`,
        };
    }
    return {
        rule: "State machine is consistent",
        status: "pass",
        detail: `${sm.states.length} state(s), ${sm.transitions.length} transition(s), no invalid transitions`,
    };
}

function checkRiskScoringComplete(analysis: AnalysisArtifact): ValidationCheck {
    const risks = analysis.risks;
    if (!risks) {
        return {
            rule: "Risk scoring is complete",
            status: "warn",
            detail: "No risk scoring was performed.",
        };
    }
    return {
        rule: "Risk scoring is complete",
        status: risks.level === "critical" ? "fail" : risks.level === "high" ? "warn" : "pass",
        detail: `Risk level: ${risks.level.toUpperCase()} (score: ${risks.total}/100), ${risks.hotspots.length} hotspot(s)`,
    };
}

function checkScenariosPresent(analysis: AnalysisArtifact): ValidationCheck {
    const seeds = analysis.scenarios ?? [];
    if (seeds.length === 0) {
        return {
            rule: "Scenario seeds are present",
            status: "warn",
            detail: "No test scenario seeds were generated.",
        };
    }
    const kinds = new Set(seeds.map((s) => s.kind));
    const hasAllKinds = kinds.has("happy-path") && kinds.has("edge-case") && kinds.has("abuse-failure");
    return {
        rule: "Scenario seeds are present",
        status: hasAllKinds ? "pass" : "warn",
        detail: `${seeds.length} seed(s) across: ${[...kinds].join(", ")}`,
    };
}

function checkNoContradictions(analysis: AnalysisArtifact): ValidationCheck {
    const contradictions = analysis.contradictions ?? [];
    if (contradictions.length === 0) {
        return { rule: "No contradictions detected", status: "pass", detail: "No conflicting statements found across source files" };
    }
    return {
        rule: "No contradictions detected",
        status: "fail",
        detail: `${contradictions.length} contradiction(s) found: ${contradictions[0].description}`,
    };
}

function checkMermaidArtifact(mermaid: MermaidArtifact): ValidationCheck[] {
    const checks: ValidationCheck[] = [];

    checks.push({
        rule: "Mermaid flowchart is non-empty",
        status: mermaid.flowchart && mermaid.flowchart.includes("flowchart") ? "pass" : "fail",
        detail: mermaid.flowchart ? "Flowchart diagram is present" : "Flowchart is empty",
    });

    checks.push({
        rule: "Mermaid traceability is present",
        status: mermaid.traceability.length > 0 ? "pass" : "fail",
        detail: mermaid.traceability.length > 0
            ? `${mermaid.traceability.length} traced node(s)`
            : "No traceability entries generated",
    });

    return checks;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(value: string, max: number): string {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
