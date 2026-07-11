const stack = [
  ["GitHub", "webhooks and PR comments"],
  ["DataHub", "lineage, owners, write-back"],
  ["MCP", "official mcp-server-datahub"],
  ["dbt", "model and schema parsing"],
  ["Groq", "diff parsing and prose"],
  ["Postgres", "run history"],
]

export function StackRow() {
  return (
    <section className="border-b border-hairline px-4 py-14" id="stack">
      <div className="mx-auto max-w-6xl">
        <h2 className="eyebrow-ticks text-center font-mono text-xs font-normal uppercase tracking-[0.22em] text-ink-soft">
          Built on the tools already in your stack
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-6">
          {stack.map(([name, note]) => (
            <div key={name} className="bg-paper px-4 py-5 text-center">
              <p className="font-display text-lg font-bold text-ink">{name}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
