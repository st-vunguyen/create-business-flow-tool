# Mermaid Icon Library

## Overview

The repository now uses a layered icon system so diagram authors can choose from a much richer icon vocabulary without breaking text-first Mermaid compatibility.

## Layer 1 — Core local export pack

These are the canonical local SVG assets used for export references and Mermaid-compatible documentation:

- `start-end` → `assets/mermaid-icons/start-end.svg`
- `process` → `assets/mermaid-icons/process.svg`
- `decision` → `assets/mermaid-icons/decision.svg`
- `exception` → `assets/mermaid-icons/exception.svg`
- `external-system` → `assets/mermaid-icons/external-system.svg`
- `data-store` → `assets/mermaid-icons/data-store.svg`

## Layer 2 — Extended semantic icon registry

The extended registry provides **1,440 semantic icon tokens** using the naming convention:

```text
<domain>.<object>.<state>
```

Formula:

- 15 domains
- 16 business objects
- 6 lifecycle states
- total = $15 \times 16 \times 6 = 1440$

This gives the team a large, modern, easy-to-read icon vocabulary while keeping Mermaid source text-first.

## Physical SVG library

The registry is backed by a generated physical SVG library:

- root: `assets/mermaid-icons/library/`
- manifest: `assets/mermaid-icons/library/icon-manifest.json`
- human-readable catalog: `docs/icons/mermaid-icon-catalog.md`
- directory pattern: `assets/mermaid-icons/library/<domain>/<domain>.<object>.<state>.svg`

## Naming convention

### Domain

Use a business domain that matches the flow context:

| Domain | Typical use |
|---|---|
| `commerce` | cart, checkout, pricing, order placement |
| `customer` | onboarding, profile, account servicing |
| `identity` | login, authentication, access checks |
| `sales` | lead, opportunity, quote, contract |
| `finance` | invoice, payment, settlement, refund |
| `risk` | fraud, scoring, watchlist, alert review |
| `compliance` | policy, KYC, audit, approvals |
| `operations` | intake, execution, orchestration, monitoring |
| `fulfillment` | pick, pack, ship, delivery |
| `support` | case, ticket, escalation, resolution |
| `marketing` | campaign, audience, consent, nurture |
| `content` | document, publish, review, archive |
| `analytics` | metrics, report, dashboard, trend |
| `platform` | service, queue, API, automation |
| `data` | dataset, record, storage, synchronization |

### Object

Use the object that best matches the main business noun or action target:

| Object | Recommended glyph family | Default Mermaid class | Fallback export icon |
|---|---|---|---|
| `request` | send / inbox | `process` | `process.svg` |
| `task` | list-checks | `process` | `process.svg` |
| `review` | search-check | `process` | `process.svg` |
| `approval` | badge-check | `decision` | `decision.svg` |
| `order` | shopping-bag | `process` | `process.svg` |
| `payment` | wallet / credit-card | `process` | `process.svg` |
| `invoice` | file-text | `process` | `process.svg` |
| `shipment` | package / truck | `external` | `external-system.svg` |
| `ticket` | ticket | `process` | `process.svg` |
| `document` | file-stack | `process` | `data-store.svg` |
| `notification` | bell / mail | `external` | `external-system.svg` |
| `user` | user-round | `process` | `process.svg` |
| `role` | shield-user | `decision` | `decision.svg` |
| `rule` | scale / shield-check | `decision` | `decision.svg` |
| `report` | chart-column | `external` | `data-store.svg` |
| `record` | database / folder-archive | `external` | `data-store.svg` |

### State

Use the state that best matches the lifecycle status:

| State | Typical meaning | Visual intent |
|---|---|---|
| `draft` | created but not yet submitted | neutral process |
| `submitted` | handed off or requested | active process |
| `verified` | checked against evidence or rules | confirmation process |
| `approved` | accepted or authorized | decision/positive milestone |
| `rejected` | declined or failed | exception or rejection |
| `completed` | finished, posted, archived, fulfilled | terminal/process completion |

## Example semantic tokens

### Commerce and checkout

- `commerce.order.submitted`
- `commerce.payment.approved`
- `commerce.invoice.completed`
- `commerce.notification.completed`

### Identity and access

- `identity.request.submitted`
- `identity.user.verified`
- `identity.role.approved`
- `identity.rule.rejected`

### Finance and settlement

- `finance.payment.submitted`
- `finance.invoice.verified`
- `finance.record.completed`
- `finance.approval.rejected`

### Operations and platform

- `operations.task.submitted`
- `operations.review.verified`
- `platform.notification.completed`
- `data.record.completed`

## Selection strategy

1. Choose the domain from the overall business context.
2. Choose the object from the noun or artifact being acted on.
3. Choose the state from the business status.
4. Map the token to the recommended Mermaid class and fallback export icon.
5. Keep the final node label evidence-backed even if the token is more expressive.

## Design intent

The registry is optimized for modern, sharp, outline-style icons with consistent strokes and clean silhouettes. It is designed to be compatible with large outline icon families when richer exported visuals are needed later.

## Machine-readable source

See `assets/mermaid-icons/semantic-icon-taxonomy.json` for the structured taxonomy that prompts, skills, and future tooling can consult.

See `assets/mermaid-icons/library/icon-manifest.json` for the generated physical SVG inventory.
