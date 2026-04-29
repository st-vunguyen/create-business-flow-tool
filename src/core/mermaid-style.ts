export const MERMAID_VISUAL_STANDARD_PATH = "docs/icons/mermaid-visual-standard.md";
export const MERMAID_ICON_LIBRARY_PATH = "docs/icons/mermaid-icon-library.md";
export const MERMAID_ICON_GUIDELINES_PATH = "docs/icons/mermaid-icon-guidelines.md";
export const MERMAID_ICON_CATALOG_PATH = "docs/icons/mermaid-icon-catalog.md";
export const MERMAID_ICON_TAXONOMY_PATH = "assets/mermaid-icons/semantic-icon-taxonomy.json";
export const MERMAID_ICON_PHYSICAL_LIBRARY_PATH = "assets/mermaid-icons/library";
export const MERMAID_EXTENDED_ICON_TOKEN_COUNT = 1440;

export const MERMAID_INIT_BLOCK = `%%{init: {"theme":"base","flowchart":{"htmlLabels":false,"curve":"basis","nodeSpacing":36,"rankSpacing":52,"padding":24,"diagramPadding":12},"themeVariables":{"fontFamily":"Inter, Arial, sans-serif","fontSize":"14px","primaryColor":"#E0ECFF","primaryTextColor":"#0F172A","primaryBorderColor":"#2563EB","lineColor":"#3B82F6","secondaryColor":"#FFF1D6","tertiaryColor":"#E9F7EF","background":"#FFFFFF","mainBkg":"#F8FAFC","clusterBkg":"#F8FAFC","clusterBorder":"#CBD5E1","edgeLabelBackground":"#FFFFFF"},"themeCSS":".node rect, .node polygon, .node path, .node circle, .node ellipse { rx: 14px; ry: 14px; stroke-linejoin: round; } .node text, .label text, .edgeLabel, .cluster-label text { font-family: Inter, Arial, sans-serif; font-size: 14px; fill: #0F172A; font-weight: 600; } .edgeLabel { background-color: #FFFFFF; color: #0F172A; padding: 4px 8px; border: 1px solid #E2E8F0; border-radius: 999px; } .cluster rect { rx: 20px; ry: 20px; fill: #F8FAFC; stroke: #CBD5E1; stroke-width: 1.5px; } .cluster-label text { font-size: 15px; font-weight: 700; fill: #0F172A; }"}}%%`;

export const MERMAID_CLASS_DEFINITIONS = [
  "  classDef startEnd fill:#0F3D91,stroke:#0F3D91,stroke-width:2.5px,color:#FFFFFF;",
  "  classDef process fill:#E8F1FF,stroke:#2563EB,stroke-width:2.25px,color:#0F172A;",
  "  classDef decision fill:#FFF4DB,stroke:#D97706,stroke-width:2.25px,color:#7C2D12;",
  "  classDef exception fill:#FDECEC,stroke:#DC2626,stroke-width:2.25px,color:#991B1B;",
  "  classDef external fill:#E9F7EF,stroke:#16A34A,stroke-width:2.25px,color:#14532D;",
  "  classDef note fill:#F8FAFC,stroke:#94A3B8,stroke-width:1.5px,color:#334155,stroke-dasharray: 4 2;",
].join("\n");

export const MERMAID_SWIMLANE_PALETTE = [
  { fill: "#DBEAFE", stroke: "#3B82F6", text: "#1E3A8A" },
  { fill: "#FEF3C7", stroke: "#D97706", text: "#92400E" },
  { fill: "#DCFCE7", stroke: "#16A34A", text: "#166534" },
  { fill: "#FCE7F3", stroke: "#DB2777", text: "#9D174D" },
  { fill: "#EDE9FE", stroke: "#7C3AED", text: "#5B21B6" },
  { fill: "#E0F2FE", stroke: "#0284C7", text: "#075985" },
] as const;

export const MERMAID_VISUAL_STANDARD_LINES = [
  "- Language: English only, concise, business-friendly, and evidence-backed.",
  "- Layout: Main flow uses `flowchart TD`; swimlanes use `flowchart LR` with one rounded subgraph per actor when ownership is explicit.",
  "- Color system: deep navy for start/end, crisp blue for process, warm amber for decisions, strong red for exceptions, emerald for external/integration steps, and alternating pastel swimlanes for actor groups.",
  "- Typography: Inter or similar sans-serif, 14px minimum, concise sentence-style labels, no emoji, no slang, no decorative wording.",
  "- Edge emphasis: the happy path uses thicker blue links; alternate branches use neutral slate links; exception branches use dashed red links.",
  "- Icons: prefer semantic icon tokens plus physical SVG references from `assets/mermaid-icons/library/`; never substitute emoji for status or meaning.",
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

export function buildSwimlaneStyleLine(swimlaneId: string, index: number): string {
  const palette = MERMAID_SWIMLANE_PALETTE[index % MERMAID_SWIMLANE_PALETTE.length];
  return `  style ${swimlaneId} fill:${palette.fill},stroke:${palette.stroke},stroke-width:2px,color:${palette.text};`;
}

export function escapeMermaidLabel(value: string): string {
  return value.replace(/"/g, "'").trim() || "Unknown / needs confirmation";
}

export function isExternalTouchpoint(value: string): boolean {
  return /\b(api|service|job|event|queue|database|db|portal|dashboard|system|integration)\b/i.test(value);
}
