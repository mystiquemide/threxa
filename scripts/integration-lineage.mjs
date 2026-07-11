// Task 2 acceptance: run the real pipeline lineage stage against the live
// DataHub + MCP server. Simulates a PR dropping cust_email from order_details.
const { computeLineage } = await import(
  "../src/lib/pipeline/lineage.ts"
)

const intents = [
  {
    entity: "order_details",
    column: "cust_email",
    changeType: "COLUMN_DROPPED",
    detail: "integration test: drop cust_email",
  },
]

const started = Date.now()
const result = await computeLineage(intents)
const elapsed = ((Date.now() - started) / 1000).toFixed(1)

console.log(`elapsed: ${elapsed}s`)
console.log(`resolved: ${JSON.stringify([...result.resolved.entries()])}`)
console.log(`unresolved: ${JSON.stringify(result.unresolved)}`)
console.log(`impacts: ${result.impacts.length}`)
for (const i of result.impacts) {
  console.log(
    `  hop=${i.hop} via=${i.viaColumn ?? "-"} [${i.entityType}] ${i.name} owner=${i.owner ?? "?"}`
  )
}
