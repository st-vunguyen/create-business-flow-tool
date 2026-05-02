import path from "node:path";
import { extractSources, SUPPORTED_EXTENSIONS } from "./core/extractors.js";
import { buildHeuristicAnalysis, buildHeuristicMermaid } from "./core/heuristics.js";
import { runValidation } from "./core/validator.js";
import { resolveExecutionMode, runLlmPrompt } from "./core/llm.js";
import { composeAnalysisPrompt, composeMermaidPrompt, loadPromptPair, renderNormalizedCorpus } from "./core/prompts.js";
import { renderAnalysisMarkdown, renderMermaidMarkdown } from "./core/renderers.js";
import type { RunOptions, RunResult } from "./types.js";
import { ensureDir, slugify, titleCase, writeText } from "./core/utils.js";

export async function runPipeline(workspaceRoot: string, options: RunOptions): Promise<RunResult> {
  const slug = options.slug ? slugify(options.slug) : slugify(path.basename(options.specDir));
  const mode = resolveExecutionMode(options.mode);
  const outputRoot = path.resolve(workspaceRoot, options.outputRoot ?? "business-flow", slug);
  const sourceDir = path.join(outputRoot, "01-source");
  const analysisDir = path.join(outputRoot, "02-analysis");
  const mermaidDir = path.join(outputRoot, "03-mermaid");
  const perFlowDir = path.join(outputRoot, "04-per-flow");
  const debugDir = path.join(outputRoot, "debug");

  const dirPromises = [
    ensureDir(sourceDir),
    ensureDir(analysisDir),
    ensureDir(mermaidDir),
    ensureDir(debugDir),
  ];
  if (options.perFlow) dirPromises.push(ensureDir(perFlowDir));
  await Promise.all(dirPromises);

  const specRoot = path.resolve(workspaceRoot, options.specDir);
  const sources = await extractSources(specRoot);
  const normalizedCorpus = renderNormalizedCorpus(specRoot, sources);
  const normalizedCorpusPath = path.join(sourceDir, "normalized-spec.md");
  await writeText(normalizedCorpusPath, normalizedCorpus);

  const promptPair = await loadPromptPair(workspaceRoot);
  const analysisPromptPath = path.join(debugDir, "analysis.prompt.md");
  const mermaidPromptPath = path.join(debugDir, "mermaid.prompt.md");
  await writeText(analysisPromptPath, composeAnalysisPrompt(promptPair.analysisPrompt, options, normalizedCorpusPath, sources));

  let analysisPath: string | undefined;
  let mermaidPath: string | undefined;
  let validationPath: string | undefined;
  let permissionsPath: string | undefined;
  let riskPath: string | undefined;
  let scenariosPath: string | undefined;

  if (mode !== "dry-run") {
    let analysisMarkdown: string;
    let heuristicAnalysis = buildHeuristicAnalysis(slug, sources);

    if (mode === "llm") {
      // LLM mode needs prompt payload built manually if user wants to run it.
      analysisMarkdown = "Run LLM Mode Not Fully Supported via the base script. Please use heuristic mode.";
    } else {
      // Run validation on heuristic analysis
      const mermaidForValidation = buildHeuristicMermaid(heuristicAnalysis, options.includeSwimlane);
      heuristicAnalysis = { ...heuristicAnalysis, validationResult: runValidation(heuristicAnalysis, mermaidForValidation) };
      analysisMarkdown = renderAnalysisMarkdown(heuristicAnalysis, normalizedCorpusPath, specRoot);
    }

    analysisPath = path.join(analysisDir, "business-flow-document.md");
    await writeText(analysisPath, analysisMarkdown);
    await writeText(mermaidPromptPath, composeMermaidPrompt(promptPair.mermaidPrompt, analysisPath, analysisMarkdown, options));

    validationPath = path.join(debugDir, "validation.json");
    permissionsPath = path.join(debugDir, "permissions.json");
    riskPath = path.join(debugDir, "risk.json");
    scenariosPath = path.join(debugDir, "scenario-seeds.md");
    await writeText(validationPath, JSON.stringify(heuristicAnalysis.validationResult ?? null, null, 2));
    await writeText(permissionsPath, JSON.stringify(heuristicAnalysis.permissions ?? null, null, 2));
    await writeText(riskPath, JSON.stringify(heuristicAnalysis.risks ?? null, null, 2));
    await writeText(scenariosPath, renderScenarioSeedMarkdown(heuristicAnalysis.scenarios ?? []));

    let mermaidMarkdown: string;
    if (mode === "llm") {
      mermaidMarkdown = "Run LLM Mode Not Fully Supported via the base script. Please use heuristic mode.";
    } else {
      const mermaid = buildHeuristicMermaid(heuristicAnalysis, options.includeSwimlane);
      mermaidMarkdown = renderMermaidMarkdown(mermaid, analysisPath, options.includeSwimlane);
    }

    mermaidPath = path.join(mermaidDir, "business-flow-mermaid.md");
    await writeText(mermaidPath, mermaidMarkdown);
  } else {
    await writeText(mermaidPromptPath, composeMermaidPrompt(promptPair.mermaidPrompt, path.join(analysisDir, "business-flow-document.md"), "", options));
  }

  const reportPath = path.join(debugDir, "run-summary.json");
  const promptPaths = [analysisPromptPath, mermaidPromptPath];
  const report: RunResult = {
    slug,
    mode,
    processedFiles: sources.map((source) => source.relativePath),
    outputRoot,
    normalizedCorpusPath,
    analysisPath,
    mermaidPath,
    validationPath,
    permissionsPath,
    riskPath,
    scenariosPath,
    promptPaths,
    reportPath,
  };
  await writeText(reportPath, JSON.stringify(report, null, 2));

  return report;
}

function renderScenarioSeedMarkdown(seeds: NonNullable<RunResult["scenariosPath"]> extends string ? import("./types.js").ScenarioSeed[] : never): string {
  const rows = seeds.map((seed) => `| ${seed.kind} | ${seed.title} | ${seed.given} | ${seed.when} | ${seed.then} |`);

  return [
    "MODE=technical",
    "",
    "# Scenario Seeds",
    "",
    "| Kind | Title | Given | When | Then |",
    "|---|---|---|---|---|",
    ...(rows.length > 0 ? rows : ["| happy-path | Unknown / needs confirmation | Preconditions need confirmation | Flow starts | Expected outcome needs confirmation |"]),
    "",
  ].join("\n");
}
