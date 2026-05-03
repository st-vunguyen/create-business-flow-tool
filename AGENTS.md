# AGENTS.md — AI Analysis Platform

This file is the canonical instruction set for any AI agent operating inside this repository.
Read it entirely before touching any spec, artifact, or source file.

---

## 1. Mission

This platform is a **spec-first QC and analysis tool** with two independent pipelines:

> **Business-flow pipeline:** Read fragmented specification files → normalize → extract a trustworthy, evidence-backed 19-section business-flow artifact pack → render traceable Markdown and Mermaid outputs.

> **Test-strategy pipeline:** Read fragmented specification files → normalize → extract a trustworthy, evidence-backed 16-section test strategy document → render traceable Markdown output.

Agents must stay strictly inside this mission scope. Neither pipeline invents facts, infers requirements, or generates content not traceable to the source spec.

---

## 2. Canonical asset directories

Top-level directories are the single source of truth for all AI assets:

| Directory | Contents | Role |
|---|---|---|
| `agents/` | Agent persona definitions | Who orchestrates each pipeline |
| `rules/` | Governance constraints | Hard rules shared across pipelines |
| `skills/` | Extraction procedures | Reusable how-to for each task |
| `prompts/` | User-facing prompts | Entry points for AI chat tools |

Tool-specific formats (`.claude/`, `.github/prompts/`) are **generated adapter layers**. Never edit them directly. Run `node tools/sync-adapters.mjs` to regenerate.

---

## 3. Roles

### Business-flow primary analyst (`agents/business-flow/expert-qc-business-flow.agent.md`)
- Read all files under `specs/<project>/`.
- Run: `pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic`
- Enrich `business-flow/<slug>/02-analysis/business-flow-document.md` so all 19 sections are complete, evidence-backed, and non-invented.

### Business-flow verifier (`agents/business-flow/business-flow-verifier.agent.md`)
- Review the produced artifact pack against 8 quality dimensions.
- Mark each dimension as `PASS`, `WARN`, or `FAIL` with evidence.
- Flag anything not traceable to `01-source/normalized-spec.md`.

### Test-strategy analyst (`agents/test-strategy/expert-qc-test-strategy.agent.md`)
- Read all files under `specs/<project>/`.
- Run: `pnpm run tool -- test-strategy --spec-dir specs/<project> --slug <slug> --mode heuristic`
- Enrich `test-strategy/<slug>/02-strategy/test-strategy-document.md` so all 16 sections are complete.
- Never invent test cases. Every TC must cite a spec source line.

### Mermaid specialist
- Translate Section 3 of the analysis document into Mermaid diagrams per `03-mermaid/business-flow-mermaid.md`.
- Use `domain.object.state` semantic icon tokens from `assets/mermaid-icons/library/`.
- Apply the palette and style rules from `docs/icons/mermaid-visual-standard.md`.
- Never add nodes, actors, or branches that are not in the analysis document.

---

## 4. Canonical pipeline flows

### Business-flow pipeline

```text
specs/<project>/
  └── (any combination of .md, .docx, .pdf, .xlsx, .csv, .json)
        ↓  src/core/extractors.ts
business-flow/<slug>/01-source/normalized-spec.md
        ↓  src/core/heuristics.ts
business-flow/<slug>/02-analysis/business-flow-document.md
        ↓  src/core/heuristics.ts + src/core/renderers.ts
business-flow/<slug>/03-mermaid/business-flow-mermaid.md
        ↓  always written
business-flow/<slug>/debug/
  ├── validation.json
  ├── permissions.json
  ├── risk.json
  ├── scenario-seeds.md
  ├── analysis.prompt.md
  ├── mermaid.prompt.md
  └── run-summary.json
```

### Test-strategy pipeline

