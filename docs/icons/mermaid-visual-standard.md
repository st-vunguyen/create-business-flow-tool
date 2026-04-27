# Mermaid Visual Standard

## Purpose

This repository produces business-flow diagrams that must stay easy to review, evidence-backed, and renderer-compatible.

## Visual baseline

- Use `flowchart TD` for the primary flow.
- Use `flowchart LR` for swimlanes when actor ownership is explicit.
- Keep Mermaid source text-first for compatibility.
- Use concise English labels with business wording only.
- Do not use decorative symbols, emoji, or playful labels.

## Class system

- `startEnd`: confirmed start or end state
- `process`: standard business activity
- `decision`: explicit business rule or branching condition
- `exception`: failure path, rejection path, or unresolved alternate path
- `external`: external system, integration, queue, event, or service-owned action
- `note`: clarification, fallback note, or unresolved ownership note

## Color system

- Cyan: start and end
- Blue: standard process steps
- Amber: decisions and approvals
- Red: exceptions, rejections, and unresolved alternate paths
- Gray: external systems and integration-owned behavior
- Slate: notes and fallback explanations

## Typography

- Sans-serif font
- 14px minimum text size
- sentence-style labels rather than long titles
- keep labels short enough to remain readable in exported diagrams

## Layout rules

- keep the happy path visually dominant
- avoid edge crossings when a simpler sequence exists
- use stable node IDs such as `START`, `N1`, `D1`, `E1`, `END`
- use swimlanes only when the owner is explicit in evidence
- if ownership is uncertain, use a fallback note instead of a guessed swimlane

## Icon system

This repository uses a two-layer icon system:

1. a core local SVG export pack in `assets/mermaid-icons/`
2. an extended semantic icon registry with 1,440 deterministic icon tokens documented in `docs/icons/mermaid-icon-library.md`

The semantic registry improves icon selection quality without forcing Mermaid to depend on image nodes.

## Required references

- `src/core/mermaid-style.ts`
- `docs/icons/mermaid-icon-library.md`
- `docs/icons/mermaid-icon-guidelines.md`
- `docs/icons/mermaid-icon-catalog.md`
- `assets/mermaid-icons/semantic-icon-taxonomy.json`
- `assets/mermaid-icons/library/`
- `assets/mermaid-icons/`
