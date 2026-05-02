# ROADMAP.md — Product Roadmap

This document describes what is fully implemented today, what is planned, and the known limitations to resolve.

---

## Current state — v0.1.0

The tool is production-capable in heuristic mode. All 19 analysis sections are populated, debug artifacts are always written, and the Mermaid output includes both a flowchart and a swimlane diagram.

**Fully implemented:**
- 4 execution modes: `heuristic`, `llm`, `auto`, `dry-run`
- 10-phase pipeline (`src/pipeline.ts`)
- 10 heuristic extraction engines
- 19-section analysis document (Sections 0–19)
- 5 domain packs: `payments`, `auth`, `fulfillment`, `cms`, `default`
- 7-category risk scoring with weighted 0–100 score
- 15+ validation checks with structured JSON output
- Semantic icon system: 1,440 tokens (`domain.object.state`)
- Swimlane diagram with 6-color palette
- Per-flow output with `--per-flow` flag
- Section 18: Data Contracts (JSON code block extraction)
- Section 19: Implementation Constraints (NEVER/ALWAYS/WARNING patterns)
- Step limit: 20 per flow
- Multi-format spec intake: `.md`, `.txt`, `.json`, `.csv`, `.pdf`, `.docx`, `.xlsx`
- `debug/` artifact pack: validation.json, permissions.json, risk.json, scenario-seeds.md, analysis.prompt.md, mermaid.prompt.md, run-summary.json

---

## Short-term — v0.2

### Per-sub-flow renderer (`04-per-flow/`)

The `--per-flow` flag currently writes the full analysis for every detected sub-flow. The target is isolated, clean per-flow artifacts: one focused 19-section doc and one Mermaid diagram per sub-flow, with cross-flow references between them.

### LLM-generated Mermaid

Currently, the Mermaid output is always heuristic, even in `--mode llm`. The LLM pass should optionally generate Mermaid using the prompt in `debug/mermaid.prompt.md`, with the heuristic output as a fallback if the LLM output fails to parse.

### Dynamic step limit

The current ceiling of 20 steps is a fixed constant. A better approach is to detect the complexity of the spec corpus and scale the limit dynamically: simple specs (≤ 5 actors) → 12 steps, complex specs (> 5 actors or > 3 sub-flows) → 30 steps.

### Numbered-list step detection

`extractStructuredFlowData()` in `src/core/extractors.ts` currently detects steps from `##` sections. It should also recognize numbered lists as step sequences:

```
1. User clicks Submit
2. System validates input
3. API sends request to payment gateway
```

---

## Medium-term — v0.3

### Swimlane phase grouping

Group swimlane subgraphs by phase (e.g., Binding, Operations, Settings) using nested Mermaid subgraphs. This requires phase metadata from the spec or from the domain pack.

### Streaming LLM response

The LLM integration currently waits for the full completion before writing. Switch to streaming (`stream: true`) so large specs show incremental output in the terminal.

### Multi-pass analysis

Run heuristic first to establish a baseline, then run LLM to enrich only the sections that scored `warn` or `fail`. Merge the two outputs by section rather than replacing the entire document.

### Domain pack expansion

Add domain packs for:
- `healthcare` — clinical workflows, consent, PHI handling
- `logistics` — shipment tracking, customs, carrier integration
- `identity-verification` — KYC, document verification, biometric checks

---

## Long-term

### Web UI for artifact review

A local browser-based viewer for `business-flow/` artifacts. Allows inline annotation, traceability highlighting (click a step → see source line), and validation check status display.

### Multi-flow cross-flow analysis

When multiple flows exist in the same project, detect shared actors and state transitions and produce a cross-flow impact map. Currently, cross-flow impacts are tracked per-contradiction item but not visualised.

### Spec diff detection

Compare the current normalized spec against a previous run's `01-source/normalized-spec.md` and flag sections that changed. Useful for tracking requirement drift.

### CI gate integration

A pre-built GitHub Action and GitLab CI template that runs the tool, asserts the validation score threshold, and posts a summary comment to the pull request.

---

## Known limitations to address

| Limitation | Status | Target version |
|---|---|---|
| `.docx` extraction is macOS-only (uses `textutil`) | Open | v0.2 — cross-platform fallback |
| Step count ceiling is fixed at 20 | Open | v0.2 — dynamic limit |
| Actor inference quality degrades with very long specs | Open | v0.2 — windowed extraction |
| Domain pack coverage: 5 packs, 3 common domains missing | Open | v0.3 |
| LLM Mermaid output not used | Open | v0.2 |
| No structured output from LLM (free-form Markdown) | Open | v0.3 — JSON schema response format |
| Per-flow output is a full doc copy, not isolated | Open | v0.2 |
| No streaming terminal output for LLM mode | Open | v0.3 |
