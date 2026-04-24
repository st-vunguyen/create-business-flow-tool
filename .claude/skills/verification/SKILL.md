# Verification Skill

## Use this skill when

- reviewing generated outputs under `business-flow/<slug>/`
- checking whether a run satisfies the repository contract
- performing the final second-pass verification after analysis and Mermaid generation are done

## Goal

Validate that the artifact pack is complete, evidence-backed, and ready for stakeholder review.

## Checklist

1. `01-source/normalized-spec.md` exists and contains numbered source lines.
2. `02-analysis/business-flow-document.md` contains summary, table, narrative, decisions, traceability, questions, and assumptions.
3. `03-mermaid/business-flow-mermaid.md` contains extracted facts, diagrams, and node traceability.
4. `04-prompts/` preserves the prompt artifacts used for the run.
5. `10-reports/run-summary.json` reflects the real execution mode and processed files.
6. The analysis table, narrative, and Mermaid pack stay mutually consistent.
7. Any unresolved ambiguity is still labeled, not silently converted into a fact.

## Quality bar

- English only
- no invented facts
- clear `Unknown / needs confirmation` markers where needed
- reject unsupported branches, actor ownership, or outcomes during verification

## Verification outcome

Always return:

1. overall status: `pass`, `pass with gaps`, or `needs revision`
2. artifact completeness status
3. evidence and traceability findings
4. analysis vs Mermaid consistency findings
5. unsupported inference findings
6. exact revisions needed before approval
