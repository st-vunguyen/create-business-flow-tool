# INTEROPERABILITY-STANDARD.md — External System Integration Rules

This document defines how the Business Flow Tool interacts with external systems, formats, and consumers. Any integration must conform to these rules.

---

## 1. Spec file intake (inbound)

### Supported formats

| Format | Reader | Notes |
|---|---|---|
| `.md`, `.markdown`, `.txt` | Node.js `readFile` UTF-8 | Primary format. Headings structure the extraction. |
| `.json` | `JSON.parse` + re-stringify | Normalized to pretty-printed JSON text |
| `.docx` | `mammoth` raw text | Heading structure preserved as plain text |
| `.doc` | macOS `textutil -convert txt` | macOS only; requires system `textutil` |
| `.pdf` | `pdf-parse` buffer | Text layer only; scanned PDFs are not supported |
| `.xlsx`, `.xls` | `xlsx` → sheet_to_json → Markdown table | Each sheet becomes a `## Sheet: <name>` section |
| `.csv`, `.tsv` | `xlsx` | Single sheet; rendered as Markdown table |

### File discovery

- All files matching supported extensions are discovered recursively under `specDir` using `fast-glob`.
- Files are sorted by `relativePath` (alphabetical) before processing.
- There is no filename or path convention required — all supported files in the directory are processed.

### Pre-processing invariants

All content is:
1. Line-ending normalized to `\n`
2. Tabs converted to two spaces
3. Trailing whitespace stripped per line
4. Line-numbered (`L1: text`)

These invariants must be preserved. The line numbers are used as evidence references throughout the system.

---

## 2. LLM integration (outbound)

### Endpoint

`POST ${OPENAI_BASE_URL}/chat/completions`

Default: `https://api.openai.com/v1/chat/completions`

Override with: `OPENAI_BASE_URL` environment variable. Trailing slash is stripped.

### Request contract

```json
{
  "model": "<OPENAI_MODEL | gpt-4.1-mini>",
  "temperature": 0.1,
  "messages": [
    {
      "role": "system",
      "content": "Follow the provided prompt contract exactly. Return only the final markdown artifact requested."
    },
    {
      "role": "user",
      "content": "<composed analysis prompt>"
    }
  ]
}
```

### Response contract

The tool reads `choices[0].message.content`. If this field is missing or empty, the call throws an error.

The response is expected to be a **Markdown string only** — no JSON wrapper, no code fences wrapping the entire response, no preamble.

### Error handling

- HTTP errors throw `Error: LLM request failed (${status}): ${body}`.
- Missing content throws `Error: LLM response did not include markdown content.`
- No retry logic is implemented at the adapter level. Retries are the caller's responsibility.

---

## 3. Mermaid diagram output (outbound)

### Compatibility target

Mermaid v10+. The `%%{init: ...}%%` block at the top of every diagram uses the `base` theme with fully overridden `themeVariables` and `themeCSS`. Renderers that do not support `%%{init}%%` will lose styling but the structure remains valid.

### Diagram types produced

| Diagram | Syntax | Location |
|---|---|---|
| Flowchart (happy path) | `flowchart TD` | Section 5 of Mermaid pack |
| State diagram | `stateDiagram-v2` | Section 5b of Mermaid pack |
| Swimlane (actor lanes) | `flowchart LR` with subgraphs | Section 6 of Mermaid pack |

### Label escaping

All node labels are passed through `escapeMermaidLabel()` which:
- Replaces `"` with `'`
- Trims whitespace
- Falls back to `"Unknown / needs confirmation"` if the result is empty

### Icon token format

Semantic icons follow the `domain.object.state` token pattern:

- `domain`: one of the 15 resolved domains (`commerce`, `finance`, `identity`, etc.)
- `object`: resolved business object (`payment`, `order`, `user`, `ticket`, etc.)
- `state`: lifecycle state (`submitted`, `approved`, `rejected`, `completed`, etc.)

Physical SVG files are resolved at `assets/mermaid-icons/library/<domain>/<token>.svg`. If a physical file does not exist for a token, the fallback export icon is used.

---

## 4. Output file format conventions

All primary artifact files follow this convention:

```
MODE=technical

# <Title>

## <Section>

...
```

The `MODE=technical` header on line 1 is a **machine-readable mode marker**. Consumers that parse artifact files should use this to detect business-flow tool output. Do not remove or modify this line.

All output files are UTF-8 encoded with LF line endings.

---

## 5. Debug artifact formats

| File | Format | Consumer |
|---|---|---|
| `debug/validation.json` | `ValidationResult` JSON | Automated QC checks, CI gate |
| `debug/permissions.json` | `PermissionMatrix` JSON | Security review, access control audit |
| `debug/risk.json` | `RiskScore` JSON | Risk dashboard, escalation triggers |
| `debug/scenario-seeds.md` | Markdown table | Test planning tools |
| `debug/run-summary.json` | `RunResult` JSON | Orchestrators, audit trails |
| `debug/analysis.prompt.md` | Plaintext Markdown | LLM passthrough, manual review |
| `debug/mermaid.prompt.md` | Plaintext Markdown | LLM passthrough, Mermaid generation |

All JSON artifacts are pretty-printed (2-space indent).

---

## 6. CLI output

`runPipeline()` returns a `RunResult` JSON object. The CLI prints this to `stdout` as pretty-printed JSON. Callers that wrap the CLI should parse stdout as JSON.

Exit code:
- `0` — success
- `1` — any error thrown by the pipeline

---

## 7. CI integration

The tool is self-contained. To run in CI:

```yaml
- name: Install dependencies
  run: pnpm install

- name: Run business flow analysis
  run: pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic

- name: Assert validation score
  run: |
    score=$(jq '.score' business-flow/<slug>/debug/validation.json)
    if [ "$score" -lt 70 ]; then echo "Validation score below threshold: $score"; exit 1; fi
```

The `validation.json` score field is a 0–100 integer. A score below 70 indicates material analysis quality issues.

---

## 8. Gitignore contract

The following paths must be excluded from version control:

```gitignore
specs/
business-flow/
```

These paths are local-only. The tool does not manage git operations and does not check whether these paths are tracked. It is the operator's responsibility to enforce this via `.gitignore`.
