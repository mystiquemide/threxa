const links = [
  { label: "GitHub", href: "https://github.com/mystiquemide/threxa" },
  { label: "Live dashboard", href: "/dashboard" },
  {
    label: "Architecture",
    href: "https://github.com/mystiquemide/threxa/blob/main/docs/ARCHITECTURE.md",
  },
  { label: "DataHub", href: "https://datahub.com" },
  { label: "Hackathon", href: "https://datahub.devpost.com" },
]

export function MarketingFooter() {
  return (
    <footer className="px-4 pb-10 pt-16">
      <svg
        viewBox="0 0 900 120"
        className="mx-auto w-full max-w-4xl opacity-60"
        aria-hidden
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M ${80 + i * 60} 110 Q 450 ${-40 + i * 22} ${820 - i * 60} 110`}
            fill="none"
            stroke="rgba(20,20,28,0.3)"
            strokeWidth="0.8"
          />
        ))}
        {[140, 290, 450, 610, 760].map((x) => (
          <circle key={x} cx={x} cy={104 - Math.abs(450 - x) * 0.04} r="2.5" fill="#c96b6e" />
        ))}
      </svg>
      <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-xs text-ink-soft">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="hover:text-ink"
            {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {l.label}
          </a>
        ))}
      </div>
      <p className="mt-6 text-center font-mono text-[11px] text-ink-soft">
        THREXA - Apache 2.0 - built on the DataHub context graph
      </p>
    </footer>
  )
}
