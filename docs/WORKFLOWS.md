# WORKFLOWS.md — End-to-End Usage Workflows

Concrete, step-by-step workflows for every common usage pattern.

---

## 1. Daily analyst workflow

The standard loop for analysing a new or updated spec.

```
1. Drop spec files into specs/<project>/
2. Run heuristic pipeline
3. Inspect validation score and checks
4. Open 02-analysis/business-flow-document.md
5. Enrich any FAIL or WARN sections
6. Re-run to confirm improvement
7. Mark artifact as review-ready
```

**Step 1 — Place spec files**

```bash
mkdir -p specs/my-project
cp ~/Downloads/requirements.md specs/my-project/
cp ~/Downloads/api-spec.json specs/my-project/
```

Supported formats: `.md`, `.txt`, `.json`, `.csv`, `.pdf`, `.docx`, `.xlsx`.

**Step 2 — Run heuristic pipeline**

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode heuristic
```

**Step 3 — Inspect validation**

```bash
cat business-flow/my-project/debug/validation.json
```

Resolve all `fail` items before proceeding. `warn` items should be addressed before marking the artifact as review-ready.

**Step 4 — Review the analysis document**

Open `business-flow/my-project/02-analysis/business-flow-document.md`. Verify:
- Section 3 (Business Flow Table) reflects the actual spec logic.
- Section 6 (Traceability) has a row for every step.
- Section 13 (Risk Hotspots) matches your domain knowledge.

**Step 5 — Enrich FAIL sections**

If the tool could not extract goal, actors, or trigger, add explicit sections to the spec:

```markdown
## Goal
Allow kitchen staff to acknowledge and complete food orders.

## Actors
- Kitchen Staff
- KDS Device
- POS System

## Trigger
A new order is received from the POS System.
```

Re-run after updating.

---

## 2. CI workflow

Use the tool as a quality gate in a continuous integration pipeline.

```yaml
# .github/workflows/spec-qc.yml
name: Spec QC
on:
  push:
    paths:
      - 'specs/**'
jobs:
  qc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 10
      - run: pnpm install
      - run: pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode heuristic
      - name: Assert validation score
        run: |
          SCORE=$(cat business-flow/my-project/debug/validation.json | python3 -c "import sys,json; print(json.load(sys.stdin)['score'])")
          echo "Validation score: $SCORE"
          [ "$SCORE" -ge 70 ] || (echo "Score below threshold" && exit 1)
      - uses: actions/upload-artifact@v4
        with:
          name: business-flow-artifacts
          path: business-flow/my-project/
```

The validation score gate (`≥ 70`) is enforced by the CI step. Adjust the threshold based on your team's quality standards.

---

## 3. LLM enrichment workflow

Use heuristic analysis as a baseline, then enrich with an LLM pass.

```
1. Run heuristic to establish baseline
2. Review which sections are thin
3. Set OPENAI_API_KEY
4. Re-run with --mode llm
5. Compare LLM output against heuristic
6. Use the better artifact
```

**Step 1 — Heuristic baseline**

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode heuristic
```

Note the validation score for comparison.

**Step 3 — Configure LLM**

```bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o          # optional, default: gpt-4o
export OPENAI_BASE_URL=https://api.openai.com/v1  # optional
```

**Step 4 — LLM pass**

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode llm
```

The LLM receives the normalized spec and the analysis prompt from `debug/analysis.prompt.md`.

**Step 5 — Compare**

Check `debug/validation.json` for the LLM run. Compare Section 3 (steps), Section 9 (gaps), and Section 13 (risks) between the two runs. Use whichever is more accurate and evidence-backed — do not merge invented content from the LLM run.

---

## 4. Spec onboarding workflow

Starting from scratch with a raw spec in a non-standard format.

```
1. Create project folder
2. Dump raw spec as .md or paste into a .txt file
3. Run dry-run to inspect what the tool sees
4. Structure the spec with explicit sections
5. Run heuristic
6. Iterate
```

**Step 3 — Dry run**

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode dry-run
```

This writes only `debug/analysis.prompt.md` — the normalized corpus the tool would send to an LLM. Inspect it to understand what was extracted.

