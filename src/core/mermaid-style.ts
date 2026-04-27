export const MERMAID_VISUAL_STANDARD_PATH = "docs/mermaid-visual-standard.md";
export const MERMAID_ICON_LIBRARY_PATH = "docs/icons/mermaid-icon-library.md";
export const MERMAID_ICON_GUIDELINES_PATH = "docs/icons/mermaid-icon-guidelines.md";
export const MERMAID_ICON_CATALOG_PATH = "docs/icons/mermaid-icon-catalog.md";
export const MERMAID_ICON_TAXONOMY_PATH = "assets/mermaid-icons/semantic-icon-taxonomy.json";
export const MERMAID_ICON_PHYSICAL_LIBRARY_PATH = "assets/mermaid-icons/library";
export const MERMAID_EXTENDED_ICON_TOKEN_COUNT = 1440;

export const MERMAID_INIT_BLOCK = `%%{init: {"theme":"base","flowchart":{"htmlLabels":false,"curve":"basis","nodeSpacing":32,"rankSpacing":44,"padding":20},"themeVariables":{"fontFamily":"Inter, Arial, sans-serif","fontSize":"14px","primaryColor":"#EFF6FF","primaryTextColor":"#0F172A","primaryBorderColor":"#2563EB","lineColor":"#475569","secondaryColor":"#F8FAFC","tertiaryColor":"#FFF7ED"},"themeCSS":".node rect, .node polygon, .node path, .node circle, .node ellipse { rx: 6px; ry: 6px; } .node text, .label text, .edgeLabel { font-family: Inter, Arial, sans-serif; font-size: 14px; fill: #0F172A; } .edgeLabel { background-color: #FFFFFF; } .cluster rect { rx: 8px; ry: 8px; fill: #F8FAFC; stroke: #CBD5E1; stroke-width: 1.5px; }"}}%%`;

export const MERMAID_CLASS_DEFINITIONS = [
  "  classDef startEnd fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0F172A;",
  "  classDef process fill:#EFF6FF,stroke:#2563EB,stroke-width:2px,color:#0F172A;",
  "  classDef decision fill:#FFF7ED,stroke:#F59E0B,stroke-width:2px,color:#0F172A;",
  "  classDef exception fill:#FEF2F2,stroke:#DC2626,stroke-width:2px,color:#0F172A;",
  "  classDef external fill:#F3F4F6,stroke:#64748B,stroke-width:2px,color:#0F172A;",
  "  classDef note fill:#F8FAFC,stroke:#94A3B8,stroke-width:1.5px,color:#334155,stroke-dasharray: 4 2;",
].join("\n");

export const MERMAID_VISUAL_STANDARD_LINES = [
  "- Language: English only, concise, business-friendly, and evidence-backed.",
  "- Layout: Main flow uses `flowchart TD`; swimlanes use `flowchart LR` with one subgraph per actor when ownership is explicit.",
  "- Color system: Blue for process, amber for decisions, red for exceptions, gray for external/system-owned activity, cyan for start/end.",
  "- Typography: Sans-serif, 14px minimum, no emoji, no slang, no decorative wording.",
  "- Edge emphasis: The happy path uses thicker blue links; alternate or unresolved branches use neutral or red links.",
  `- References: \`${MERMAID_VISUAL_STANDARD_PATH}\`, \`${MERMAID_ICON_LIBRARY_PATH}\`, \`${MERMAID_ICON_GUIDELINES_PATH}\`, and \`${MERMAID_ICON_CATALOG_PATH}\`.`,
];

export const MERMAID_ICON_LIBRARY = [
  { key: "start-end", file: "assets/mermaid-icons/start-end.svg", usage: "Terminal event, confirmed start, confirmed end" },
  { key: "process", file: "assets/mermaid-icons/process.svg", usage: "Standard business activity or workflow step" },
  { key: "decision", file: "assets/mermaid-icons/decision.svg", usage: "Business rule, approval gate, or branching decision" },
  { key: "exception", file: "assets/mermaid-icons/exception.svg", usage: "Failure path, rejection path, or exception handling" },
  { key: "external-system", file: "assets/mermaid-icons/external-system.svg", usage: "External system, service, queue, or integration touchpoint" },
  { key: "data-store", file: "assets/mermaid-icons/data-store.svg", usage: "Stored record, document repository, or persistent state" },
] as const;

export function renderMermaidIconLines(): string[] {
  return [
    ...MERMAID_ICON_LIBRARY.map((icon) => `- \`${icon.key}\` → \`${icon.file}\` (${icon.usage})`),
    `- Extended semantic registry: \`${MERMAID_EXTENDED_ICON_TOKEN_COUNT.toLocaleString("en-US")}\` icon tokens using \`<domain>.<object>.<state>\`; see \`${MERMAID_ICON_LIBRARY_PATH}\`.`,
    `- Machine-readable taxonomy: \`${MERMAID_ICON_TAXONOMY_PATH}\`.`,
    `- Physical SVG library: \`${MERMAID_ICON_PHYSICAL_LIBRARY_PATH}\`.`,
    `- Selection guide: \`${MERMAID_ICON_GUIDELINES_PATH}\`.`,
  ];
}

export function buildFallbackSwimlaneDiagram(message: string): string {
  return [
    MERMAID_INIT_BLOCK,
    "flowchart LR",
    '  START(["Start"])',
    `  NOTE["${escapeMermaidLabel(message)}"]`,
    '  END(["End"])',
    "  START --> NOTE",
    "  NOTE --> END",
    MERMAID_CLASS_DEFINITIONS,
    "  class START,END startEnd;",
    "  class NOTE note;",
    "  linkStyle 0,1 stroke:#64748B,stroke-width:1.75px,stroke-dasharray: 4 2;",
  ].join("\n");
}

export function escapeMermaidLabel(value: string): string {
  return value.replace(/"/g, "'").trim() || "Unknown / needs confirmation";
}

export function isExternalTouchpoint(value: string): boolean {
  return /\b(api|service|job|event|queue|database|db|portal|dashboard|system|integration)\b/i.test(value);
}