```text
specs/<project>/
  └── (same supported formats)
        ↓  src/core/extractors.ts
test-strategy/<slug>/01-source/normalized-spec.md
        ↓  src/core/test-strategy-heuristics.ts
test-strategy/<slug>/02-strategy/test-strategy-document.md
        ↓  always written
test-strategy/<slug>/debug/
  ├── test-cases.json
  ├── coverage-gaps.json
  ├── risks.json
  └── run-summary.json
```

---

## 5. Commands

```bash
# Business-flow pipeline
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic

# Test-strategy pipeline (NEW)
pnpm run tool -- test-strategy --spec-dir specs/<project> --slug <slug> --mode heuristic

# Dry run — writes only the analysis prompt, no artifacts
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode dry-run

# Show runtime capability summary
pnpm run tool -- doctor

# Sync canonical AI assets to tool adapters
node tools/sync-adapters.mjs

# Verify TypeScript types (no emit)
pnpm run lint

# Build to dist/
pnpm run build

# Run end-to-end smoke test
pnpm run test
```

---

## 6. Required output: 19-section business-flow analysis document

Every business-flow run must produce `02-analysis/business-flow-document.md` with exactly these sections:

| # | Section | Purpose |
|---|---|---|
| 0 | Scope | Topic, goal, domain, in/out of scope |
| 1 | Source | Source files and corpus anchor |
| 2 | Business Flow Summary | Fact table: goal, actors, trigger, outcomes, touchpoints |
| 3 | Business Flow Table | `# \| Actor \| Step \| Decision \| Touchpoint \| Outcome \| Notes/Risks` |
| 4 | Narrative Flow | Numbered prose restatement |
| 5 | Decisions and Exceptions | All branches and exception paths |
| 6 | Traceability | Row → source file + line |
| 7 | Questions | Missing information for stakeholders |
| 8 | Assumptions | Minimal assumptions only |
| 9 | Gap Taxonomy | Typed gaps by category |
| 10 | State Machine | States, transitions, state diagram |
| 11 | Permissions | Role-action-access matrix, conflicts, gaps |
| 12 | Async Events | Event table, external dependencies |
| 13 | Risk Hotspots | Weighted score 0–100, level, hotspot list |
| 14 | Scenario Seeds | happy-path, edge-case, abuse-failure, regression |
| 15 | Contradictions | Conflicting rules + cross-flow impacts |
| 16 | Validation Report | Structured pass/warn/fail checks |
| 17 | Checklist | Final artifact checklist |
| 18 | Data Contracts | JSON/data format contracts from code blocks |
| 19 | Implementation Constraints | NEVER/ALWAYS/WARNING rules |

---

## 7. Required output: 16-section test-strategy document

Every test-strategy run must produce `02-strategy/test-strategy-document.md` with exactly these sections:

| # | Section | Purpose |
|---|---|---|
| 0 | Scope | Topic, goal, domain, source files |
| 1 | Source | Source file inventory |
| 2 | Test Strategy Summary | Counts: TCs, gaps, ACs, regressions, risks |
| 3 | Test Scope Matrix | Per-area in-scope / out-of-scope with rationale |
| 4 | Test Case Catalog | TC ID, type, flow, precondition, steps, expected result, evidence, priority |
| 5 | Traceability Matrix | TC ID → evidence |
| 6 | Acceptance Criteria | AC ID → feature → criterion → linked TCs → evidence |
| 7 | Coverage Gaps | Behaviors in spec with no TC |
| 8 | Regression Inventory | Lines referencing known bugs or existing behaviors |
| 9 | Test Data Requirements | Fixtures/seeds needed per TC |
| 10 | Environment & Tool Requirements | Hardware, software, network needs |
| 11 | Risk & Priority Assessment | Score 0–100, level, evidence |
| 12 | Assumptions | Minimal assumptions only |
| 13 | Questions for Stakeholders | Missing or ambiguous spec text |
| 14 | Contradiction Register | Conflicting behaviors in spec |
| 15 | Verification Checklist | Pass/warn/fail quality gates |

---

## 8. QC guardrails (non-negotiable — both pipelines)

