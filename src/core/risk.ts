import type { AnalysisArtifact, RiskCategory, RiskItem, RiskScore } from "../types.js";

interface RiskWeight {
    category: RiskCategory;
    weight: number;
}

const RISK_WEIGHTS: RiskWeight[] = [
    { category: "payment-flow", weight: 20 },
    { category: "async-dependency", weight: 18 },
    { category: "permission-gap", weight: 16 },
    { category: "missing-recovery", weight: 16 },
    { category: "external-coupling", weight: 14 },
    { category: "exception-density", weight: 10 },
    { category: "state-ambiguity", weight: 6 },
];

/**
 * Scores risks in an analysis artifact and produces a ranked list of hotspots.
 */
export function scoreRisks(analysis: AnalysisArtifact): RiskScore {
    const hotspots: RiskItem[] = [
        ...detectPaymentFlowRisk(analysis),
        ...detectAsyncDependencyRisk(analysis),
        ...detectPermissionGapRisk(analysis),
        ...detectMissingRecoveryRisk(analysis),
        ...detectExternalCouplingRisk(analysis),
        ...detectExceptionDensityRisk(analysis),
        ...detectStateAmbiguityRisk(analysis),
    ];

    // Sort by score desc
    hotspots.sort((a, b) => b.score - a.score);

    const total = computeWeightedTotal(hotspots);
    const level = resolveRiskLevel(total);

    return { total, level, hotspots: hotspots.slice(0, 10) };
}

// ─── Risk detectors ───────────────────────────────────────────────────────────

function detectPaymentFlowRisk(analysis: AnalysisArtifact): RiskItem[] {
    const items: RiskItem[] = [];
    const corpus = buildCorpus(analysis);

    if (/\b(payment|charge|transaction|billing|invoice|wallet|refund|settlement)\b/i.test(corpus)) {
        const hasRecovery = /\b(refund|rollback|reversal|compensation|idempotent|retry.*payment)\b/i.test(corpus);
        items.push({
            category: "payment-flow",
            label: "Payment flow detected",
            description: hasRecovery
                ? "Payment flow is present and recovery behavior is mentioned."
                : "Payment flow is present but no explicit refund, reversal, or idempotency pattern was found.",
            score: hasRecovery ? 5 : 9,
            evidence: extractEvidenceSnippet(analysis, /payment|charge|transaction/i),
        });
    }

    return items;
}

function detectAsyncDependencyRisk(analysis: AnalysisArtifact): RiskItem[] {
    const items: RiskItem[] = [];
    const asyncEvents = analysis.asyncEvents ?? [];

    if (asyncEvents.length > 0) {
        const missingCallbacks = asyncEvents.filter((e) => !e.hasCallback);
        const missingRecovery = asyncEvents.filter((e) => !e.hasRecovery);

        if (missingCallbacks.length > 0) {
            items.push({
                category: "async-dependency",
                label: `${missingCallbacks.length} async event(s) without callback`,
                description: `Events without defined callback: ${missingCallbacks.map((e) => e.kind).join(", ")}`,
                score: Math.min(10, 4 + missingCallbacks.length * 2),
                evidence: missingCallbacks[0]?.evidence ?? "",
            });
        }

        if (missingRecovery.length > 0) {
            items.push({
                category: "async-dependency",
                label: `${missingRecovery.length} async event(s) without recovery`,
                description: `Async events have no failure recovery path: ${missingRecovery.map((e) => e.name.slice(0, 40)).join(", ")}`,
                score: Math.min(10, 3 + missingRecovery.length * 2),
                evidence: missingRecovery[0]?.evidence ?? "",
            });
        }
    }

    return items;
}

function detectPermissionGapRisk(analysis: AnalysisArtifact): RiskItem[] {
    const items: RiskItem[] = [];
    const matrix = analysis.permissions;

    if (!matrix || matrix.entries.length === 0) {
        const corpus = buildCorpus(analysis);
        if (/\b(role|permission|access|authorize|allowed|forbidden)\b/i.test(corpus)) {
            items.push({
                category: "permission-gap",
                label: "Permission mentions with no extracted rules",
                description: "Permission keywords detected in spec but no role-action matrix was extractable. Explicit permission rules are missing.",
                score: 8,
                evidence: extractEvidenceSnippet(analysis, /role|permission|access/i),
            });
        }
        return items;
    }

    if (matrix.conflicts.length > 0) {
        items.push({
            category: "permission-gap",
            label: `${matrix.conflicts.length} permission conflict(s)`,
            description: `Conflicting access rules: ${matrix.conflicts.map((c) => c.description.slice(0, 60)).join("; ")}`,
            score: 9,
            evidence: "",
        });
    }

    if (matrix.gaps.length > 2) {
        items.push({
            category: "permission-gap",
            label: `${matrix.gaps.length} unauthorized actions`,
            description: `Actions without any permission rule: ${matrix.gaps.map((g) => g.action).join(", ")}`,
            score: Math.min(8, 3 + matrix.gaps.length),
            evidence: "",
        });
    }

    return items;
}

