export interface LlmRunInput {
  prompt: string;
  model?: string;
}

export async function runLlmPrompt(input: LlmRunInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = input.model ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: "Follow the provided prompt contract exactly. Return only the final markdown artifact requested.",
        },
        {
          role: "user",
          content: input.prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("LLM response did not include markdown content.");
  }

  return content;
}

export function resolveExecutionMode(requestedMode: "auto" | "llm" | "heuristic" | "dry-run"): "llm" | "heuristic" | "dry-run" {
  if (requestedMode === "auto") {
    return process.env.OPENAI_API_KEY ? "llm" : "heuristic";
  }

  return requestedMode;
}
