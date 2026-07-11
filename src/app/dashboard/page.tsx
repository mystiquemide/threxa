import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeverityBadge } from "@/components/dashboard/severity-badge"
import { DemoBanner } from "@/components/dashboard/demo-banner"
import { StatusStrip } from "@/components/dashboard/status-strip"
import { listRuns } from "@/lib/runs"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const runs = await listRuns()

  const completed = runs.filter((r) => r.status === "COMPLETED")
  const stats = [
    { title: "analyzed_prs", value: runs.length },
    { title: "breaking_caught", value: completed.filter((r) => r.severity === "BREAKING").length },
    { title: "risky_flagged", value: completed.filter((r) => r.severity === "RISKY").length },
    { title: "safe_passed", value: completed.filter((r) => r.severity === "SAFE").length },
  ]
  const guardedRepos = [...new Set(runs.map((r) => r.repo))]

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <DemoBanner />
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-fog">
            Run history
          </h1>
          <span className="font-mono text-xs text-fog-soft">
            $ threxa watch --all
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-sm text-fog-soft">
            every data-model PR analyzed, with its blast-radius verdict
          </p>
          <StatusStrip />
        </div>

        <div className="mt-8 grid gap-px border border-fogline bg-fogline sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0">
              <CardHeader className="mb-0">
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="font-display text-3xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-fog-soft">guarded repos:</span>
          {guardedRepos.length === 0 ? (
            <span className="text-fog-soft">none yet</span>
          ) : (
            guardedRepos.map((repo) => (
              <span key={repo} className="border border-fogline bg-panel px-3 py-1 text-fog">
                {repo}
              </span>
            ))
          )}
        </div>

        <div className="mt-6 overflow-x-auto border border-fogline">
          {runs.length === 0 ? (
            <div className="bg-panel p-12 text-center">
              <p className="font-display font-semibold text-fog">No runs yet</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-fog-soft">
                install the threxa webhook on a repo and open a PR that touches a SQL or
                dbt model file. the analysis lands here within a minute.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-fogline bg-panel font-mono text-xs text-fog-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">verdict</th>
                  <th className="px-4 py-3 font-medium">pull request</th>
                  <th className="px-4 py-3 font-medium">repo</th>
                  <th className="px-4 py-3 font-medium">when</th>
                  <th className="px-4 py-3 font-medium sr-only">detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fogline">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-panel">
                    <td className="px-4 py-3">
                      <SeverityBadge value={run.severity ?? run.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/runs/${run.id}`} className="text-fog hover:underline">
                        #{run.prNumber} {run.prTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-fog-soft">{run.repo}</td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-fog-soft">
                      {new Date(run.startedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/runs/${run.id}`}
                        className="font-mono text-xs text-fog-soft hover:text-fog"
                      >
                        blast radius &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
