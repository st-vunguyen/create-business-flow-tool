# AGENTS.md — Expert QC Business Flow Tool

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
