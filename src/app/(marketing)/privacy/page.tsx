import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Threxa",
  description: "What data Threxa processes, what it stores, and what it never collects.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-6">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-ink">
          <span className="block font-serif-display text-5xl italic">Privacy Policy</span>
        </h1>
        <p className="mt-4 text-center font-mono text-xs text-ink-soft">
          Effective July 11, 2026
        </p>

        <div className="mt-10 divide-y divide-hairline">
          <Section title="What Threxa processes">
            <p>
              When a guarded repository opens or updates a pull request, Threxa receives
              the webhook payload GitHub sends: repository name, pull request title and
              number, commit identifiers, and the list of changed files. For data-model
              files it fetches the diff content to analyze the change. Diffs of
              data-model files are sent to the configured language-model provider for
              parsing and explanation, and entity names are queried against the
              connected DataHub instance.
            </p>
          </Section>

          <Section title="What Threxa stores">
            <p>
              Analysis runs are stored in Postgres: repository and pull request
              metadata, the structured change intents, the affected catalog assets with
              their owners as recorded in DataHub, the verdict, and the generated
              explanation. Change records and incidents are written to the connected
              DataHub instance. Raw diffs are not stored after analysis completes.
            </p>
          </Section>

          <Section title="What Threxa never collects">
            <p>
              There are no user accounts, no cookies, no analytics trackers, no
              advertising identifiers, and no collection of personal information from
              dashboard visitors. The dashboard is read-only.
            </p>
          </Section>

          <Section title="Third parties">
            <p>
              Threxa exchanges data with three kinds of systems, each under its own
              terms: GitHub (webhooks in, comments and statuses out), the configured
              language-model provider (data-model diffs for parsing), and the connected
              DataHub instance (lineage queries in, change records out). Self-hosted
              deployments choose all three.
            </p>
          </Section>

          <Section title="Data removal">
            <p>
              To remove stored analysis history for a repository, open an issue on the{" "}
              <a
                href="https://github.com/mystiquemide/threxa/issues"
                className="underline hover:text-ink"
                target="_blank"
                rel="noreferrer"
              >
                GitHub repository
              </a>{" "}
              or, for self-hosted deployments, delete the rows from your own database.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
