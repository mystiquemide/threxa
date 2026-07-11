import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold tracking-widest text-amber-400 uppercase">
          The PR gate for data models
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Stop breaking dashboards you didn&apos;t know existed
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          Threxa reviews every data-model PR against your DataHub lineage. It names what
          breaks, who owns it, and how to fix it, in a comment on the PR, before the merge.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg">See it catch a breaking change</Button>
          </Link>
          <Link href="https://github.com/mystiquemide/threxa">
            <Button variant="outline" size="lg">View on GitHub</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
