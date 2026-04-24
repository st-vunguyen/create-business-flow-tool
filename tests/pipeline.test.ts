import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runPipeline } from "../src/pipeline.js";

test("runPipeline generates English-only heuristic business-flow artifacts with Mermaid visual standards", async () => {
  const workspaceRoot = path.resolve(process.cwd());
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "business-flow-tool-"));

  const result = await runPipeline(workspaceRoot, {
    specDir: "tests/fixtures/specs/sample",
    outputRoot,
    slug: "sample-checkout",
    mode: "heuristic",
    includeSwimlane: true,
  });

  assert.equal(result.mode, "heuristic");
  assert.ok(result.analysisPath);
  assert.ok(result.mermaidPath);

  const analysis = await readFile(result.analysisPath!, "utf8");
  const mermaid = await readFile(result.mermaidPath!, "utf8");

  assert.match(analysis, /# Sample Checkout Business Flow Document/i);
  assert.match(analysis, /\| # \| Actor\/Role \| Business Step \| Decision\/Condition \| System Touchpoint \| Expected Outcome \| Notes\/Risks \|/i);
  assert.match(analysis, /Customer opens checkout page/i);
  assert.match(analysis, /Payment service confirms transaction/i);
  assert.match(analysis, /UI page/i);
  assert.match(analysis, /Payment is authorized/i);
  assert.doesNotMatch(analysis, /\| \d+ \| Customer \| Customer \|/i);
  assert.match(mermaid, /## 2\) Diagram Standard/i);
  assert.match(mermaid, /assets\/mermaid-icons\/decision\.svg/i);
  assert.match(mermaid, /%%\{init:/i);
  assert.match(mermaid, /classDef process/i);
  assert.match(mermaid, /classDef decision/i);
  assert.match(mermaid, /classDef exception/i);
  assert.match(mermaid, /Customer opens checkout page/i);
  assert.match(mermaid, /Payment service confirms transaction/i);
  assert.doesNotMatch(mermaid, /Customer completes an order from cart to payment confirmation\"]\n  START --> N1/i);
  assert.match(mermaid, /linkStyle .*stroke:#2563EB/i);
  assert.match(mermaid, /NodeId \| Node text \| Evidence/i);
});
