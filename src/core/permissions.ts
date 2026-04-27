import type {
    AccessLevel,
    BusinessFlowStep,
    ExtractedSource,
    PermissionConflict,
    PermissionEntry,
    PermissionGap,
    PermissionMatrix,
} from "../types.js";
import { dedupe } from "./utils.js";

const ROLE_PATTERN = /\b(admin|administrator|manager|supervisor|approver|reviewer|operator|user|customer|guest|buyer|seller|staff|owner|agent|system|service|anonymous|authenticated|super[- ]?admin|read[- ]?only)\b/gi;
const ACCESS_ALLOW_PATTERN = /\b(can|may|is allowed to|has access to|has permission to|is authorized to|is able to|can access|can view|can edit|can create|can delete|can approve|can submit|can manage)\b/i;
const ACCESS_DENY_PATTERN = /\b(cannot|can not|may not|is not allowed|does not have access|does not have permission|is unauthorized|is forbidden|is blocked|cannot access|cannot view|cannot edit)\b/i;
const ACCESS_CONDITIONAL_PATTERN = /\b(only if|provided that|when|unless|if authorized|if approved|conditional on|subject to|depending on)\b/i;

const ACTION_PATTERNS: Array<[string, RegExp]> = [
    ["approve", /\b(approve|authorization|grant approval)\b/i],
    ["reject", /\b(reject|deny|decline)\b/i],
    ["submit", /\b(submit|file|initiate|request)\b/i],
    ["create", /\b(create|add|register|enroll|onboard)\b/i],
    ["update", /\b(update|edit|modify|change)\b/i],
    ["delete", /\b(delete|remove|deactivate|archive)\b/i],
    ["view", /\b(view|read|access|see|display|show)\b/i],
    ["manage", /\b(manage|administrate|configure|oversee)\b/i],
    ["cancel", /\b(cancel|void|revoke|terminate)\b/i],
    ["export", /\b(export|download|generate report)\b/i],
];

/**
 * Extracts permission matrix from sources and steps.
 */
export function extractPermissions(
    sources: ExtractedSource[],
    steps: BusinessFlowStep[],
    actors: string[]
): PermissionMatrix {
    const entries: PermissionEntry[] = [];

    // Extract from source lines
    for (const source of sources) {
        for (const line of source.lines) {
            const lineEntries = extractFromLine(line.text, `${source.relativePath} L${line.lineNumber}`);
            entries.push(...lineEntries);
        }
    }

    // Extract from steps
    for (const step of steps) {
        const text = `${step.actor} ${step.action} ${step.notes} ${step.decision}`;
        const evidence = step.evidence;
        const stepEntries = extractFromLine(text, evidence);
        entries.push(...stepEntries);
    }

    // Deduplicate
    const deduped = dedupeEntries(entries);

    // Detect gaps: actions mentioned in steps without any permission entry
    const coveredActions = new Set(deduped.map((e) => e.action));
    const gaps: PermissionGap[] = detectGaps(steps, coveredActions);

    // Detect conflicts
    const conflicts: PermissionConflict[] = detectConflicts(deduped, actors);

    return { entries: deduped, conflicts, gaps };
}

// ─── Extraction ───────────────────────────────────────────────────────────────

function extractFromLine(text: string, evidence: string): PermissionEntry[] {
    const entries: PermissionEntry[] = [];
    const roles = extractRoles(text);
    if (roles.length === 0) return entries;

    const action = deriveAction(text);
    if (!action) return entries;

    const access = deriveAccessLevel(text);
    const condition = extractCondition(text);

    for (const role of roles) {
        entries.push({ role, action, access, condition, evidence });
    }

    return entries;
}

function extractRoles(text: string): string[] {
    const matches = text.matchAll(ROLE_PATTERN);
    const roles: string[] = [];
    for (const match of matches) {
        roles.push(normalizeRole(match[0]));
    }
    return dedupe(roles);
}

function deriveAction(text: string): string | null {
    for (const [action, pattern] of ACTION_PATTERNS) {
        if (pattern.test(text)) return action;
    }
    return null;
}

function deriveAccessLevel(text: string): AccessLevel {
    if (ACCESS_DENY_PATTERN.test(text)) return "denied";
    if (ACCESS_CONDITIONAL_PATTERN.test(text)) return "conditional";
    if (ACCESS_ALLOW_PATTERN.test(text)) return "allowed";
    return "unknown";
}

function extractCondition(text: string): string | undefined {
    const conditionMatch = text.match(
        /\b(?:only if|provided that|when|unless|conditional on|subject to|depending on)\s+([^.;,]{0,60})/i
    );
    return conditionMatch ? conditionMatch[1].trim() : undefined;
}

function normalizeRole(role: string): string {
    return role.toLowerCase().replace(/[-\s]+/g, "_");
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function dedupeEntries(entries: PermissionEntry[]): PermissionEntry[] {
    const seen = new Map<string, PermissionEntry>();

    for (const entry of entries) {
        const key = `${entry.role}:${entry.action}`;
        if (!seen.has(key)) {
            seen.set(key, entry);
        } else {
            // Prefer more specific access level
            const existing = seen.get(key)!;
            if (existing.access === "unknown" && entry.access !== "unknown") {
                seen.set(key, entry);
            }
        }
    }

    return [...seen.values()];
}

// ─── Gap Detection ────────────────────────────────────────────────────────────

function detectGaps(steps: BusinessFlowStep[], coveredActions: Set<string>): PermissionGap[] {
    const gaps: PermissionGap[] = [];
    const actionsSeen = new Set<string>();

    for (const step of steps) {
        const action = deriveAction(`${step.action} ${step.decision} ${step.notes}`);
        if (action && !coveredActions.has(action) && !actionsSeen.has(action)) {
            actionsSeen.add(action);
            gaps.push({
                action,
                description: `Action "${action}" appears in Step ${step.index} but has no permission rule defined in the source`,
            });
        }
    }

    return gaps;
}

// ─── Conflict Detection ───────────────────────────────────────────────────────

function detectConflicts(entries: PermissionEntry[], actors: string[]): PermissionConflict[] {
    const conflicts: PermissionConflict[] = [];

    // Group by action
    const byAction = new Map<string, PermissionEntry[]>();
    for (const entry of entries) {
        const list = byAction.get(entry.action) ?? [];
        list.push(entry);
        byAction.set(entry.action, list);
    }

    for (const [action, actionEntries] of byAction.entries()) {
        const allowedRoles = actionEntries.filter((e) => e.access === "allowed").map((e) => e.role);
        const deniedRoles = actionEntries.filter((e) => e.access === "denied").map((e) => e.role);

        // Same role appears as both allowed and denied
        const conflictingRoles = allowedRoles.filter((r) => deniedRoles.includes(r));
        if (conflictingRoles.length > 0) {
            conflicts.push({
                action,
                roles: conflictingRoles,
                description: `Role(s) [${conflictingRoles.join(", ")}] appear as both allowed and denied for action "${action}"`,
            });
        }
    }

    return conflicts;
}
