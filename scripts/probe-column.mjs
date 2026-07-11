import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

const client = new Client({ name: "threxa-probe", version: "0.1.0" })
await client.connect(
  new StreamableHTTPClientTransport(new URL("http://localhost:8000/mcp"))
)
const urn =
  "urn:li:dataset:(urn:li:dataPlatform:snowflake,b2fd91.order_entry_db.analytics.order_details,PROD)"

const fields = await client.callTool(
  { name: "list_schema_fields", arguments: { urn } },
  undefined,
  { timeout: 120000 }
)
console.log("=== SCHEMA FIELDS ===")
for (const c of fields.content ?? []) if (c.type === "text") console.log(c.text.slice(0, 1500))

const colArg = process.argv[2]
if (colArg) {
  console.log(`\n=== DOWNSTREAM OF COLUMN ${colArg} ===`)
  const res = await client.callTool(
    {
      name: "get_lineage",
      arguments: { urn, column: colArg, upstream: false, max_hops: 1, max_results: 10 },
    },
    undefined,
    { timeout: 120000 }
  )
  for (const c of res.content ?? []) if (c.type === "text") console.log(c.text.slice(0, 2500))
}
await client.close()
