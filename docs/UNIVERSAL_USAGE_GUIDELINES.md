# Universal Usage Guidelines

This guide explains how to use the Business Flow Tool from raw specification files to review-ready artifacts.

## Who this guide is for

Use this guide if you are:

- new to the repository
- preparing a spec folder under `specs/`
- trying to understand what the tool outputs
- iterating on unclear requirements until the artifact pack is good enough to review

## What the tool does

The tool reads mixed-format specification files and produces a business-flow artifact set.

The primary outputs are:

- `business-flow/<slug>/01-source/normalized-spec.md`
- `business-flow/<slug>/02-analysis/business-flow-document.md`
- `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`

The tool also writes supporting debug artifacts to:

- `business-flow/<slug>/debug/`

These debug artifacts are useful for validation, machine-readable review, and prompt/runtime inspection, but they are not the main user-facing deliverables.

## Recommended mental model

Think of the pipeline as four layers:

1. input layer — raw files in `specs/<project>/`
2. normalization layer — a numbered, traceable source corpus
3. analysis layer — a structured business-flow document
4. visualization layer — Mermaid diagrams and icon metadata

## Prerequisites

Install dependencies once from repo root:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run doctor
```

Why this is enough:

- `node_modules/` is restored from `package.json` + `pnpm-lock.yaml`
- `dist/` is rebuilt automatically by the repository `prepare` script during install

So neither `node_modules/` nor `dist/` needs to be committed to git for normal clone-and-use workflow.

If you want to run the compiled artifact instead of `tsx`, use:

```bash
pnpm run tool:dist -- doctor
```

No environment variables are required for the normal workflow.

## Default user workflow

The intended user workflow is only 3 steps:

1. put source files in `specs/<project>/`
2. ask `Copilot Chat` or `Claude` to run the full business-flow pipeline for that project
3. review the final outputs under `business-flow/<slug>/`

The assistant should handle the intermediate run, prompt application, and verification steps.

Recommended instruction:

```text
Run the full business-flow pipeline for `specs/<project>` and produce the final artifact pack under `business-flow/<slug>/`.
Use the repository prompts, rules, and verifier automatically. Do the intermediate steps yourself and only return the final status, key gaps, and output paths.
```

If you are using `Copilot Chat`, `Claude`, or another assistant manually, that short instruction should be enough.

Optional environment variables for the repository's built-in experimental `llm` mode:

```bash
export OPENAI_API_KEY="<your-key>"
export OPENAI_MODEL="gpt-4.1-mini"
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

## Step 1 — Prepare input specs

Create a project folder under `specs/`:

```text
specs/
  my-project/
    product-requirements.md
    api-contract.json
    flow-notes.txt
    touchpoints.csv
```

Supported formats include:

- `.md`, `.markdown`, `.txt`
- `.doc`, `.docx`
- `.pdf`
- `.xlsx`, `.xls`, `.csv`, `.tsv`
- `.json`

### Input best practices

The tool works best when the source material contains at least some of the following:

- named actors or roles
- a clear trigger or starting event
- major business steps
- expected outcomes
- error handling or edge cases
- permission rules, if access control matters
- lifecycle states, if an entity changes status over time

You do not need to pre-format everything perfectly. The normalization pass is designed to tolerate messy inputs.

## Internal runtime path

For normal usage, the assistant should run the heuristic pipeline on your behalf.

## Step 1 — Run the heuristic pipeline

The most reliable starting point is heuristic mode:

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode heuristic
```

This produces:

```text
business-flow/my-project/
├── 01-source/
│   └── normalized-spec.md
├── 02-analysis/
│   └── business-flow-document.md
├── 03-mermaid/
│   └── business-flow-mermaid.md
└── debug/
    ├── analysis.prompt.md
    ├── mermaid.prompt.md
    ├── validation.json
    ├── permissions.json
    ├── risk.json
    ├── scenario-seeds.md
    └── run-summary.json
