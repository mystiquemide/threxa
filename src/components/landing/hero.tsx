import Link from "next/link"

export function Hero() {
  return (
    <section className="border-b border-hairline px-4 pb-24 pt-24 text-center sm:pt-32">
      <h1 className="mx-auto max-w-4xl text-ink">
        <span className="block font-serif-display text-5xl italic leading-[1.05] sm:text-7xl">
          The blast-radius agent
        </span>
        <span className="mt-1 block font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-6xl">
          for data model PRs
        </span>
      </h1>
      <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft">
        A renamed column merges quietly, and three days later a dashboard nobody
        checked is wrong. Threxa reviews every data-model pull request against your
        DataHub lineage, names what breaks and who owns it, then writes the change
        back into the catalog.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="stamp border border-ink bg-wash px-6 py-3 font-mono text-sm font-medium text-ink"
        >
          See it catch a breaking change
        </Link>
        <a
          href="https://github.com/mystiquemide/threxa"
          target="_blank"
          rel="noreferrer"
          className="stamp border border-ink bg-paper px-6 py-3 font-mono text-sm text-ink"
        >
          View the source
        </a>
      </div>
    </section>
  )
}
