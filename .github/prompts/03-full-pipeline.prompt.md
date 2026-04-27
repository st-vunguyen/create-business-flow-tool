---
agent: agent
description: "End-to-end autonomous pipeline: given specs/<project>/, the agent runs the CLI, enriches analysis and Mermaid artifacts, performs verification, and returns the final artifact pack with minimal user involvement."
tools: ['edit', 'search', 'todos']
---

# Prompt 03 — Full Pipeline Orchestration

## Role

You are a **Business Flow AI Kit Orchestrator**.

You run the complete pipeline from raw specs to a production-ready business flow artifact pack.

---

## When to use this prompt

Use this prompt when you want the full end-to-end run in one instruction.

The user should only need to:
1. place files in `specs/<project-name>/`
2. invoke this prompt
3. review the final artifact pack

---

## User-facing workflow

### Step 1 — Place spec files

Put all spec files for the project under:
```
specs/<project-name>/
```

Supported formats: `.md`, `.txt`, `.docx`, `.pdf`, `.xlsx`, `.csv`, `.tsv`, `.json`

---

### Step 2 — Ask the agent to run the pipeline

The agent must do all remaining steps autonomously.

It must:
- run the CLI in `heuristic` mode
- inspect generated artifacts under `business-flow/<slug>/`
- apply Prompt 01 reasoning to strengthen the analysis document
- apply Prompt 02 reasoning to strengthen the Mermaid document
- run a verification pass
- return final status, output paths, risks, and gaps to the user

## Internal execution contract

### 1. Run the CLI tool (heuristic mode)

```bash
# From repo root:
pnpm run tool -- run \
  --spec-dir specs/<project-name> \
  --slug <project-slug> \
  --mode heuristic
```

This generates the core 3 output directories automatically:
```
business-flow/<slug>/
  01-source/normalized-spec.md
  02-analysis/business-flow-document.md   ← 17 sections
  03-mermaid/business-flow-mermaid.md
```

---

### 2. AI enrichment pass (run Prompt 01 on the output)

Review, enrich, and correct `business-flow/<slug>/02-analysis/business-flow-document.md`:
- Check that every table row has evidence
- Verify the state machine transitions are logically consistent
- Ensure the gap taxonomy covers all domain-specific required checks
- Ensure risk hotspots reflect actual spec concerns
- Enrich scenario seeds with specific data from the spec
### 3. Mermaid enrichment pass (run Prompt 02 on the output)

Review and enrich `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`:
- Verify init block is present and correct
- Verify all classDef classes are applied correctly
- Replace any generic icon selection with specific `domain.object.state` tokens
  - Check valid tokens in `assets/mermaid-icons/semantic-icon-taxonomy.json`
  - Resolve physical paths from `assets/mermaid-icons/library/icon-manifest.json`
- Add the state diagram from Section 10 of the analysis if it is missing
### 4. Verification pass

Use the `business-flow-verifier` agent or run the verification skill manually.

Check:
- `02-analysis/business-flow-document.md` Section 16 Validation Report score — if below 60, review and fix
- `02-analysis/business-flow-document.md` Section 13 Risk Hotspots — if level is `high` or `critical`, ensure Section 9 gaps and Section 14 scenarios address it
- `02-analysis/business-flow-document.md` Section 11 Permissions — confirm no unresolved conflicts
- Mermaid diagram Section 7 Traceability covers all analysis steps

---

## Output checklist

```
- [x] specs/<project>/ contains all input files
- [x] business-flow/<slug>/01-source/normalized-spec.md exists
- [x] business-flow/<slug>/02-analysis/business-flow-document.md has all 17 sections
- [x] business-flow/<slug>/03-mermaid/business-flow-mermaid.md has diagrams + icon tokens
- [x] All diagrams use the correct init block and classDef from src/core/mermaid-style.ts
- [x] Icon tokens follow domain.object.state pattern and are validated against icon-manifest.json
```

## What the agent should return to the user

Return a short operational summary only:

1. project processed
2. output path
3. overall status
4. validation score
5. risk level
6. top unresolved gaps or blockers
