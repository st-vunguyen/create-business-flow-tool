# Verification Skill

## Use this skill when

- Reviewing the full artifact set under `business-flow/<slug>/` or `test-strategy/<slug>/`
- Checking whether a run satisfies the repository output contract
- Performing the final pass after generation

## Goal

Validate that the full artifact pack is complete, evidence-backed, and ready for stakeholder review. Verification is an internal agent responsibility, not a manual user step.

## Business-flow checklist

### 01-source/
- [ ] `normalized-spec.md` exists with numbered source lines

### 02-analysis/
- [ ] All 19 sections present (0–19)
- [ ] Section 3 table — every row has actor, step, traceability
- [ ] Section 6 — every row cites source file + line
- [ ] Section 9 — typed gaps by category
- [ ] Section 10 — states, transitions, `stateDiagram-v2`
- [ ] Section 13 — risk level stated; at least 1 hotspot if score > 0
- [ ] No invented facts

### 03-mermaid/
- [ ] Init block matches `src/core/mermaid-style.ts`
- [ ] classDef covers: `startEnd`, `process`, `decision`, `exception`, `external`, `note`
- [ ] ≥3 semantic tokens validated against `icon-manifest.json`
- [ ] Section 7 traceability covers all analysis Section 3 steps

### debug/
- [ ] `validation.json`: `checks[]`, `passCount`, `warnCount`, `failCount`, `score`
- [ ] `permissions.json`: `entries[]`, `conflicts[]`, `gaps[]`
- [ ] `risk.json`: `total`, `level`, `hotspots[]`

## Test-strategy checklist

### 02-strategy/
- [ ] All 16 sections present (0–15)
- [ ] Section 4 — every test case has ID, type, steps, expected result, evidence
- [ ] Section 10 — every test case traces to spec source line
- [ ] Section 8 — coverage gaps explicitly listed
- [ ] Section 14 — regression checklist present
- [ ] No invented test cases for behavior not in spec

## Quality bar (both pipelines)

- **English only** — no cell, label, or sentence in another language
- **No invented facts** — reject claims without source evidence
- **Known unknowns explicit** — `Unknown / needs confirmation` where data is missing

## Outcome format

1. **Overall status**: `pass` | `pass with gaps` | `needs revision`
2. Missing sections list
3. Evidence and traceability issues
4. Required revisions

> **Canonical source:** `skills/verification/SKILL.md`
