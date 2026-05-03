# Mermaid Visual Standards

> **Applies to:** business-flow pipeline only

## Init block (exact — copy from `src/core/mermaid-style.ts`)

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

## Icon selection — `domain.object.state` tokens

1. Read `## 0) Scope > Domain` from analysis doc
2. Check `assets/mermaid-icons/semantic-icon-taxonomy.json` for valid objects and states
3. Token pattern: `<domain>.<object>.<state>` — e.g., `finance.payment.submitted`
4. Verify token exists in `assets/mermaid-icons/library/icon-manifest.json`
5. Never invent token names; always validate against the manifest

## Hard rules

- Never add nodes, actors, or branches not in the analysis document
- Swimlane only when actor ownership is explicitly stated in source
- State diagram only when Section 10 has confirmed states and transitions

> **Canonical source:** `rules/mermaid-visual-standards.md`
