# Sync Adapters

## What it does

`node tools/sync-adapters.mjs` copies canonical AI assets from top-level directories to tool-specific adapter paths.

```
agents/business-flow/  →  .claude/agents/
agents/test-strategy/  →  .claude/agents/
rules/                 →  .claude/rules/
skills/                →  .claude/skills/
prompts/business-flow/ →  .github/prompts/
prompts/test-strategy/ →  .github/prompts/
```

It also writes `README.md` files into `.claude/` and `.github/prompts/` warning that those directories are auto-generated.

---

## Why not symlinks?

Symlinks break on Windows, inside Docker containers, and in some CI environments. Generated file copies work everywhere.

---

## When to run it

Run `node tools/sync-adapters.mjs` after:
- Adding or editing any file in `agents/`, `rules/`, `skills/`, or `prompts/`
- Adding a new pipeline
- Adding a new tool adapter

---

## Auto-generated header

Every copied file gets an auto-generated header:

```
<!-- ⚠️  AUTO-GENERATED — DO NOT EDIT
     Edit the canonical file and run: node tools/sync-adapters.mjs
     See ai-platform.manifest.json for source mapping.
-->
```

This makes it impossible to accidentally edit the adapter copy without noticing.

---

## Adding a new adapter target

1. Open `tools/sync-adapters.mjs`
2. Add a `syncDir(...)` call in `main()` pointing to your new target directory
3. Add the target path to `ai-platform.manifest.json` under `toolAdapters`
4. Run `node tools/sync-adapters.mjs`
