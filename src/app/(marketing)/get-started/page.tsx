import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Get started - Threxa",
  description:
    "Guard a repository with Threxa in four steps: run the stack, point a webhook, set five environment variables, open a data PR.",
}

const steps = [
  {
    title: "Run the stack",
    body: "Threxa needs a DataHub instance with your lineage, the official MCP server in front of it, and the Threxa app itself. The repository README walks through all three with the standard DataHub quickstart.",
    code: `pip install acryl-datahub mcp-server-datahub
datahub docker quickstart
datahub datapack load showcase-ecommerce
mcp-server-datahub --transport http
npm install && npx prisma migrate dev && npm run dev`,
  },
  {
    title: "Point a webhook at Threxa",
    body: "In the repository you want guarded: Settings, Webhooks, add one for pull request events. Use a strong secret; Threxa verifies every delivery signature and rejects the rest.",
    code: `Payload URL   https://<your-threxa-host>/api/webhooks/github
Content type  application/json
Secret        <GITHUB_WEBHOOK_SECRET>
Events        Pull requests`,
  },
  {
    title: "Set the environment",
    body: "Five values connect the pieces. The .env.example in the repository documents each one.",
    code: `GROQ_API_KEY            diff parsing and verdict prose
DATABASE_URL            run history (Postgres)
DATAHUB_GMS_URL         your catalog
MCP_SERVER_URL          the MCP sidecar
GITHUB_WEBHOOK_SECRET   webhook signature check
GITHUB_TOKEN            posting PR comments`,
  },
  {
    title: "Open a data PR",
    body: "Touch any .sql file or dbt model and open the pull request. The verdict comment lands within a minute: severity, the impact table with owners, and a migration path. The run appears in the dashboard, and the change record lands in your catalog.",
    code: null,
  },
]

export default function GetStartedPage() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-ink">
          <span className="block font-serif-display text-5xl italic">Guard a repository</span>
          <span className="mt-1 block font-display text-2xl font-extrabold tracking-tight">
            in four steps
          </span>
        </h1>

        <ol className="mt-14 space-y-12">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="flex items-baseline gap-4">
                <span className="eyebrow-ticks font-mono text-xs text-ink-soft">
                  step {i + 1}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink">{step.title}</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
              {step.code && (
                <pre className="mt-4 overflow-x-auto border border-hairline bg-white p-4 font-mono text-xs leading-relaxed text-ink shadow-[4px_4px_0_0_rgba(20,20,28,0.08)]">
                  {step.code}
                </pre>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-16 border-t border-hairline pt-10 text-center">
          <p className="text-ink-soft">
            The full quickstart, architecture, and every ADR live in the repository.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://github.com/mystiquemide/threxa"
              target="_blank"
              rel="noreferrer"
              className="stamp border border-ink bg-wash px-5 py-2.5 font-mono text-sm text-ink"
            >
              Read the README
            </a>
            <Link
              href="/dashboard"
              className="stamp border border-ink bg-paper px-5 py-2.5 font-mono text-sm text-ink"
            >
              See runs live
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
