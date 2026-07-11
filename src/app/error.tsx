"use client"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center text-ink">
      <p className="eyebrow-ticks font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
        Something broke
      </p>
      <h1 className="mt-4">
        <span className="block font-serif-display text-5xl italic">An unexpected error</span>
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        This one is on us, not your data. Try again, and if it persists the run
        history is unaffected.
      </p>
      <button
        onClick={reset}
        className="stamp mt-8 border border-ink bg-wash px-5 py-2.5 font-mono text-sm text-ink"
      >
        Try again
      </button>
    </div>
  )
}
