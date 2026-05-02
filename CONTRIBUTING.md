# CONTRIBUTING.md — How to Contribute

This document covers how to set up a development environment, run tests, add new analysis capabilities, and follow the repository conventions.

---

## 1. Setup

**Requirements:**

- Node.js ≥ 18
- pnpm ≥ 10

```bash
git clone <repo>
cd create-business-flow-tool
pnpm install
```

**Verify the build:**

```bash
pnpm run lint       # TypeScript type check, no emit
pnpm run build      # Compile to dist/
pnpm run test       # End-to-end smoke test
pnpm run doctor     # Runtime capability check
```

---

## 2. Development workflow

```bash
# Run the tool directly against TypeScript source (no build needed)
pnpm run tool -- run --spec-dir specs/<project> --slug <slug> --mode heuristic

# After changes, verify types still compile
pnpm run lint

# After changes, verify the smoke test still passes
pnpm run test
```

No hot-reload or watch mode is configured. The `tsx` runtime executes TypeScript source directly so there is no compile step during development.

---

## 3. File conventions

### TypeScript

- All source files live under `src/`.
- All types are defined in `src/types.ts`. Do not define types inline in module files.
- Use `import type` for type-only imports.
- Use `.js` extension in import paths (required for ESM resolution with TypeScript).
- Module type: `"module"` (ESM). No CommonJS `require()`.

### Naming

- File names: `kebab-case.ts`
- Functions: `camelCase`
- Types and interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Comments

- Use JSDoc `/** ... */` only for exported public functions.
- Use `//` for inline implementation notes.
- Do not add decorative separators inside function bodies.

---

## 4. Adding a new extraction engine

To add a new analysis capability (e.g., a new section or detector):

1. **Define the type** in `src/types.ts`. Export from `src/index.ts` if needed.
2. **Create the engine** in `src/core/<engine-name>.ts`. Export one public function.
3. **Wire into `buildHeuristicAnalysis()`** in `src/core/heuristics.ts`:
   - Call your function and assign its output to the enriched artifact.
   - Add the field to the final `return` object.
4. **Add a renderer** in `src/core/renderers.ts`:
   - Add `render<YourSection>Section(analysis: AnalysisArtifact): string[]`.
   - Append it to `renderAnalysisMarkdown()` under the correct section number.
5. **Update `docs/reference/CONTRACTS.md`** to document the new interface fields.
6. **Update prompt 01** (`.github/prompts/01-analyze-spec-to-business-flow-documents.prompt.md`) to include the new section in the required output structure.
7. **Add a test assertion** in `tests/pipeline.test.ts` to verify the section appears in the output.

---

## 5. Adding a new domain pack

Domain packs live in `src/core/domain-packs.ts`.

1. Add a new `DomainPackName` union value.
2. Add a new entry to the `PACKS` object with:
   - `knownFailurePatterns`: common failure scenarios in this domain.
   - `knownBusinessRules`: rules agents should enforce.
   - `riskKeywords`: keywords that trigger domain recognition.
   - `requiredGapChecks`: typed `GapItem[]` entries to inject when the domain is detected.
3. Update `resolveBusinessDomain()` in `src/core/heuristics.ts` if new keyword patterns are needed.

---

## 6. Updating the Mermaid visual standard

The visual standard is defined in two places:

- **Constants**: `src/core/mermaid-style.ts` — `MERMAID_INIT_BLOCK`, `MERMAID_CLASS_DEFINITIONS`, `MERMAID_SWIMLANE_PALETTE`, `MERMAID_VISUAL_STANDARD_LINES`
- **Documentation**: `docs/icons/mermaid-visual-standard.md`

Both must be kept in sync. Changes to the palette, CSS, or style rules go in `mermaid-style.ts`. Narrative guidance and usage rules go in `mermaid-visual-standard.md`.

---

## 7. Running tests

```bash
pnpm run test
```

The test suite uses Node.js's built-in test runner (`node:test`). It runs the full pipeline against `tests/fixtures/specs/sample/` and asserts:

- All expected output paths exist.
- The analysis document contains the required sections.
- Mermaid diagram standard headers are present.
- Validation, permissions, risk, and scenario artifacts are written.
- No obvious content quality regressions.

Test fixtures are in `tests/fixtures/specs/sample/`. To test with a new spec type, add a file to that directory and add the corresponding assertion.

---

## 8. Updating prompt contracts

Prompt files in `.github/prompts/` are source-of-truth assets. When updating:

1. Edit the prompt file.
2. Verify the heuristic renderer in `src/core/renderers.ts` still produces output consistent with the updated spec.
3. If sections change, update the section list in `AGENTS.md` (Section 5).
4. Run `pnpm run test` to confirm smoke test still passes.

---

## 9. What not to change

- Do not modify the output of `renderNormalizedCorpus()` in a way that breaks line numbering — line numbers are used as evidence references throughout the system.
- Do not change the `MODE=technical` header line added to all outputs — it is a machine-readable mode marker.
- Do not commit anything under `specs/` or `business-flow/` — both are gitignored and local-only.
- Do not remove any validation check from `src/core/validator.ts` without updating `docs/reference/VALIDATION-GOVERNANCE.md`.

---

## 10. Pull request checklist

- [ ] `pnpm run lint` passes (no TypeScript errors)
- [ ] `pnpm run test` passes (smoke test green)
- [ ] `docs/reference/CONTRACTS.md` updated if any interface changed
- [ ] Prompt 01 updated if any section was added or removed
- [ ] `AGENTS.md` section table updated if section count changed
- [ ] No `specs/` or `business-flow/` files staged
