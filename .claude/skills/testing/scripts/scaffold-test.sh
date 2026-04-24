#!/usr/bin/env bash
set -euo pipefail

OUTPUT_SLUG="${1:-example-flow}"
RESULT_ROOT="business-flow/${OUTPUT_SLUG}"

mkdir -p "$RESULT_ROOT"/{01-source,02-analysis,03-mermaid,04-prompts,10-reports}

echo "Scaffolded $RESULT_ROOT"
