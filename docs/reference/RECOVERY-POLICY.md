# RECOVERY-POLICY.md — Failure Handling and Recovery

This document defines how to handle failed runs, partial outputs, corrupted artifacts, and common error conditions.

---

## 1. Failure categories

| Category | Description |
|---|---|
| No spec files found | `specDir` exists but contains no supported files |
| File read failure | A spec file cannot be read (format, permissions, encoding) |
| LLM API failure | Network error or non-200 response from OpenAI |
| LLM empty response | API responded 200 but `choices[0].message.content` is missing or blank |
| Analysis quality failure | Pipeline ran but validation score is below acceptable threshold |
| Partial output | Some artifacts written but pipeline exited mid-run |

---

## 2. No spec files found

**Symptom:** Pipeline throws `Error: No supported spec files found in <path>`.

**Recovery:**
1. Verify `--spec-dir` points to the correct directory.
2. Run `pnpm run tool -- doctor` to confirm supported extensions.
3. Ensure at least one file with a supported extension (`.md`, `.docx`, `.xlsx`, `.pdf`, `.json`, `.csv`, `.txt`) exists anywhere under `specDir`.
4. If the directory is correct but empty, add a minimal spec file and re-run.

---

## 3. File read failure

**Symptom:** `extractSource()` throws for a specific file.

**Recovery by file type:**

| Extension | Common cause | Fix |
|---|---|---|
| `.doc` | Not running on macOS | Move to macOS or convert to `.docx` first |
| `.pdf` | Scanned PDF (no text layer) | Export to `.txt` or `.md` manually |
| `.xlsx` | Encrypted or password-protected | Remove protection and save again |
| `.json` | Invalid JSON syntax | Validate and fix the JSON |

If one file fails, the entire pipeline fails. Exclude the problematic file temporarily by moving it out of `specDir`, or fix the file before re-running.

---

## 4. LLM API failure

**Symptom:** `Error: LLM request failed (${status}): ${body}`

**Recovery:**
1. Verify `OPENAI_API_KEY` is set and valid.
2. Check the error body — `401` is an auth failure, `429` is rate-limit, `5xx` is a server issue.
3. Run with `--mode heuristic` as a fallback to get a complete artifact pack without the LLM.
4. Retry the LLM run once the API issue is resolved.

**For rate limits:** Wait and retry. The tool does not implement automatic retry — the caller is responsible.

---

## 5. LLM empty response

**Symptom:** `Error: LLM response did not include markdown content.`

**Recovery:**
1. Inspect `debug/analysis.prompt.md` to ensure the prompt is well-formed and within token limits.
2. If the normalized corpus is very large, the token limit may be exceeded. Use `--mode dry-run` to inspect the prompt size before re-running.
3. Try a larger context model (e.g., `gpt-4o` with 128k context) via `OPENAI_MODEL`.
4. As an immediate fallback, run `--mode heuristic`.

---

## 6. Analysis quality failure (low validation score)

**Symptom:** `debug/validation.json` shows `score < 70` or multiple `fail` checks.

**Approach:** Investigate the failing checks and address the root cause in the spec.

### Common fail conditions and fixes

| Check | Fail condition | Fix |
|---|---|---|
| Goal is defined | Goal extracted as "Unknown" | Add a `## Goal` heading with one clear sentence |
| Actors are defined | No actors found | Add an `## Actors` section listing roles |
| Steps are present | Zero steps extracted | Add a `## Steps` or numbered list to the spec |
| Every step has evidence | Steps from untraced lines | Add line-numbered content to the spec |
| Async has callback | Async events with no callback | Document the callback or recovery path in the spec |
| State machine consistent | States with no transitions | Add lifecycle status descriptions to the spec |

**For WARN checks:** These indicate partial information. They do not block the artifact but should be resolved before the artifact is treated as review-ready.

---

## 7. Partial output (pipeline exited mid-run)

**Symptom:** Some files exist under `business-flow/<slug>/` but the run did not complete.

**Recovery:**
1. Delete the entire `business-flow/<slug>/` directory:
   ```bash
   rm -rf business-flow/<slug>/
   ```
2. Re-run the full pipeline.

Do not attempt to patch partial outputs manually — the pipeline regenerates all artifacts atomically from the source and they are not intended to be edited in place.

---

## 8. Stale artifacts after spec changes

**Symptom:** The spec files changed but the analysis document still reflects the old version.

**Recovery:** Re-run the pipeline. There is no cache or staleness detection — the pipeline always regenerates from source.

```bash
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
```

---

## 9. Dry-run as a diagnostic tool

Before a full run, use `--mode dry-run` to:
- Verify all spec files are discovered correctly.
- Inspect the normalized corpus for unexpected content.
- Review the analysis prompt before sending it to an LLM.

```bash
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode dry-run
cat business-flow/<slug>/debug/analysis.prompt.md
```

---

## 10. Validation score thresholds

| Score range | Level | Recommended action |
|---|---|---|
| 90–100 | Excellent | Artifact is review-ready |
| 70–89 | Good | Review WARN items; artifact is usable |
| 50–69 | Marginal | Address FAIL items before using artifact |
| 0–49 | Poor | Spec is likely too sparse; enrich spec and re-run |

---

## 11. Recovering a broken LLM analysis document

If an LLM-generated analysis document is malformed (e.g., missing sections, wrong structure):

1. Run the heuristic pipeline to regenerate a clean baseline:
   ```bash
   pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic
   ```
2. Use the heuristic output as the foundation.
3. Manually apply LLM-sourced enrichments where the heuristic output is incomplete.

The heuristic output is always structurally valid and complete across all 19 sections. It is the safest recovery baseline.
