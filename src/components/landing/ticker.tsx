const items = [
  "Column-level lineage: 8 consumers of cust_email flagged before merge",
  "Full blast radius across 2 hops computed in 24 seconds",
  "Every verdict written back to the catalog as institutional memory",
  "BREAKING verdicts set a failing commit status until resolved",
  "Built on the official DataHub MCP server",
]

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <span aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="px-6">{item}</span>
          <span className="text-coral">&#8859;</span>
        </span>
      ))}
    </span>
  )
}

export function Ticker() {
  return (
    <div className="overflow-hidden border-b border-hairline bg-paper py-2 whitespace-nowrap">
      <div className="animate-marquee inline-block font-mono text-[13px] text-ink">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
