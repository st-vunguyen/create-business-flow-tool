import path from "node:path";
import { extractSources } from "./core/extractors.js";
import { renderNormalizedCorpus } from "./core/prompts.js";
import { buildHeuristicTestStrategy } from "./core/test-strategy-heuristics.js";
import { renderTestStrategyMarkdown } from "./core/test-strategy-renderers.js";
import { resolveExecutionMode } from "./core/llm.js";
import { ensureDir, slugify, writeText } from "./core/utils.js";
import type { TestStrategyRunOptions, TestStrategyRunResult } from "./types-test-strategy.js";

export async function runTestStrategyPipeline(
    workspaceRoot: string,
    options: TestStrategyRunOptions,
): Promise<TestStrategyRunResult> {
    const slug = options.slug ? slugify(options.slug) : slugify(path.basename(options.specDir));
    const mode = resolveExecutionMode(options.mode);
    const outputRoot = path.resolve(workspaceRoot, options.outputRoot ?? "test-strategy", slug);
    const sourceDir = path.join(outputRoot, "01-source");
    const strategyDir = path.join(outputRoot, "02-strategy");
    const debugDir = path.join(outputRoot, "debug");

    await Promise.all([ensureDir(sourceDir), ensureDir(strategyDir), ensureDir(debugDir)]);

    const specRoot = path.resolve(workspaceRoot, options.specDir);
    const sources = await extractSources(specRoot);
    const normalizedCorpus = renderNormalizedCorpus(specRoot, sources);
    const normalizedCorpusPath = path.join(sourceDir, "normalized-spec.md");
    await writeText(normalizedCorpusPath, normalizedCorpus);

    let strategyPath: string | undefined;

    if (mode !== "dry-run") {
        const artifact = buildHeuristicTestStrategy(slug, sources);
        const strategyMarkdown = renderTestStrategyMarkdown(artifact, normalizedCorpusPath);
        strategyPath = path.join(strategyDir, "test-strategy-document.md");
        await writeText(strategyPath, strategyMarkdown);

        // Debug artifacts
        await writeText(
            path.join(debugDir, "test-cases.json"),
            JSON.stringify(artifact.testCases, null, 2),
        );
        await writeText(
            path.join(debugDir, "coverage-gaps.json"),
            JSON.stringify(artifact.coverageGaps, null, 2),
        );
        await writeText(
            path.join(debugDir, "risks.json"),
            JSON.stringify(artifact.risks, null, 2),
        );
    }

    const report: TestStrategyRunResult = {
        slug,
        mode,
        processedFiles: sources.map((s) => s.relativePath),
        outputRoot,
        normalizedCorpusPath,
        strategyPath,
        debugDir,
    };

    await writeText(path.join(debugDir, "run-summary.json"), JSON.stringify(report, null, 2));

    return report;
}
