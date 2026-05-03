---
description: "Autonomously read specs/<project>/ and produce a complete evidence-backed 19-section business-flow analysis pack."
tools: ['edit', 'search', 'todos']
---

# Prompt 01 — Spec → Business Flow Analysis Document

## Mission

Read `specs/<project>/`, normalize all source files, and produce a review-ready business-flow analysis pack under `business-flow/<slug>/`.

The user should only:
1. Place spec files in `specs/<project>/`
2. Ask you to run the pipeline
3. Review the output

You handle everything else.

---

## Step 1 — Bootstrap (if needed)

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run doctor
```

## Step 2 — Run the heuristic pipeline

```bash
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
```

## Step 3 — Enrich the analysis document

Apply these principles to `business-flow/<slug>/02-analysis/business-flow-document.md`:

### Evidence quality
- Every row in Section 3 must cite a source file + line number
- Replace any `Unknown / needs confirmation` entries only if you find explicit evidence
- Never invent evidence

### Section completeness
- All 19 sections must be populated (0–19)
- Section 9 gap taxonomy must include domain-pack required gap checks
- Section 10 must include both a list of states and a `stateDiagram-v2` block
- Section 11 must have the permissions matrix with conflicts and gaps columns
- Section 12 must classify each event with kind, hasCallback, hasRecovery
- Section 13 must give each risk a numeric score 0–100 and a level (low/medium/high/critical)

### State-machine coherence
- Every state in Section 10 must appear in at least one transition
- No orphan states
- Rollback transitions must be labeled as such

### Risk realism
- Risk scores must reflect actual gaps found in Section 9
- Do not inflate scores with generic observations

### Scenario quality
- happy-path seeds must cover the main success flow end-to-end
- abuse-failure seeds must cover at least the top HIGH risk

## Step 4 — Verify

Before handing off, confirm:
- [ ] `01-source/normalized-spec.md` exists with numbered lines
- [ ] All 19 sections present
- [ ] All Section 3 rows have Section 6 traceability entries
- [ ] Validation score ≥ 60
- [ ] No invented facts

## Output

Return only:
1. Output path
2. Validation score
3. Top 3 gaps or unresolved questions

> **Canonical source:** `prompts/business-flow/01-analyze-spec-to-business-flow-documents.prompt.md`
> Tool adapter: `.github/prompts/01-analyze-spec-to-business-flow-documents.prompt.md`
