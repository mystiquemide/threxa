// Capture real get_lineage response shapes for the lineage client rewrite.
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

const MCP_URL = process.env.MCP_SERVER_URL ?? "http://localhost:8000/mcp"
const urn =
  process.argv[2] ??
  "urn:li:dataset:(urn:li:dataPlatform:snowflake,b2fd91.order_entry_db.order_entry.orders,PROD)"
const column = process.argv[3]

const client = new Client({ name: "threxa-probe", version: "0.1.0" })
await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)))

const args = { urn, upstream: false, max_hops: 3, max_results: 50 }
if (column) args.column = column
const res = await client.callTool({ name: "get_lineage", arguments: args })
for (const c of res.content ?? []) {
  if (c.type === "text") console.log(c.text.slice(0, 6000))
}
await client.close()
