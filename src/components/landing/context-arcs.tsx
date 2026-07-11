import { Reveal } from "./reveal"

const sources = [
  "Downstream lineage",
  "Column usage",
  "Asset owners",
  "Schema fields",
  "Entity types",
  "Hop distance",
  "Merge state",
]

export function ContextArcs() {
  const w = 900
  const cx = w / 2
  return (
    <section className="border-b border-hairline px-4 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="eyebrow-ticks font-mono text-xs font-normal uppercase tracking-[0.22em] text-ink-soft">
          Every verdict is grounded in the context graph
        </h2>
        <Reveal className="mt-8">
          <svg viewBox={`0 0 ${w} 240`} className="mx-auto w-full max-w-3xl" aria-hidden>
            {sources.map((_, i) => {
              const x = 60 + (i * (w - 120)) / (sources.length - 1)
              return (
                <g key={i}>
                  <path
                    d={`M ${x} 60 Q ${(x + cx) / 2} ${170 + Math.abs(cx - x) * 0.12} ${cx} 200`}
                    fill="none"
                    stroke="rgba(20,20,28,0.28)"
                    strokeWidth="1"
                  />
                  <circle cx={x} cy={60} r="3.5" fill="#c96b6e" />
                </g>
              )
            })}
            <circle cx={cx} cy={200} r="5" fill="#14141c" />
          </svg>
          <div className="-mt-2 grid grid-cols-4 gap-y-3 font-mono text-[11px] text-ink-soft sm:grid-cols-7">
            {sources.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <p className="mt-8 font-mono text-sm text-ink">
            &darr; one severity: SAFE / RISKY / BREAKING
          </p>
        </Reveal>
      </div>
    </section>
  )
}
