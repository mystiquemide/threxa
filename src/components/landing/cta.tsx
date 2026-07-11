import Link from "next/link"
import { Reveal } from "./reveal"

export function CTA() {
  return (
    <section className="border-b border-hairline px-4 py-24 text-center">
      <Reveal>
        <h2 className="mx-auto max-w-3xl text-ink">
          <span className="block font-serif-display text-5xl italic leading-tight">
            The next column you drop
          </span>
          <span className="mt-1 block font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            has consumers you have not met
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-ink-soft">
          Watch a breaking change get caught end to end: PR opened, blast radius
          computed, owners named, verdict posted, catalog updated.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="stamp border border-ink bg-wash px-6 py-3 font-mono text-sm font-medium text-ink"
          >
            Open the live dashboard
          </Link>
          <a
            href="https://github.com/mystiquemide/threxa#judge-quickstart-10-minutes"
            target="_blank"
            rel="noreferrer"
            className="stamp border border-ink bg-paper px-6 py-3 font-mono text-sm text-ink"
          >
            Run it yourself
          </a>
        </div>
      </Reveal>
    </section>
  )
}
