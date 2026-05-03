# Platform Architecture

## Overview

This platform uses a **canonical asset + adapter** pattern to keep AI logic portable across tools and environments.

```
┌──────────────────────────────────────────────────────────────────┐
│                    Canonical Source of Truth                     │
│                                                                  │
│   agents/          rules/          skills/         prompts/      │
│   ├── business-    ├── evidence-   ├── spec-       ├── business- │
│   │   flow/        │   and-        │   intake/     │   flow/     │
│   └── test-        │   traceab..   ├── analysis-   └── test-     │
│       strategy/    ├── business-   │   extraction/     strategy/ │
│                    │   flow-art..  ├── test-                     │
│                    ├── test-strat  │   strategy-                 │
│                    ├── repo-boun   │   extraction/               │
│                    ├── mermaid-    ├── mermaid-                  │
│                    │   visual-     │   pack/                     │
│                    └── spec-clar   └── verification/             │
└──────────────────────────────────────────────────────────────────┘
                              │
                  node tools/sync-adapters.mjs
                              │
          ┌───────────────────┴──────────────────┐
          ▼                                       ▼
   .claude/                              .github/prompts/
   ├── agents/    (adapter copy)         (adapter copy)
   ├── rules/
   └── skills/
```

---

## The manifest

`ai-platform.manifest.json` at the repo root is the central registry. It defines:

- `canonical` — paths to canonical asset directories
- `pipelines` — `business-flow` and `test-strategy` pipeline definitions
- `toolAdapters` — `.claude/` and `.github/prompts/` adapter paths
- `syncCommand` — `node tools/sync-adapters.mjs`

---

## Directory layout

| Directory | Role | Editable? |
|---|---|---|
| `agents/` | Canonical agent definitions | ✅ Yes |
| `rules/` | Canonical governance rules | ✅ Yes |
| `skills/` | Canonical extraction skills | ✅ Yes |
| `prompts/` | Canonical prompt files | ✅ Yes |
| `src/` | TypeScript pipeline engine | ✅ Yes |
| `specs/<project>/` | Input spec files | ✅ Yes (user) |
| `business-flow/<slug>/` | Business-flow output | ❌ Generated |
| `test-strategy/<slug>/` | Test-strategy output | ❌ Generated |
| `.claude/` | Claude adapter (generated) | ❌ Do not edit |
| `.github/prompts/` | Copilot adapter (generated) | ❌ Do not edit |

---

## Adding a new pipeline

1. Define a new agent in `agents/<pipeline-name>/`
2. Add relevant rules to `rules/`
3. Add an extraction skill in `skills/<pipeline-name>-extraction/`
4. Add prompts in `prompts/<pipeline-name>/`
5. Implement TypeScript in `src/core/<pipeline-name>-heuristics.ts` and `src/core/<pipeline-name>-renderers.ts`
6. Add a pipeline runner in `src/pipeline-<pipeline-name>.ts`
7. Wire up a CLI command in `src/cli.ts`
8. Register the pipeline in `ai-platform.manifest.json`
9. Run `node tools/sync-adapters.mjs`

---

## Adding a new tool adapter

1. Add the adapter target path to `ai-platform.manifest.json` under `toolAdapters`
2. Add a copy rule in `tools/sync-adapters.mjs`
3. Run `node tools/sync-adapters.mjs`
