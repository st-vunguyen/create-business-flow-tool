import type { AsyncEvent, AsyncEventKind, BusinessFlowStep, ExtractedSource, ExternalDependency, RetryPolicy } from "../types.js";
import { dedupe } from "./utils.js";

const WEBHOOK_PATTERN = /\b(webhook|callback url|notify url|event hook|post.*event)\b/i;
const QUEUE_PATTERN = /\b(queue|topic|message broker|kafka|rabbitmq|sqs|pubsub|event bus|message queue|consumer|producer)\b/i;
const CALLBACK_PATTERN = /\b(callback|on.*success|on.*failure|on.*complete|after.*response|when.*confirmed|when.*received)\b/i;
const RETRY_PATTERN = /\b(retry|re-?try|attempt|backoff|exponential|max.*attempt|try again)\b/i;
const TIMEOUT_PATTERN = /\b(timeout|time.?out|deadline|expir[ye]|wait.*seconds|wait.*minutes|after \d+\s*(seconds?|minutes?|hours?))\b/i;
const ASYNC_PATTERN = /\b(async|asynchronous|non.?blocking|background|deferred|scheduled|later|eventually|queued)\b/i;
const POLLING_PATTERN = /\b(poll|polling|check.*status.*repeat|interval|long.?poll)\b/i;
const EVENT_EMIT_PATTERN = /\b(emit|publish|fire.*event|raise.*event|dispatch)\b/i;

const EXTERNAL_SERVICE_PATTERNS: Array<[ExternalDependency["kind"], RegExp]> = [
    ["api", /\b(external api|third.?party api|rest api|soap|http call|http request|api call|api endpoint)\b/i],
    ["queue", /\b(message queue|broker|sqs|kafka|rabbitmq|pubsub)\b/i],
    ["database", /\b(database|db|postgres|mysql|mongodb|redis|elasticsearch|data store)\b/i],
    ["email", /\b(email|smtp|send.*mail|mail server|ses|sendgrid|mailchimp)\b/i],
    ["sms", /\b(sms|twilio|text message|mobile notification)\b/i],
    ["webhook", /\b(webhook|webhook.*endpoint|event hook)\b/i],
    ["service", /\b(payment service|auth service|identity service|notification service|external service|microservice)\b/i],
];

/**
 * Extract async events and external dependencies from sources and steps.
 */
export function extractAsyncEvents(
    sources: ExtractedSource[],
    steps: BusinessFlowStep[]
): { asyncEvents: AsyncEvent[]; externalDependencies: ExternalDependency[] } {
    const asyncEvents: AsyncEvent[] = [];
    const externalDeps: ExternalDependency[] = [];

    // Scan source files
    for (const source of sources) {
        for (const line of source.lines) {
            const evidence = `${source.relativePath} L${line.lineNumber}`;
            const text = line.text;

            const asyncEvent = detectAsyncEvent(text, evidence);
            if (asyncEvent) asyncEvents.push(asyncEvent);

            const extDep = detectExternalDependency(text, evidence);
            if (extDep) externalDeps.push(extDep);
        }
    }

    // Scan steps
    for (const step of steps) {
        const text = `${step.action} ${step.touchpoint} ${step.notes} ${step.outcome}`;
        const asyncEvent = detectAsyncEvent(text, step.evidence);
        if (asyncEvent) {
            asyncEvent.name = `Step ${step.index}: ${asyncEvent.name}`;
            asyncEvents.push(asyncEvent);
        }

        const extDep = detectExternalDependency(text, step.evidence);
        if (extDep) externalDeps.push(extDep);
    }

    return {
        asyncEvents: dedupeAsyncEvents(asyncEvents),
        externalDependencies: dedupeExternalDeps(externalDeps),
    };
}

// ─── Detection helpers ────────────────────────────────────────────────────────

