# Spec Intake Skill

## Use this skill when

- The task starts from raw files in `specs/<project>/`
- The user asks what the source corpus contains
- Both `business-flow` and `test-strategy` pipelines use this as their first step

## Goal

Create a trustworthy, numbered corpus from the input before any interpretation begins.

## Workflow

1. Identify the spec root: `specs/<project-name>/`
2. List every file; confirm each is a supported type
3. Extract text from each file using numbered lines with relative path prefix
4. Concatenate into the normalized corpus → write to `01-source/normalized-spec.md`
5. Note empty, malformed, or unsupported inputs without inventing replacements
6. Preserve relative file paths — traceability depends on them

## Supported file types (via `src/core/extractors.ts`)

- `.md`, `.markdown`, `.txt` — plain text/Markdown
- `.doc`, `.docx` — Word documents (mammoth)
- `.pdf` — PDF (pdf-parse)
- `.xlsx`, `.xls`, `.csv`, `.tsv` — spreadsheets (xlsx)
- `.json` — structured data

## Domain signal from intake

Note keywords that indicate business domain during intake:
- **finance/commerce:** payment, charge, invoice, refund, cart, checkout, order
- **identity:** login, token, session, MFA, OAuth, role, permission, SSO
- **fulfillment:** shipment, delivery, inventory, carrier, dispatch, warehouse
- **content/cms:** publish, draft, article, document, version, review, approval
- **operations:** device, bind, activate, queue, MQ, polling, state, configure

The domain is needed for gap checks and risk scoring in subsequent extraction steps.

## Runtime handoff

- Normalized corpus → `01-source/normalized-spec.md`
- This corpus is the input to both `analysis-extraction` (business-flow) and `test-strategy-extraction`

> **Canonical source:** `skills/spec-intake/SKILL.md`
