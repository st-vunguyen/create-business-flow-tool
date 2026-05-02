export const MERMAID_VISUAL_STANDARD_PATH = "docs/icons/mermaid-visual-standard.md";
export const MERMAID_ICON_LIBRARY_PATH = "docs/icons/mermaid-icon-library.md";
export const MERMAID_ICON_GUIDELINES_PATH = "docs/icons/mermaid-icon-guidelines.md";
export const MERMAID_ICON_CATALOG_PATH = "docs/icons/mermaid-icon-catalog.md";
export const MERMAID_ICON_TAXONOMY_PATH = "assets/mermaid-icons/semantic-icon-taxonomy.json";
export const MERMAID_ICON_PHYSICAL_LIBRARY_PATH = "assets/mermaid-icons/library";
export const MERMAID_EXTENDED_ICON_TOKEN_COUNT = 1440;

// htmlLabels:true is required so that <br/> renders as a real line break.
// The renderer + escapeMermaidLabel + wrapMermaidLabel cooperate so callers
// only ever emit `<br/>` (never `\n` or real newlines) inside node labels.
export const MERMAID_INIT_BLOCK = `%%{init: {"theme":"base","flowchart":{"htmlLabels":true,"curve":"basis","nodeSpacing":40,"rankSpacing":56,"padding":28,"diagramPadding":16,"wrappingWidth":280},"themeVariables":{"fontFamily":"Inter, Arial, sans-serif","fontSize":"14px","primaryColor":"#EBF3FF","primaryTextColor":"#0F172A","primaryBorderColor":"#2563EB","lineColor":"#3B82F6","secondaryColor":"#FFFBEB","tertiaryColor":"#F0FDF4","background":"#FFFFFF","mainBkg":"#F8FAFC","clusterBkg":"#F8FAFC","clusterBorder":"#CBD5E1","edgeLabelBackground":"#FFFFFF","nodeBorder":"#CBD5E1"},"themeCSS":".node rect, .node polygon, .node path, .node circle, .node ellipse { rx: 12px; ry: 12px; stroke-linejoin: round; filter: drop-shadow(0 2px 4px rgba(15,23,42,0.08)); } .nodeLabel, .nodeLabel p, .label foreignObject div, .node text, .label text { font-family: Inter, Arial, sans-serif; font-size: 14px; color: #0F172A; fill: #0F172A; font-weight: 600; letter-spacing: 0.01em; line-height: 1.45; text-align: center; } .nodeLabel p { margin: 0; padding: 0 4px; } .edgeLabel, .edgeLabel p { background-color: #FFFFFF; color: #334155; padding: 3px 8px; border: 1px solid #E2E8F0; border-radius: 999px; font-size: 12px; font-weight: 500; } .cluster rect { rx: 18px; ry: 18px; fill: #F8FAFC; stroke: #CBD5E1; stroke-width: 1.5px; } .cluster-label, .cluster-label p, .cluster-label text { font-size: 13px; font-weight: 700; color: #334155; fill: #334155; letter-spacing: 0.04em; text-transform: uppercase; }"}}%%`;

export const MERMAID_CLASS_DEFINITIONS = [
  "  classDef startEnd fill:#1D4ED8,stroke:#0F3D91,stroke-width:2.5px,color:#FFFFFF,font-weight:700;",
  "  classDef process fill:#EBF3FF,stroke:#2563EB,stroke-width:2.25px,color:#0F172A,font-weight:600;",
  "  classDef decision fill:#FFFBEB,stroke:#D97706,stroke-width:2.25px,color:#78350F,font-weight:600;",
  "  classDef exception fill:#FEF2F2,stroke:#DC2626,stroke-width:2.25px,color:#991B1B,font-weight:600;",
  "  classDef external fill:#F0FDF4,stroke:#16A34A,stroke-width:2.25px,color:#14532D,font-weight:600;",
  "  classDef note fill:#F8FAFC,stroke:#94A3B8,stroke-width:1.5px,color:#475569,font-weight:500,stroke-dasharray: 4 2;",
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
  "- Label line breaks: ALWAYS use `<br/>` inside node and edge labels. NEVER use `\\n`, escaped sequences, or actual newline characters — they render as literal text.",
  "- Label length: keep each visual line ≤ 28 characters (≈ 4–6 words). Split longer labels with `<br/>` on a natural word boundary; never split a word.",
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

/**
 * Sanitises a label for use inside a Mermaid node label.
 *
 * Guarantees:
 * - Removes double-quotes (so the surrounding `["..."]` is never broken).
 * - Converts every form of "line break" to a single `<br/>` so the result
 *   renders as a proper multi-line label with htmlLabels:true.
 *   Forms covered: real newline / CRLF, the literal 2-character sequence
 *   `\n` (a frequent LLM mistake), and pre-existing `<br>` / `<br/>` tags.
 * - Collapses runs of whitespace and trims edges.
 */
export function escapeMermaidLabel(value: string): string {
  if (!value) return "Unknown / needs confirmation";

  const cleaned = value
    .replace(/"/g, "'")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("<br/>");

  return cleaned || "Unknown / needs confirmation";
}

/**
 * Wraps a long label across multiple lines using `<br/>` so it never spills
 * out of its node box. Word-aware: never splits a word in the middle.
 *
 * Pass `maxCharsPerLine` to control density (28 is a good default for
 * 14px Inter inside a 220px-wide rounded rectangle).
 */
export function wrapMermaidLabel(value: string, maxCharsPerLine = 28): string {
  const flat = escapeMermaidLabel(value).replace(/<br\s*\/?>/gi, " ");
  if (flat.length <= maxCharsPerLine) return flat;

  const words = flat.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines.join("<br/>");
}

export function isExternalTouchpoint(value: string): boolean {
  return /\b(api|service|job|event|queue|database|db|portal|dashboard|system|integration)\b/i.test(value);
}
