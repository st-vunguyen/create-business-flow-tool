import type { ExtractedSource } from "../types.js";
import type {
    AcceptanceCriteria,
    CoverageGap,
    RegressionItem,
    TestCase,
    TestDataRequirement,
    TestEnvironmentRequirement,
    TestPriority,
    TestRiskItem,
    TestScopeEntry,
    TestStrategyArtifact,
    TestType,
} from "../types-test-strategy.js";
import { dedupe, titleCase } from "./utils.js";

// ─── Patterns ─────────────────────────────────────────────────────────────────

const STEP_PATTERN = /^[-*\d.]\s+.{10,}/;
const ACCEPTANCE_PATTERN = /\b(must|shall|should|require|expect|verify|validate|ensure|confirm|assert)\b/i;
const ERROR_PATTERN = /\b(error|fail|failure|invalid|reject|denied|forbidden|timeout|exception|cancel|unavailable)\b/i;
const REGRESSION_PATTERN = /\b(regression|existing behavior|bug|known issue|previously|historical|was broken|was fixed)\b/i;
const ENVIRONMENT_PATTERN = /\b(hardware|device|server|network|database|tool|platform|os|browser|client|firmware|kds|pos|tablet|screen)\b/i;
const DATA_PATTERN = /\b(test data|seed data|fixture|mock|stub|sample|data set|dataset|precondition data)\b/i;
const E2E_PATTERN = /\b(user|operator|staff|admin|customer)\b.{0,40}\b(click|submit|press|scan|select|login|logout|place|confirm)\b/i;
const INTEGRATION_PATTERN = /\b(api|endpoint|route|service|queue|mq|webhook|callback|integration|message|event|pub.?sub)\b/i;
const UNIT_PATTERN = /\b(formula|calculation|rule|logic|condition|function|algorithm|compute|parse|validate)\b/i;

// ─── TC ID helpers ────────────────────────────────────────────────────────────

function makeTcId(flowLetter: string, index: number, type: TestType): string {
    return `TC-${flowLetter}${String(index).padStart(2, "0")}-${type}`;
}

function makeGapId(index: number): string {
    return `GAP-${String(index + 1).padStart(2, "0")}`;
}

function makeAcId(index: number): string {
    return `AC-${String(index + 1).padStart(2, "0")}`;
}

function makeRegressionId(index: number): string {
    return `REG-${String(index + 1).padStart(2, "0")}`;
}

function makeTdId(index: number): string {
    return `TD-${String(index + 1).padStart(2, "0")}`;
}

function makeRiskId(index: number): string {
    return `RISK-${String(index + 1).padStart(2, "0")}`;
}

// ─── Evidence string ─────────────────────────────────────────────────────────

function makeEvidence(source: ExtractedSource, lineNumber: number): string {
    return `[${source.relativePath} L${lineNumber}]`;
}

// ─── Infer test type from a text line ────────────────────────────────────────

function inferTestType(text: string): TestType {
    if (REGRESSION_PATTERN.test(text)) return "regression";
    if (ERROR_PATTERN.test(text)) return "negative";
    if (E2E_PATTERN.test(text)) return "e2e";
    if (INTEGRATION_PATTERN.test(text)) return "integration";
    if (UNIT_PATTERN.test(text)) return "unit";
    return "e2e"; // default — most spec lines describe user-visible flows
}

// ─── Priority heuristic ───────────────────────────────────────────────────────

function inferPriority(text: string): TestPriority {
    const lower = text.toLowerCase();
    if (/\b(must|critical|blocking|mandatory|required|always)\b/.test(lower)) return "critical";
    if (/\b(should|high|important|key|primary)\b/.test(lower)) return "high";
    if (/\b(nice|optional|low|minor|secondary)\b/.test(lower)) return "low";
    return "medium";
}

// ─── Collect step-like lines from all sources ─────────────────────────────────

interface CandidateLine {
    text: string;
    evidence: string;
    source: ExtractedSource;
    lineNumber: number;
}

