import type { BusinessFlowStep, ExtractedSource, StateNode, StateMachine, StateTransition } from "../types.js";
import { MERMAID_INIT_BLOCK } from "./mermaid-style.js";
import { dedupe } from "./utils.js";

const STATE_VERB_PATTERN = /\b(created|submitted|pending|processing|approved|rejected|completed|cancelled|delivered|shipped|failed|refunded|verified|confirmed|authorized|escalated|closed|archived|active|inactive|draft|published|expired|locked|suspended)\b/gi;
const ROLLBACK_PATTERN = /\b(rollback|revert|undo|cancel|reverse|reset|restore|go back)\b/i;
const EXCEPTION_TRANSITION_PATTERN = /\b(error|fail|timeout|cancel|reject|denied|unavailable|invalid)\b/i;

/**
 * Extracts a state machine model from sources and steps.
 */
export function extractStateMachine(sources: ExtractedSource[], steps: BusinessFlowStep[]): StateMachine {
    const stateLabels = extractAllStateLabels(sources, steps);
    const states = buildStateNodes(stateLabels, steps);
    const transitions = buildTransitions(steps, states);
    const invalidTransitions = detectInvalidTransitions(states, transitions);
    const rollbackPaths = detectRollbackPaths(transitions);
    const stateDiagram = renderStateDiagram(states, transitions);

    return {
        states,
        transitions,
        invalidTransitions,
        rollbackPaths,
        stateDiagram,
    };
}

function extractAllStateLabels(sources: ExtractedSource[], steps: BusinessFlowStep[]): string[] {
    const labels: string[] = [];

    // Extract from source text
    for (const source of sources) {
        for (const line of source.lines) {
            const matches = line.text.matchAll(STATE_VERB_PATTERN);
            for (const match of matches) {
                labels.push(match[0].toLowerCase());
            }
        }
    }

    // Extract from step outcomes and decisions
    for (const step of steps) {
        const combined = `${step.outcome} ${step.decision} ${step.notes}`;
        const matches = combined.matchAll(STATE_VERB_PATTERN);
        for (const match of matches) {
            labels.push(match[0].toLowerCase());
        }
    }

    return dedupe(labels);
}

function buildStateNodes(labels: string[], steps: BusinessFlowStep[]): StateNode[] {
    // Determine initial state from first step trigger
    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    const initialLabel = firstStep
        ? deriveStateFromStep(firstStep) ?? labels[0] ?? "created"
        : "created";

    const terminalCandidates = new Set(["completed", "cancelled", "delivered", "closed", "archived", "rejected", "expired", "failed"]);

    const coreLabels = dedupe([initialLabel, ...labels]).slice(0, 15);

    return coreLabels.map((label, index) => ({
        id: `S${index}`,
        label: capitalizeFirst(label),
        isInitial: index === 0,
        isTerminal: terminalCandidates.has(label),
    }));
}

function buildTransitions(steps: BusinessFlowStep[], states: StateNode[]): StateTransition[] {
    const transitions: StateTransition[] = [];
    const stateMap = new Map(states.map((s) => [s.label.toLowerCase(), s.id]));

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const nextStep = steps[i + 1];

        const fromLabel = deriveStateFromStep(step);
        const toLabel = nextStep ? deriveStateFromStep(nextStep) : null;

        if (!fromLabel || !toLabel || fromLabel === toLabel) continue;

        const fromId = stateMap.get(fromLabel) ?? resolveClosestState(fromLabel, states);
        const toId = toLabel ? (stateMap.get(toLabel) ?? resolveClosestState(toLabel, states)) : null;

        if (!fromId || !toId) continue;

        const isRollback = ROLLBACK_PATTERN.test(`${step.action} ${step.notes}`);
        const isException = EXCEPTION_TRANSITION_PATTERN.test(`${step.notes} ${step.decision}`);

        transitions.push({
            from: fromId,
            to: toId,
            trigger: truncate(step.action, 50),
            guard: step.decision !== "-" ? truncate(step.decision, 40) : undefined,
            isRollback,
            isException,
            evidence: step.evidence,
        });

        // Add exception branch if decision exists
        if (step.decision !== "-" && isException) {
            const exceptionLabel = "Failed";
            const exceptionId = findOrFallbackState(states, ["failed", "rejected", "cancelled"]);
            if (exceptionId && exceptionId !== fromId) {
                transitions.push({
                    from: fromId,
                    to: exceptionId,
                    trigger: truncate(step.decision, 50),
                    guard: "exception path",
                    isRollback: false,
                    isException: true,
                    evidence: step.evidence,
                });
            }
        }
    }

    return dedupeTransitions(transitions);
}

