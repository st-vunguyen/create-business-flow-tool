# Documentation Guide

This folder explains the **idea**, **requirements**, **architecture**, **implementation plan**, and **day-to-day usage** of the Business Flow Tool.

## Start here

If you know nothing about the repository, read in this order:

1. `requirements/PRODUCT_REQUIREMENT_DOCUMENT.md`
   - What problem the tool solves
   - Who it is for
   - What outputs it should produce
2. `architecture/SYSTEM_ARCHITECTURE.md`
   - How the repository is structured
   - How the runtime pipeline works
   - Which source files own which responsibilities
3. `UNIVERSAL_USAGE_GUIDELINES.md`
   - How to prepare specs
   - Which command to run
   - How to read the outputs
   - How to iterate when gaps remain
4. `implement-plan/implement-plan.md`
   - The long-term product and engineering direction
   - The target capability model behind the project
5. `implement-plan/implement-plan-assessment.md`
   - The current maturity level versus the larger vision
   - What is already implemented and what is still missing

## What this repository is

This repository is a **spec-first business-flow analysis tool**.

It takes mixed specification files from `specs/<project>/` and turns them into:

- a normalized source corpus
- a structured business-flow analysis document
- a Mermaid diagram pack
- optional debug artifacts for validation, traceability, and machine-readable review

The tool is designed for:

- business analysts
- quality-control analysts
- solution designers
- engineers who need to understand messy requirements quickly

## What it is not

This repository is **not** a code generator for product features.

Its job is to:

- understand specifications
- clarify business behavior
- expose ambiguity and contradictions
- produce reviewable documentation artifacts

Its job is **not** to:

- implement the product itself
- invent missing requirements
- replace source specifications as the system of record

## Current output model

For each run, the main user-facing artifacts are:

- `business-flow/<slug>/01-source/normalized-spec.md`
- `business-flow/<slug>/02-analysis/business-flow-document.md`
- `business-flow/<slug>/03-mermaid/business-flow-mermaid.md`

Supporting runtime and audit artifacts are grouped under:

- `business-flow/<slug>/debug/`

Examples:

- `debug/analysis.prompt.md`
- `debug/mermaid.prompt.md`
- `debug/validation.json`
- `debug/permissions.json`
- `debug/risk.json`
- `debug/scenario-seeds.md`
- `debug/run-summary.json`

## Documentation principles

The documents in this folder follow these rules:

- describe the repository as it actually works today
- separate **current behavior** from **future intent**
- make the reading path easy for a new contributor
- prefer precise file paths and source-of-truth references over vague descriptions

## Related source-of-truth files outside `docs/`

- `README.md` — concise repo-level overview
- `AGENTS.md` — workspace instructions and mission
- `.github/prompts/` — prompt source of truth used by the runtime and agents
- `.claude/` — repo-local rules, skills, and agents for business-flow analysis

## Recommended onboarding workflow

If you are using the repository as an end user:

1. put specs in `specs/<project>/`
2. ask `Copilot Chat` or `Claude` to run the full business-flow pipeline
3. review the outputs in `business-flow/<slug>/`

If you are new to the repository as a contributor:

1. read this file
2. read the PRD
3. read the architecture doc
4. scan `src/cli.ts`, `src/pipeline.ts`, and `src/core/`
5. run the sample test
6. run the tool on a small spec folder
7. inspect the three main artifacts and the `debug/` folder