function detectAsyncEvent(text: string, evidence: string): AsyncEvent | null {
    const kind = resolveAsyncEventKind(text);
    if (!kind) return null;

    const hasCallback = CALLBACK_PATTERN.test(text);
    const hasRecovery = /\b(recovery|retry|fallback|default|handle.*error|on.*fail)\b/i.test(text);
    const retryPolicy = RETRY_PATTERN.test(text) ? extractRetryPolicy(text) : undefined;

    return {
        kind,
        name: extractEventName(text, kind),
        description: truncate(text.trim(), 100),
        hasCallback,
        hasRecovery,
        retryPolicy,
        evidence,
    };
}

function detectExternalDependency(text: string, evidence: string): ExternalDependency | null {
    for (const [kind, pattern] of EXTERNAL_SERVICE_PATTERNS) {
        if (pattern.test(text)) {
            const hasFailureHandling = /\b(error handling|retry|fallback|timeout|failure.*handled|on.*error)\b/i.test(text);
            return {
                name: extractDependencyName(text, kind),
                kind,
                hasFailureHandling,
                evidence,
            };
        }
    }
    return null;
}

function resolveAsyncEventKind(text: string): AsyncEventKind | null {
    if (WEBHOOK_PATTERN.test(text)) return "webhook";
    if (QUEUE_PATTERN.test(text)) return "queue-consumer";
    if (CALLBACK_PATTERN.test(text)) return "callback";
    if (RETRY_PATTERN.test(text)) return "retry-loop";
    if (TIMEOUT_PATTERN.test(text)) return "timeout-branch";
    if (POLLING_PATTERN.test(text)) return "polling";
    if (EVENT_EMIT_PATTERN.test(text)) return "event-emit";
    if (ASYNC_PATTERN.test(text)) return "callback";
    return null;
}

function extractRetryPolicy(text: string): RetryPolicy {
    const maxAttemptsMatch = text.match(/(?:max|up to|maximum)\s*(\d+)\s*(?:attempts?|retries|times)/i);
    const timeoutMatch = text.match(/(?:timeout|wait)\s*(?:of|after)?\s*(\d+)\s*(seconds?|minutes?)/i);

    let timeoutSeconds: number | "unknown" = "unknown";
    if (timeoutMatch) {
        const value = parseInt(timeoutMatch[1], 10);
        timeoutSeconds = timeoutMatch[2].startsWith("minute") ? value * 60 : value;
    }

    const backoff = /exponential/i.test(text)
        ? "exponential"
        : /linear/i.test(text)
            ? "linear"
            : /immediate/i.test(text)
                ? "immediate"
                : "unknown";

    return {
        maxAttempts: maxAttemptsMatch ? parseInt(maxAttemptsMatch[1], 10) : "unknown",
        backoffStrategy: backoff,
        timeoutSeconds,
    };
}

function extractEventName(text: string, kind: AsyncEventKind): string {
    const shortText = truncate(text, 50);
    return `${kind} event: ${shortText}`;
}

function extractDependencyName(text: string, kind: ExternalDependency["kind"]): string {
    // Try to get the noun phrase near the keyword
    const match = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:API|Service|Queue|Database|Webhook)/i);
    if (match) return match[0];
    return `${kind} dependency`;
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function dedupeAsyncEvents(events: AsyncEvent[]): AsyncEvent[] {
    const seen = new Map<string, AsyncEvent>();
    for (const event of events) {
        const key = `${event.kind}:${event.description.slice(0, 40)}`;
        if (!seen.has(key)) seen.set(key, event);
    }
    return [...seen.values()].slice(0, 12);
}

function dedupeExternalDeps(deps: ExternalDependency[]): ExternalDependency[] {
    const seen = new Map<string, ExternalDependency>();
    for (const dep of deps) {
        const key = `${dep.kind}:${dep.name}`;
        if (!seen.has(key)) seen.set(key, dep);
    }
    return [...seen.values()].slice(0, 10);
}

function truncate(value: string, max: number): string {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
