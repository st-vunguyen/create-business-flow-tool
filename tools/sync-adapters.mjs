#!/usr/bin/env node
/**
 * sync-adapters.mjs
 *
 * Copies canonical AI assets from top-level directories to tool adapter paths.
 *
 * Canonical source         → Adapter target
 * ─────────────────────────────────────────────────────────────────────────
 * agents/business-flow/    → .claude/agents/
 * agents/test-strategy/    → .claude/agents/
 * rules/                   → .claude/rules/
 * skills/                  → .claude/skills/
 * prompts/business-flow/   → .github/prompts/
 * prompts/test-strategy/   → .github/prompts/
 *
 * No symlinks. Generated copies only.
 * Run: node tools/sync-adapters.mjs
 */

import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const ADAPTER_HEADER = `<!-- ⚠️  AUTO-GENERATED — DO NOT EDIT
     Edit the canonical file and run: node tools/sync-adapters.mjs
     See ai-platform.manifest.json for source mapping.
-->
`;

async function ensureDir(dir) {
    await mkdir(dir, { recursive: true });
}

async function copyWithHeader(src, dest) {
    const original = await readFile(src, "utf8");
    const header = original.startsWith("---")
        ? original // preserve YAML frontmatter — insert header after closing ---
            .replace(/^(---[\s\S]*?---\n)/, (match) => match + ADAPTER_HEADER)
        : ADAPTER_HEADER + original;
    await ensureDir(path.dirname(dest));
    await writeFile(dest, header, "utf8");
    console.log(`  ✓  ${path.relative(ROOT, src)}  →  ${path.relative(ROOT, dest)}`);
}

async function syncDir(srcDir, destDir, { flatten = false } = {}) {
    let entries;
    try {
        entries = await readdir(srcDir, { withFileTypes: true });
    } catch {
        console.warn(`  ⚠  Source not found: ${path.relative(ROOT, srcDir)} — skipped`);
        return;
    }

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        if (entry.isDirectory()) {
            if (flatten) {
                // recurse, but write files into destDir (no sub-folder)
                await syncDir(srcPath, destDir, { flatten });
            } else {
                await syncDir(srcPath, path.join(destDir, entry.name));
            }
        } else if (entry.isFile() && /\.(md|json)$/.test(entry.name)) {
            const destPath = path.join(destDir, entry.name);
            await copyWithHeader(srcPath, destPath);
        }
    }
}

async function main() {
    console.log("🔄  sync-adapters — copying canonical AI assets to tool adapters\n");

    // .claude/ adapter
    console.log("→  .claude/ adapter:");
    await syncDir(path.join(ROOT, "agents", "business-flow"), path.join(ROOT, ".claude", "agents"));
    await syncDir(path.join(ROOT, "agents", "test-strategy"), path.join(ROOT, ".claude", "agents"));
    await syncDir(path.join(ROOT, "rules"), path.join(ROOT, ".claude", "rules"));
    await syncDir(path.join(ROOT, "skills"), path.join(ROOT, ".claude", "skills"));

    // .github/prompts/ adapter
    console.log("\n→  .github/prompts/ adapter:");
    await syncDir(path.join(ROOT, "prompts", "business-flow"), path.join(ROOT, ".github", "prompts"), { flatten: true });
    await syncDir(path.join(ROOT, "prompts", "test-strategy"), path.join(ROOT, ".github", "prompts"), { flatten: true });

    // Write README into .claude/ and .github/prompts/ explaining adapter status
    const claudeReadme = `# .claude/ — Auto-generated adapter layer

> ⚠️  **Do not edit files in this directory directly.**
> Edit the canonical source files in \`agents/\`, \`rules/\`, \`skills/\`, \`prompts/\`
> and run \`node tools/sync-adapters.mjs\` to regenerate.

See \`ai-platform.manifest.json\` for the full source mapping.
`;
    await writeFile(path.join(ROOT, ".claude", "README.md"), claudeReadme, "utf8");
    console.log(`\n  ✓  .claude/README.md`);

    const githubPromptsReadme = `# .github/prompts/ — Auto-generated adapter layer

> ⚠️  **Do not edit files in this directory directly.**
> Edit the canonical source files in \`prompts/business-flow/\` and \`prompts/test-strategy/\`
> and run \`node tools/sync-adapters.mjs\` to regenerate.

See \`ai-platform.manifest.json\` for the full source mapping.
`;
    await ensureDir(path.join(ROOT, ".github", "prompts"));
    await writeFile(path.join(ROOT, ".github", "prompts", "README.md"), githubPromptsReadme, "utf8");
    console.log(`  ✓  .github/prompts/README.md`);

    console.log("\n✅  sync complete");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
