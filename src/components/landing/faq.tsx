"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "How is this different from CI schema checks?",
    a: "Schema checks see the diff. Threxa sees the consequences: it walks live DataHub lineage to find every dashboard, table, and feature downstream of the change, checks whether affected columns are actually consumed, and names the owners. A rename that passes every static check can still be BREAKING two hops away.",
  },
  {
    q: "How is severity decided?",
    a: "By deterministic code, not by a model. A destructive change to a column that downstream assets consume is BREAKING. Destructive or logic changes with consumers are RISKY. Additive changes with no affected consumers are SAFE. If an entity cannot be resolved in the catalog, the verdict is never SAFE, because unknown blast radius is a risk.",
  },
  {
    q: "What does the LLM actually do?",
    a: "Two jobs at the edges: parsing raw SQL diffs into structured change intents, and writing the plain-language explanation with a migration path. Lineage traversal, column-consumption checks, and scoring are all plain code you can audit.",
  },
  {
    q: "What gets written back to DataHub?",
    a: "Every completed analysis appends a change record to the touched entities: date, severity, PR link, and what changed. When a PR with a BREAKING verdict merges, Threxa also raises incidents on the downstream assets it identified.",
  },
  {
    q: "What happens when the catalog is unreachable?",
    a: "The run fails loudly. Threxa posts a comment saying the analysis could not complete and that the change should be treated as unreviewed. It never silently passes a change as SAFE without lineage.",
  },
  {
    q: "How fast is a verdict?",
    a: "The lineage stage resolves a 22-asset blast radius across 2 hops in about 24 seconds against a live catalog. End to end, PR open to posted comment stays under a minute.",
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="border-b border-hairline px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="eyebrow-ticks text-center font-mono text-xs font-normal uppercase tracking-[0.22em] text-ink-soft">
          Questions engineers ask
        </h2>
        <div className="mt-10 border-t border-hairline">
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b border-hairline">
              <button
                className="flex w-full items-center justify-between py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-display text-base font-semibold text-ink">
                  {f.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <p className="pb-5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
