# Mermaid Icon Guidelines

## Purpose

Use this guide to choose icon tokens that reinforce business meaning without adding unsupported facts.

## Core rule

Choose icons from business evidence, not from what looks visually attractive.

## Visual priority rule

If a diagram needs visual emphasis, prefer repository icon tokens and SVG references over emoji. Emoji are not allowed as a substitute for business meaning, severity, status, or actor identity.

## Decision matrix

| Flow situation | Preferred token pattern | Preferred Mermaid class | Fallback export icon | Notes |
|---|---|---|---|---|
| User starts a process | `<domain>.request.submitted` | `process` | `process.svg` | Use when a request, application, or submission starts the flow |
| Analyst or staff reviews something | `<domain>.review.verified` | `process` | `process.svg` | Use when the source explicitly describes review/check activity |
| Approval gate | `<domain>.approval.approved` | `decision` | `decision.svg` | Use only when approval/decision is explicit |
| Rejection or failure | `<domain>.<object>.rejected` | `exception` | `exception.svg` | Use for failed validation, denial, cancellation, reject |
| External system action | `platform.notification.completed`, `platform.request.completed`, or `<domain>.shipment.completed` | `external` | `external-system.svg` | Use for API, queue, system, service, job, or external touchpoint |
| Stored artifact or data write | `<domain>.record.completed` or `<domain>.document.completed` | `external` | `data-store.svg` | Use for repository, database, ledger, archive, or record state |
| End state | `<domain>.<object>.completed` | `startEnd` or `process` | `start-end.svg` | Reserve terminal styling for true start/end states |

## Domain hints

- Use `commerce` for checkout, cart, order, and catalog flows.
- Use `identity` for sign-in, access, MFA, and role flows.
- Use `finance` for invoice, payment, refund, and settlement flows.
- Use `risk` for fraud checks, alerts, and scoring flows.
- Use `compliance` for KYC, policy, and audit flows.
- Use `operations` for intake, workflow orchestration, and back-office handling.
- Use `fulfillment` for warehouse, dispatch, and delivery flows.
- Use `support` for ticketing, incident, and escalation flows.
- Use `platform` when a technical integration is the primary owner.
- Use `data` when the important meaning is persistence, synchronization, or record state.

## Good examples

- Checkout payment approved → `commerce.payment.approved`
- Refund request submitted → `finance.request.submitted`
- Fraud rule rejected → `risk.rule.rejected`
- User access verified → `identity.user.verified`
- Ticket resolved and archived → `support.ticket.completed`
- Shipment dispatched by carrier → `fulfillment.shipment.completed`

## Avoid

- do not choose `approved` when the source only says `reviewed`
- do not choose a domain just because the icon looks nicer
- do not assign external or data-store icons when the step is clearly human-owned
- do not use icon choices to imply automation, ownership, or system behavior that the source does not support

## Prompt and agent behavior

When producing Mermaid packs:

1. list the core export icon set
2. choose 3 to 8 semantic icon tokens for the major node families in the diagram
3. keep Mermaid source text-first
4. include the physical SVG path from `assets/mermaid-icons/library/` when export-oriented metadata is helpful
5. use the token choice as design/export metadata, not as a replacement for evidence-backed node labels
6. prefer icon families that visually differentiate human work, system work, decisions, and data persistence
7. use icon selection to reinforce visual polish, not to add unsupported behavior
