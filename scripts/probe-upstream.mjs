import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

const client = new Client({ name: "threxa-probe", version: "0.1.0" })
await client.connect(
  new StreamableHTTPClientTransport(new URL(process.env.MCP_SERVER_URL ?? "http://localhost:8000/mcp"))
)
const urn = process.argv[2]
const res = await client.callTool(
  {
    name: "get_lineage",
    arguments: {
      urn,
      upstream: process.argv[3] !== "down",
      max_hops: Number(process.argv[4] ?? 1),
      max_results: Number(process.argv[5] ?? 10),
    },
  },
  undefined,
  { timeout: 240000 }
)
for (const c of res.content ?? []) if (c.type === "text") console.log(c.text.slice(0, 4000))
await client.close()
