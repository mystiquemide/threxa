// F3 lineage client: deterministic traversal against the official mcp-server-datahub
// over streamable HTTP (ADR-2). Tool names, argument shapes, and response shapes
// verified against mcp-server-datahub 0.6.0 with the showcase-ecommerce datapack
// (scripts/verify-mcp.mjs, probe-*.mjs).
//
// Verified facts:
// - tools: search, get_lineage, get_entities, list_schema_fields, get_dataset_queries
// - get_lineage returns {downstreams|upstreams: {total, searchResults: [{entity}]}}
//   and accepts a `column` argument for true column-level lineage
// - multi-hop queries can exceed GMS slice timeouts on small instances, so we BFS
//   with 1-hop calls and track hop distance ourselves
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import type { ChangeIntent, ImpactedAsset } from "@/lib/types"

const MAX_HOPS = 2
const MAX_PER_HOP = 15
/** Cap the BFS frontier so hop-2 fan-out stays within the latency budget. */
const MAX_FRONTIER = 10
const CONCURRENCY = 5
const CALL_TIMEOUT_MS = 120_000

/** Run tasks with bounded concurrency; GMS on small instances chokes on more. */
async function pMap<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    results.push(...(await Promise.all(items.slice(i, i + CONCURRENCY).map(fn))))
  }
  return results
}

async function connect(): Promise<Client> {
  const client = new Client({ name: "threxa", version: "0.1.0" })
  const transport = new StreamableHTTPClientTransport(
    new URL(process.env.MCP_SERVER_URL ?? "http://localhost:8000/mcp")
  )
  await client.connect(transport)
  return client
}

async function callToolJson(
  client: Client,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const result = await client.callTool({ name, arguments: args }, undefined, {
    timeout: CALL_TIMEOUT_MS,
  })
  const text = ((result as { content?: { type: string; text?: string }[] }).content ?? [])
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text)
    .join("\n")
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

interface EntityNode {
  urn?: string
  type?: string
  name?: string
  properties?: { name?: string }
  ownership?: {
    owners?: { owner?: { name?: string; properties?: { displayName?: string } } }[]
  }
}

function parseLineageEntities(json: unknown): EntityNode[] {
  const o = json as {
    downstreams?: { searchResults?: { entity?: EntityNode }[] }
    upstreams?: { searchResults?: { entity?: EntityNode }[] }
  } | null
  const results = o?.downstreams?.searchResults ?? o?.upstreams?.searchResults ?? []
  return results.map((r) => r.entity ?? {}).filter((e) => e.urn)
}

function displayName(e: EntityNode): string {
  return e.properties?.name ?? e.name ?? e.urn?.split(",").at(-2) ?? e.urn ?? "unknown"
}

function ownerOf(e: EntityNode): string | undefined {
  const owner = e.ownership?.owners?.[0]?.owner
  return owner?.properties?.displayName ?? owner?.name
}

export interface LineageResult {
  /** entity name (as in the diff) -> resolved URN */
  resolved: Map<string, string>
  unresolved: string[]
  /** downstream assets per touched entity, severity left unset (scorer's job) */
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

      // Entity-level BFS, 1-hop calls with exact hop tracking, parallel per hop.
      const found = new Map<string, Omit<ImpactedAsset, "severity">>()
      let frontier = [urn]
      for (let hop = 1; hop <= MAX_HOPS && frontier.length > 0; hop++) {
        const next: string[] = []
        const responses = await pMap(frontier.slice(0, MAX_FRONTIER), (u) =>
          callToolJson(client, "get_lineage", {
            urn: u,
            upstream: false,
            max_hops: 1,
            max_results: MAX_PER_HOP,
          })
        )
        for (const json of responses) {
          for (const e of parseLineageEntities(json)) {
            if (e.urn === urn || found.has(e.urn as string)) continue
            found.set(e.urn as string, {
              urn: e.urn as string,
              name: displayName(e),
              entityType: (e.type ?? "dataset").toLowerCase(),
              owner: ownerOf(e),
              hop,
              sourceEntity: entity,
            })
            next.push(e.urn as string)
          }
        }
        frontier = next
      }

      // Column-level lineage for destructive column intents: consumers of the
      // specific column get viaColumn set (the scorer's BREAKING signal).
      const columns = [
        ...new Set(
          intents
            .filter((i) => i.entity === entity && i.column)
            .map((i) => i.column as string)
        ),
      ]
      for (const column of columns) {
        const json = await callToolJson(client, "get_lineage", {
          urn,
          column,
          upstream: false,
          max_hops: 1,
          max_results: MAX_PER_HOP,
        })
        for (const e of parseLineageEntities(json)) {
          const existing = found.get(e.urn as string)
          if (existing) {
            existing.viaColumn = existing.viaColumn ?? column
          } else {
            found.set(e.urn as string, {
              urn: e.urn as string,
              name: displayName(e),
              entityType: (e.type ?? "dataset").toLowerCase(),
              owner: ownerOf(e),
              hop: 1,
              viaColumn: column,
              sourceEntity: entity,
            })
          }
        }
      }

      // Fallback only when the catalog has no fine-grained lineage at all for
      // this entity: a direct downstream whose schema carries the same field
      // name counts as consuming the column. Skipped when column-level lineage
      // already produced hits, so the happy path pays zero extra calls.
      const anyVia = [...found.values()].some((f) => f.viaColumn)
      const hop1NoVia = [...found.values()].filter((f) => f.hop === 1 && !f.viaColumn)
      if (columns.length > 0 && !anyVia && hop1NoVia.length > 0) {
        await pMap(hop1NoVia, async (asset) => {
          const json = await callToolJson(client, "list_schema_fields", {
            urn: asset.urn,
            keywords: columns,
          })
          const fields =
            (json as { fields?: { fieldPath?: string }[] } | null)?.fields ?? []
          const hit = columns.find((c) =>
            fields.some((f) => f.fieldPath?.toLowerCase() === c.toLowerCase())
          )
          if (hit) asset.viaColumn = hit
        })
      }

      impacts.push(...found.values())
    }
    return { resolved, unresolved, impacts }
  } finally {
    await client.close().catch(() => {})
  }
}

async function resolveUrn(client: Client, entity: string): Promise<string | null> {
  const json = await callToolJson(client, "search", {
    query: entity,
    num_results: 10,
  })
  const results =
    (json as { searchResults?: { entity?: EntityNode }[] } | null)?.searchResults ?? []
  const datasets = results
    .map((r) => r.entity ?? {})
    .filter((e) => e.urn?.startsWith("urn:li:dataset:"))
  const exact = datasets.find(
    (e) => displayName(e).toLowerCase() === entity.toLowerCase()
  )
  return exact?.urn ?? datasets[0]?.urn ?? null
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
