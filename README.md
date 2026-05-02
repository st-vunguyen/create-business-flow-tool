# Business Flow Tool

> Turn fragmented specifications into a traceable, evidence-backed **19-section business-flow document** plus **Mermaid diagram pack** — in one command.

A spec-first QC and analysis platform. Drop your raw specs into a folder, run one command, and get a clean review-ready artifact pack you can hand to product, engineering, or QA.

---

## Why this tool

Real-world requirements rarely arrive as one clean PRD. They spread across PRDs, meeting notes, spreadsheets, API contracts, PDFs, and Word files. This tool reads all of that and answers, in a single consistent pack:

- What starts the flow? Who does what? What decisions and exception paths exist?
- What states, permissions, async events, and external dependencies are involved?
- Where are the gaps, risks, contradictions, and data-contract assumptions?

Every claim is traceable back to a numbered line in the source corpus. Nothing is invented.

---

## How it works (3 steps)

```text
specs/<project>/        →   business-flow/<slug>/
(your raw files)            01-source/      ← numbered evidence corpus
                            02-analysis/    ← 19-section business-flow document
                            03-mermaid/     ← flowchart + swimlane + state diagram
                            debug/          ← validation, risk, permissions, prompts
```

1. Drop spec files (any mix of `.md`, `.docx`, `.pdf`, `.xlsx`, `.csv`, `.json`, …) into `specs/<project>/`.
2. Run the pipeline.
3. Review the artifact pack under `business-flow/<slug>/`.

---

## Install

Requires **Node.js ≥ 18** and **pnpm ≥ 10**.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run doctor       # confirm runtime is ready
```

`dist/` is rebuilt automatically by the `prepare` script during install — nothing else to do.

---

## Quick start

```bash
# 1. Place your spec files anywhere under specs/<project>/
# 2. Run the heuristic pipeline (deterministic, no API key required)
pnpm run tool -- run --spec-dir specs/<project> --slug my-project --mode heuristic

