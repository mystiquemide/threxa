import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Documentation - Threxa",
  description:
    "How Threxa works: the analysis pipeline, severity model, catalog write-back, API surface, and configuration reference.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-hairline py-10 last:border-0">
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-hairline bg-white p-4 font-mono text-xs leading-relaxed text-ink shadow-[4px_4px_0_0_rgba(20,20,28,0.08)]">
      {children}
    </pre>
  )
}

export default function DocsPage() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-ink">
          <span className="block font-serif-display text-5xl italic">Documentation</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-ink-soft">
          Everything below is implemented and verifiable in the{" "}
          <a
            href="https://github.com/mystiquemide/threxa"
            className="underline hover:text-ink"
            target="_blank"
            rel="noreferrer"
          >
            source repository
          </a>
          . For setup, start with{" "}
          <Link href="/get-started" className="underline hover:text-ink">
            Get started
          </Link>
          .
        </p>

        <div className="mt-14">
          <Section title="The pipeline">
            <p>
              A pull request webhook triggers a linear analysis chain. Each stage is a
              separate module with one responsibility:
            </p>
            <Code>{`gate      filter to .sql and dbt model/schema files
parse     LLM turns the diff into structured change intents
lineage   walk downstream lineage via the DataHub MCP server
score     deterministic severity: SAFE / RISKY / BREAKING
comment   post or update one verdict comment on the PR
writeback change record to DataHub; incidents on merged BREAKING
persist   store the run for the dashboard`}</Code>
            <p>
              The webhook acknowledges within seconds and the analysis runs after the
              response, so repository hooks never time out.
            </p>
          </Section>

          <Section title="The severity model">
            <p>
              Severity is computed by plain code, never by the language model, and it is
              scoped per touched entity so a destructive change to one model never
              escalates another model&apos;s consumers.
            </p>
            <Code>{`BREAKING  a dropped or renamed column that downstream assets
          consume (column-level lineage), or a dropped entity
          with any downstream consumers
RISKY     destructive or logic changes with consumers whose
          column usage cannot be confirmed, or any change to an
          entity the catalog cannot resolve
SAFE      additive changes, or no downstream consumers`}</Code>
            <p>
              Missing lineage never yields SAFE. If the catalog is unreachable, the run
              fails loudly and the pull request is told the change is unreviewed.
            </p>
          </Section>

          <Section title="Catalog write-back">
            <p>
              Every completed analysis appends a change record to the touched DataHub
              entities: date, severity, pull request link, and what changed. When a pull
              request with a BREAKING verdict merges, Threxa raises incidents on the
              downstream assets it identified. The catalog carries the memory of every
              change, readable by any tool connected to it.
            </p>
          </Section>

          <Section title="API surface">
            <Code>{`POST /api/webhooks/github   pull_request events, HMAC verified
GET  /api/runs              run list, optional ?repo=owner/name
GET  /api/runs/:id          full run with intents and impacts
GET  /api/health            connectivity: postgres, mcp, datahub`}</Code>
            <p>
              Read endpoints are public. The webhook rejects any delivery whose
              signature does not match the configured secret.
            </p>
          </Section>

          <Section title="Configuration reference">
            <Code>{`GROQ_API_KEY               LLM for diff parsing and prose
GROQ_MODEL                 optional model override
DATABASE_URL               Postgres connection string
DATAHUB_GMS_URL            DataHub GMS endpoint
DATAHUB_TOKEN              access token, if auth is enabled
MCP_SERVER_URL             mcp-server-datahub endpoint
GITHUB_WEBHOOK_SECRET      webhook signature secret
GITHUB_TOKEN               posts comments and statuses
NEXT_PUBLIC_DEMO_MODE      labeled sample data, no backend
NEXT_PUBLIC_DATAHUB_UI_URL enables catalog links in the UI`}</Code>
          </Section>

          <Section title="Architecture and decisions">
            <p>
              The full design, data model, failure paths, and seven architecture
              decision records live in{" "}
              <a
                href="https://github.com/mystiquemide/threxa/blob/main/docs/ARCHITECTURE.md"
                className="underline hover:text-ink"
                target="_blank"
                rel="noreferrer"
              >
                docs/ARCHITECTURE.md
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
