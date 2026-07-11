import Link from "next/link"

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#blast-radius", label: "Blast radius" },
  { href: "/get-started", label: "Get started" },
]

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="hidden gap-6 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink-soft hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href="/"
          className="justify-self-center font-display text-xl font-extrabold tracking-tight text-ink"
        >
          THREXA
        </Link>
        <div className="flex items-center justify-end gap-4">
          <a
            href="https://github.com/mystiquemide/threxa"
            className="hidden text-sm text-ink-soft hover:text-ink sm:block"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link
            href="/dashboard"
            className="stamp border border-ink bg-wash px-4 py-1.5 font-mono text-sm text-ink"
          >
            Live dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}
