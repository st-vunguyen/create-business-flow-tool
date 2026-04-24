import { readFile } from "node:fs/promises";
import path from "node:path";
import { extractSources, SUPPORTED_EXTENSIONS } from "./core/extractors.js";
import { buildHeuristicAnalysis, buildHeuristicMermaid } from "./core/heuristics.js";
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
  const promptsDir = path.join(outputRoot, "04-prompts");
  const reportDir = path.join(outputRoot, "10-reports");

  await Promise.all([ensureDir(sourceDir), ensureDir(analysisDir), ensureDir(mermaidDir), ensureDir(promptsDir), ensureDir(reportDir)]);

  const specRoot = path.resolve(workspaceRoot, options.specDir);
  const sources = await extractSources(specRoot);
  const normalizedCorpus = renderNormalizedCorpus(specRoot, sources);
  const normalizedCorpusPath = path.join(sourceDir, "normalized-spec.md");
  await writeText(normalizedCorpusPath, normalizedCorpus);

  const { analysisPrompt, mermaidPrompt } = await loadPromptPair(workspaceRoot);
  const analysisPromptPath = path.join(promptsDir, "01-analysis.prompt.md");
  const mermaidPromptPath = path.join(promptsDir, "02-mermaid.prompt.md");
  await writeText(analysisPromptPath, composeAnalysisPrompt(analysisPrompt, { ...options, outputRoot }, normalizedCorpusPath, sources));

  let analysisPath: string | undefined;
  let mermaidPath: string | undefined;

  if (mode !== "dry-run") {
    let analysisMarkdown: string;

    if (mode === "llm") {
      const prompt = await readFile(analysisPromptPath, "utf8");
      analysisMarkdown = await runLlmPrompt({ prompt, model: options.model });
    } else {
      const analysis = buildHeuristicAnalysis(slug, sources);
      analysisMarkdown = renderAnalysisMarkdown(analysis, normalizedCorpusPath, specRoot);
    }

    analysisPath = path.join(analysisDir, "business-flow-document.md");
    await writeText(analysisPath, analysisMarkdown);
    await writeText(mermaidPromptPath, composeMermaidPrompt(mermaidPrompt, analysisPath, analysisMarkdown, { ...options, outputRoot }));

    let mermaidMarkdown: string;
    if (mode === "llm") {
      const prompt = await readFile(mermaidPromptPath, "utf8");
      mermaidMarkdown = await runLlmPrompt({ prompt, model: options.model });
    } else {
      const analysis = buildHeuristicAnalysis(slug, sources);
      const mermaid = buildHeuristicMermaid(analysis, options.includeSwimlane);
      mermaidMarkdown = renderMermaidMarkdown(mermaid, analysisPath, options.includeSwimlane);
    }

    mermaidPath = path.join(mermaidDir, "business-flow-mermaid.md");
    await writeText(mermaidPath, mermaidMarkdown);
  } else {
    await writeText(
      mermaidPromptPath,
      composeMermaidPrompt(
        mermaidPrompt,
        path.join(analysisDir, "business-flow-document.md"),
        "MODE=technical\n\n# Business Flow Document\n\nDry-run mode only generated prompts. Run again with `--mode heuristic` or `--mode llm` to create the source document.",
        { ...options, outputRoot },
      ),
    );
  }

  const reportPath = path.join(reportDir, "run-summary.json");
  await writeText(
    reportPath,
    JSON.stringify(
      {
        slug,
        title: `${titleCase(slug)} Business Flow Run`,
        mode,
        specRoot,
        supportedExtensions: SUPPORTED_EXTENSIONS,
        processedFiles: sources.map((source) => source.relativePath),
        outputs: {
          normalizedCorpusPath,
          analysisPath,
          mermaidPath,
          prompts: [analysisPromptPath, mermaidPromptPath],
        },
      },
      null,
      2,
    ),
  );

  return {
    slug,
    mode,
    processedFiles: sources.map((source) => source.relativePath),
    outputRoot,
    normalizedCorpusPath,
    analysisPath,
    mermaidPath,
    promptPaths: [analysisPromptPath, mermaidPromptPath],
    reportPath,
  };
}