function detectInvalidTransitions(states: StateNode[], transitions: StateTransition[]): string[] {
    const invalid: string[] = [];
    const terminalIds = new Set(states.filter((s) => s.isTerminal).map((s) => s.id));
    const stateMap = new Map(states.map((s) => [s.id, s.label]));

    for (const t of transitions) {
        if (terminalIds.has(t.from)) {
            const fromLabel = stateMap.get(t.from) ?? t.from;
            const toLabel = stateMap.get(t.to) ?? t.to;
            invalid.push(`"${fromLabel}" → "${toLabel}": transition from terminal state is not allowed unless rollback is explicitly modeled`);
        }
    }

    // Check for orphan states (no outgoing transitions unless terminal)
    const statesWithOutgoing = new Set(transitions.map((t) => t.from));
    for (const state of states) {
        if (!state.isTerminal && !state.isInitial && !statesWithOutgoing.has(state.id)) {
            invalid.push(`"${state.label}": orphan state — no outgoing transitions detected`);
        }
    }

    return invalid;
}

function detectRollbackPaths(transitions: StateTransition[]): string[] {
    return transitions
        .filter((t) => t.isRollback)
        .map((t) => `${t.from} → ${t.to}: ${t.trigger}`);
}

function renderStateDiagram(states: StateNode[], transitions: StateTransition[]): string {
    const lines: string[] = [MERMAID_INIT_BLOCK, "stateDiagram-v2"];
    const stateMap = new Map(states.map((s) => [s.id, s.label]));

    for (const state of states) {
        lines.push(`  ${state.id} : ${state.label}`);
    }

    const initialState = states.find((s) => s.isInitial);
    if (initialState) {
        lines.push(`  [*] --> ${initialState.id}`);
    }

    for (const t of transitions) {
        const label = t.guard ? `${t.trigger} [${t.guard}]` : t.trigger;
        lines.push(`  ${t.from} --> ${t.to} : ${escapeMermaidStateLabel(label)}`);
    }

    for (const state of states.filter((s) => s.isTerminal)) {
        lines.push(`  ${state.id} --> [*]`);
    }

    return lines.join("\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStateFromStep(step: BusinessFlowStep): string | null {
    const text = `${step.outcome} ${step.decision} ${step.action}`.toLowerCase();
    const matches = text.matchAll(STATE_VERB_PATTERN);
    for (const match of matches) {
        return match[0].toLowerCase();
    }
    return null;
}

function resolveClosestState(label: string, states: StateNode[]): string | null {
    for (const state of states) {
        if (state.label.toLowerCase().includes(label) || label.includes(state.label.toLowerCase())) {
            return state.id;
        }
    }
    return null;
}

function findOrFallbackState(states: StateNode[], candidates: string[]): string | null {
    for (const candidate of candidates) {
        const found = states.find((s) => s.label.toLowerCase() === candidate);
        if (found) return found.id;
    }
    return null;
}

function dedupeTransitions(transitions: StateTransition[]): StateTransition[] {
    const seen = new Set<string>();
    return transitions.filter((t) => {
        const key = `${t.from}→${t.to}:${t.trigger}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function capitalizeFirst(value: string): string {
    return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}

function truncate(value: string, max: number): string {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function escapeMermaidStateLabel(value: string): string {
    return value.replace(/"/g, "'").replace(/[<>]/g, "");
}
