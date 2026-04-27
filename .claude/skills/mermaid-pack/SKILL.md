# Mermaid Pack Skill

## Use this skill when

- Mermaid flowcharts or swimlanes are created, reviewed, or changed
- `src/core/mermaid-style.ts` or Mermaid rendering logic is edited
- icon tokens are being selected or reviewed
- the user asks for better visual consistency or node traceability

## Goal

Produce Mermaid diagrams that are readable, visually consistent, evidence-backed, and annotated with the correct semantic icon tokens from the repository icon library.

## Workflow

1. Start from the analysis document (`02-analysis/business-flow-document.md`), not raw specs.  
2. Read `## 0) Scope > Domain` to know the business domain for icon selection.
3. Apply the exact init block and classDef from `src/core/mermaid-style.ts`.
4. Build the primary flowchart (`flowchart TD`).
5. Add swimlane (`flowchart LR`) only when actor ownership is explicit.
6. Add state diagram (`stateDiagram-v2`) when Section 10 has states.
7. Select semantic icon tokens for major node families.
8. Write section traceability for every node and decision.

## Init block — exact copy from `src/core/mermaid-style.ts`

```
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#EFF6FF","primaryTextColor":"#1E3A5F","primaryBorderColor":"#2563EB","lineColor":"#2563EB","secondaryColor":"#FEF9C3","tertiaryColor":"#F0FDF4","edgeLabelBackground":"#FFFFFF","fontSize":"14px"}}}%%
```

## Class definitions

```
classDef startEnd  fill:#1E3A5F,stroke:#1E3A5F,color:#FFFFFF,rx:20
classDef process   fill:#EFF6FF,stroke:#2563EB,color:#1E3A5F
classDef decision  fill:#FEF9C3,stroke:#CA8A04,color:#1E3A5F
classDef exception fill:#FEF2F2,stroke:#DC2626,color:#B91C1C
classDef external  fill:#F0FDF4,stroke:#16A34A,color:#14532D
classDef note      fill:#F8FAFC,stroke:#94A3B8,color:#475569,rx:6
```

## Link style rules

- Happy path → `stroke:#2563EB,stroke-width:2.5px`
- Neutral → `stroke:#64748B,stroke-width:1.75px`
- Exception → `stroke:#DC2626,stroke-width:2px,stroke-dasharray: 4 2`

## Icon selection workflow

### Step 1 — Identify domain
Read `## 0) Scope > Domain` from the analysis document.
Valid domains: `commerce`, `identity`, `finance`, `risk`, `compliance`, `fulfillment`, `support`, `marketing`, `analytics`, `platform`, `data`, `operations`, `customer`, `content`, `sales`

### Step 2 — Identify objects and states
Check `assets/mermaid-icons/semantic-icon-taxonomy.json` for the valid `objects` and `states` for that domain.

### Step 3 — Compose tokens
Token pattern: `<domain>.<object>.<state>`

Examples: `finance.payment.submitted`, `identity.user.verified`, `fulfillment.shipment.completed`

### Step 4 — Resolve physical paths
Look up in `assets/mermaid-icons/library/icon-manifest.json` → key is the token, value is the `.svg` path.

Physical path: `assets/mermaid-icons/library/<domain>/<token>.svg`

### Step 5 — Apply guidelines
Read `docs/mermaid-icon-guidelines.md` before finalizing. Reject tokens that imply unsupported ownership, automation, or status.

### Reference files (in priority order)
1. `assets/mermaid-icons/semantic-icon-taxonomy.json` — valid domain/object/state values
2. `assets/mermaid-icons/library/icon-manifest.json` — exact physical SVG paths
3. `docs/mermaid-icon-guidelines.md` — semantic rules for icon choices
4. `docs/mermaid-icon-library.md` — domain overview and context
5. `docs/mermaid-icon-catalog.md` — generated full catalog

### Fallback icons (always include these)
- `startEnd` → `assets/mermaid-icons/start-end.svg`
- `process` → `assets/mermaid-icons/process.svg`
- `decision` → `assets/mermaid-icons/decision.svg`
- `exception` → `assets/mermaid-icons/exception.svg`
- `external` → `assets/mermaid-icons/external-system.svg`
- `data-store` → `assets/mermaid-icons/data-store.svg`

## Quality rules

- Choose 3–8 tokens, one per major node family
- Do not invent token names — use only tokens validated against `icon-manifest.json`
- Tokens must reinforce evidence-backed meaning only
- Keep Mermaid text-first — icons are export metadata, not embedded SVG
