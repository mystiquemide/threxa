import { Reveal } from "./reveal"

const cases = [
  {
    verdict: "BREAKING",
    tone: "text-coral",
    title: "Drop cust_email from order_details",
    detail:
      "Column-level lineage finds 8 direct consumers, from PowerBI measures to a replica table. The PR gets a failing status and a staged migration path.",
  },
  {
    verdict: "RISKY",
    tone: "text-ink",
    title: "Rewrite the order_history filter",
    detail:
      "No columns change shape, but the logic feeding downstream marts does. Consumers get named so the author knows exactly who to warn.",
  },
  {
    verdict: "SAFE",
    tone: "text-ink-soft",
    title: "Add is_express_delivery flag",
    detail:
      "Additive only. Nothing downstream reads a column that changed, so the verdict says so and stays out of the way.",
  },
]

export function CaseCards() {
  return (
    <section className="border-b border-hairline px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="eyebrow-ticks text-center font-mono text-xs font-normal uppercase tracking-[0.22em] text-ink-soft">
          Three PRs, three correct calls
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.verdict} delay={i * 0.08}>
              <div className="flex h-full flex-col border border-hairline bg-white p-6 shadow-[6px_6px_0_0_rgba(20,20,28,0.08)]">
                <span className={`font-mono text-xs font-semibold ${c.tone}`}>
                  [{c.verdict}]
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
