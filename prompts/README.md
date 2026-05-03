# Prompts — Canonical Directory

This directory is the **single source of truth** for all prompt files used by this platform.

```
prompts/
├── business-flow/
│   ├── 01-analyze-spec-to-business-flow-documents.prompt.md
│   ├── 02-convert-business-flow-documents-to-mermaid.prompt.md
│   └── 03-full-pipeline.prompt.md
└── test-strategy/
    ├── 01-analyze-spec-to-test-strategy.prompt.md
    └── 02-full-test-strategy-pipeline.prompt.md
```

## Tool adapters

| Tool | Adapter path | Mirror of |
|------|-------------|-----------|
| GitHub Copilot Chat | `.github/prompts/` | `prompts/business-flow/` + `prompts/test-strategy/` |
| Claude Code | `.claude/` settings | referenced via `ai-platform.manifest.json` |

To regenerate adapters after editing canonical prompts:
```bash
node tools/sync-adapters.mjs
```
