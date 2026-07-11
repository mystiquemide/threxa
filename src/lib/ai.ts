import Anthropic from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = "claude-sonnet-5"

/**
 * Forced-tool-use structured output. Claude must call the single provided tool,
 * so the result is schema-shaped JSON, never free text (AGENTS.md rule).
 */
export async function structured<T>(opts: {
  system: string
  prompt: string
  toolName: string
  toolDescription: string
  schema: Anthropic.Tool.InputSchema
  maxTokens?: number
}): Promise<T> {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
    tools: [
      {
        name: opts.toolName,
        description: opts.toolDescription,
        input_schema: opts.schema,
      },
    ],
    tool_choice: { type: "tool", name: opts.toolName },
  })
  const block = res.content.find((b) => b.type === "tool_use")
  if (!block || block.type !== "tool_use") {
    throw new Error("Model did not return structured output")
  }
  return block.input as T
}

/** Plain prose completion for explanations and fix suggestions. */
export async function prose(system: string, prompt: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: prompt }],
  })
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim()
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
