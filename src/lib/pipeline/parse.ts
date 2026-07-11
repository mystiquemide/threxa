import { structured, withRetry } from "@/lib/ai"
import type { PrFile } from "@/lib/github"
import type { ChangeIntent } from "@/lib/types"

const SYSTEM = `You are a data-engineering change analyzer. You read unified diffs of SQL and dbt model files and extract every schema-relevant change. Be precise: only report changes visible in the diff. The entity name is the dbt model name (file basename without extension) or the table being altered in DDL. Never invent entities or columns that are not in the diff.`

const SCHEMA = {
  type: "object" as const,
  properties: {
    intents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity: { type: "string", description: "Model or table name, e.g. fct_orders" },
          column: { type: "string", description: "Column affected, omit for entity-level changes" },
          changeType: {
            type: "string",
            enum: [
              "COLUMN_DROPPED",
              "COLUMN_RENAMED",
              "COLUMN_ADDED",
              "TYPE_CHANGED",
              "LOGIC_CHANGED",
              "ENTITY_DROPPED",
            ],
          },
          detail: { type: "string", description: "One sentence describing the specific change" },
          renamedTo: { type: "string", description: "New column name, only for COLUMN_RENAMED" },
        },
        required: ["entity", "changeType", "detail"],
      },
    },
  },
  required: ["intents"],
}

/** F2: diff in, structured ChangeIntents out. No lineage, no severity here. */
export async function parseChanges(files: PrFile[]): Promise<ChangeIntent[]> {
  const diff = files
    .map((f) => `--- ${f.filename} (${f.status}) ---\n${f.patch ?? "(no patch: binary or too large)"}`)
    .join("\n\n")

  const { intents } = await withRetry(() =>
    structured<{ intents: ChangeIntent[] }>({
      system: SYSTEM,
      prompt: `Extract all schema-relevant change intents from this pull request diff:\n\n${diff}`,
      toolName: "report_change_intents",
      toolDescription: "Report the structured list of data model changes found in the diff",
      schema: SCHEMA,
    })
  )
  return intents
}
