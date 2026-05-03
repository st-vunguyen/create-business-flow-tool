---
description: "Autonomously read specs/<project>/ and produce a complete evidence-backed 16-section test strategy document pack."
tools: ['edit', 'search', 'todos']
---

# Prompt 01 — Spec → Test Strategy Document

## Mission

Read `specs/<project>/`, normalize all source files, and produce a review-ready test strategy pack under `test-strategy/<slug>/`.

You handle everything. The user only:
1. Places spec files in `specs/<project>/`
2. Asks you to run the test-strategy pipeline
3. Reviews the output

---

## Non-negotiable rules

1. **Only test what the spec specifies.** If a behavior is not written down, it does not become a test case.
2. **Every test case cites its source.** Format: `[source-file.md L45]`
3. **TC ID convention:** `TC-<FLOW-LETTER><nn>-<type>` e.g. `TC-A01-e2e`, `TC-B02-integration`
4. **Test types only when spec supports:**
   - `e2e` — spec describes a user-facing happy path with steps and outcome
   - `integration` — spec describes component interaction or API contract
   - `unit` — spec describes a rule, formula, or condition that is isolated
   - `regression` — spec flags a historical bug or an "existing" behavior
   - `negative` — spec describes an error branch or a rejection condition
5. **Never infer test types** not supported by the text.
6. **Prefer `Unknown / needs confirmation`** over inventing coverage.

---

## Step 1 — Bootstrap (if needed)

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run doctor
```

## Step 2 — Run the heuristic pipeline

```bash
pnpm run tool -- test-strategy --spec-dir specs/<project> --slug <slug> --mode heuristic
```

## Step 3 — Enrich the strategy document

Apply to `test-strategy/<slug>/02-strategy/test-strategy-document.md`:

### Section completeness
All 16 sections must be populated:

| # | Section |
|---|---------|
| 0 | Scope |
| 1 | Source |
| 2 | Test Strategy Summary |
| 3 | Test Scope Matrix |
| 4 | Test Case Catalog |
| 5 | Traceability Matrix |
| 6 | Acceptance Criteria |
| 7 | Coverage Gaps |
| 8 | Regression Inventory |
| 9 | Test Data Requirements |
| 10 | Environment & Tool Requirements |
| 11 | Risk & Priority Assessment |
| 12 | Assumptions |
| 13 | Questions |
| 14 | Contradiction Register |
| 15 | Verification Checklist |

### Section 4 — Test Case Catalog
- Each test case must have: `id`, `type`, `flow`, `precondition`, `steps`, `expectedResult`, `evidence`, `priority`
- Evidence = `[source-file.md L45]` format
- Priority = critical / high / medium / low

### Section 5 — Traceability
- Each TC ID must map to ≥1 source evidence entry
- Any spec line that describes behavior and has no TC is a coverage gap (goes to Section 7)

### Section 7 — Coverage Gaps
- Populate with: behavior described in spec → not yet covered by any TC
- Columns: gap ID, description, source evidence, suggested test type, priority

### Section 11 — Risk Assessment
- Numeric score 0–100, level (low/medium/high/critical)
- Only risks derivable from spec gaps and untested paths

## Step 4 — Verify before output

- [ ] `01-source/normalized-spec.md` exists
- [ ] All 16 sections populated
- [ ] All Section 4 TCs have Section 5 traceability entries
- [ ] No invented behaviors
- [ ] Validation score noted

## Output

Return only:
1. Output path
2. Test case count (by type)
3. Coverage gap count
4. Top 3 highest-priority risks
5. Unresolved questions

> **Canonical source:** `prompts/test-strategy/01-analyze-spec-to-test-strategy.prompt.md`
> Tool adapter: `.github/prompts/test-strategy-01-analyze-spec.prompt.md`
