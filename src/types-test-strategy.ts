// ─── Test Strategy Types ──────────────────────────────────────────────────────

export type TestType = "e2e" | "integration" | "unit" | "regression" | "negative";
export type TestPriority = "critical" | "high" | "medium" | "low";

export interface TestCase {
    id: string; // TC-<FLOW-LETTER><nn>-<type>  e.g. TC-A01-e2e
    type: TestType;
    flow: string;
    precondition: string;
    steps: string[];
    expectedResult: string;
    evidence: string; // [source-file.md L45]
    priority: TestPriority;
}

export interface TestScopeEntry {
    area: string;
    inScope: boolean;
    rationale: string;
    evidence: string;
}

export interface CoverageGap {
    id: string; // GAP-nn
    description: string;
    evidence: string;
    suggestedTestType: TestType;
    priority: TestPriority;
}

export interface AcceptanceCriteria {
    id: string;
    feature: string;
    criterion: string;
    testCaseIds: string[];
    evidence: string;
}

export interface RegressionItem {
    id: string;
    description: string;
    affectedArea: string;
    evidence: string;
    testCaseId?: string;
}

export interface TestDataRequirement {
    id: string;
    description: string;
    relatedTestCases: string[];
    notes: string;
}

export interface TestEnvironmentRequirement {
    category: string; // e.g. "Hardware", "Software", "Network", "Data"
    requirement: string;
    notes: string;
}

export interface TestRiskItem {
    id: string;
    area: string;
    description: string;
    score: number; // 0–100
    level: "low" | "medium" | "high" | "critical";
    evidence: string;
}

export interface TestStrategyArtifact {
    slug: string;
    topic: string;
    goal: string;
    domain: string;
    sourceFiles: string[];
    testCases: TestCase[];
    scopeEntries: TestScopeEntry[];
    coverageGaps: CoverageGap[];
    acceptanceCriteria: AcceptanceCriteria[];
    regressionItems: RegressionItem[];
    testDataRequirements: TestDataRequirement[];
    environmentRequirements: TestEnvironmentRequirement[];
    risks: TestRiskItem[];
    assumptions: string[];
    questions: string[];
    contradictions: string[];
}

export interface TestStrategyRunOptions {
    specDir: string;
    slug?: string;
    outputRoot?: string;
    mode: import("./types.js").RunMode;
}

export interface TestStrategyRunResult {
    slug: string;
    mode: string;
    processedFiles: string[];
    outputRoot: string;
    normalizedCorpusPath: string;
    strategyPath?: string;
    debugDir: string;
}