- **Evidence-first.** Every actor, step, decision, outcome, test case, and constraint must trace to a line in `01-source/normalized-spec.md`.
- **No invention.** Never add actors, branches, rules, test cases, or touchpoints that do not appear in the source.
- **Prefer `Unknown / needs confirmation`** over guessing when data is missing.
- **One action per table row.** Do not compress multiple actions into one row.
- **Traceability is mandatory.** Every row in Section 3 (business-flow) and every TC in Section 4 (test-strategy) must have a traceability entry.
- **English only.** No non-English text in headings, labels, cells, or narrative.

---

## 9. Eight quality dimensions (business-flow verifier checklist)

| # | Dimension | Pass condition |
|---|---|---|
| Q1 | Completeness | All 19 sections are populated |
| Q2 | Evidence | Every claim is traceable to the corpus |
| Q3 | Accuracy | No invented facts; wording stays close to source |
| Q4 | Consistency | Sections 3, 6, 10, 11, 12 do not contradict each other |
| Q5 | Gap coverage | Section 9 reflects domain-pack required gap checks |
| Q6 | Risk quality | Section 13 score and level match the analysis |
| Q7 | Mermaid fidelity | Diagrams render exactly the flow in Section 3 |
| Q8 | Language | English only, business-friendly, no emoji, no slang |

---

## 10. Out of scope

Agents must not:
- Implement product features beyond the QC tool itself.
- Write migrations, deployment scripts, or infra configs.
- Generate spec content (e.g., invent requirements).
- Push `specs/` or `business-flow/` or `test-strategy/` to remote (all are gitignored).
- Edit files in `.claude/` or `.github/prompts/` directly (use `sync-adapters.mjs`).

This file is the canonical instruction set for any AI agent operating inside this repository.
Read it entirely before touching any spec, artifact, or source file.

---

## 1. Mission

This tool is a **spec-first QC and analysis platform**. Its only job is:

> Read fragmented specification files → normalize them → extract a trustworthy, evidence-backed business-flow artifact pack → render traceable Markdown and Mermaid outputs.

Agents must stay strictly inside this mission scope.

---

## 2. Roles

### Primary analyst
- Read all files under `specs/<project>/`.
- Run the heuristic pipeline: `pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic`.
- Enrich `business-flow/<slug>/02-analysis/business-flow-document.md` so all 19 sections are complete, evidence-backed, and non-invented.
- Ensure `debug/` artifacts (validation.json, permissions.json, risk.json, scenario-seeds.md) reflect the final analysis.

### Verifier
- Review the produced artifact pack against the 8 quality dimensions below.
- Mark each dimension as `PASS`, `WARN`, or `FAIL` with evidence.
- Do not make assumptions. Flag anything that is not traceable to `01-source/normalized-spec.md`.

### Mermaid specialist
- Translate the analysis document into Mermaid diagrams per `03-mermaid/business-flow-mermaid.md`.
- Use `domain.object.state` semantic icon tokens from `assets/mermaid-icons/library/`.
- Apply the palette and style rules from `docs/icons/mermaid-visual-standard.md`.
- Never add nodes, actors, or branches that are not in the analysis document.

---

## 3. Canonical pipeline flow

```text
specs/<project>/
  └── (any combination of .md, .docx, .pdf, .xlsx, .csv, .json)
        ↓  extractors.ts
business-flow/<slug>/01-source/normalized-spec.md
        ↓  heuristics.ts
business-flow/<slug>/02-analysis/business-flow-document.md
        ↓  heuristics.ts + renderers.ts
business-flow/<slug>/03-mermaid/business-flow-mermaid.md
        ↓  (optional, --per-flow)
business-flow/<slug>/04-per-flow/
        ↓  always written
business-flow/<slug>/debug/
  ├── validation.json
  ├── permissions.json
  ├── risk.json
  ├── scenario-seeds.md
  ├── analysis.prompt.md
  ├── mermaid.prompt.md
  └── run-summary.json
```

