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
  assert.ok(result.validationPath);
  assert.ok(result.permissionsPath);
  assert.ok(result.riskPath);
  assert.ok(result.scenariosPath);
  assert.equal(result.promptPaths.length, 2);
  assert.ok(result.reportPath);
  assert.match(result.validationPath!, /\/debug\/validation\.json$/i);
  assert.match(result.permissionsPath!, /\/debug\/permissions\.json$/i);
  assert.match(result.riskPath!, /\/debug\/risk\.json$/i);
  assert.match(result.scenariosPath!, /\/debug\/scenario-seeds\.md$/i);
  assert.match(result.promptPaths[0]!, /\/debug\/analysis\.prompt\.md$/i);
  assert.match(result.promptPaths[1]!, /\/debug\/mermaid\.prompt\.md$/i);
  assert.match(result.reportPath, /\/debug\/run-summary\.json$/i);

  const analysis = await readFile(result.analysisPath!, "utf8");
  const mermaid = await readFile(result.mermaidPath!, "utf8");
  const validation = await readFile(result.validationPath!, "utf8");
  const permissions = await readFile(result.permissionsPath!, "utf8");
  const risk = await readFile(result.riskPath!, "utf8");
  const scenarios = await readFile(result.scenariosPath!, "utf8");
  const report = await readFile(result.reportPath, "utf8");

  assert.match(analysis, /# Sample Checkout Business Flow Document/i);
  assert.match(analysis, /\| # \| Actor\/Role \| Business Step \| Decision\/Condition \| System Touchpoint \| Expected Outcome \| Notes\/Risks \|/i);
  assert.match(analysis, /Customer opens checkout page/i);
  assert.match(analysis, /Payment service confirms transaction/i);
  assert.match(analysis, /UI page/i);
  assert.match(analysis, /Payment is authorized/i);
  assert.match(analysis, /## 9\) Gap Taxonomy/i);
  assert.match(analysis, /## 10\) State Machine/i);
  assert.match(analysis, /## 11\) Permissions/i);
  assert.match(analysis, /## 12\) Async Events/i);
  assert.match(analysis, /## 13\) Risk Hotspots/i);
  assert.match(analysis, /## 14\) Scenario Seeds/i);
  assert.match(analysis, /## 15\) Contradictions/i);
  assert.match(analysis, /## 16\) Validation Report/i);
  assert.doesNotMatch(analysis, /\| \d+ \| Customer \| Customer \|/i);
  assert.match(mermaid, /## 2\) Diagram Standard/i);
  assert.match(mermaid, /assets\/mermaid-icons\/decision\.svg/i);
  assert.match(mermaid, /Selected semantic tokens:/i);
  assert.match(mermaid, /assets\/mermaid-icons\/library\//i);
  assert.match(mermaid, /%%\{init:/i);
  assert.match(mermaid, /classDef process/i);
  assert.match(mermaid, /classDef decision/i);
  assert.match(mermaid, /classDef exception/i);
  assert.match(mermaid, /## 5b\) State Diagram/i);
  assert.match(mermaid, /Customer opens checkout page/i);
  assert.match(mermaid, /Payment service confirms transaction/i);
  assert.doesNotMatch(mermaid, /Customer completes an order from cart to payment confirmation\"]\n  START --> N1/i);
  assert.match(mermaid, /linkStyle .*stroke:#2563EB/i);
  assert.match(mermaid, /NodeId \| Node text \| Evidence/i);
  assert.match(validation, /"checks"/i);
  assert.match(validation, /"score"/i);
  assert.match(permissions, /"entries"/i);
  assert.match(permissions, /"gaps"/i);
  assert.match(risk, /"hotspots"/i);
  assert.match(risk, /"level"/i);
  assert.match(scenarios, /# Scenario Seeds/i);
  assert.match(scenarios, /\| Kind \| Title \| Given \| When \| Then \|/i);
  assert.match(report, /"promptPaths"/i);
  assert.match(report, /"validationPath"/i);
  assert.match(report, /debug\/analysis\.prompt\.md/i);
  assert.match(report, /debug\/run-summary\.json/i);
});
