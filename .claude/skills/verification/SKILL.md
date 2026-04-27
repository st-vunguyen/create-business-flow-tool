# Verification Skill

## Use this skill when

- reviewing the full artifact set under `business-flow/<slug>/`
- checking whether a run satisfies the repository output contract
- performing the final second-pass after analysis and Mermaid generation

## Goal

Validate that the full artifact pack is complete, evidence-backed, and ready for stakeholder review.

By default, verification is an internal agent responsibility, not a manual user step.

## Checklist — by directory

### 01-source/
- [ ] `normalized-spec.md` exists with numbered source lines and relative path prefixes

### 02-analysis/
- [ ] All 17 sections present (0 through 17)
- [ ] Section 3 table — every row has actor, step, and traceability
- [ ] Section 6 traceability — every row cites source file + line number
- [ ] Section 9 gap taxonomy — typed gaps by category; domain pack gaps included
- [ ] Section 10 state machine — list of states, transition table, `stateDiagram-v2`
- [ ] Section 11 permissions — role-action matrix; conflicts and gaps listed
- [ ] Section 12 async events — each event has kind, callback status, recovery status
- [ ] Section 13 risk hotspots — risk level stated; at least 1 hotspot if score > 0
- [ ] Section 14 scenario seeds — at least happy-path and edge-case seeds present
- [ ] Section 15 contradictions and cross-flow impact — conflicts and downstream impact review are present when evidence supports them
- [ ] Section 16 validation — score, pass/warn/fail counts, table of checks
- [ ] No invented facts — all claims traceable to `01-source/normalized-spec.md`

### 03-mermaid/
- [ ] Init block matches `src/core/mermaid-style.ts` exact variables
- [ ] classDef covers: `startEnd`, `process`, `decision`, `exception`, `external`, `note`
- [ ] Happy path blue links + exception red dashed links
- [ ] `linkStyle` lines are present
- [ ] Section 3 icon set: fallback icons + ≥3 semantic tokens with `domain.object.state`
- [ ] Tokens validated against `assets/mermaid-icons/library/icon-manifest.json`
- [ ] Section 7 traceability covers all analysis Section 3 steps
- [ ] Swimlane present OR fallback note explains why it was omitted

### debug/
- [ ] `validation.json` has `checks[]`, `passCount`, `warnCount`, `failCount`, `score`
- [ ] `permissions.json` has `entries[]`, `conflicts[]`, `gaps[]`
- [ ] `risk.json` has `total`, `level`, `hotspots[]`
- [ ] `scenario-seeds.md` has seeds covering at least 3 of the 4 kinds
- [ ] `run-summary.json` has `slug`, `mode`, `processedFiles`, and all output paths

## Quality bar

- **English only** — no cell, label, or sentence in another language
- **No invented facts** — reject claims without source evidence
- **Known unknowns are explicit** — `Unknown / needs confirmation` where data is missing
- **Risk and scenarios are coupled** — every `high`/`critical` hotspot should have at least one `abuse-failure` seed
- **Icon tokens are grounded** — token must be in `icon-manifest.json`; reject invented paths

## Verification outcome

Return:
1. **Overall status**: `pass` | `pass with gaps` | `needs revision`
2. Missing or empty directories/sections
3. Evidence and traceability issues
4. Analysis ↔ Mermaid consistency gaps
5. State machine anomalies
6. Icon selection issues
7. Required revisions list
