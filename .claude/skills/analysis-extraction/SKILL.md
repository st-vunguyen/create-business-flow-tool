# Analysis Extraction Skill

## Use this skill when

- the task is to derive actors, triggers, steps, decisions, outcomes, or questions
- heuristic logic in `src/core/heuristics.ts` needs to change
- the business-flow document structure is being reviewed or improved

## Goal

Turn normalized source evidence into a business-flow analysis without overstating certainty.

## Workflow

1. Start from numbered source lines, not memory or assumptions.
2. Extract explicit structure first: goal, actors, steps, touchpoints, outcomes.
3. Use inference only when it is narrowly supported by nearby text.
4. Keep one table row close to one business action.
5. Emit questions or assumptions instead of inventing missing facts.