function collectCandidateLines(sources: ExtractedSource[]): CandidateLine[] {
    const results: CandidateLine[] = [];
    for (const source of sources) {
        for (const line of source.lines) {
            const trimmed = line.text.trim();
            if (trimmed.length < 15) continue;
            if (/^#+\s/.test(trimmed)) continue; // skip headings
            if (/^\|/.test(trimmed)) continue; // skip table rows
            results.push({
                text: trimmed,
                evidence: makeEvidence(source, line.lineNumber),
                source,
                lineNumber: line.lineNumber,
            });
        }
    }
    return results;
}

// ─── Derive flow letter from source file name ────────────────────────────────

function flowLetterFromSource(source: ExtractedSource, index: number): string {
    const base = source.relativePath.replace(/\.\w+$/, "").toUpperCase();
    const match = base.match(/([A-Z])/);
    return match ? match[1] : String.fromCharCode(65 + (index % 26));
}

// ─── Build test cases from step-like lines ────────────────────────────────────

function buildTestCases(sources: ExtractedSource[]): TestCase[] {
    const cases: TestCase[] = [];
    let globalIndex = 1;

    for (let si = 0; si < sources.length; si++) {
        const source = sources[si];
        const flowLetter = flowLetterFromSource(source, si);
        const stepLines = source.lines.filter((line) => STEP_PATTERN.test(line.text.trim()));
        let flowStepIndex = 1;

        for (const line of stepLines) {
            const trimmed = line.text.trim();
            const type = inferTestType(trimmed);
            const priority = inferPriority(trimmed);
            const id = makeTcId(flowLetter, flowStepIndex, type);
            const evidence = makeEvidence(source, line.lineNumber);

            const precondition = ACCEPTANCE_PATTERN.test(trimmed)
                ? `System is in a state where: ${trimmed.split(".")[0]}`
                : "System is in a valid initial state — see spec for details";

            cases.push({
                id,
                type,
                flow: source.title,
                precondition,
                steps: [trimmed],
                expectedResult: ERROR_PATTERN.test(trimmed)
                    ? "System returns appropriate error response per spec"
                    : "System completes the action successfully per spec",
                evidence,
                priority,
            });

            flowStepIndex++;
            globalIndex++;

            if (globalIndex > 200) break; // safety cap
        }
        if (globalIndex > 200) break;
    }

    return cases;
}

// ─── Build scope entries ──────────────────────────────────────────────────────

function buildScopeEntries(sources: ExtractedSource[]): TestScopeEntry[] {
    return sources.slice(0, 20).map((source) => ({
        area: source.title,
        inScope: true,
        rationale: "Spec file provided and readable",
        evidence: `[${source.relativePath} L1]`,
    }));
}

// ─── Build coverage gaps ──────────────────────────────────────────────────────

function buildCoverageGaps(sources: ExtractedSource[], testCases: TestCase[]): CoverageGap[] {
    const coveredEvidence = new Set(testCases.map((tc) => tc.evidence));
    const gaps: CoverageGap[] = [];

    for (const source of sources) {
        for (const line of source.lines) {
            const trimmed = line.text.trim();
            if (trimmed.length < 20) continue;
            const evidence = makeEvidence(source, line.lineNumber);
            if (coveredEvidence.has(evidence)) continue;
            // Only flag lines that look like behavioral requirements not covered by a TC
            if (!ACCEPTANCE_PATTERN.test(trimmed) && !ERROR_PATTERN.test(trimmed)) continue;

            gaps.push({
                id: makeGapId(gaps.length),
                description: trimmed.slice(0, 120),
                evidence,
                suggestedTestType: inferTestType(trimmed),
                priority: inferPriority(trimmed),
            });

            if (gaps.length >= 30) break;
        }
        if (gaps.length >= 30) break;
    }

    return gaps;
}

// ─── Build acceptance criteria ────────────────────────────────────────────────

function buildAcceptanceCriteria(sources: ExtractedSource[], testCases: TestCase[]): AcceptanceCriteria[] {
    const acs: AcceptanceCriteria[] = [];

    for (const source of sources) {
        for (const line of source.lines) {
            const trimmed = line.text.trim();
            if (!ACCEPTANCE_PATTERN.test(trimmed) || trimmed.length < 20) continue;
            const evidence = makeEvidence(source, line.lineNumber);
            const linkedTcs = testCases.filter((tc) => tc.evidence === evidence).map((tc) => tc.id);

            acs.push({
                id: makeAcId(acs.length),
                feature: source.title,
                criterion: trimmed.slice(0, 200),
                testCaseIds: linkedTcs,
                evidence,
            });

            if (acs.length >= 30) break;
        }
        if (acs.length >= 30) break;
    }

    return acs;
}

// ─── Build regression items ───────────────────────────────────────────────────

function buildRegressionItems(sources: ExtractedSource[], testCases: TestCase[]): RegressionItem[] {
    const items: RegressionItem[] = [];

    for (const source of sources) {
        for (const line of source.lines) {
            const trimmed = line.text.trim();
            if (!REGRESSION_PATTERN.test(trimmed)) continue;
            const evidence = makeEvidence(source, line.lineNumber);
            const linkedTc = testCases.find((tc) => tc.type === "regression" && tc.evidence === evidence);

            items.push({
                id: makeRegressionId(items.length),
                description: trimmed.slice(0, 200),
                affectedArea: source.title,
                evidence,
                testCaseId: linkedTc?.id,
            });

            if (items.length >= 20) break;
        }
        if (items.length >= 20) break;
    }

    return items;
}

// ─── Build test data requirements ─────────────────────────────────────────────

function buildTestDataRequirements(sources: ExtractedSource[], testCases: TestCase[]): TestDataRequirement[] {
    const items: TestDataRequirement[] = [];

    for (const source of sources) {
        for (const line of source.lines) {
            const trimmed = line.text.trim();
            if (!DATA_PATTERN.test(trimmed)) continue;
            const evidence = makeEvidence(source, line.lineNumber);
            const relatedTcs = testCases.filter((tc) => tc.evidence === evidence).map((tc) => tc.id);

            items.push({
                id: makeTdId(items.length),
                description: trimmed.slice(0, 200),
                relatedTestCases: relatedTcs,
                notes: "Unknown / needs confirmation — derive from spec context",
            });

            if (items.length >= 15) break;
        }
        if (items.length >= 15) break;
    }

    return items;
}

// ─── Build environment requirements ──────────────────────────────────────────

function buildEnvironmentRequirements(sources: ExtractedSource[]): TestEnvironmentRequirement[] {
    const items: TestEnvironmentRequirement[] = [];
    const seen = new Set<string>();

    for (const source of sources) {
        for (const line of source.lines) {
            const trimmed = line.text.trim();
            if (!ENVIRONMENT_PATTERN.test(trimmed)) continue;
            const match = trimmed.match(ENVIRONMENT_PATTERN);
            if (!match) continue;
            const key = match[0].toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);

            items.push({
                category: titleCase(key),
                requirement: trimmed.slice(0, 150),
                notes: "Unknown / needs confirmation",
            });

            if (items.length >= 10) break;
        }
        if (items.length >= 10) break;
    }

    return items;
}