**Step 4 — Structure the spec**

Add these sections to your spec for maximum extraction quality:

```markdown
## Goal
## Actors
## Trigger
## Steps
## Outcomes
## Decisions
## Exceptions
## Permissions
## Async Events
```

The heuristic engine uses regex on these exact headings.

---

## 5. Mermaid specialist workflow

Producing or reviewing Mermaid diagrams from the analysis.

```
1. Read 02-analysis/business-flow-document.md completely
2. Identify all actors (Section 2) and steps (Section 3)
3. Check domain pack (Section 0 — Scope)
4. Select icon tokens from assets/mermaid-icons/library/
5. Verify swimlane palette is applied
6. Validate diagram renders in target viewer
7. Confirm no nodes exist that are not in Section 3
```

**Icon token format:** `domain.object.state`

Examples:
- `commerce.order.created`
- `identity.user.active`
- `finance.payment.captured`

Icon manifest: `assets/mermaid-icons/library/icon-manifest.json`

Visual standard: `docs/icons/mermaid-visual-standard.md`

**Swimlane palette** (from `src/core/mermaid-style.ts`):

| Index | Color |
|---|---|
| 0 | `#E3F2FD` |
| 1 | `#F3E5F5` |
| 2 | `#E8F5E9` |
| 3 | `#FFF8E1` |
| 4 | `#FCE4EC` |
| 5 | `#E0F7FA` |

**Non-negotiable rule:** Never add a node, actor, or branch to the Mermaid diagram that does not appear in Section 3 of the analysis document.

---

## 6. Verifier workflow

Reviewing an artifact pack against the 8 quality dimensions.

```
1. Open 01-source/normalized-spec.md (the corpus)
2. Open 02-analysis/business-flow-document.md
3. Open debug/validation.json
4. For each quality dimension (Q1–Q8), mark PASS/WARN/FAIL
5. Document evidence for any WARN or FAIL
6. Return findings to analyst
```

**Quality dimensions:**

| # | Dimension | Key check |
|---|---|---|
| Q1 | Completeness | All 19 sections populated and non-empty |
| Q2 | Evidence | Every step in Section 3 has a matching row in Section 6 |
| Q3 | Accuracy | No invented facts; compare Section 3 against `01-source/normalized-spec.md` |
| Q4 | Consistency | Section 3 actors match Section 11; Section 3 states match Section 10 |
| Q5 | Gap coverage | Section 9 covers all domain-pack required gap checks |
| Q6 | Risk quality | Section 13 score matches the actual complexity of the spec |
| Q7 | Mermaid fidelity | Every node in `03-mermaid/` maps to a step in Section 3 |
| Q8 | Language | English only, no emoji, no non-business terminology |

**Evidence format:**

```
Q3 FAIL: Step 7 ("System auto-approves if score > 800") — phrase "score > 800"
not found anywhere in 01-source/normalized-spec.md. Likely invented.
```

---

## 7. Adding a new project

```bash
# 1. Create the spec directory
mkdir -p specs/<project-name>

# 2. Place spec files (any supported format)
cp path/to/your/files specs/<project-name>/

# 3. Verify tool sees the files
pnpm run tool -- run \
  --spec-dir specs/<project-name> \
  --slug <project-name> \
  --mode dry-run

# 4. Inspect what was extracted
open business-flow/<project-name>/debug/analysis.prompt.md

# 5. Run full heuristic analysis
pnpm run tool -- run \
  --spec-dir specs/<project-name> \
  --slug <project-name> \
  --mode heuristic

# 6. Check output
open business-flow/<project-name>/02-analysis/business-flow-document.md
open business-flow/<project-name>/03-mermaid/business-flow-mermaid.md
cat business-flow/<project-name>/debug/validation.json
```

---

## 8. Checking tool health

```bash
# Verify capabilities and runtime
pnpm run tool -- doctor

# TypeScript type check (no emit)
pnpm run lint

# Run smoke test
pnpm run test
```

`doctor` reports: Node version, pnpm version, OPENAI_API_KEY presence, available LLM model, icon library status, and domain packs loaded.