```

## Step 2 — Understand the three primary artifacts

### `01-source/normalized-spec.md`

This is the source-of-truth corpus created from the input files.

Use it to:

- verify that important source content was extracted correctly
- inspect line numbers and relative file paths
- confirm traceability when reviewing analysis claims

### `02-analysis/business-flow-document.md`

This is the main business-flow document.

It contains 17 sections, including:

- scope and source summary
- flow table and narrative
- gap taxonomy
- state machine
- permissions
- async events
- risk hotspots
- scenario seeds
- contradictions
- validation report

This is the main document for analysts, reviewers, and stakeholders.

### `03-mermaid/business-flow-mermaid.md`

This contains the diagram pack, including:

- the Mermaid flowchart
- the optional swimlane diagram
- the optional state diagram
- node traceability
- semantic icon-token metadata

This is the main document for visual review and process communication.

## Step 3 — Use the debug artifacts correctly

The `debug/` folder is intentionally separate so it does not clutter the main outputs.

### `debug/analysis.prompt.md`

This is the runtime-expanded version of Prompt 01.

It is useful when you want to:

- inspect exactly what context was prepared for an AI pass
- copy the runtime prompt into another tool manually
- debug prompt construction

### `debug/mermaid.prompt.md`

This is the runtime-expanded version of Prompt 02.

Use it for Mermaid-specific prompt inspection or manual LLM refinement.

### `debug/validation.json`

Machine-readable validation results.

### `debug/permissions.json`

Machine-readable permission matrix.

### `debug/risk.json`

Machine-readable risk score and hotspot list.

### `debug/scenario-seeds.md`

Readable scenario seeds separated from the main analysis document.

### `debug/run-summary.json`

Manifest of the run and output paths.

## Step 4 — Decide whether the output is good enough

Review these checkpoints first:

1. `02-analysis` Section 16 — Validation Report
2. `02-analysis` Section 9 — Gap Taxonomy
3. `02-analysis` Section 13 — Risk Hotspots
4. `03-mermaid` Section 7 — Traceability
5. `debug/validation.json` and `debug/risk.json` if you need structured review

### Practical review rule

If the flow is understandable, traceable, and the remaining gaps are explicit rather than hidden, the artifact is useful even if the source spec is imperfect.

## Step 5 — Iterate when the spec is weak

When the output is incomplete, do not manually invent facts in generated artifacts.

Instead:

1. add clarification back into `specs/<project>/`
2. re-run the pipeline
3. compare the new output

Good ways to improve the input corpus:

- add a clarification note file such as `qa.md`
- add a permission matrix or touchpoint CSV
- add state or lifecycle notes
- add examples of failure paths or retry behavior

## Recommended commands

### Capability summary

```bash
pnpm run tool -- doctor
```

### Heuristic run

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode heuristic
```

### Auto mode

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode auto
```

`auto` resolves to:

- `llm` when `OPENAI_API_KEY` is configured
- `heuristic` otherwise

If you do not want a built-in API call, just run `heuristic` explicitly.

### Dry run

```bash
pnpm run tool -- run --spec-dir specs/my-project --slug my-project --mode dry-run
```

Use dry-run when you only want normalized inputs and prompt/debug preparation.

## Important accuracy notes

### About LLM mode

The repository includes:

- prompt source-of-truth files in `.github/prompts/`
- prompt composition logic in `src/core/prompts.ts`
- LLM request scaffolding in `src/core/llm.ts`

However, the current CLI pipeline is still strongest in heuristic mode.

If you are using `Copilot Chat` or `Claude`, you do not need `OPENAI_API_KEY` just to benefit from the repository. The intended workflow is:

1. ask the assistant to run the full pipeline
2. let the assistant handle heuristic run, prompt use, and verification internally
3. review the final outputs under `business-flow/<slug>/`

Use `debug/*.prompt.md` only when you intentionally want a manual deep-dive or override the default autonomous flow.

Use the built-in `llm` mode only if you explicitly want this repository itself to call an OpenAI-compatible API.

### About prompts

There are two kinds of prompt files:

- `.github/prompts/*.prompt.md` → committed prompt source-of-truth
- `business-flow/<slug>/debug/*.prompt.md` → runtime-expanded prompt snapshots

The runtime snapshots are for debug, audit, and manual reuse. They do not replace the source-of-truth prompt files.

## Common mistakes to avoid

- Do not treat generated analysis as stronger than the source evidence.
- Do not edit output files to add unsupported facts.
- Do not confuse `debug/*.prompt.md` with the canonical prompts in `.github/prompts/`.
- Do not assume a missing branch is handled just because the main flow looks clean.
- Do not skip `normalized-spec.md` when checking traceability.

## Reading path for new contributors

If you are trying to understand the whole repository, read next:

1. `docs/requirements/PRODUCT_REQUIREMENT_DOCUMENT.md`
2. `docs/architecture/SYSTEM_ARCHITECTURE.md`
3. `docs/implement-plan/implement-plan.md`
4. `docs/implement-plan/implement-plan-assessment.md`
