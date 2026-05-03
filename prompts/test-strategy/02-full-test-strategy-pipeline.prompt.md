---
description: "Full autonomous test-strategy pipeline: bootstrap → run heuristic engine → enrich 16-section document → verify → report."
tools: ['edit', 'search', 'todos']
---

# Prompt 02 — Full Autonomous Test-Strategy Pipeline

## Mission

Take raw specs under `specs/<project>/` and leave the repository in a finished state:

- `test-strategy/<slug>/01-source/normalized-spec.md`
- `test-strategy/<slug>/02-strategy/test-strategy-document.md`
- `test-strategy/<slug>/debug/` — all supporting artifacts

The user only:
1. Places spec files in `specs/<project>/`
2. Asks you to run the test-strategy pipeline
3. Reviews the output pack

You do everything else.

---

## Absolute UX rule

The user must not manually:
- Install dependencies
- Build the project
- Choose CLI mode
- Run partial prompts separately
- Inspect debug/ artifacts manually

---

## Step 0 — Bootstrap (if needed)

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run doctor
```

## Step 1 — Validate input

Confirm `specs/<project>/` exists and contains source files. Report and stop only if missing.

## Step 2 — Run pipeline

```bash
pnpm run tool -- test-strategy --spec-dir specs/<project> --slug <slug> --mode heuristic
```

## Step 3 — Enrich 16-section strategy document

Apply all rules from Prompt 01 to `02-strategy/test-strategy-document.md`.

### Enrichment priorities (in order)
1. Complete Section 4 — Test Case Catalog (most user-visible)
2. Complete Section 5 — Traceability Matrix (quality gate)
3. Fill Section 7 — Coverage Gaps from untested spec lines
4. Score Section 11 — Risk Assessment with numeric + level
5. Surface Section 6 — Acceptance Criteria per feature/flow
6. Populate Section 13 — Questions for missing/ambiguous spec text

## Step 4 — Verify

- [ ] `01-source/normalized-spec.md` anchors all evidence
- [ ] All 16 sections populated
- [ ] Every TC in Section 4 has a Section 5 traceability row
- [ ] Every coverage gap in Section 7 is traceable to a spec line without a TC
- [ ] No invented behaviors, rules, or test cases
- [ ] Validation score ≥ 60

## Step 5 — Final handoff

Return only:
1. Project slug processed
2. Output path
3. Pipeline status (complete / partial / blocked)
4. Test case count by type
5. Coverage gap count
6. Risk level (highest)
7. Top 3 unresolved questions or blockers

---

## What this pipeline does NOT do

- It does not suggest architecture changes
- It does not write production code
- It does not suggest tooling or frameworks unless the spec mentions them
- It does not combine outputs with the business-flow pipeline (they are fully independent)

> **Canonical source:** `prompts/test-strategy/02-full-test-strategy-pipeline.prompt.md`
> Tool adapter: `.github/prompts/test-strategy-02-full-pipeline.prompt.md`
