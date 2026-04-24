export type RunMode = "auto" | "llm" | "heuristic" | "dry-run";

export interface RunOptions {
  specDir: string;
  slug?: string;
  outputRoot?: string;
  mode: RunMode;
  includeSwimlane: boolean;
  model?: string;
}

export interface ExtractedSource {
  filePath: string;
  relativePath: string;
  extension: string;
  title: string;
  content: string;
  numberedContent: string;
  lines: SourceLine[];
}

export interface SourceLine {
  relativePath: string;
  lineNumber: number;
  text: string;
}

export interface BusinessFlowStep {
  index: number;
  actor: string;
  action: string;
  decision: string;
  touchpoint: string;
  outcome: string;
  notes: string;
  evidence: string;
}

export interface AnalysisArtifact {
  title: string;
  topic: string;
  goal: string;
  scope: string;
  sourceFiles: string[];
  trigger: string;
  outcomes: string[];
  actors: string[];
  touchpoints: string[];
  steps: BusinessFlowStep[];
  narrative: string[];
  decisions: string[];
  exceptions: string[];
  questions: string[];
  assumptions: string[];
}

export interface MermaidNodeTrace {
  nodeId: string;
  text: string;
  evidence: string;
}

export interface MermaidArtifact {
  facts: {
    trigger: string;
    outcomes: string[];
    actors: string[];
    decisions: string[];
    exceptions: string[];
  };
  flowchart: string;
  swimlane?: string;
  traceability: MermaidNodeTrace[];
  gaps: string[];
}

export interface RunResult {
  slug: string;
  mode: Exclude<RunMode, "auto">;
  processedFiles: string[];
  outputRoot: string;
  normalizedCorpusPath: string;
  analysisPath?: string;
  mermaidPath?: string;
  promptPaths: string[];
  reportPath: string;
}
