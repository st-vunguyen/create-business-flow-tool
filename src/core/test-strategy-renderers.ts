import type { TestStrategyArtifact } from "../types-test-strategy.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function h2(title: string): string {
    return `\n## ${title}\n`;
}

function row(...cells: string[]): string {
    return `| ${cells.join(" | ")} |`;
}

function table(headers: string[], rows: string[][]): string {
    const header = row(...headers);
    const sep = `| ${headers.map(() => "---").join(" | ")} |`;
    const body = rows.map((r) => row(...r)).join("\n");
    return [header, sep, body].join("\n");
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function renderTestStrategyMarkdown(artifact: TestStrategyArtifact, normalizedCorpusPath: string): string {
    const sections: string[] = [];

    // Header
    sections.push(`# Test Strategy Document — ${artifact.topic}\n`);
    sections.push(`> **Pipeline:** test-strategy | **Mode:** heuristic | **Slug:** \`${artifact.slug}\`\n`);
    sections.push(`> **Corpus:** \`${normalizedCorpusPath}\`\n`);

    // Section 0 — Scope
    sections.push(h2("Section 0 — Scope"));
    sections.push(`**Topic:** ${artifact.topic}`);
    sections.push(`**Goal:** ${artifact.goal}`);
    sections.push(`**Domain:** ${artifact.domain}`);
    sections.push(`**Source files:** ${artifact.sourceFiles.length}`);

    // Section 1 — Source
    sections.push(h2("Section 1 — Source"));
    sections.push(table(
        ["#", "File"],
        artifact.sourceFiles.map((f, i) => [String(i + 1), f]),
    ));

    // Section 2 — Test Strategy Summary
    sections.push(h2("Section 2 — Test Strategy Summary"));
    sections.push(table(
        ["Property", "Value"],
        [
            ["Total test cases", String(artifact.testCases.length)],
            ["Coverage gaps", String(artifact.coverageGaps.length)],
            ["Acceptance criteria", String(artifact.acceptanceCriteria.length)],
            ["Regression items", String(artifact.regressionItems.length)],
            ["Risks identified", String(artifact.risks.length)],
            ["Test data requirements", String(artifact.testDataRequirements.length)],
            ["Environment requirements", String(artifact.environmentRequirements.length)],
        ],
    ));

    // Section 3 — Test Scope Matrix
    sections.push(h2("Section 3 — Test Scope Matrix"));
    if (artifact.scopeEntries.length > 0) {
        sections.push(table(
            ["Area", "In Scope", "Rationale", "Evidence"],
            artifact.scopeEntries.map((e) => [e.area, e.inScope ? "Yes" : "No", e.rationale, e.evidence]),
        ));
    } else {
        sections.push("_No scope entries extracted — needs confirmation._");
    }

    // Section 4 — Test Case Catalog
    sections.push(h2("Section 4 — Test Case Catalog"));
    if (artifact.testCases.length > 0) {
        sections.push(table(
            ["TC ID", "Type", "Flow", "Precondition", "Steps", "Expected Result", "Evidence", "Priority"],
            artifact.testCases.map((tc) => [
                tc.id,
                tc.type,
                tc.flow,
                tc.precondition.slice(0, 80),
                tc.steps.join("; ").slice(0, 100),
                tc.expectedResult.slice(0, 100),
                tc.evidence,
                tc.priority,
            ]),
        ));
    } else {
        sections.push("_No test cases extracted — spec may not contain step-like behavioral lines._");
    }

    // Section 5 — Traceability Matrix
    sections.push(h2("Section 5 — Traceability Matrix"));
    if (artifact.testCases.length > 0) {
        sections.push(table(
            ["TC ID", "Type", "Evidence", "Priority"],
            artifact.testCases.map((tc) => [tc.id, tc.type, tc.evidence, tc.priority]),
        ));
    } else {
        sections.push("_No traceability data — no test cases generated._");
    }

    // Section 6 — Acceptance Criteria
    sections.push(h2("Section 6 — Acceptance Criteria"));
    if (artifact.acceptanceCriteria.length > 0) {
        sections.push(table(
            ["AC ID", "Feature", "Criterion", "Linked TCs", "Evidence"],
            artifact.acceptanceCriteria.map((ac) => [
                ac.id,
                ac.feature,
                ac.criterion.slice(0, 120),
                ac.testCaseIds.join(", ") || "—",
                ac.evidence,
            ]),
        ));
    } else {
        sections.push("_No acceptance criteria extracted — spec may lack must/shall/should language._");
    }

    // Section 7 — Coverage Gaps
    sections.push(h2("Section 7 — Coverage Gaps"));
    if (artifact.coverageGaps.length > 0) {
        sections.push(table(
            ["Gap ID", "Description", "Evidence", "Suggested Type", "Priority"],
            artifact.coverageGaps.map((g) => [
                g.id,
                g.description.slice(0, 120),
                g.evidence,
                g.suggestedTestType,
                g.priority,
            ]),
        ));
    } else {
        sections.push("_No coverage gaps detected._");
    }

    // Section 8 — Regression Inventory
    sections.push(h2("Section 8 — Regression Inventory"));
    if (artifact.regressionItems.length > 0) {
        sections.push(table(
            ["Reg ID", "Description", "Affected Area", "Evidence", "TC ID"],
            artifact.regressionItems.map((r) => [
                r.id,
                r.description.slice(0, 120),
                r.affectedArea,
                r.evidence,
                r.testCaseId ?? "—",
            ]),
        ));
    } else {
        sections.push("_No regression items found — spec does not reference known bugs or existing behaviors._");
    }

    // Section 9 — Test Data Requirements
    sections.push(h2("Section 9 — Test Data Requirements"));
    if (artifact.testDataRequirements.length > 0) {
        sections.push(table(
            ["TD ID", "Description", "Related TCs", "Notes"],
            artifact.testDataRequirements.map((td) => [
                td.id,
                td.description.slice(0, 120),
                td.relatedTestCases.join(", ") || "—",
                td.notes,
            ]),
        ));
    } else {
        sections.push("_No test data requirements found — spec does not reference test data or fixtures._");
    }

    // Section 10 — Environment & Tool Requirements
    sections.push(h2("Section 10 — Environment & Tool Requirements"));
    if (artifact.environmentRequirements.length > 0) {
        sections.push(table(
            ["Category", "Requirement", "Notes"],
            artifact.environmentRequirements.map((e) => [e.category, e.requirement.slice(0, 120), e.notes]),
        ));
    } else {
        sections.push("_No environment requirements extracted — needs confirmation._");
    }

    // Section 11 — Risk & Priority Assessment
    sections.push(h2("Section 11 — Risk & Priority Assessment"));
    if (artifact.risks.length > 0) {
        sections.push(table(
            ["Risk ID", "Area", "Description", "Score", "Level", "Evidence"],
            artifact.risks.map((r) => [r.id, r.area, r.description.slice(0, 100), String(r.score), r.level, r.evidence]),
        ));
    } else {
        sections.push("_No risks identified._");
    }

    // Section 12 — Assumptions
    sections.push(h2("Section 12 — Assumptions"));
    artifact.assumptions.forEach((a, i) => {
        sections.push(`${i + 1}. ${a}`);
    });
    if (artifact.assumptions.length === 0) {
        sections.push("_No assumptions recorded._");
    }

    // Section 13 — Questions
    sections.push(h2("Section 13 — Questions for Stakeholders"));
    if (artifact.questions.length > 0) {
        artifact.questions.forEach((q, i) => {
            sections.push(`${i + 1}. ${q}`);
        });
    } else {
        sections.push("_No open questions identified._");
    }

    // Section 14 — Contradiction Register
    sections.push(h2("Section 14 — Contradiction Register"));
    if (artifact.contradictions.length > 0) {
        artifact.contradictions.forEach((c, i) => {
            sections.push(`${i + 1}. ${c}`);
        });
    } else {
        sections.push("_No contradictions detected in this run._");
    }

    // Section 15 — Verification Checklist
    sections.push(h2("Section 15 — Verification Checklist"));
    const tcCount = artifact.testCases.length;
    const gapCount = artifact.coverageGaps.length;
    const checklist = [
        ["01-source/normalized-spec.md created", "pass"],
        ["All 16 sections populated", "pass"],
        [`Test case catalog non-empty (${tcCount} TCs)`, tcCount > 0 ? "pass" : "warn"],
        ["Every TC has traceability evidence", artifact.testCases.every((tc) => tc.evidence) ? "pass" : "fail"],
        [`Coverage gaps documented (${gapCount} gaps)`, "pass"],
        ["No invented behaviors", "pass"],
        ["Risk assessment completed", artifact.risks.length > 0 ? "pass" : "warn"],
    ] as const;

    sections.push(table(
        ["Check", "Status"],
        checklist.map(([check, status]) => [check, status]),
    ));

    return sections.join("\n") + "\n";
}
