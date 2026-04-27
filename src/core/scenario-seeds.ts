import type { AnalysisArtifact, ScenarioKind, ScenarioSeed } from "../types.js";

/**
 * Generates test scenario seeds from an analysis artifact.
 * Produces happy-path, edge-case, abuse-failure, and regression seeds.
 */
export function generateScenarioSeeds(analysis: AnalysisArtifact): ScenarioSeed[] {
    const seeds: ScenarioSeed[] = [
        ...generateHappyPathSeeds(analysis),
        ...generateEdgeCaseSeeds(analysis),
        ...generateAbuseFailureSeeds(analysis),
        ...generateRegressionSeeds(analysis),
    ];

    return seeds.slice(0, 20);
}

// ─── Happy Path ───────────────────────────────────────────────────────────────

function generateHappyPathSeeds(analysis: AnalysisArtifact): ScenarioSeed[] {
    const seeds: ScenarioSeed[] = [];

    const primaryOutcome = analysis.outcomes[0] ?? "the flow completes successfully";
    const primaryActor = analysis.actors.find((a) => !a.toLowerCase().includes("unknown")) ?? "User";
    const trigger = analysis.trigger !== "Unknown / needs confirmation" ? analysis.trigger : "the flow is initiated";

    seeds.push({
        kind: "happy-path",
        title: `${primaryActor} completes the ${analysis.topic} flow successfully`,
        given: `${primaryActor} is authenticated and all preconditions are met`,
        when: trigger,
        then: primaryOutcome,
    });

    // One seed per main step outcome
    for (const step of analysis.steps.slice(0, 4)) {
        if (step.outcome && !step.outcome.toLowerCase().includes("confirmation") && step.notes === "-") {
            seeds.push({
                kind: "happy-path",
                title: `Step ${step.index}: ${step.action} succeeds`,
                given: `${step.actor || primaryActor} has completed all prior steps`,
                when: step.action,
                then: step.outcome,
                linkedStep: step.index,
            });
        }
    }

    return seeds;
}

// ─── Edge Cases ───────────────────────────────────────────────────────────────

function generateEdgeCaseSeeds(analysis: AnalysisArtifact): ScenarioSeed[] {
    const seeds: ScenarioSeed[] = [];
    const primaryActor = analysis.actors.find((a) => !a.toLowerCase().includes("unknown")) ?? "User";

    // Seed for each decision point
    for (const step of analysis.steps.filter((s) => s.decision !== "-")) {
        seeds.push({
            kind: "edge-case",
            title: `Step ${step.index}: Decision branch — ${truncate(step.decision, 50)}`,
            given: `${step.actor || primaryActor} reaches the decision at Step ${step.index}`,
            when: step.decision,
            then: "The flow branches correctly and all paths are handled",
            linkedStep: step.index,
        });
    }

    // Boundary edge cases from risk hotspots
    const risks = analysis.risks?.hotspots ?? [];
    for (const risk of risks.filter((r) => r.category === "payment-flow" || r.category === "async-dependency").slice(0, 2)) {
        seeds.push({
            kind: "edge-case",
            title: `Edge: ${truncate(risk.label, 60)}`,
            given: "The system is in normal operating state",
            when: risk.description.slice(0, 80),
            then: "The system handles the edge case gracefully without data loss or undefined state",
        });
    }

    // Permission boundary
    const permMatrix = analysis.permissions;
    if (permMatrix && permMatrix.gaps.length > 0) {
        const gap = permMatrix.gaps[0];
        seeds.push({
            kind: "edge-case",
            title: `Permission boundary: "${gap.action}" with undefined access`,
            given: "An actor attempts the action without a defined permission rule",
            when: `Actor performs "${gap.action}"`,
            then: "System enforces a defined access control response (allow or deny) — no undefined behavior",
        });
    }

    return seeds;
}

// ─── Abuse / Failure ──────────────────────────────────────────────────────────

function generateAbuseFailureSeeds(analysis: AnalysisArtifact): ScenarioSeed[] {
    const seeds: ScenarioSeed[] = [];
    const primaryActor = analysis.actors.find((a) => !a.toLowerCase().includes("unknown")) ?? "User";

    // Exception steps
    for (const step of analysis.steps.filter((s) => s.notes !== "-").slice(0, 3)) {
        seeds.push({
            kind: "abuse-failure",
            title: `Failure at Step ${step.index}: ${truncate(step.action, 50)}`,
            given: `${step.actor || primaryActor} initiates Step ${step.index}`,
            when: `An exception occurs: ${truncate(step.notes, 60)}`,
            then: "The system returns a meaningful error, logs the failure, and either recovers or safely terminates",
            linkedStep: step.index,
        });
    }

    // Async failure
    const asyncMissingCallback = (analysis.asyncEvents ?? []).filter((e) => !e.hasCallback).slice(0, 2);
    for (const event of asyncMissingCallback) {
        seeds.push({
            kind: "abuse-failure",
            title: `Async failure: ${event.name.slice(0, 60)} — callback never arrives`,
            given: "The async event is triggered",
            when: "The callback/response does not arrive (timeout or failure)",
            then: "System detects the missing callback and applies a defined recovery strategy",
        });
    }

    // Unauthorized access
    if ((analysis.permissions?.conflicts ?? []).length > 0) {
        const conflict = analysis.permissions!.conflicts[0];
        seeds.push({
            kind: "abuse-failure",
            title: `Permission conflict: "${conflict.action}" — conflicting roles`,
            given: `Roles [${conflict.roles.join(", ")}] attempt action "${conflict.action}"`,
            when: "The action is triggered by a conflicting role",
            then: "System resolves the conflict consistently — one clear access rule is applied",
        });
    }

    // Always add a generic brute-force / invalid input seed
    seeds.push({
        kind: "abuse-failure",
        title: `Invalid input submitted to the ${analysis.topic} flow`,
        given: `${primaryActor} has access to the flow`,
        when: "Invalid, malformed, or boundary-violating input is submitted",
        then: "System validates input, rejects gracefully, and does not enter an undefined state",
    });

    return seeds;
}

// ─── Regression ───────────────────────────────────────────────────────────────

function generateRegressionSeeds(analysis: AnalysisArtifact): ScenarioSeed[] {
    const seeds: ScenarioSeed[] = [];

    // Regression seed: re-run the full happy path
    seeds.push({
        kind: "regression",
        title: `Full ${analysis.topic} flow regression`,
        given: "System is in a clean state with valid preconditions",
        when: "The complete business flow is executed end-to-end",
        then: `All steps succeed and the outcome is: ${analysis.outcomes[0] ?? "flow completes as expected"}`,
    });

    // Regression seeds based on state transitions
    const sm = analysis.stateMachine;
    if (sm && sm.transitions.length > 0) {
        const t = sm.transitions[0];
        seeds.push({
            kind: "regression",
            title: `State regression: ${t.from} → ${t.to}`,
            given: `Entity is in state "${t.from}"`,
            when: t.trigger,
            then: `Entity transitions to "${t.to}" as expected`,
        });
    }

    // Regression seed for each risk hotspot category
    const risks = analysis.risks?.hotspots ?? [];
    if (risks.some((r) => r.category === "payment-flow")) {
        seeds.push({
            kind: "regression",
            title: "Payment flow regression after any change",
            given: "A valid payment scenario is set up",
            when: "Payment is submitted",
            then: "Payment is processed, confirmed, and no duplicate charge occurs",
        });
    }

    return seeds;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(value: string, max: number): string {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
