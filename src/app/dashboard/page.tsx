import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeverityBadge } from "@/components/dashboard/severity-badge"
import { DemoBanner } from "@/components/dashboard/demo-banner"
import { listRuns } from "@/lib/runs"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const runs = await listRuns()

  const completed = runs.filter((r) => r.status === "COMPLETED")
  const stats = [
    { title: "Analyzed PRs", value: runs.length },
    { title: "Breaking caught", value: completed.filter((r) => r.severity === "BREAKING").length },
    { title: "Risky flagged", value: completed.filter((r) => r.severity === "RISKY").length },
    { title: "Safe passed", value: completed.filter((r) => r.severity === "SAFE").length },
  ]
  const guardedRepos = [...new Set(runs.map((r) => r.repo))]

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        <DemoBanner />
        <h1 className="text-2xl font-bold text-white">Run history</h1>
        <p className="mt-2 text-gray-400">
          Every data-model PR Threxa analyzed, with its blast-radius verdict.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="mb-0">
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Guarded repos:</span>
          {guardedRepos.length === 0 ? (
            <span className="text-sm text-gray-400">none yet</span>
          ) : (
            guardedRepos.map((repo) => (
              <span
                key={repo}
                className="rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-300"
              >
                {repo}
              </span>
            ))
          )}
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-800">
          {runs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-white font-medium">No runs yet</p>
              <p className="mt-2 text-sm">
                Install the Threxa webhook on a repo and open a PR that touches a SQL or dbt
                model file. The analysis lands here within a minute.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 bg-gray-900/50 text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Verdict</th>
                  <th className="px-4 py-3 font-medium">Pull request</th>
                  <th className="px-4 py-3 font-medium">Repo</th>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium sr-only">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-900/40">
                    <td className="px-4 py-3">
                      <SeverityBadge value={run.severity ?? run.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/runs/${run.id}`} className="text-white hover:underline">
                        #{run.prNumber} {run.prTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{run.repo}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
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
                        className="text-xs text-gray-500 hover:text-gray-300"
                      >
                        Blast radius
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
