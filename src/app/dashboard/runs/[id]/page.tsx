import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeverityBadge } from "@/components/dashboard/severity-badge"
import { DemoBanner } from "@/components/dashboard/demo-banner"
import { getRun } from "@/lib/runs"

export const dynamic = "force-dynamic"

// Public DataHub UI for judge click-through; search links work for every entity type.
const DATAHUB_UI = process.env.NEXT_PUBLIC_DATAHUB_UI_URL ?? "http://localhost:9002"
const catalogLink = (query: string) =>
  `${DATAHUB_UI}/search?query=${encodeURIComponent(query)}`

const changeLabels: Record<string, string> = {
  COLUMN_DROPPED: "Column dropped",
  COLUMN_RENAMED: "Column renamed",
  COLUMN_ADDED: "Column added",
  TYPE_CHANGED: "Type changed",
  LOGIC_CHANGED: "Logic changed",
  ENTITY_DROPPED: "Entity dropped",
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const run = await getRun(id)
  if (!run) notFound()

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        <DemoBanner />
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300">
          &larr; All runs
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <SeverityBadge value={run.severity ?? run.status} className="text-sm px-3 py-1" />
          <h1 className="text-2xl font-bold text-white">
            #{run.prNumber} {run.prTitle}
          </h1>
        </div>
        <p className="mt-2 text-gray-400">
          {run.repo} &middot; commit {run.headSha.slice(0, 7)} &middot;{" "}
          <a href={run.prUrl} className="text-gray-300 underline hover:text-white" target="_blank" rel="noreferrer">
            view PR
          </a>
          {run.commentUrl && (
            <>
              {" "}&middot;{" "}
              <a href={run.commentUrl} className="text-gray-300 underline hover:text-white" target="_blank" rel="noreferrer">
                verdict comment
              </a>
            </>
          )}
          {run.wroteBack && <> &middot; change record written to DataHub</>}
        </p>

        {run.status === "FAILED" && (
          <Card className="mt-8 border-red-500/30">
            <CardHeader className="mb-0">
              <CardTitle>Analysis failed</CardTitle>
              <CardDescription>
                This run did not complete. The PR was told to treat the change as unreviewed.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-lg font-semibold text-white">Detected changes</h2>
            <div className="mt-4 space-y-3">
              {run.intents.length === 0 ? (
                <p className="text-sm text-gray-400">No structured changes extracted.</p>
              ) : (
                run.intents.map((intent) => (
                  <Card key={intent.id} className="p-4">
                    <p className="text-sm text-white font-medium">
                      {changeLabels[intent.changeType] ?? intent.changeType}
                      {intent.column && (
                        <>
                          : <code className="text-amber-300">{intent.column}</code>
                          {intent.renamedTo && (
                            <>
                              {" "}&rarr; <code className="text-amber-300">{intent.renamedTo}</code>
                            </>
                          )}
                        </>
                      )}{" "}
                      on <code className="text-sky-300">{intent.entity}</code>
                    </p>
                    <p className="mt-1 text-sm text-gray-400">{intent.detail}</p>
                    {intent.entityUrn ? (
                      <a
                        href={catalogLink(intent.entity)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-gray-500 underline hover:text-gray-300"
                      >
                        View in DataHub
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-amber-400">
                        Not found in catalog; blast radius unknown.
                      </p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Verdict</h2>
            <Card className="mt-4 p-4">
              {run.summary ? (
                <p className="text-sm text-gray-300 whitespace-pre-line">{run.summary}</p>
              ) : (
                <p className="text-sm text-gray-400">No summary recorded.</p>
              )}
              {run.suggestedFix && (
                <>
                  <p className="mt-4 text-sm font-semibold text-white">Suggested fix</p>
                  <p className="mt-1 text-sm text-gray-300 whitespace-pre-line">{run.suggestedFix}</p>
                </>
              )}
            </Card>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">
            Blast radius ({run.impacts.length} downstream asset{run.impacts.length === 1 ? "" : "s"})
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800">
            {run.impacts.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">
                No downstream consumers found in the catalog for the touched entities.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-800 bg-gray-900/50 text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Asset</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Hop</th>
                    <th className="px-4 py-3 font-medium">Via column</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[...run.impacts]
                    .sort((a, b) => a.hop - b.hop)
                    .map((impact) => (
                      <tr key={impact.id}>
                        <td className="px-4 py-3">
                          <a
                            href={catalogLink(impact.name)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:underline"
                          >
                            {impact.name}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{impact.entityType}</td>
                        <td className="px-4 py-3 text-gray-400">{impact.owner ?? "unknown"}</td>
                        <td className="px-4 py-3 text-gray-400">{impact.hop}</td>
                        <td className="px-4 py-3">
                          {impact.viaColumn ? (
                            <code className="text-amber-300">{impact.viaColumn}</code>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <SeverityBadge value={impact.severity} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
