import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");
const taxonomyPath = path.join(workspaceRoot, "assets/mermaid-icons/semantic-icon-taxonomy.json");
const outputRoot = path.join(workspaceRoot, "assets/mermaid-icons/library");
const manifestPath = path.join(outputRoot, "icon-manifest.json");
const catalogPath = path.join(workspaceRoot, "docs/icons/mermaid-icon-catalog.md");
const galleryMarkdownPath = path.join(workspaceRoot, "docs/icons/mermaid-icon-gallery.md");
const galleryHtmlPath = path.join(workspaceRoot, "docs/icons/mermaid-icon-gallery.html");
const libraryReadmePath = path.join(outputRoot, "README.md");

const domainPalette = {
  commerce: { primary: "#2563EB", soft: "#DBEAFE", accent: "#1D4ED8" },
  customer: { primary: "#0F766E", soft: "#CCFBF1", accent: "#0D9488" },
  identity: { primary: "#4F46E5", soft: "#E0E7FF", accent: "#4338CA" },
  sales: { primary: "#C2410C", soft: "#FFEDD5", accent: "#EA580C" },
  finance: { primary: "#0F766E", soft: "#DCFCE7", accent: "#16A34A" },
  risk: { primary: "#B91C1C", soft: "#FEE2E2", accent: "#DC2626" },
  compliance: { primary: "#0F766E", soft: "#D1FAE5", accent: "#059669" },
  operations: { primary: "#1D4ED8", soft: "#E0F2FE", accent: "#0284C7" },
  fulfillment: { primary: "#7C3AED", soft: "#EDE9FE", accent: "#8B5CF6" },
  support: { primary: "#0369A1", soft: "#E0F2FE", accent: "#0EA5E9" },
  marketing: { primary: "#BE185D", soft: "#FCE7F3", accent: "#DB2777" },
  content: { primary: "#475569", soft: "#F1F5F9", accent: "#64748B" },
  analytics: { primary: "#7C2D12", soft: "#FFEDD5", accent: "#EA580C" },
  platform: { primary: "#334155", soft: "#E2E8F0", accent: "#475569" },
  data: { primary: "#0369A1", soft: "#E0F2FE", accent: "#0284C7" },
};

const statePalette = {
  draft: { color: "#94A3B8", ring: "#CBD5E1", symbol: "draft" },
  submitted: { color: "#2563EB", ring: "#93C5FD", symbol: "submitted" },
  verified: { color: "#0F766E", ring: "#99F6E4", symbol: "verified" },
  approved: { color: "#16A34A", ring: "#BBF7D0", symbol: "approved" },
  rejected: { color: "#DC2626", ring: "#FECACA", symbol: "rejected" },
  completed: { color: "#0891B2", ring: "#A5F3FC", symbol: "completed" },
};

function safeId(input) {
  return input.replace(/[^a-zA-Z0-9]+/g, "-");
}

