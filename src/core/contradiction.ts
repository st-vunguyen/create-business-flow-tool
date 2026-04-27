import type { ExtractedSource, ContradictionItem } from "../types.js";

const ALLOW_PATTERNS = [
    /\b(can|may|is allowed to|has.*permission|is authorized)\b/i,
];
const DENY_PATTERNS = [
    /\b(cannot|can not|may not|is not allowed|is unauthorized|is forbidden|does not have.*permission)\b/i,
];

/**
 * Detects contradictory statements across source files.
 * This is a heuristic approach based on semantic opposites.
 */
export function detectContradictions(sources: ExtractedSource[]): ContradictionItem[] {
    const contradictions: ContradictionItem[] = [];

    // Collect all significant sentences with allow/deny markers
    const allowStatements: StatementRecord[] = [];
    const denyStatements: StatementRecord[] = [];

    for (const source of sources) {
        for (const line of source.lines) {
            const text = line.text.trim();
            if (text.length < 10) continue;

            const evidence = `${source.relativePath} L${line.lineNumber}`;

            if (ALLOW_PATTERNS.some((p) => p.test(text))) {
                allowStatements.push({ text, evidence, key: extractSubjectAction(text) });
            } else if (DENY_PATTERNS.some((p) => p.test(text))) {
                denyStatements.push({ text, evidence, key: extractSubjectAction(text) });
            }
        }
    }

    // Find statements where same subject+action appears in both allow and deny
    for (const allow of allowStatements) {
        for (const deny of denyStatements) {
            if (allow.key && deny.key && keysOverlap(allow.key, deny.key)) {
                contradictions.push({
                    description: `Conflicting access rule for "${allow.key}"`,
                    statementA: allow.text,
                    statementB: deny.text,
                    sourceA: allow.evidence,
                    sourceB: deny.evidence,
                });
            }
        }
    }

    // Also detect numeric contradictions (e.g. "max 3 retries" vs "max 5 retries")
    contradictions.push(...detectNumericContradictions(sources));

    return dedupeContradictions(contradictions).slice(0, 10);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface StatementRecord {
    text: string;
    evidence: string;
    key: string | null;
}

function extractSubjectAction(text: string): string | null {
    // Extract "[subject] [verb] [object]" key phrase
    const match = text.match(
        /\b(admin|user|customer|staff|manager|operator|system|service|reviewer|approver)\b.{0,20}\b(approve|reject|submit|create|delete|update|view|access|cancel|export|manage)\b/i
    );
    if (match) {
        return `${match[1].toLowerCase()}:${match[2].toLowerCase()}`;
    }
    return null;
}

function keysOverlap(a: string, b: string): boolean {
    // Same subject+action key
    return a === b;
}

function detectNumericContradictions(sources: ExtractedSource[]): ContradictionItem[] {
    const contradictions: ContradictionItem[] = [];
    const numericClaims = new Map<string, { value: string; text: string; evidence: string }>();

    const numericPatterns: Array<[string, RegExp]> = [
        ["max-retries", /\bmax(?:imum)?\s*(\d+)\s*retrie?s?\b/i],
        ["timeout-seconds", /\btimeout\s*(?:of|is)?\s*(\d+)\s*seconds?\b/i],
        ["max-items", /\bmax(?:imum)?\s*(\d+)\s*items?\b/i],
        ["expiry-days", /\bexpir[ye][sd]?\s*(?:in|after)?\s*(\d+)\s*days?\b/i],
    ];

    for (const source of sources) {
        for (const line of source.lines) {
            const text = line.text.trim();
            const evidence = `${source.relativePath} L${line.lineNumber}`;

            for (const [key, pattern] of numericPatterns) {
                const match = text.match(pattern);
                if (match) {
                    const value = match[1];
                    const existing = numericClaims.get(key);
                    if (existing && existing.value !== value) {
                        contradictions.push({
                            description: `Conflicting numeric constraint for "${key}": ${existing.value} vs ${value}`,
                            statementA: existing.text,
                            statementB: text,
                            sourceA: existing.evidence,
                            sourceB: evidence,
                        });
                    } else if (!existing) {
                        numericClaims.set(key, { value, text, evidence });
                    }
                }
            }
        }
    }

    return contradictions;
}

function dedupeContradictions(items: ContradictionItem[]): ContradictionItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = `${item.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