---

## 4. Commands

```bash
# Run the full pipeline (auto selects heuristic or llm based on OPENAI_API_KEY)
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode auto

# Force heuristic (deterministic, no LLM)
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic

# Dry run — writes only the analysis prompt, no artifacts
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode dry-run

# Include per-flow output directory
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic --per-flow

# Disable swimlane diagram
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic --no-swimlane

# Show runtime capability summary
pnpm run tool -- doctor

# Verify TypeScript types (no emit)
pnpm run lint

# Build to dist/
pnpm run build

# Run end-to-end smoke test
pnpm run test
```

---

## 5. Required output: 19-section analysis document

Every run must produce `02-analysis/business-flow-document.md` with exactly these sections:

| # | Section | Purpose |
|---|---|---|
| 0 | Scope | Topic, goal, domain, in/out of scope |
| 1 | Source | Source files and corpus anchor |
| 2 | Business Flow Summary | Fact table: goal, actors, trigger, outcomes, touchpoints |
| 3 | Business Flow Table | `# \| Actor \| Step \| Decision \| Touchpoint \| Outcome \| Notes/Risks` |
| 4 | Narrative Flow | Numbered prose restatement |
| 5 | Decisions and Exceptions | All branches and exception paths |
| 6 | Traceability | Row → source file + line |
| 7 | Questions | Missing information for stakeholders |
| 8 | Assumptions | Minimal assumptions only |
| 9 | Gap Taxonomy | Typed gaps by category |
| 10 | State Machine | States, transitions, state diagram |
| 11 | Permissions | Role-action-access matrix, conflicts, gaps |
| 12 | Async Events | Event table, external dependencies |
| 13 | Risk Hotspots | Weighted score 0–100, level, hotspot list |
| 14 | Scenario Seeds | happy-path, edge-case, abuse-failure, regression |
| 15 | Contradictions | Conflicting rules + cross-flow impacts |
| 16 | Validation Report | Structured pass/warn/fail checks |
| 17 | Checklist | Final artifact checklist |
| 18 | Data Contracts | JSON/data format contracts from code blocks |
| 19 | Implementation Constraints | NEVER/ALWAYS/WARNING rules |

---

## 6. QC guardrails (non-negotiable)

- **Evidence-first.** Every actor, step, decision, outcome, and constraint must trace to a line in `01-source/normalized-spec.md`.
- **No invention.** Never add actors, branches, rules, or touchpoints that do not appear in the source.
- **Prefer `Unknown / needs confirmation`** over guessing when data is missing.
- **One action per table row.** Do not compress multiple actions into one row.
- **Traceability is mandatory.** Every row in Section 3 must have a matching row in Section 6.
- **Icon choices reinforce meaning only.** Semantic icon tokens must not imply ownership, automation, or lifecycle states unsupported by evidence.
- **English only.** No non-English text in headings, labels, cells, or narrative.

---

## 7. Eight quality dimensions (verifier checklist)

| # | Dimension | Pass condition |
|---|---|---|
| Q1 | Completeness | All 19 sections are populated |
| Q2 | Evidence | Every claim is traceable to the corpus |
| Q3 | Accuracy | No invented facts; wording stays close to source |
| Q4 | Consistency | Sections 3, 6, 10, 11, 12 do not contradict each other |
| Q5 | Gap coverage | Section 9 reflects domain-pack required gap checks |
| Q6 | Risk quality | Section 13 score and level match the analysis |
| Q7 | Mermaid fidelity | Diagrams render exactly the flow in Section 3 |
| Q8 | Language | English only, business-friendly, no emoji, no slang |

---

## 8. Out of scope

Agents must not:
- Implement product features beyond the QC tool itself.
- Write migrations, deployment scripts, or infra configs.
- Generate spec content (e.g., invent requirements).
- Push `specs/` or `business-flow/` to remote (both are gitignored).
