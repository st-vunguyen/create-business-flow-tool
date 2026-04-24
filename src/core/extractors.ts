import { execFile as execFileCallback } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import fg from "fast-glob";
import xlsxModule from "xlsx";
import type { ExtractedSource } from "../types.js";
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
