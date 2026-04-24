# Expert QC Business Flow Tool

This repository is a spec-first QC tool for clarifying requirements and generating standard business-flow artifacts.

## Mission

- read source specs from `specs/`
- normalize multi-format inputs into a clean corpus
- extract a trustworthy business flow
- surface ambiguity, gaps, and assumptions clearly
- generate a traceable Mermaid diagram from the extracted flow

## Commands

```bash
pnpm run tool -- doctor
pnpm run tool -- run --spec-dir specs --slug my-flow --output-root business-flow --mode auto
pnpm run tool -- run --spec-dir specs --slug my-flow --output-root business-flow --mode heuristic
pnpm run tool -- run --spec-dir specs --slug my-flow --output-root business-flow --mode dry-run
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
src/core/                    # extractors, prompts, heuristics, renderers, utilities
specs/                       # local input specs (gitignored)
business-flow/               # local generated QC artifacts (gitignored)
tests/fixtures/specs/sample/ # sample specs for smoke tests
tests/pipeline.test.ts       # end-to-end heuristic smoke test
.github/prompts/             # prompt source of truth
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

## Out of scope by default

- frontend or backend product implementation
- API testing packs and Postman assets
- Playwright or E2E framework work
- database schemas or migrations
- CI/CD or deployment setup
