import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SourceLine } from "../types.js";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "business-flow";
}

export function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeText(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, "utf8");
}

export async function exists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\t/g, "  ").replace(/[ \t]+$/gm, "").trim();
}

export function compactLines(value: string): string[] {
  return normalizeWhitespace(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) {
      continue;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(normalized);
  }

  return output;
}

export function numberLines(content: string, relativePath: string): { numbered: string; lines: SourceLine[] } {
  const lines = normalizeWhitespace(content)
    .split("\n")
    .map((text, index) => ({ relativePath, lineNumber: index + 1, text }));

  const numbered = lines.map((line) => `L${line.lineNumber}: ${line.text}`).join("\n");
  return { numbered, lines };
}

export function firstNonEmpty(values: string[]): string {
  return values.find((value) => value.trim()) ?? "Unknown / needs confirmation";
}

export function toMarkdownTable(rows: string[][]): string {
  return rows
    .map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`)
    .join("\n");
}
