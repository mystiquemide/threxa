import Link from "next/link"

export function Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-fogline bg-night/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-fog">
            THREXA
          </Link>
          <span className="font-mono text-xs text-fog-soft">/ runs</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <a
            href="https://github.com/mystiquemide/threxa"
            target="_blank"
            rel="noreferrer"
            className="text-fog-soft hover:text-fog"
          >
            source
          </a>
          <Link
            href="/"
            className="stamp-dark border border-fogline bg-panel px-3 py-1.5 text-fog"
          >
            about threxa
          </Link>
        </div>
      </div>
    </nav>
  )
}
