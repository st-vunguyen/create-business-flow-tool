# Mermaid Icon Catalog

## Overview

This catalog describes the generated physical SVG icon library for business-flow diagrams.

- Total semantic tokens: `1,440`
- Naming convention: `<domain>.<object>.<state>`
- Output root: `assets/mermaid-icons/library/`
- Machine-readable manifest: `assets/mermaid-icons/library/icon-manifest.json`

## Domains

- `commerce`: Commerce
- `customer`: Customer
- `identity`: Identity
- `sales`: Sales
- `finance`: Finance
- `risk`: Risk
- `compliance`: Compliance
- `operations`: Operations
- `fulfillment`: Fulfillment
- `support`: Support
- `marketing`: Marketing
- `content`: Content
- `analytics`: Analytics
- `platform`: Platform
- `data`: Data

## Objects

- `request`: Request → class `process` → fallback `process.svg`
- `task`: Task → class `process` → fallback `process.svg`
- `review`: Review → class `process` → fallback `process.svg`
- `approval`: Approval → class `decision` → fallback `decision.svg`
- `order`: Order → class `process` → fallback `process.svg`
- `payment`: Payment → class `process` → fallback `process.svg`
- `invoice`: Invoice → class `process` → fallback `process.svg`
- `shipment`: Shipment → class `external` → fallback `external-system.svg`
- `ticket`: Ticket → class `process` → fallback `process.svg`
- `document`: Document → class `external` → fallback `data-store.svg`
- `notification`: Notification → class `external` → fallback `external-system.svg`
- `user`: User → class `process` → fallback `process.svg`
- `role`: Role → class `decision` → fallback `decision.svg`
- `rule`: Rule → class `decision` → fallback `decision.svg`
- `report`: Report → class `external` → fallback `data-store.svg`
- `record`: Record → class `external` → fallback `data-store.svg`

## States

- `draft`: Created but not yet handed off
- `submitted`: Sent, requested, or handed off
- `verified`: Checked and supported by evidence or controls
- `approved`: Accepted or authorized
- `rejected`: Declined, failed, or denied
- `completed`: Finished, archived, delivered, or posted

## Directory pattern

`assets/mermaid-icons/library/<domain>/<domain>.<object>.<state>.svg`

## Selection workflow

1. Choose the domain from the business context.
2. Choose the object from the noun or artifact under change.
3. Choose the state from the supported business status.
4. Use the manifest to look up the physical SVG path and fallback export icon.
5. Keep Mermaid source text-first and treat the physical SVGs as export-ready companions.

## Sample generated assets

- `commerce.request.draft` → `assets/mermaid-icons/library/commerce/commerce.request.draft.svg`
- `commerce.request.submitted` → `assets/mermaid-icons/library/commerce/commerce.request.submitted.svg`
- `commerce.request.verified` → `assets/mermaid-icons/library/commerce/commerce.request.verified.svg`
- `commerce.request.approved` → `assets/mermaid-icons/library/commerce/commerce.request.approved.svg`
- `commerce.request.rejected` → `assets/mermaid-icons/library/commerce/commerce.request.rejected.svg`
- `commerce.request.completed` → `assets/mermaid-icons/library/commerce/commerce.request.completed.svg`
- `commerce.task.draft` → `assets/mermaid-icons/library/commerce/commerce.task.draft.svg`
- `commerce.task.submitted` → `assets/mermaid-icons/library/commerce/commerce.task.submitted.svg`
- `commerce.task.verified` → `assets/mermaid-icons/library/commerce/commerce.task.verified.svg`
- `commerce.task.approved` → `assets/mermaid-icons/library/commerce/commerce.task.approved.svg`
- `commerce.task.rejected` → `assets/mermaid-icons/library/commerce/commerce.task.rejected.svg`
- `commerce.task.completed` → `assets/mermaid-icons/library/commerce/commerce.task.completed.svg`
- `commerce.review.draft` → `assets/mermaid-icons/library/commerce/commerce.review.draft.svg`
- `commerce.review.submitted` → `assets/mermaid-icons/library/commerce/commerce.review.submitted.svg`
- `commerce.review.verified` → `assets/mermaid-icons/library/commerce/commerce.review.verified.svg`
- `commerce.review.approved` → `assets/mermaid-icons/library/commerce/commerce.review.approved.svg`
- `commerce.review.rejected` → `assets/mermaid-icons/library/commerce/commerce.review.rejected.svg`
- `commerce.review.completed` → `assets/mermaid-icons/library/commerce/commerce.review.completed.svg`
