import { Reveal } from "./reveal"

interface Row {
  eyebrow: string
  title: string
  body: string
  note: string
  mock: React.ReactNode
  flip?: boolean
}

function MockShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline bg-white shadow-[6px_6px_0_0_rgba(20,20,28,0.08)]">
      <div className="border-b border-hairline px-4 py-2 font-mono text-xs text-ink-soft">
        {title}
      </div>
      <div className="p-4 font-mono text-[11px] leading-relaxed text-ink">{children}</div>
    </div>
  )
}

const rows: Row[] = [
  {
    eyebrow: "Parse",
    title: "The diff becomes structured intent",
    body: "Threxa reads the raw SQL diff and extracts exactly what changed: columns dropped, renamed, retyped, logic rewritten. No hand-written rules per warehouse dialect, and nothing invented that is not in the diff.",
    note: "field note: a one-line SELECT edit resolves to COLUMN_DROPPED cust_email on order_details",
    mock: (
      <MockShell title="change intents - #14">
        <pre className="whitespace-pre-wrap">{`- c.cust_email,
=> {
  "entity": "order_details",
  "column": "cust_email",
  "changeType": "COLUMN_DROPPED"
}`}</pre>
      </MockShell>
    ),
  },
  {
    eyebrow: "Score",
    title: "Severity is computed, never vibes",
    body: "Lineage traversal and scoring are deterministic code. A dropped column that downstream assets actually consume is BREAKING. An additive change with no consumers is SAFE. An entity the catalog cannot resolve is never SAFE, unknown blast radius is a risk by definition.",
    note: "field note: 22 downstream assets across 2 hops resolved in 24 seconds on live lineage",
    flip: true,
    mock: (
      <MockShell title="score.ts - deterministic">
        <pre className="whitespace-pre-wrap">{`viaColumn || entityDropped  -> BREAKING
destructive || logicChange  -> RISKY
additive, no consumers      -> SAFE
unresolved entity           -> never SAFE`}</pre>
      </MockShell>
    ),
  },
  {
    eyebrow: "Write back",
    title: "The catalog remembers every change",
    body: "Each analysis appends a change record to the touched DataHub entities. When a breaking PR merges anyway, Threxa raises incidents on the downstream assets it named. Six months later, the catalog still knows which PR broke what.",
    note: "field note: change records and incidents land via DataHub GraphQL, readable by every tool in the stack",
    mock: (
      <MockShell title="graphql - write-back">
        <pre className="whitespace-pre-wrap">{`updateDescription(order_details)
  + 2026-07-11 [BREAKING] PR #14
raiseIncident(customer_analytics)
  "Breaking upstream change merged"`}</pre>
      </MockShell>
    ),
  },
]

export function FeatureRows() {
  return (
    <section className="border-b border-hairline px-4 py-20" id="blast-radius">
      <div className="mx-auto max-w-6xl space-y-20">
        {rows.map((row) => (
          <Reveal key={row.eyebrow}>
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 ${row.flip ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <p className="eyebrow-ticks font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
                  {row.eyebrow}
                </p>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  {row.title}
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft">{row.body}</p>
                <p className="mt-6 border-l-2 border-coral pl-3 font-mono text-xs text-ink-soft">
                  {row.note}
                </p>
              </div>
              <div>{row.mock}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
