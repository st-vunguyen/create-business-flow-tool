import type { GapItem } from "../types.js";

export type DomainPackName = "payments" | "auth" | "fulfillment" | "cms" | "default";

export interface DomainPack {
    name: DomainPackName;
    displayName: string;
    knownFailurePatterns: string[];
    knownBusinessRules: string[];
    riskKeywords: string[];
    requiredGapChecks: GapItem[];
}

const PACKS: Record<DomainPackName, DomainPack> = {
    payments: {
        name: "payments",
        displayName: "Payments & Billing",
        knownFailurePatterns: [
            "Duplicate charge on retry without idempotency key",
            "Payment status stuck in 'pending' with no timeout",
            "Refund flow not defined for partial payments",
            "Insufficient funds not handled with meaningful user feedback",
            "Currency mismatch not validated at input",
            "Webhook signature not verified leading to spoofed notifications",
        ],
        knownBusinessRules: [
            "All payment mutations must be idempotent",
            "Refund requires original transaction reference",
            "Settlement can only occur from 'authorized' or 'captured' state",
            "Chargebacks freeze payout until resolved",
            "PCI-DSS: card data must not be stored in plain text",
        ],
        riskKeywords: ["payment", "charge", "refund", "invoice", "billing", "wallet", "settlement", "payout"],
        requiredGapChecks: [
            { category: "missing-retry", description: "Payment retry behavior not specified — define max retries and backoff" },
            { category: "missing-rollback", description: "Payment rollback/refund path not specified if downstream fails" },
            { category: "missing-async-callback", description: "Webhook/callback for payment status update not defined" },
            { category: "missing-state-detail", description: "Payment lifecycle states (authorized → captured → settled) not fully modeled" },
        ],
    },

    auth: {
        name: "auth",
        displayName: "Authentication & Identity",
        knownFailurePatterns: [
            "No account lockout after repeated failed login attempts",
            "Session not invalidated on password change",
            "MFA bypass path not secured",
            "Token expiry not handled gracefully (client sees 401 without refresh attempt)",
            "OAuth callback URL not validated (open redirect)",
            "Role changes not propagated to active sessions",
        ],
        knownBusinessRules: [
            "Tokens must expire and support refresh",
            "Passwords must not be stored in plain text",
            "MFA must be required for privileged actions",
            "Session must be invalidated on logout and password reset",
            "Role assignment requires approval from an authorized actor",
        ],
        riskKeywords: ["login", "authenticate", "token", "session", "mfa", "oauth", "role", "permission", "identity", "sso"],
        requiredGapChecks: [
            { category: "missing-timeout", description: "Session/token expiry behavior not defined" },
            { category: "missing-retry", description: "Login retry lockout policy not defined" },
            { category: "missing-rollback", description: "Account recovery/unlock path not defined" },
            { category: "missing-permission", description: "Role escalation guard not defined" },
        ],
    },

    fulfillment: {
        name: "fulfillment",
        displayName: "Order Fulfillment & Shipping",
        knownFailurePatterns: [
            "Order stuck in 'processing' if inventory check times out",
            "Shipment created without carrier confirmation",
            "No split-shipment handling for partial inventory",
            "Delivery confirmation not triggering downstream invoice",
            "Return flow not defined for damaged/wrong items",
        ],
        knownBusinessRules: [
            "Orders can only ship from 'confirmed' state",
            "Cancellations are blocked after shipment label is printed",
            "Inventory must be reserved at checkout and released on cancellation",
            "Carrier integration must have retry on failed label generation",
        ],
        riskKeywords: ["shipment", "delivery", "order", "inventory", "carrier", "dispatch", "fulfillment", "warehouse", "return"],
        requiredGapChecks: [
            { category: "missing-rollback", description: "Order cancellation path not defined after shipment initiation" },
            { category: "missing-retry", description: "Carrier API retry not defined if label generation fails" },
            { category: "missing-async-callback", description: "Carrier webhook for delivery confirmation not modeled" },
            { category: "missing-state-detail", description: "Order state machine (pending → confirmed → shipped → delivered → returned) not fully defined" },
        ],
    },

    cms: {
        name: "cms",
        displayName: "Content Management",
        knownFailurePatterns: [
            "Draft published without required approval step",
            "Content rollback not available after deletion",
            "Version conflicts not handled when two editors modify simultaneously",
            "Published content not invalidated in cache on update",
            "Media upload failure leaves orphan references in content",
        ],
        knownBusinessRules: [
            "Content must pass review before publishing",
            "Published content can only be unpublished, not deleted directly",
            "All content changes must be version-controlled",
            "Media assets must be validated for size and type before upload",
        ],
        riskKeywords: ["publish", "content", "article", "document", "draft", "review", "approval", "version", "cms"],
        requiredGapChecks: [
            { category: "missing-rollback", description: "Content rollback/undo not defined — needed for accidental publish" },
            { category: "missing-state-detail", description: "Content lifecycle (draft → review → approved → published → archived) not fully modeled" },
            { category: "missing-permission", description: "Publisher vs author permission boundary not explicit" },
        ],
    },

    default: {
        name: "default",
        displayName: "General Business Flow",
        knownFailurePatterns: [
            "Flow entry without explicit precondition check",
            "No timeout on long-running steps",
            "Missing notification on state changes",
        ],
        knownBusinessRules: [
            "Every flow must have a defined trigger and at least one terminal outcome",
            "Actors must be explicitly named for steps involving approval or rejection",
        ],
        riskKeywords: [],
        requiredGapChecks: [
            { category: "missing-rule", description: "No explicit business rules documented for this flow" },
        ],
    },
};

/**
 * Resolves the domain pack for a given domain string.
 */
export function loadDomainPack(domain: string): DomainPack {
    if (domain === "finance" || domain === "commerce") return PACKS.payments;
    if (domain === "identity") return PACKS.auth;
    if (domain === "fulfillment") return PACKS.fulfillment;
    if (domain === "content") return PACKS.cms;
    return PACKS[domain as DomainPackName] ?? PACKS.default;
}

/**
 * Returns all gap checks from a domain pack that are relevant given the corpus.
 */
export function getDomainGapItems(pack: DomainPack, corpus: string): GapItem[] {
    // Only return gaps that are relevant to the corpus (keyword overlap)
    if (pack.name === "default") return pack.requiredGapChecks;

    const hasKeyword = pack.riskKeywords.some((kw) =>
        new RegExp(`\\b${kw}\\b`, "i").test(corpus)
    );

    return hasKeyword ? pack.requiredGapChecks : [];
}