// ─── Build risks ──────────────────────────────────────────────────────────────

function buildRisks(coverageGaps: CoverageGap[], sources: ExtractedSource[]): TestRiskItem[] {
    const risks: TestRiskItem[] = [];

    // Risk from coverage gaps
    const criticalGaps = coverageGaps.filter((g) => g.priority === "critical" || g.priority === "high");
    if (criticalGaps.length > 0) {
        risks.push({
            id: makeRiskId(0),
            area: "Test Coverage",
            description: `${criticalGaps.length} high/critical behaviors have no test case`,
            score: Math.min(100, criticalGaps.length * 10),
            level: criticalGaps.length >= 5 ? "high" : "medium",
            evidence: criticalGaps[0].evidence,
        });
    }

    // Risk from spec size
    const totalLines = sources.reduce((acc, s) => acc + s.lines.length, 0);
    if (totalLines > 500) {
        risks.push({
            id: makeRiskId(risks.length),
            area: "Spec Complexity",
            description: `Large spec corpus (${totalLines} lines) increases test case maintenance burden`,
            score: Math.min(80, Math.floor(totalLines / 20)),
            level: totalLines > 1000 ? "high" : "medium",
            evidence: `[corpus: ${totalLines} lines across ${sources.length} files]`,
        });
    }

    return risks;
}

// ─── Build questions ──────────────────────────────────────────────────────────

function buildQuestions(coverageGaps: CoverageGap[]): string[] {
    return coverageGaps
        .filter((g) => g.priority === "critical" || g.priority === "high")
        .slice(0, 10)
        .map((g) => `Confirm expected behavior for: "${g.description}" ${g.evidence}`);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildHeuristicTestStrategy(slug: string, sources: ExtractedSource[]): TestStrategyArtifact {
    const topic = titleCase(slug);
    const allLines = collectCandidateLines(sources);
    const goalLine = allLines.find((l) => /\b(goal|objective|purpose|overview|summary)\b/i.test(l.text));
    const goal = goalLine?.text.slice(0, 200) ?? "Unknown / needs confirmation";
    const domain = sources.length > 0 ? (sources[0].relativePath.split("/")[0] ?? "general") : "general";

    const testCases = buildTestCases(sources);
    const scopeEntries = buildScopeEntries(sources);
    const coverageGaps = buildCoverageGaps(sources, testCases);
    const acceptanceCriteria = buildAcceptanceCriteria(sources, testCases);
    const regressionItems = buildRegressionItems(sources, testCases);
    const testDataRequirements = buildTestDataRequirements(sources, testCases);
    const environmentRequirements = buildEnvironmentRequirements(sources);
    const risks = buildRisks(coverageGaps, sources);
    const questions = buildQuestions(coverageGaps);

    const assumptions = [
        "All spec files in 01-source/normalized-spec.md are the authoritative input.",
        "Test types are derived only from explicit spec signals — no inference beyond what is written.",
        "Coverage gaps are areas where spec describes behavior but no test case was generated.",
    ];

    const contradictions: string[] = [];

    return {
        slug,
        topic,
        goal,
        domain,
        sourceFiles: sources.map((s) => s.relativePath),
        testCases,
        scopeEntries,
        coverageGaps,
        acceptanceCriteria,
        regressionItems,
        testDataRequirements,
        environmentRequirements,
        risks,
        assumptions,
        questions,
        contradictions,
    };
}
