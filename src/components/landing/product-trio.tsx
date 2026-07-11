import { Reveal } from "./reveal"

function PanelChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline bg-white text-left shadow-[6px_6px_0_0_rgba(20,20,28,0.08)]">
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2">
        <span className="h-2 w-2 rounded-full border border-ink/30" />
        <span className="h-2 w-2 rounded-full border border-ink/30" />
        <span className="font-mono text-xs text-ink-soft">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function VerdictComment() {
  return (
    <PanelChrome title="pull request #14 - conversation">
      <div className="space-y-3 font-mono text-[11px] leading-relaxed">
        <p className="font-sans text-sm font-semibold text-ink">
          Threxa verdict: <span className="bg-wash px-1.5 py-0.5 text-coral">BREAKING</span>
        </p>
        <p className="text-ink-soft">
          1 change detected, 22 downstream assets in the blast radius.
        </p>
        <div className="border border-hairline">
          <div className="grid grid-cols-4 gap-2 border-b border-hairline bg-paper px-2 py-1 text-ink-soft">
            <span>asset</span>
            <span>owner</span>
            <span>hop</span>
            <span>via</span>
          </div>
          {[
            ["Customer Analytics", "Karen O.", "1", "cust_email"],
            ["ORDER_DETAILS_REPLICA", "Fiona G.", "1", "cust_email"],
            ["datahub_order_entries", "Sarah C.", "2", "-"],
          ].map((r) => (
            <div key={r[0]} className="grid grid-cols-4 gap-2 border-b border-hairline px-2 py-1 last:border-0 text-ink">
              {r.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          ))}
        </div>
        <p className="text-ink-soft">
          Suggested fix: deprecate first. Keep cust_email as a passthrough for one
          release, migrate the 8 consumers, then drop.
        </p>
      </div>
    </PanelChrome>
  )
}

function BlastRadius() {
  return (
    <PanelChrome title="threxa - run detail">
      <div className="space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-semibold text-ink">
            #14 drop cust_email from order_details
          </span>
        </div>
        {[
          ["hop 1", 14, "bg-coral/70"],
          ["hop 2", 8, "bg-coral/40"],
          ["via column", 8, "bg-ink/80"],
        ].map(([label, n, tone]) => (
          <div key={label as string} className="flex items-center gap-2">
            <span className="w-20 text-ink-soft">{label}</span>
            <div className="h-4 flex-1 border border-hairline bg-paper">
              <div
                className={`h-full ${tone}`}
                style={{ width: `${((n as number) / 22) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-ink">{n}</span>
          </div>
        ))}
        <p className="pt-1 text-ink-soft">
          22 assets resolved from live lineage in 24s. Severity is computed, not
          guessed: missing lineage can never score SAFE.
        </p>
      </div>
    </PanelChrome>
  )
}

function WriteBack() {
  return (
    <PanelChrome title="datahub - order_details">
      <div className="space-y-2 font-mono text-[11px] leading-relaxed">
        <p className="font-sans text-sm font-semibold text-ink">Threxa change log</p>
        <div className="border-l-2 border-coral pl-3 text-ink">
          2026-07-11 [BREAKING] refactor: drop cust_email from order_details
          <span className="text-ink-soft"> - SELECT list no longer includes cust_email</span>
        </div>
        <div className="border-l-2 border-ink/30 pl-3 text-ink">
          2026-07-10 [SAFE] feat: add is_express_delivery flag
        </div>
        <p className="pt-1 text-ink-soft">
          Merged breaking changes raise incidents on the downstream assets they hit.
          The catalog remembers what happened and why.
        </p>
      </div>
    </PanelChrome>
  )
}

const panels = [
  { caption: "The verdict, on the PR", component: <VerdictComment /> },
  { caption: "The blast radius, quantified", component: <BlastRadius /> },
  { caption: "The catalog, kept in the loop", component: <WriteBack /> },
]

export function ProductTrio() {
  return (
    <section className="border-b border-hairline px-4 py-20" id="how-it-works">
      <div className="mx-auto max-w-6xl">
        <h2 className="eyebrow-ticks text-center font-mono text-xs font-normal uppercase tracking-[0.22em] text-ink-soft">
          One webhook, three artifacts
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {panels.map((p, i) => (
            <Reveal key={p.caption} delay={i * 0.08}>
              {p.component}
              <p className="mt-3 text-center font-mono text-xs text-ink-soft">
                {p.caption}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
