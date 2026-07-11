// Task 2: verify the official mcp-server-datahub against our lineage client's
// assumptions. Lists tools with their schemas, then exercises search and lineage
// for a showcase-ecommerce entity. Run: node scripts/verify-mcp.mjs [entityName]
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

const MCP_URL = process.env.MCP_SERVER_URL ?? "http://localhost:8000/mcp"
const entity = process.argv[2] ?? "fct_orders"

const client = new Client({ name: "threxa-verify", version: "0.1.0" })
await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)))

const { tools } = await client.listTools()
console.log("=== TOOLS ===")
for (const t of tools) {
  console.log(`\n${t.name}: ${t.description?.slice(0, 200)}`)
  console.log(`  input: ${JSON.stringify(t.inputSchema?.properties ?? {}, null, 0).slice(0, 500)}`)
}

const searchTool = tools.find((t) => t.name.includes("search"))
if (searchTool) {
  console.log(`\n=== SEARCH (${searchTool.name}) for "${entity}" ===`)
  try {
    const res = await client.callTool({ name: searchTool.name, arguments: { query: entity } })
    for (const c of res.content ?? []) {
      if (c.type === "text") console.log(c.text.slice(0, 3000))
    }
  } catch (err) {
    console.log("search failed:", err.message)
  }
}

const lineageTool = tools.find((t) => t.name.includes("lineage"))
if (lineageTool) {
  console.log(`\n=== LINEAGE TOOL AVAILABLE: ${lineageTool.name} ===`)
  console.log("call it manually once a URN is known from search output")
}

await client.close()
