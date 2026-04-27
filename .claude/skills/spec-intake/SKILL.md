# Spec Intake Skill

## Use this skill when

- the task starts from raw files in `specs/<project>/`
- the user asks what the source corpus contains
- extraction quality depends on understanding file types, headings, or spreadsheet structure

## Goal

Create a trustworthy, numbered corpus from the input before any business-flow interpretation begins.

## Workflow

1. Identify the spec root directory: `specs/<project-name>/`
2. List every file and confirm each is a supported type (see below).
3. Extract text from each file — use numbered lines with relative path prefix.
4. Concatenate into the normalized corpus → write to `01-source/normalized-spec.md`.
5. Note empty, malformed, or unsupported inputs without inventing replacements.
6. Preserve relative file paths — traceability depends on them.

## Supported file types

Handled by `src/core/extractors.ts`:
- `.md`, `.markdown`, `.txt` — plain text/Markdown
- `.doc`, `.docx` — Word documents (via mammoth)
- `.pdf` — PDF (via pdf-parse)
- `.xlsx`, `.xls`, `.csv`, `.tsv` — spreadsheets (via xlsx)
- `.json` — structured data

## Domain signal from intake

During intake, note keywords that indicate business domain:
- **finance/commerce**: payment, charge, invoice, refund, cart, checkout, order
- **identity**: login, token, session, MFA, OAuth, role, permission, SSO
- **fulfillment**: shipment, delivery, inventory, carrier, dispatch, warehouse
- **content/cms**: publish, draft, article, document, version, review, approval

Record the likely domain early — it is needed for gap checks and risk scoring in the analysis phase.

## Runtime handoff

- Normalized corpus → `01-source/normalized-spec.md`
- The normalized corpus is the input to Prompt 01 (analysis extraction)
- Prompts in `.github/prompts/` are the source of truth for LLM instructions
