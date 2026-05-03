---
description: "Full autonomous pipeline: bootstrap repo → run heuristic engine → enrich analysis → enrich Mermaid → verify → report."
tools: ['edit', 'search', 'todos', 'terminal']
---

# Prompt 03 — Full Autonomous Business-Flow Pipeline

## Mission

Take raw specs under `specs/<project>/` and leave the repository in a finished state:

- `business-flow/<slug>/01-source/normalized-spec.md`
- `business-flow/<slug>/02-analysis/business-flow-document.md`
- `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`
- `business-flow/<slug>/debug/` — all supporting artifacts

The user should only need to:
1. Clone the repo
2. Put spec files into `specs/<project>/`
3. Ask you to run the business-flow pipeline
4. Review the final output pack

You do everything else.

---

## Absolute UX rule

The user must not manually:
- Install dependencies
- Build the project
- Choose CLI mode
- Run Prompt 01 and Prompt 02 separately
- Inspect debug/ artifacts manually
- Coordinate verification passes

---

## Step 0 — Bootstrap (if needed)

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run doctor
```

## Step 1 — Validate input

Check that `specs/<project>/` exists and contains source files. Report only if missing.

## Step 2 — Run pipeline

```bash
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
```

## Step 3 — Enrich analysis

Apply Prompt 01 standard to `02-analysis/business-flow-document.md`.

## Step 4 — Enrich Mermaid

Apply Prompt 02 standard to `03-mermaid/business-flow-mermaid.md`.

## Step 5 — Verify

- `01-source/normalized-spec.md` exists and is usable as evidence anchor
- `02-analysis/business-flow-document.md` contains all 19 sections
- `03-mermaid/business-flow-mermaid.md` has all required diagram sections
- Validation score acceptable
- Top risks and gaps surfaced

## Step 6 — Final handoff

Return only:
1. Project processed
2. Output path
3. Overall status
4. Validation score
5. Risk level
6. Top unresolved gaps or blockers

> **Canonical source:** `prompts/business-flow/03-full-pipeline.prompt.md`
> Tool adapter: `.github/prompts/03-full-pipeline.prompt.md`
