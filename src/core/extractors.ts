import { execFile as execFileCallback } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import fg from "fast-glob";
import xlsxModule from "xlsx";
import type { ConstraintSeverity, DataContract, ExtractedSource, ImplementationConstraint } from "../types.js";
import { ensureDir, normalizeWhitespace, numberLines, titleCase } from "./utils.js";

const execFile = promisify(execFileCallback);
const XLSX = xlsxModule;

export const SUPPORTED_EXTENSIONS = [
  ".md",
  ".markdown",
  ".txt",
  ".doc",
  ".docx",
  ".pdf",
  ".xlsx",
  ".xls",
  ".csv",
  ".tsv",
  ".json",
] as const;

export async function discoverSpecFiles(specDir: string): Promise<string[]> {
  await ensureDir(specDir);

  return fg(["**/*.{md,markdown,txt,doc,docx,pdf,xlsx,xls,csv,tsv,json}"], {
    cwd: specDir,
    absolute: true,
    onlyFiles: true,
    unique: true,
  });
}

export async function extractSources(specDir: string): Promise<ExtractedSource[]> {
  const files = await discoverSpecFiles(specDir);

  if (files.length === 0) {
    throw new Error(`No supported spec files found in ${specDir}`);
  }

  const sources = await Promise.all(files.map((filePath) => extractSource(specDir, filePath)));
  return sources.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

export async function extractSource(specDir: string, filePath: string): Promise<ExtractedSource> {
  const extension = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(specDir, filePath) || path.basename(filePath);
  const title = titleCase(path.basename(relativePath, extension));
  const content = await readContent(filePath, extension);
  const normalized = normalizeWhitespace(content);
  const { numbered, lines } = numberLines(normalized, relativePath);

  return {
    filePath,
    relativePath,
    extension,
    title,
    content: normalized,
    numberedContent: numbered,
    lines,
  };
}

async function readContent(filePath: string, extension: string): Promise<string> {
  switch (extension) {
    case ".md":
    case ".markdown":
    case ".txt":
      return readUtf8(filePath);
    case ".json":
      return readJsonAsText(filePath);
    case ".docx":
      return readDocx(filePath);
    case ".doc":
      return readLegacyWord(filePath);
    case ".pdf":
      return readPdf(filePath);
    case ".xlsx":
    case ".xls":
    case ".csv":
    case ".tsv":
      return readSpreadsheet(filePath, extension);
    default:
      throw new Error(`Unsupported extension: ${extension}`);
  }
}

async function readUtf8(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

async function readJsonAsText(filePath: string): Promise<string> {
  const content = await readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(content) as unknown;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}

async function readDocx(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function readLegacyWord(filePath: string): Promise<string> {
  if (process.platform === "darwin") {
    const { stdout } = await execFile("textutil", ["-convert", "txt", "-stdout", filePath]);
    return stdout;
  }

  throw new Error(`.doc extraction requires macOS textutil or a custom extractor: ${filePath}`);
}

async function readPdf(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  const pdfModule = await import("pdf-parse");
  const pdfParse = (pdfModule.default ?? pdfModule) as (input: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text;
}

async function readSpreadsheet(filePath: string, extension: string): Promise<string> {
  const workbook = XLSX.readFile(filePath, {
    raw: false,
    dense: true,
    type: "file",
  });

  const renderedSheets = workbook.SheetNames.map((sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
      defval: "",
    }) as Array<Array<string | number | boolean | null>>;

    const lines: string[] = [`## Sheet: ${sheetName}`];
    if (rows.length === 0) {
      lines.push("(empty sheet)");
      return lines.join("\n");
    }

    const normalizedRows = rows.map((row: Array<string | number | boolean | null>) =>
      row.map((cell: string | number | boolean | null) => String(cell ?? "").trim()),
    );
    const header = normalizedRows[0];
    const body = normalizedRows.slice(1);

    if (header.every((cell: string) => !cell)) {
      lines.push(...normalizedRows.map((row: string[]) => row.filter(Boolean).join(" | ")));
      return lines.join("\n");
    }

    lines.push(`| ${header.join(" | ")} |`);
    lines.push(`| ${header.map(() => "---").join(" | ")} |`);
    for (const row of body) {
      lines.push(`| ${row.join(" | ")} |`);
    }

    return lines.join("\n");
  });

  const title = extension === ".csv" || extension === ".tsv" ? "## Sheet: Table" : undefined;
  return [title, ...renderedSheets].filter(Boolean).join("\n\n");
}

// ─── Implementation Constraint Extraction ─────────────────────────────────────

const CONSTRAINT_PATTERN = /\b(never|always|must not|critical|important|warning|do not|do not use|must be)\b/i;
const SEVERITY_MAP: Record<string, ConstraintSeverity> = {
  never: "never",
  "must not": "never",
  "do not": "never",
  "do not use": "never",
  always: "always",
  "must be": "always",
  critical: "warning",
  important: "warning",
  warning: "warning",
};

function resolveSeverity(text: string): ConstraintSeverity {
  const lower = text.toLowerCase();
  for (const [keyword, severity] of Object.entries(SEVERITY_MAP)) {
    if (lower.includes(keyword)) return severity;
  }
  return "warning";
}

export function extractImplementationNotes(sources: ExtractedSource[]): ImplementationConstraint[] {
  const results: ImplementationConstraint[] = [];

  for (const source of sources) {
    const lines = source.content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (CONSTRAINT_PATTERN.test(trimmed) && trimmed.length > 20 && trimmed.length < 400) {
        results.push({
          severity: resolveSeverity(trimmed),
          rule: trimmed.replace(/^[-*]\s*/, ""),
          context: source.title,
          source: source.relativePath,
        });
      }
    }
  }

  // Deduplicate by normalized rule text
  const seen = new Set<string>();
  return results.filter((item) => {
    const key = item.rule.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Data Format Extraction ───────────────────────────────────────────────────

const CODE_BLOCK_REGEX = /```(?:json|typescript|javascript|text)?\s*\n([\s\S]*?)```/g;
const JSON_OBJECT_REGEX = /^\s*[{[]/;

export function extractDataFormats(sources: ExtractedSource[]): DataContract[] {
  const results: DataContract[] = [];

  for (const source of sources) {
    const blocks: string[] = [];
    let match: RegExpExecArray | null;
    CODE_BLOCK_REGEX.lastIndex = 0;

    while ((match = CODE_BLOCK_REGEX.exec(source.content)) !== null) {
      const block = match[1].trim();
      if (block && JSON_OBJECT_REGEX.test(block)) {
        blocks.push(block);
      }
    }

    for (const block of blocks) {
      try {
        const parsed = JSON.parse(block) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const fields = Object.keys(parsed as Record<string, unknown>);
          if (fields.length > 0) {
            const name = fields.join(", ").slice(0, 60);
            results.push({
              name,
              format: "JSON",
              fields,
              example: block.slice(0, 300),
              source: source.relativePath,
            });
          }
        }
      } catch {
        // Not valid JSON — skip
      }
    }
  }

  // Limit to 10 most field-rich contracts
  return results
    .sort((a, b) => b.fields.length - a.fields.length)
    .slice(0, 10);
}
