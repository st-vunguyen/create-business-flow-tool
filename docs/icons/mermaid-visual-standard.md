# Mermaid Visual Standard

## Purpose

This repository produces business-flow diagrams that must stay easy to review, evidence-backed, and renderer-compatible.

## Visual baseline

- Use `flowchart TD` for the primary flow.
- Use `flowchart LR` for swimlanes when actor ownership is explicit.
- Keep Mermaid source text-first for compatibility.
- Use concise English labels with business wording only.
- Do not use decorative symbols, emoji, or playful labels.
- Aim for presentation-ready output: rounded containers, high-contrast borders, balanced spacing, and deliberate visual hierarchy.

## Class system

- `startEnd`: confirmed start or end state
- `process`: standard business activity
- `decision`: explicit business rule or branching condition
- `exception`: failure path, rejection path, or unresolved alternate path
- `external`: external system, integration, queue, event, or service-owned action
- `note`: clarification, fallback note, or unresolved ownership note

## Color system

- Deep navy: start and end nodes
- Crisp blue: standard process steps
- Warm amber: decisions and approvals
- Strong red: exceptions, rejections, and unresolved alternate paths
- Emerald: external systems and integration-owned behavior
- Slate: notes and fallback explanations
- Pastel lane palette: alternate actor swimlanes using soft blue, amber, green, rose, violet, or cyan backgrounds

## Typography

- Sans-serif font
- 14px minimum text size
- sentence-style labels rather than long titles
- keep labels short enough to remain readable in exported diagrams
- prefer two-line node labels only when a touchpoint materially helps the reader
- keep actor names visually stronger than step text in swimlanes

## Layout rules

- keep the happy path visually dominant
- avoid edge crossings when a simpler sequence exists
- use stable node IDs such as `START`, `N1`, `D1`, `E1`, `END`
- use swimlanes only when the owner is explicit in evidence
- if ownership is uncertain, use a fallback note instead of a guessed swimlane
- group related steps into visually coherent blocks when the flow is long
- leave enough spacing so nodes do not feel crowded
- show integration steps with distinct `external` styling instead of burying them among business nodes

## Icon system

This repository uses a two-layer icon system:

1. a core local SVG export pack in `assets/mermaid-icons/`
2. an extended semantic icon registry with 1,440 deterministic icon tokens documented in `docs/icons/mermaid-icon-library.md`

The semantic registry improves icon selection quality without forcing Mermaid to depend on image nodes.

## Modern diagram recipe

When generating a polished business-flow diagram, apply this order of decisions:

1. choose the main flow direction and keep the happy path visually obvious
2. decide whether actor ownership is strong enough for swimlanes
3. assign node classes before writing link styles
4. select 3 to 8 semantic icon tokens for major node families
5. use repository SVG references as export metadata
6. avoid emoji entirely

## Style targets inspired by strong business diagrams

- actor containers should read like deliberate cards, not default clusters
- borders should be saturated enough to remain visible on export
- fills should stay soft enough to preserve text contrast
- edge labels should look like compact pills rather than raw text on lines
- start/end nodes should act as visual anchors
- decision nodes should stand out immediately without overwhelming the flow

## Required references

- `src/core/mermaid-style.ts`
- `docs/icons/mermaid-icon-library.md`
- `docs/icons/mermaid-icon-guidelines.md`
- `docs/icons/mermaid-icon-catalog.md`
- `assets/mermaid-icons/semantic-icon-taxonomy.json`
- `assets/mermaid-icons/library/`
- `assets/mermaid-icons/`