# 3. Review the generated artifacts
open business-flow/my-project/02-analysis/business-flow-document.md
open business-flow/my-project/03-mermaid/business-flow-mermaid.md
```

> Working with `Copilot Chat` or `Claude`? Just say:
> *"Run the full business-flow pipeline for `specs/<project>` and produce the final artifact pack under `business-flow/<slug>/`."*
> The assistant will handle the run, enrichment, and verification.

---

## Commands

| Command | Description |
|---|---|
| `pnpm run tool -- run --spec-dir <path> --slug <slug> --mode heuristic` | Deterministic local pipeline (recommended) |
| `pnpm run tool -- run ... --mode auto` | Use LLM if `OPENAI_API_KEY` is set, else heuristic |
| `pnpm run tool -- run ... --mode dry-run` | Write analysis prompt only, no artifacts |
| `pnpm run tool -- run ... --per-flow` | Generate per-sub-flow output in `04-per-flow/` |
| `pnpm run tool -- run ... --no-swimlane` | Skip swimlane diagram |
| `pnpm run tool -- doctor` | Show runtime capability summary |
| `pnpm run lint` | TypeScript type check |
| `pnpm run build` | Compile to `dist/` |
| `pnpm run test` | Run end-to-end smoke test |

---

## Output: the 19-section analysis document

Every run produces `02-analysis/business-flow-document.md` with these sections:

| # | Section | What it captures |
|---|---|---|
| 0 | Scope | Topic, goal, domain, in/out of scope |
| 1 | Source | Source files and corpus anchor |
| 2 | Business Flow Summary | Goal, actors, trigger, outcomes, touchpoints |
| 3 | Business Flow Table | One row per business step |
| 4 | Narrative Flow | Numbered prose restatement |
| 5 | Decisions and Exceptions | All branches and exception paths |
| 6 | Traceability | Each row → source file + line |
| 7 | Questions | Missing information for stakeholders |
| 8 | Assumptions | Minimal labeled assumptions |
| 9 | Gap Taxonomy | Typed gaps grouped by category |
| 10 | State Machine | States, transitions, state diagram |
| 11 | Permissions | Role-action-access matrix, conflicts, gaps |
| 12 | Async Events | Events table + external dependencies |
| 13 | Risk Hotspots | Weighted score 0–100, level, hotspot list |
| 14 | Scenario Seeds | happy-path / edge-case / abuse / regression |
| 15 | Contradictions | Conflicting rules + cross-flow impacts |
| 16 | Validation Report | Structured pass/warn/fail checks |
| 17 | Checklist | Final artifact checklist |
| 18 | Data Contracts | JSON/data formats from code blocks |
| 19 | Implementation Constraints | NEVER / ALWAYS / WARNING rules |

---

## Supported input formats

| Format | Extensions |
|---|---|
| Markdown | `.md`, `.markdown` |
| Plain text | `.txt` |
| Word | `.docx`, `.doc` (`.doc` requires macOS `textutil`) |
| PDF | `.pdf` |
| Spreadsheet | `.xlsx`, `.xls`, `.csv`, `.tsv` |
| JSON | `.json` |

---

## Execution modes

| Mode | Behavior |
|---|---|
| `heuristic` | Fully deterministic. Uses regex, pattern matching, and domain packs. **Recommended default.** |
| `llm` | Uses an OpenAI-compatible API to enrich analysis. Requires `OPENAI_API_KEY`. |
| `auto` | Picks `llm` if `OPENAI_API_KEY` is set, otherwise `heuristic`. |
| `dry-run` | Writes the analysis prompt only; no analysis document. |

Optional LLM environment:

```bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4.1-mini       # optional
export OPENAI_BASE_URL=https://...     # optional
```

---

## Repository layout

```text
.
├── README.md            ← you are here
├── AGENTS.md            ← canonical instructions for AI agents
├── CLAUDE.md            ← Claude-specific operating rules
├── CONTRIBUTING.md      ← contributor guide
├── package.json
├── tsconfig.json
│
├── src/                 ← CLI + pipeline
│   ├── cli.ts
│   ├── pipeline.ts
│   ├── types.ts
│   └── core/            ← extractors, heuristics, renderers, validator, risk, …
│
├── .github/prompts/     ← versioned prompt contracts
├── .claude/             ← repo-local rules, skills, agents
├── assets/mermaid-icons ← semantic SVG icon library
├── tests/               ← end-to-end smoke test + fixtures
├── tools/               ← icon-library generator
├── docs/                ← all reference documentation (see docs/README.md)
│
├── specs/               ← LOCAL ONLY — your input specs (gitignored)
└── business-flow/       ← LOCAL ONLY — generated artifacts (gitignored)
```

`specs/` and `business-flow/` are deliberately gitignored — they hold your private input and generated output.

---

## Documentation

The full documentation lives in [`docs/`](docs/). Start with [`docs/README.md`](docs/README.md).

| If you want to… | Read |
|---|---|
| Understand the product | [`docs/requirements/PRODUCT_REQUIREMENT_DOCUMENT.md`](docs/requirements/PRODUCT_REQUIREMENT_DOCUMENT.md) |
| Understand the architecture | [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) |
| Use the tool day-to-day | [`docs/UNIVERSAL_USAGE_GUIDELINES.md`](docs/UNIVERSAL_USAGE_GUIDELINES.md) |
| Follow workflows | [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) |
| See the runtime lifecycle | [`docs/reference/EXECUTION-LIFECYCLE.md`](docs/reference/EXECUTION-LIFECYCLE.md) |
| Learn the type contracts | [`docs/reference/CONTRACTS.md`](docs/reference/CONTRACTS.md) |
| Learn validation rules | [`docs/reference/VALIDATION-GOVERNANCE.md`](docs/reference/VALIDATION-GOVERNANCE.md) |
| Contribute | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| See the roadmap | [`docs/ROADMAP.md`](docs/ROADMAP.md) |

---

## Local-only data

- `specs/` — your input only. Never push.
- `business-flow/` — your generated output. Never push.

Both are enforced in `.gitignore`.

---

## License

Internal tool. See repository owner for licensing details.
