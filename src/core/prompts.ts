import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ExtractedSource, RunOptions } from "../types.js";
import { normalizeWhitespace } from "./utils.js";

const PROMPT_01 = ".github/prompts/01-analyze-spec-to-business-flow-documents.prompt.md";
const PROMPT_02 = ".github/prompts/02-convert-business-flow-documents-to-mermaid.prompt.md";

export async function loadPromptPair(workspaceRoot: string): Promise<{ analysisPrompt: string; mermaidPrompt: string }> {
  const [analysisPrompt, mermaidPrompt] = await Promise.all([
    readFile(path.join(workspaceRoot, PROMPT_01), "utf8"),
    readFile(path.join(workspaceRoot, PROMPT_02), "utf8"),
  ]);

  return {
    analysisPrompt: normalizeWhitespace(analysisPrompt),
    mermaidPrompt: normalizeWhitespace(mermaidPrompt),
  };
}

export function renderNormalizedCorpus(specRoot: string, sources: ExtractedSource[]): string {
  const header = [
    "MODE=technical",
    "",
    "# Normalized Spec Corpus",
    "",
    `- Spec root: ${specRoot}`,
    `- Total files: ${sources.length}`,
    "",
  ].join("\n");

  const sections = sources.map((source) => {
    return [
      `## Source File: ${source.relativePath}`,
      `- Title: ${source.title}`,
      `- Extension: ${source.extension}`,
      "",
      source.numberedContent,
      "",
    ].join("\n");
  });

  return `${header}${sections.join("\n")}`.trimEnd() + "\n";
}

export function composeAnalysisPrompt(promptText: string, options: RunOptions, corpusPath: string, sources: ExtractedSource[]): string {
  const sourceList = sources.map((source) => `- ${source.relativePath}`).join("\n");
  const corpusBody = renderNormalizedCorpus(options.specDir, sources);

  return [
    promptText,
    "",
    "## Runtime Context",
    `- SPEC_ROOT=${options.specDir}`,
    `- OUTPUT_ROOT=${options.outputRoot ?? "result"}`,
    `- RUN_MODE=${options.mode}`,
    `- NORMALIZED_CORPUS=${corpusPath}`,
    "",
    "## Source Files",
    sourceList,
    "",
    "## Normalized Corpus",
    corpusBody,
    "",
    "## Instruction",
    "Read the normalized corpus file above and generate the final markdown only.",
  ].join("\n");
}

export function composeMermaidPrompt(promptText: string, sourceDocumentPath: string, sourceDocumentContent: string, options: RunOptions): string {
  return [
    promptText,
    "",
    "## Runtime Context",
    `- SOURCE_DOC=${sourceDocumentPath}`,
    `- OUTPUT_ROOT=${options.outputRoot ?? "result"}`,
    `- OUTPUT=${options.includeSwimlane ? "flowchart+swimlane" : "flowchart-only"}`,
    "",
    "## Business Flow Document Pack",
    sourceDocumentContent,
    "",
    "## Instruction",
    "Read the business-flow document and generate the final markdown only.",
  ].join("\n");
}