function detectMissingRecoveryRisk(analysis: AnalysisArtifact): RiskItem[] {
    const items: RiskItem[] = [];

    const stepsWithException = analysis.steps.filter((s) => s.notes !== "-");
    const stepsWithoutRecovery = stepsWithException.filter(
        (s) => !/\b(retry|recovery|fallback|revert|redirect|notify|escalate|cancel)\b/i.test(s.notes)
    );

    if (stepsWithoutRecovery.length > 0) {
        items.push({
            category: "missing-recovery",
            label: `${stepsWithoutRecovery.length} exception(s) without recovery path`,
            description: `Exception steps with no recovery behavior defined: ${stepsWithoutRecovery.map((s) => `Step ${s.index}`).join(", ")}`,
            score: Math.min(10, 3 + stepsWithoutRecovery.length * 2),
            evidence: stepsWithoutRecovery[0]?.evidence ?? "",
        });
    }

    const gaps = analysis.gaps ?? [];
    const missingRetry = gaps.filter((g) => g.category === "missing-retry");
    const missingRollback = gaps.filter((g) => g.category === "missing-rollback");

    if (missingRetry.length > 0) {
        items.push({
            category: "missing-recovery",
            label: "Missing retry behavior",
            description: missingRetry[0].description,
            score: 7,
            evidence: missingRetry[0].evidence ?? "",
        });
    }

    if (missingRollback.length > 0) {
        items.push({
            category: "missing-recovery",
            label: "Missing rollback behavior",
            description: missingRollback[0].description,
            score: 7,
            evidence: missingRollback[0].evidence ?? "",
        });
    }

    return items;
}

function detectExternalCouplingRisk(analysis: AnalysisArtifact): RiskItem[] {
    const items: RiskItem[] = [];
    const extDeps = analysis.externalDependencies ?? [];

    const withoutHandling = extDeps.filter((d) => !d.hasFailureHandling);
    if (withoutHandling.length > 0) {
        items.push({
            category: "external-coupling",
            label: `${withoutHandling.length} external dep(s) without failure handling`,
            description: `Deps lacking failure handling: ${withoutHandling.map((d) => d.name).join(", ")}`,
            score: Math.min(9, 4 + withoutHandling.length * 2),
            evidence: withoutHandling[0]?.evidence ?? "",
        });
    }

    return items;
}

function detectExceptionDensityRisk(analysis: AnalysisArtifact): RiskItem[] {
    const items: RiskItem[] = [];
    const total = analysis.steps.length;
    if (total === 0) return items;

    const exceptionsCount = analysis.steps.filter((s) => s.notes !== "-").length;
    const density = exceptionsCount / total;

    if (density > 0.4) {
        items.push({
            category: "exception-density",
            label: `High exception density (${Math.round(density * 100)}% of steps)`,
            description: `${exceptionsCount} of ${total} steps have exception notes. High density indicates complex or fragile flow.`,
            score: Math.min(8, Math.round(density * 10)),
            evidence: "",
        });
    }

    return items;
}

function detectStateAmbiguityRisk(analysis: AnalysisArtifact): RiskItem[] {
    const items: RiskItem[] = [];
    const sm = analysis.stateMachine;

    if (!sm || sm.states.length === 0) {
        items.push({
            category: "state-ambiguity",
            label: "No states detected",
            description: "The flow has no extractable state lifecycle. This is a risk if the spec describes an entity with stateful behavior.",
            score: 4,
            evidence: "",
        });
        return items;
    }

    if (sm.invalidTransitions.length > 0) {
        items.push({
            category: "state-ambiguity",
            label: `${sm.invalidTransitions.length} invalid state transition(s)`,
            description: `Invalid transitions detected: ${sm.invalidTransitions[0]}`,
            score: 7,
            evidence: "",
        });
    }

    return items;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function computeWeightedTotal(hotspots: RiskItem[]): number {
    if (hotspots.length === 0) return 0;

    let total = 0;
    for (const weight of RISK_WEIGHTS) {
        const categoryItems = hotspots.filter((h) => h.category === weight.category);
        if (categoryItems.length > 0) {
            const maxScore = Math.max(...categoryItems.map((h) => h.score));
            total += (maxScore / 10) * weight.weight;
        }
    }

    return Math.min(100, Math.round(total));
}

function resolveRiskLevel(score: number): RiskScore["level"] {
    if (score >= 70) return "critical";
    if (score >= 45) return "high";
    if (score >= 20) return "medium";
    return "low";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCorpus(analysis: AnalysisArtifact): string {
    return [
        analysis.goal,
        analysis.trigger,
        ...analysis.outcomes,
        ...analysis.actors,
        ...analysis.touchpoints,
        ...analysis.steps.map((s) => `${s.action} ${s.notes} ${s.outcome}`),
    ].join(" ");
}

function extractEvidenceSnippet(analysis: AnalysisArtifact, pattern: RegExp): string {
    for (const step of analysis.steps) {
        if (pattern.test(`${step.action} ${step.touchpoint} ${step.notes}`)) {
            return step.evidence;
        }
    }
    return "";
}
