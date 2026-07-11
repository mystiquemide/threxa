import Link from "next/link"

export default function NotFound() {
  return (
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center text-ink">
      <p className="eyebrow-ticks font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
        404
      </p>
      <h1 className="mt-4">
        <span className="block font-serif-display text-5xl italic">Nothing downstream</span>
        <span className="mt-1 block font-display text-2xl font-extrabold tracking-tight">
          of this URL
        </span>
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        The page you followed does not exist. The lineage ends here.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="stamp border border-ink bg-wash px-5 py-2.5 font-mono text-sm text-ink"
        >
          Back home
        </Link>
        <Link
          href="/dashboard"
          className="stamp border border-ink bg-paper px-5 py-2.5 font-mono text-sm text-ink"
        >
          Run history
        </Link>
      </div>
    </div>
  )
}
