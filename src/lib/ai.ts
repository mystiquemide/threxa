// LLM access via Groq's OpenAI-compatible API. All calls go through here:
// structured output uses forced tool calling (AGENTS.md rule: no raw
// JSON.parse on free-text completions).

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

async function chat(body: Record<string, unknown>): Promise<{
  content: string | null
  toolArguments: string | null
}> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, temperature: 0.2, ...body }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Groq API ${res.status}: ${detail.slice(0, 300)}`)
  }
  const json = (await res.json()) as {
    choices: {
      message: {
        content: string | null
        tool_calls?: { function: { arguments: string } }[]
      }
    }[]
  }
  const message = json.choices[0]?.message
  return {
    content: message?.content ?? null,
    toolArguments: message?.tool_calls?.[0]?.function.arguments ?? null,
  }
}

/**
 * Forced-tool-call structured output: the model must call the single provided
 * tool, so the result is schema-shaped JSON, never free text.
 */
export async function structured<T>(opts: {
  system: string
  prompt: string
  toolName: string
  toolDescription: string
  schema: Record<string, unknown>
  maxTokens?: number
}): Promise<T> {
  const { toolArguments } = await chat({
    max_tokens: opts.maxTokens ?? 4096,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.prompt },
    ] satisfies ChatMessage[],
    tools: [
      {
        type: "function",
        function: {
          name: opts.toolName,
          description: opts.toolDescription,
          parameters: opts.schema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: opts.toolName } },
  })
  if (!toolArguments) throw new Error("Model did not return structured output")
  return JSON.parse(toolArguments) as T
}

/** Plain prose completion for explanations and fix suggestions. */
export async function prose(system: string, prompt: string): Promise<string> {
  const { content } = await chat({
    max_tokens: 1500,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ] satisfies ChatMessage[],
  })
  return (content ?? "").trim()
}

/** One retry with backoff for transient API failures (ADR failure path). */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (first) {
    await new Promise((r) => setTimeout(r, 2000))
    try {
      return await fn()
    } catch {
      throw first
    }
  }
}
