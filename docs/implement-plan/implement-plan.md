# Implementation Plan

## Purpose of this document

This document captures the strategic implementation vision behind the repository.

It answers four questions:

1. where the original idea came from
2. what the repository is trying to become over time
3. what capability layers matter most
4. how to prioritize the roadmap without losing the current working core

This document is intentionally broader than the current codebase. For the current implementation state, read `implement-plan-assessment.md`.

## 1. Origin of the idea

The starting insight behind this repository is simple:

> a real business flow is not just a pretty flowchart.

Most tools can sketch a sequence like:

> user clicks → system responds

But real business understanding also needs:

- intent
- rules
- state changes
- ownership
- permissions
- async callbacks
- failure and recovery
- ambiguity surfacing

That insight is the foundation of the implementation plan.

## 2. End-state vision

The long-term target is a Business Flow AI Kit that can take fragmented specifications and produce a strong business reasoning package.

The desired end-state includes:

- requirement understanding
- business rule extraction
- state transition reasoning
- permission analysis
- async and dependency reasoning
- risk analysis
- gap detection
- contradiction detection
- scenario seed generation
- self-validation

## 3. Why a layered plan is necessary

This repository should not try to jump straight from raw specs to perfect AI reasoning in one step.

The safer path is layered:

1. normalize the source corpus
2. build deterministic extraction primitives
3. render reliable primary artifacts
4. enrich with specialized reasoning modules
5. optionally use prompt-assisted refinement on top

This keeps the tool useful at every maturity stage.

## 4. Capability layers that matter

### 4.1 Requirement intelligence

The tool should understand:

- actors
- goals
- triggers
- steps
- outcomes
- questions
- assumptions

This is the minimum layer required for useful flow output.

### 4.2 Flow intelligence

The tool should identify:

- sequence
- branching
- failure paths
- async behavior
- retry hints
- dead ends or suspicious gaps

### 4.3 State reasoning

The tool should model:

- states
- transitions
- terminal states
- invalid transitions
- rollback or recovery paths

### 4.4 Permission reasoning

The tool should model:

- role/action/access mappings
- permission gaps
- permission conflicts

### 4.5 Risk reasoning

The tool should identify hotspots where the flow is fragile or underspecified.

### 4.6 Scenario generation

The tool should turn extracted flow understanding into:

- happy-path scenarios
- edge cases
- abuse/failure scenarios
- regression anchors

### 4.7 Validation

The tool should audit its own outputs with structured checks rather than relying only on human intuition.

## 5. Practical implementation strategy

### Phase 1 — reliable deterministic core

Focus on:

- multi-format extraction
- normalized corpus generation
- heuristic analysis
- Mermaid rendering
- basic validation

This phase makes the tool immediately useful.

### Phase 2 — richer analysis modules

Focus on:

- state machine extraction
- permission matrix extraction
- async modeling
- risk scoring
- contradiction detection
- scenario seed generation

This phase increases analytical depth.

### Phase 3 — stronger domain intelligence

Focus on:

- domain packs
- rule libraries
- better gap taxonomies
- more reliable business object/state inference

This phase makes the tool feel less generic.

### Phase 4 — advanced reasoning and orchestration

Focus on:

- smarter AI-assisted refinement
- stronger validation policies
- better cross-flow impact review
- deeper quality scoring

This phase should happen only after the earlier phases are stable.

## 6. What should remain true throughout the roadmap

No matter how advanced the repository becomes, these rules should stay true:

- the source evidence remains the anchor
- the main outputs remain readable by humans
- unsupported certainty is never introduced
- prompt-based enrichment must not erase deterministic traceability

## 7. Relationship to the current repository

Today, the repository already embodies part of this plan:

- it normalizes sources
- it produces the three main artifact types
- it has specialized heuristic modules
- it separates primary outputs from debug artifacts

The implementation plan therefore describes how to extend a working system, not how to rescue a broken one.

## 8. What done well looks like

The project is succeeding when a new user can:

1. drop specs into `specs/<project>/`
2. run one command
3. understand the flow from the primary outputs
4. inspect the `debug/` folder if deeper audit is needed
5. see uncertainty surfaced explicitly rather than hidden

## 9. Recommended use of this document

Use this file when you need to discuss:

- long-term direction
- capability priorities
- why the repository exists in this shape
- what future investment areas matter most

Use `implement-plan-assessment.md` when you need to discuss:

- current status
- current gaps
- practical next actions
rollback
states
exception
permission

=> đó không phải business flow thật.

Tóm gọn:

Một AI kit tạo Business Flow “đỉnh” cần:

Requirement understanding
State machine reasoning
Business rule extraction
Exception modeling
Async/event reasoning
Permission analysis
Risk analysis
Gap detection
Self-validation
Structured outputs
Domain intelligence packs

Nếu muốn, tôi còn có thể giúp bạn tiếp tục với:

“Business Flow Canonical Schema” (schema chuẩn cho AI generate)
“Prompt architecture nhiều tầng”
“Flow reasoning framework”
“Spec → Flow extraction pipeline”
“Business Flow quality scoring system”
“Anti-hallucination strategy cho flow generation”
“Flow DSL design”
“AI-ready business ontology”
“Universal business flow template”
“Flow validation checklist cho QC level enterprise”

để biến nó thành một framework cực mạnh chứ không chỉ là prompt kit.