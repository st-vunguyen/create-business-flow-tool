#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { SUPPORTED_EXTENSIONS } from "./core/extractors.js";
import { resolveExecutionMode } from "./core/llm.js";
import { runPipeline } from "./pipeline.js";
import type { RunMode } from "./types.js";

interface RunCommandOptions {
  specDir: string;
  slug?: string;
  outputRoot: string;
  mode: RunMode;
  model?: string;
  swimlane: boolean;
  perFlow: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

const program = new Command();
program
  .name("business-flow-tool")
  .description("Normalize specs, generate business-flow documents, and convert them to Mermaid diagrams.")
  .version("0.1.0");

program
  .command("run")
  .description("Run the full business-flow pipeline")
  .option("--spec-dir <path>", "Directory containing spec files", "specs")
  .option("--slug <slug>", "Output slug")
  .option("--output-root <path>", "Local output root directory (gitignored)", "business-flow")
  .option("--mode <mode>", "Execution mode: auto, llm, heuristic, dry-run", "auto")
  .option("--model <model>", "LLM model name for llm mode")
  .option("--no-swimlane", "Disable swimlane output")
  .option("--per-flow", "Generate per-sub-flow artifacts in 04-per-flow/")
  .action(async (commandOptions: RunCommandOptions) => {
    const mode = commandOptions.mode as RunMode;
    const result = await runPipeline(workspaceRoot, {
      specDir: commandOptions.specDir,
      slug: commandOptions.slug,
      outputRoot: commandOptions.outputRoot,
      mode,
      includeSwimlane: commandOptions.swimlane,
      model: commandOptions.model,
      perFlow: commandOptions.perFlow,
    });

    console.log(JSON.stringify(result, null, 2));
  });

program
  .command("doctor")
  .description("Show runtime capability summary")
  .action(() => {
    const effectiveMode = resolveExecutionMode("auto");
    console.log(
      JSON.stringify(
        {
          workspaceRoot,
          supportedExtensions: SUPPORTED_EXTENSIONS,
          llmConfigured: Boolean(process.env.OPENAI_API_KEY),
          effectiveAutoMode: effectiveMode,
          docExtractor: process.platform === "darwin" ? "textutil" : "needs custom extractor",
        },
        null,
        2,
      ),
    );
  });

const argv = process.argv[2] === "--" ? [process.argv[0], process.argv[1], ...process.argv.slice(3)] : process.argv;

program.parseAsync(argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
