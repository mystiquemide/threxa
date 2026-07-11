// F3 lineage client: deterministic traversal against the official mcp-server-datahub
// sidecar over streamable HTTP (ADR-2). Tool names and result shapes are verified
// against the live server in Task 2; parsing is defensive on purpose.
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import type { ChangeIntent, ImpactedAsset } from "@/lib/types"

const MAX_HOPS = 3

async function connect(): Promise<Client> {
  const client = new Client({ name: "threxa", version: "0.1.0" })
  const transport = new StreamableHTTPClientTransport(
    new URL(process.env.MCP_SERVER_URL ?? "http://localhost:8000/mcp")
  )
  await client.connect(transport)
  return client
}

function textContent(result: unknown): string {
  const content = (result as { content?: { type: string; text?: string }[] }).content
  return (content ?? [])
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text)
    .join("\n")
}

function tryJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export interface LineageResult {
  /** entity name (as in the diff) -> resolved URN */
  resolved: Map<string, string>
  unresolved: string[]
  /** raw downstream assets per touched entity, severity left UNSET (scorer's job) */
  impacts: Omit<ImpactedAsset, "severity">[]
}

export async function computeLineage(intents: ChangeIntent[]): Promise<LineageResult> {
  const client = await connect()
  try {
    const entities = [...new Set(intents.map((i) => i.entity))]
    const resolved = new Map<string, string>()
    const unresolved: string[] = []
    const impacts: Omit<ImpactedAsset, "severity">[] = []

    for (const entity of entities) {
      const urn = await resolveUrn(client, entity)
      if (!urn) {
        unresolved.push(entity)
        continue
      }
      resolved.set(entity, urn)
      const downstream = await downstreamAssets(client, urn)

      // Column-level consumption check (hop 1 only): a dropped/renamed column
      // counts as consumed when a direct downstream schema carries the same field.
      const columns = intents
        .filter((i) => i.entity === entity && i.column)
        .map((i) => i.column as string)
      for (const asset of downstream) {
        let viaColumn: string | undefined
        if (asset.hop === 1 && columns.length > 0) {
          const fields = await schemaFields(client, asset.urn)
          viaColumn = columns.find((c) =>
            fields.some((f) => f.toLowerCase() === c.toLowerCase())
          )
        }
        impacts.push({ ...asset, viaColumn, sourceEntity: entity })
      }
    }
    return { resolved, unresolved, impacts }
  } finally {
    await client.close().catch(() => {})
  }
}

async function resolveUrn(client: Client, entity: string): Promise<string | null> {
  const result = await client.callTool({
    name: "search",
    arguments: { query: entity, num_results: 5 },
  })
  const text = textContent(result)
  // Prefer a structured hit whose name matches exactly; fall back to first URN in text.
  const json = tryJson(text) as
    | { entities?: { urn?: string; name?: string }[]; searchResults?: { entity?: { urn?: string; name?: string } }[] }
    | null
  const candidates: { urn?: string; name?: string }[] = json?.entities
    ? json.entities
    : json?.searchResults
      ? json.searchResults.map((r) => r.entity ?? {})
      : []
  const exact = candidates.find(
    (c) => c.name?.toLowerCase() === entity.toLowerCase() && c.urn
  )
  if (exact?.urn) return exact.urn
  if (candidates[0]?.urn) return candidates[0].urn
  const match = text.match(/urn:li:dataset:[^\s"',)\]]+/)
  return match ? match[0] : null
}

async function downstreamAssets(
  client: Client,
  urn: string
): Promise<{ urn: string; name: string; entityType: string; owner?: string; hop: number }[]> {
  const result = await client.callTool({
    name: "get_lineage",
    arguments: { urn, upstream: false, max_hops: MAX_HOPS },
  })
  const json = tryJson(textContent(result))
  if (!json) return []

  // Accept both flat lists and nested { entity, degree } shapes.
  const rows: { urn: string; name: string; entityType: string; owner?: string; hop: number }[] = []
  const visit = (node: unknown, hop: number) => {
    if (Array.isArray(node)) return node.forEach((n) => visit(n, hop))
    if (typeof node !== "object" || node === null) return
    const o = node as Record<string, unknown>
    const entity = (o.entity ?? o) as Record<string, unknown>
    const entityUrn = entity.urn as string | undefined
    if (entityUrn && entityUrn !== urn) {
      const owners = entity.owners as { owner?: { username?: string; name?: string } }[] | undefined
      rows.push({
        urn: entityUrn,
        name: (entity.name as string) ?? entityUrn.split(",").at(-2) ?? entityUrn,
        entityType: (entity.type as string) ?? (entity.entityType as string) ?? "dataset",
        owner: owners?.[0]?.owner?.username ?? owners?.[0]?.owner?.name,
        hop: typeof o.degree === "number" ? (o.degree as number) : hop,
      })
    }
    for (const key of ["downstreams", "relationships", "entities", "results", "lineage"]) {
      if (o[key]) visit(o[key], hop + (entityUrn && entityUrn !== urn ? 1 : 0))
    }
  }
  visit(json, 1)

  // De-duplicate by urn, keep the closest hop.
  const byUrn = new Map<string, (typeof rows)[number]>()
  for (const row of rows) {
    const prev = byUrn.get(row.urn)
    if (!prev || row.hop < prev.hop) byUrn.set(row.urn, row)
  }
  return [...byUrn.values()]
}

async function schemaFields(client: Client, urn: string): Promise<string[]> {
  try {
    const result = await client.callTool({
      name: "get_entity",
      arguments: { urn },
    })
    const text = textContent(result)
    const json = tryJson(text) as {
      schemaMetadata?: { fields?: { fieldPath?: string }[] }
      schema?: { fields?: { fieldPath?: string }[] }
    } | null
    const fields =
      json?.schemaMetadata?.fields ?? json?.schema?.fields ?? []
    if (fields.length > 0) {
      return fields.map((f) => f.fieldPath ?? "").filter(Boolean)
    }
    // Fallback: field paths mentioned anywhere in the text response.
    return [...text.matchAll(/"fieldPath"\s*:\s*"([^"]+)"/g)].map((m) => m[1])
  } catch {
    return []
  }
}

export async function mcpReachable(): Promise<boolean> {
  try {
    const client = await connect()
    await client.close()
    return true
  } catch {
    return false
  }
}
