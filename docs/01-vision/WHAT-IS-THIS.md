# What Is This?

## The problem

When teams build software, they accumulate specs: requirements documents, feature breakdowns, business rules, UI descriptions, API contracts. These specs are written by different people at different times, in different formats.

By the time a developer, QA engineer, or stakeholder needs to understand "what does this system actually do?", the answer is scattered across 10 files, inconsistent, and partially obsolete.

**The result:** wasted review cycles, missed edge cases, undocumented exceptions, and test strategies that don't match what was actually specified.

---

## What this tool does

This tool is a **spec-first analysis platform**. It reads your fragmented spec files and produces:

### 1. Business Flow Analysis (`pnpm run tool -- run`)
A 19-section evidence-backed document that captures:
- Every actor, step, decision, and outcome in the flow
- State machine, permissions matrix, async events
- Risk scores, scenario seeds, contradiction register
- Full traceability from every claim back to a source line

### 2. Test Strategy (`pnpm run tool -- test-strategy`)
A 16-section test strategy document that captures:
- Test case catalog (with TC IDs, types, evidence)
- Coverage gaps (behaviors in spec with no test case)
- Acceptance criteria, regression inventory
- Test data requirements, risk assessment

Both pipelines share one core rule: **they never invent facts**. Every actor, step, decision, and test case must trace to a line in the spec.

---

## Who is this for?

| Role | Use case |
|---|---|
| Business analyst | Review extracted flow before dev starts |
| QA engineer | Get a test strategy grounded in the spec |
| Developer | Understand the full flow including edge cases |
| Tech lead | Identify spec gaps before implementation |
| Product manager | Confirm the spec says what it should say |

---

## What this tool is NOT

- It is not a code generator
- It is not a test runner
- It is not a documentation generator that invents content
- It is not a spec authoring tool

It is a **spec analysis and quality control tool**.

---

## Output examples

After running the business-flow pipeline on a spec directory:

```
business-flow/<slug>/
├── 01-source/normalized-spec.md      ← numbered corpus
├── 02-analysis/business-flow-document.md  ← 19-section analysis
├── 03-mermaid/business-flow-mermaid.md    ← flowchart + swimlane + state
└── debug/                                 ← validation, risks, scenarios
```

After running the test-strategy pipeline:

```
test-strategy/<slug>/
├── 01-source/normalized-spec.md      ← same numbered corpus
├── 02-strategy/test-strategy-document.md  ← 16-section strategy
└── debug/                                 ← test cases, gaps, risks
```
