# Expert QC Business Flow Tool

This repository is a spec-first QC tool for clarifying requirements and generating standard business-flow artifacts.

## Mission

- read source specs from `specs/`
- normalize multi-format inputs into a clean corpus
- extract a trustworthy business flow with state machine, permissions, risk scoring, async modeling, and test scenarios.
- surface ambiguity, gaps, and contradictions clearly
- generate a traceable Mermaid diagram from the extracted flow
- choose semantically appropriate icon tokens from the extended icon registry when preparing Mermaid-oriented outputs
- verify the final artifact pack one more time before treating it as review-ready

## Commands

```bash
pnpm run tool -- doctor
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode auto
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode dry-run
pnpm run lint
pnpm run build
pnpm run test
```

## Canonical flow

```text
specs/ -> business-flow/<slug>/01-source -> business-flow/<slug>/02-analysis -> business-flow/<slug>/03-mermaid
```

## Main areas

```text
src/                         # CLI and runtime pipeline
src/core/                    # extractors, prompts, heuristics, validators, risk engines
specs/                       # local input specs (gitignored)
business-flow/               # local generated QC artifacts (gitignored)
tests/fixtures/specs/sample/ # sample specs for smoke tests
tests/pipeline.test.ts       # end-to-end heuristic smoke test
.github/prompts/             # prompt source of truth (01-analysis, 02-mermaid, 03-full-pipeline)
docs/                        # visual standards, icon library, and icon selection guidance
.claude/                     # Claude-specific QC agent, skill, and rules
```

## Local-only data

- `specs/` is local input only and must not be pushed.
- `business-flow/` is local generated output only and must not be pushed.
- `.gitignore` enforces both rules for each user of the tool.

## QC guardrails

- Every claim must be evidence-backed.
- Never invent actors, rules, branches, or outcomes.
- Prefer `Unknown / needs confirmation` over guessing.
- Keep wording close to the source unless very light normalization is needed.
- Every table row and Mermaid node must have traceability.
- Icon choices must reinforce supported meaning only; they must not add unsupported ownership, automation, or status.

## Preferred roles

- primary analyst: read specs and produce the 17-section business-flow pack and Mermaid pack
- verifier: review the produced pack against the 8 output directories for evidence, consistency, and unsupported inference
- do not drift into unrelated implementation work unless explicitly requested