function lighten(hex, amount) {
  const [r, g, b] = hex.match(/[A-Fa-f0-9]{2}/g).map((value) => Number.parseInt(value, 16));
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function renderStateBadge(state, color) {
  switch (state) {
    case "submitted":
      return `<path d="M-4 0H4M0 -4L4 0L0 4" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "verified":
    case "approved":
    case "completed":
      return `<path d="M-3.5 -0.5L-0.5 2.5L4 -2.5" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "rejected":
      return `<path d="M-3 -3L3 3M3 -3L-3 3" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    case "draft":
    default:
      return `<path d="M-3.5 0.5L1.5 -4.5L3.5 -2.5L-1.5 2.5L-4.5 3.5L-3.5 0.5Z" stroke="${color}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`;
  }
}

function renderGlyph(object, color) {
  const common = `stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  switch (object) {
    case "request":
      return [
        `<path d="M18 28H36" ${common}/>`,
        `<path d="M30 22L36 28L30 34" ${common}/>`,
        `<path d="M18 38H46V44H18Z" ${common}/>`,
      ].join("");
    case "task":
      return [
        `<rect x="18" y="20" width="8" height="8" rx="2" ${common}/>`,
        `<path d="M20 24L22.5 26.5L26 21.5" ${common}/>`,
        `<path d="M31 24H46" ${common}/>`,
        `<path d="M18 38H26" ${common}/>`,
        `<path d="M31 38H46" ${common}/>`,
      ].join("");
    case "review":
      return [
        `<circle cx="28" cy="28" r="8" ${common}/>`,
        `<path d="M34 34L42 42" ${common}/>`,
        `<path d="M24.5 28.5L27.5 31.5L32 25.5" ${common}/>`,
      ].join("");
    case "approval":
      return [
        `<path d="M32 18L42 22V30C42 36 38 40.5 32 44C26 40.5 22 36 22 30V22L32 18Z" ${common}/>`,
        `<path d="M27.5 30L31 33.5L37.5 27" ${common}/>`,
      ].join("");
    case "order":
      return [
        `<path d="M22 24H42L40 42H24L22 24Z" ${common}/>`,
        `<path d="M27 24V22C27 19.8 29.2 18 32 18C34.8 18 37 19.8 37 22V24" ${common}/>`,
      ].join("");
    case "payment":
      return [
        `<rect x="18" y="22" width="28" height="20" rx="4" ${common}/>`,
        `<path d="M18 28H46" ${common}/>`,
        `<path d="M24 36H31" ${common}/>`,
      ].join("");
    case "invoice":
      return [
        `<path d="M24 18H38L44 24V44H24Z" ${common}/>`,
        `<path d="M38 18V24H44" ${common}/>`,
        `<path d="M28 30H40" ${common}/>`,
        `<path d="M28 36H40" ${common}/>`,
      ].join("");
    case "shipment":
      return [
        `<path d="M21 28L32 22L43 28L32 34L21 28Z" ${common}/>`,
        `<path d="M21 28V38L32 44L43 38V28" ${common}/>`,
        `<path d="M32 34V44" ${common}/>`,
      ].join("");
    case "ticket":
      return [
        `<path d="M20 24H44V30C41.5 30 39.5 32 39.5 34.5C39.5 37 41.5 39 44 39V44H20V39C22.5 39 24.5 37 24.5 34.5C24.5 32 22.5 30 20 30V24Z" ${common}/>`,
        `<path d="M32 24V44" ${common} stroke-dasharray="3 4"/>`,
      ].join("");
    case "document":
      return [
        `<path d="M22 22H36L42 28V42H22Z" ${common}/>`,
        `<path d="M36 22V28H42" ${common}/>`,
        `<path d="M28 32H36" ${common}/>`,
        `<path d="M28 38H36" ${common}/>`,
      ].join("");
    case "notification":
      return [
        `<path d="M24 38H40L38 34V28C38 23.6 35.3 20.3 32 19C28.7 20.3 26 23.6 26 28V34L24 38Z" ${common}/>`,
        `<path d="M29 42C29.7 43.7 30.8 44.5 32 44.5C33.2 44.5 34.3 43.7 35 42" ${common}/>`,
      ].join("");
    case "user":
      return [
        `<circle cx="32" cy="25" r="6" ${common}/>`,
        `<path d="M22 42C24.4 37.8 28 35.5 32 35.5C36 35.5 39.6 37.8 42 42" ${common}/>`,
      ].join("");
    case "role":
      return [
        `<path d="M32 18L41 22V29C41 35 37 39.5 32 43C27 39.5 23 35 23 29V22L32 18Z" ${common}/>`,
        `<circle cx="32" cy="28" r="3.5" ${common}/>`,
        `<path d="M28 35C29.2 33.8 30.5 33.2 32 33.2C33.5 33.2 34.8 33.8 36 35" ${common}/>`,
      ].join("");
    case "rule":
      return [
        `<path d="M32 20V42" ${common}/>`,
        `<path d="M24 24H40" ${common}/>`,
        `<path d="M24 24L20 30H28L24 24Z" ${common}/>`,
        `<path d="M40 24L36 30H44L40 24Z" ${common}/>`,
        `<path d="M28 40H36" ${common}/>`,
      ].join("");
    case "report":
      return [
        `<path d="M22 42V22" ${common}/>`,
        `<path d="M22 42H44" ${common}/>`,
        `<rect x="26" y="32" width="4" height="10" rx="1.5" ${common}/>`,
        `<rect x="33" y="27" width="4" height="15" rx="1.5" ${common}/>`,
        `<rect x="40" y="24" width="4" height="18" rx="1.5" ${common}/>`,
      ].join("");
    case "record":
      return [
        `<ellipse cx="32" cy="22" rx="11" ry="4.5" ${common}/>`,
        `<path d="M21 22V38C21 40.5 25.9 43 32 43C38.1 43 43 40.5 43 38V22" ${common}/>`,
        `<path d="M21 30C21 32.5 25.9 35 32 35C38.1 35 43 32.5 43 30" ${common}/>`,
      ].join("");
    default:
      return `<rect x="22" y="22" width="20" height="20" rx="6" ${common}/>`;
  }
}

function buildSvg({ token, domain, object, state, domainLabel, objectLabel, stateLabel, fallbackExportIcon, mermaidClass }) {
  const domainColors = domainPalette[domain] ?? domainPalette.operations;
  const stateColors = statePalette[state] ?? statePalette.draft;
  const iconId = safeId(token);
  const bgGradient = `${iconId}-bg`;
  const accentGradient = `${iconId}-accent`;
  const softLift = lighten(domainColors.soft, 0.4);
  const border = domainColors.accent;
  const glyphColor = domainColors.primary;
  const badgeColor = stateColors.color;
  const badgeRing = stateColors.ring;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${iconId}-title ${iconId}-desc">
  <title id="${iconId}-title">${token}</title>
  <desc id="${iconId}-desc">${domainLabel} ${objectLabel} in ${stateLabel} state. Suggested Mermaid class: ${mermaidClass}. Fallback export icon: ${fallbackExportIcon}.</desc>
  <defs>
    <linearGradient id="${bgGradient}" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="${domainColors.soft}" stop-opacity="0.5" />
      <stop offset="1" stop-color="${softLift}"/>
    </linearGradient>
    <linearGradient id="${accentGradient}" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="${domainColors.primary}"/>
      <stop offset="1" stop-color="${domainColors.accent}"/>
    </linearGradient>
    <filter id="${iconId}-shadow" x="2" y="2" width="60" height="60" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0F172A" flood-opacity="0.1"/>
    </filter>
  </defs>
  <g filter="url(#${iconId}-shadow)">
    <!-- Base App-Style Squircle -->
    <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#${bgGradient})" stroke="${border}" stroke-width="1.5" stroke-opacity="0.3"/>
    
    <!-- Central Glyph (Scaled UP!) -->
    <g transform="translate(-14.4, -14.4) scale(1.45)">
      ${renderGlyph(object, glyphColor)}
    </g>

    <!-- State Badge (Bottom Right to not overlap glyph center) -->
    <g transform="translate(50, 50)">
      <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="${badgeRing}" stroke-width="1.5"/>
      ${renderStateBadge(stateColors.symbol, badgeColor)}
    </g>
  </g>
</svg>
`;
}

function buildCatalog(taxonomy, manifestEntries) {
  const domainLines = taxonomy.domains.map((domain) => `- \`${domain.key}\`: ${domain.label}`).join("\n");
  const objectLines = taxonomy.objects
    .map((object) => `- \`${object.key}\`: ${object.label} → class \`${object.mermaidClass}\` → fallback \`${path.basename(object.fallbackExportIcon)}\``)
    .join("\n");
  const stateLines = taxonomy.states.map((state) => `- \`${state.key}\`: ${state.intent}`).join("\n");
  const sampleTokens = manifestEntries.slice(0, 18).map((entry) => `- \`${entry.token}\` → \`${entry.file}\``).join("\n");

  return `# Mermaid Icon Catalog

## Overview

This catalog describes the generated physical SVG icon library for business-flow diagrams.

- Total semantic tokens: \`${taxonomy.tokenCount.toLocaleString("en-US")}\`
- Naming convention: \`${taxonomy.namingConvention}\`
- Output root: \`assets/mermaid-icons/library/\`
- Machine-readable manifest: \`assets/mermaid-icons/library/icon-manifest.json\`

## Domains

${domainLines}

## Objects

${objectLines}

## States

${stateLines}

## Directory pattern

\`assets/mermaid-icons/library/<domain>/<domain>.<object>.<state>.svg\`

## Selection workflow

1. Choose the domain from the business context.
2. Choose the object from the noun or artifact under change.
3. Choose the state from the supported business status.
4. Use the manifest to look up the physical SVG path and fallback export icon.
5. Keep Mermaid source text-first and treat the physical SVGs as export-ready companions.

## Sample generated assets

${sampleTokens}
`;
}

function toPosixRelative(fromFilePath, toFilePath) {
  return path.relative(path.dirname(fromFilePath), toFilePath).split(path.sep).join("/");
}

function buildGalleryMarkdown(taxonomy, manifestEntries) {
  const grouped = new Map();

  for (const entry of manifestEntries) {
    if (!grouped.has(entry.domain)) {
      grouped.set(entry.domain, []);
    }
    grouped.get(entry.domain).push(entry);
  }

  const sections = taxonomy.domains.map((domain) => {
    const entries = grouped.get(domain.key) ?? [];
    const cards = entries
      .map((entry) => {
        const relativeSvg = toPosixRelative(galleryMarkdownPath, path.join(workspaceRoot, entry.file));
        return [
          '<td align="center" valign="top" width="16.6%">',
          `  <img src="${relativeSvg}" width="72" height="72" alt="${entry.token}" />`,
          `  <br /><code>${entry.token}</code>`,
          `  <br /><sub>${entry.object} · ${entry.state}</sub>`,
          "</td>",
        ].join("\n");
      })
      .reduce((rows, card, index) => {
        const rowIndex = Math.floor(index / 6);
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        rows[rowIndex].push(card);
        return rows;
      }, [])
      .map((row) => `<tr>\n${row.join("\n")}\n</tr>`)
      .join("\n");

    return [
      `## ${domain.label}`,
      "",
      `- Domain key: \`${domain.key}\``,
      `- Icon count: \`${entries.length}\``,
      `- Recommended domain glyph family: \`${domain.recommendedGlyph}\``,
      "",
      "<table>",
      cards,
      "</table>",
      "",
    ].join("\n");
  });

  return [
    "# Mermaid Icon Gallery",
    "",
    "This gallery provides a fast in-repo preview of the generated physical SVG icon library grouped by business domain.",
    "",
    `- Total icons: \`${manifestEntries.length.toLocaleString("en-US")}\``,
    "- View the interactive HTML gallery in `docs/icons/mermaid-icon-gallery.html` for search and filtering.",
    "- Use `docs/icons/mermaid-icon-catalog.md` for the structural overview and `icon-manifest.json` for machine-readable lookup.",
    "",
    ...sections,
  ].join("\n");
}

function buildGalleryHtml(taxonomy, manifestEntries) {
  const domainOptions = taxonomy.domains
    .map((domain) => `<option value="${domain.key}">${domain.label}</option>`)
    .join("\n");

  const cards = manifestEntries
    .map((entry) => {
      const svgPath = toPosixRelative(galleryHtmlPath, path.join(workspaceRoot, entry.file));
      return [
        `<article class="card" data-domain="${entry.domain}" data-object="${entry.object}" data-state="${entry.state}" data-token="${entry.token}">`,
        `  <img src="${svgPath}" alt="${entry.token}" loading="lazy" width="80" height="80" />`,
        `  <h3>${entry.token}</h3>`,
        `  <p><strong>Domain:</strong> ${entry.domain}</p>`,
        `  <p><strong>Object:</strong> ${entry.object}</p>`,
        `  <p><strong>State:</strong> ${entry.state}</p>`,
        `  <p><strong>Class:</strong> ${entry.mermaidClass}</p>`,
        `  <code>${entry.file}</code>`,
        "</article>",
      ].join("\n");
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mermaid Icon Gallery</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f8fafc;
      --surface: #ffffff;
      --border: #dbe2ea;
      --text: #0f172a;
      --muted: #475569;
      --accent: #2563eb;
      --accent-soft: #dbeafe;
      --shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    .page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
    .hero {
      background: linear-gradient(135deg, #eff6ff 0%, #ffffff 65%);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--shadow);
      margin-bottom: 24px;
    }
    h1 { margin: 0 0 8px; font-size: 32px; }
    .hero p { margin: 0; color: var(--muted); max-width: 900px; line-height: 1.6; }
    .stats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
    .stat {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 16px;
      min-width: 160px;
    }
    .stat strong { display: block; font-size: 20px; }
    .controls {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 12px;
      margin: 24px 0;
    }
    input, select {
      width: 100%;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid var(--border);
      font: inherit;
      background: var(--surface);
      color: var(--text);
    }
    .summary {
      margin: 0 0 16px;
      color: var(--muted);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
    }
    .card img {
      display: block;
      margin: 0 auto 12px;
      background: linear-gradient(180deg, #f8fafc, #ffffff);
      border-radius: 14px;
    }
    .card h3 {
      font-size: 14px;
      line-height: 1.4;
      margin: 0 0 12px;
      word-break: break-word;
    }
    .card p {
      margin: 6px 0;
      font-size: 13px;
      color: var(--muted);
    }
    code {
      display: block;
      margin-top: 10px;
      padding: 8px 10px;
      border-radius: 10px;
      background: #f1f5f9;
      font-size: 11px;
      line-height: 1.5;
      word-break: break-all;
    }
    .empty {
      display: none;
      padding: 24px;
      background: var(--surface);
      border: 1px dashed var(--border);
      border-radius: 16px;
      color: var(--muted);
      text-align: center;
    }
    @media (max-width: 900px) {
      .controls { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="hero">
      <h1>Mermaid Icon Gallery</h1>
      <p>Interactive preview of the physical SVG icon library for business-flow diagrams. Search by token, filter by domain or lifecycle state, and inspect exact file paths directly in the repository.</p>
      <div class="stats">
        <div class="stat"><strong>${manifestEntries.length.toLocaleString("en-US")}</strong><span>Total icons</span></div>
        <div class="stat"><strong>${taxonomy.domains.length}</strong><span>Domains</span></div>
        <div class="stat"><strong>${taxonomy.objects.length}</strong><span>Objects</span></div>
        <div class="stat"><strong>${taxonomy.states.length}</strong><span>States</span></div>
      </div>
    </section>

    <section class="controls">
      <input id="search" type="search" placeholder="Search token, domain, object, or state…" />
      <select id="domainFilter">
        <option value="">All domains</option>
        ${domainOptions}
      </select>
      <select id="stateFilter">
        <option value="">All states</option>
        ${taxonomy.states.map((state) => `<option value="${state.key}">${state.label}</option>`).join("\n")}
      </select>
    </section>

    <p class="summary" id="summary">Showing all ${manifestEntries.length.toLocaleString("en-US")} icons.</p>
    <div class="empty" id="empty">No icons match the current filters.</div>
    <section class="grid" id="grid">
      ${cards}
    </section>
  </div>

  <script>
    const searchInput = document.getElementById('search');
    const domainFilter = document.getElementById('domainFilter');
    const stateFilter = document.getElementById('stateFilter');
    const summary = document.getElementById('summary');
    const empty = document.getElementById('empty');
    const cards = Array.from(document.querySelectorAll('.card'));

    function applyFilters() {
      const query = searchInput.value.trim().toLowerCase();
      const domain = domainFilter.value;
      const state = stateFilter.value;
      let visibleCount = 0;

      for (const card of cards) {
        const haystack = [
          card.dataset.token,
          card.dataset.domain,
          card.dataset.object,
          card.dataset.state,
        ].join(' ').toLowerCase();

        const matchesQuery = !query || haystack.includes(query);
        const matchesDomain = !domain || card.dataset.domain === domain;
        const matchesState = !state || card.dataset.state === state;
        const visible = matchesQuery && matchesDomain && matchesState;

        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      }

      summary.textContent = 'Showing ' + visibleCount.toLocaleString('en-US') + ' icon' + (visibleCount === 1 ? '' : 's') + (domain ? ' in ' + domain : '') + (state ? ' with state ' + state : '') + '.';
      empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    searchInput.addEventListener('input', applyFilters);
    domainFilter.addEventListener('change', applyFilters);
    stateFilter.addEventListener('change', applyFilters);
    applyFilters();
  </script>
</body>
</html>`;
}

function buildLibraryReadme(taxonomy) {
  return `# Physical Mermaid Icon Library

This folder contains generated SVG assets for the business-flow semantic icon registry.

- Total icons: ${taxonomy.tokenCount}
- Naming convention: ${taxonomy.namingConvention}
- Directory pattern: \
  \
  assets/mermaid-icons/library/<domain>/<domain>.<object>.<state>.svg

Do not hand-edit generated SVGs individually unless you intentionally want to diverge from the generator output.
`;
}

async function main() {
  const taxonomy = JSON.parse(await readFile(taxonomyPath, "utf8"));
  const entries = [];

  await mkdir(outputRoot, { recursive: true });
  await mkdir(path.join(workspaceRoot, "docs/icons"), { recursive: true });

  for (const domain of taxonomy.domains) {
    const domainDir = path.join(outputRoot, domain.key);
    await mkdir(domainDir, { recursive: true });

    for (const object of taxonomy.objects) {
      for (const state of taxonomy.states) {
        const token = `${domain.key}.${object.key}.${state.key}`;
        const fileName = `${token}.svg`;
        const relativeFile = path.posix.join("assets/mermaid-icons/library", domain.key, fileName);
        const filePath = path.join(domainDir, fileName);
        const svg = buildSvg({
          token,
          domain: domain.key,
          object: object.key,
          state: state.key,
          domainLabel: domain.label,
          objectLabel: object.label,
          stateLabel: state.label,
          fallbackExportIcon: object.fallbackExportIcon,
          mermaidClass: object.mermaidClass,
        });

        await writeFile(filePath, svg, "utf8");
        entries.push({
          token,
          file: relativeFile,
          domain: domain.key,
          object: object.key,
          state: state.key,
          mermaidClass: object.mermaidClass,
          fallbackExportIcon: object.fallbackExportIcon,
          recommendedGlyphs: object.recommendedGlyphs ?? [],
          recommendedDomainGlyph: domain.recommendedGlyph,
        });
      }
    }
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    tokenCount: entries.length,
    namingConvention: taxonomy.namingConvention,
    outputRoot: "assets/mermaid-icons/library",
    entries,
  };

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  await writeFile(catalogPath, buildCatalog(taxonomy, entries), "utf8");
  await writeFile(galleryMarkdownPath, buildGalleryMarkdown(taxonomy, entries), "utf8");
  await writeFile(galleryHtmlPath, buildGalleryHtml(taxonomy, entries), "utf8");
  await writeFile(libraryReadmePath, buildLibraryReadme(taxonomy), "utf8");

  console.log(`Generated ${entries.length} icons into ${outputRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
