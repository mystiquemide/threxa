import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeverityBadge } from "@/components/dashboard/severity-badge"
import { DemoBanner } from "@/components/dashboard/demo-banner"
import { getRun } from "@/lib/runs"

export const dynamic = "force-dynamic"

const DATAHUB_UI = process.env.NEXT_PUBLIC_DATAHUB_UI_URL ?? "http://localhost:9002"
const catalogLink = (query: string) =>
  `${DATAHUB_UI}/search?query=${encodeURIComponent(query)}`

const changeLabels: Record<string, string> = {
  COLUMN_DROPPED: "column dropped",
  COLUMN_RENAMED: "column renamed",
  COLUMN_ADDED: "column added",
  TYPE_CHANGED: "type changed",
  LOGIC_CHANGED: "logic changed",
  ENTITY_DROPPED: "entity dropped",
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
    <div className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <DemoBanner />
        <Link href="/dashboard" className="font-mono text-xs text-fog-soft hover:text-fog">
          &larr; all runs
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <SeverityBadge value={run.severity ?? run.status} className="px-3 py-1 text-sm" />
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-fog">
            #{run.prNumber} {run.prTitle}
          </h1>
        </div>
        <p className="mt-2 font-mono text-xs text-fog-soft">
          {run.repo} &middot; commit {run.headSha.slice(0, 7)} &middot;{" "}
          <a href={run.prUrl} className="underline hover:text-fog" target="_blank" rel="noreferrer">
            view PR
          </a>
          {run.commentUrl && (
            <>
              {" "}&middot;{" "}
              <a
                href={run.commentUrl}
                className="underline hover:text-fog"
                target="_blank"
                rel="noreferrer"
              >
                verdict comment
              </a>
            </>
          )}
          {run.wroteBack && <> &middot; change record written to DataHub</>}
        </p>

        {run.status === "FAILED" && (
          <Card className="mt-8 border-ember/40">
            <CardHeader className="mb-0">
              <CardTitle>Analysis failed</CardTitle>
              <CardDescription>
                this run did not complete. the PR was told to treat the change as unreviewed.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-fog-soft">
              detected changes
            </h2>
            <div className="mt-4 space-y-3">
              {run.intents.length === 0 ? (
                <p className="font-mono text-xs text-fog-soft">
                  no structured changes extracted
                </p>
              ) : (
                run.intents.map((intent) => (
                  <Card key={intent.id} className="p-4">
                    <p className="text-sm font-medium text-fog">
                      {changeLabels[intent.changeType] ?? intent.changeType}
                      {intent.column && (
                        <>
                          : <code className="font-mono text-amberish">{intent.column}</code>
                          {intent.renamedTo && (
                            <>
                              {" "}&rarr;{" "}
                              <code className="font-mono text-amberish">{intent.renamedTo}</code>
                            </>
                          )}
                        </>
                      )}{" "}
                      on <code className="font-mono text-sage">{intent.entity}</code>
                    </p>
                    <p className="mt-1 font-mono text-xs text-fog-soft">{intent.detail}</p>
                    {intent.entityUrn ? (
                      <a
                        href={catalogLink(intent.entity)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block font-mono text-xs text-fog-soft underline hover:text-fog"
                      >
                        view in DataHub
                      </a>
                    ) : (
                      <p className="mt-2 font-mono text-xs text-amberish">
                        not found in catalog; blast radius unknown
                      </p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-fog-soft">
              verdict
            </h2>
            <Card className="mt-4 p-4">
              {run.summary ? (
                <p className="text-sm leading-relaxed whitespace-pre-line text-fog">
                  {run.summary}
                </p>
              ) : (
                <p className="font-mono text-xs text-fog-soft">no summary recorded</p>
              )}
              {run.suggestedFix && (
                <>
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-fog-soft">
                    suggested fix
                  </p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-fog">
                    {run.suggestedFix}
                  </p>
                </>
              )}
            </Card>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-fog-soft">
            blast radius ({run.impacts.length} downstream asset{run.impacts.length === 1 ? "" : "s"})
          </h2>
          <div className="mt-4 overflow-x-auto border border-fogline">
            {run.impacts.length === 0 ? (
              <p className="bg-panel p-6 font-mono text-xs text-fog-soft">
                no downstream consumers found in the catalog for the touched entities
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-fogline bg-panel font-mono text-xs text-fog-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium">asset</th>
                    <th className="px-4 py-3 font-medium">type</th>
                    <th className="px-4 py-3 font-medium">owner</th>
                    <th className="px-4 py-3 font-medium">hop</th>
                    <th className="px-4 py-3 font-medium">via column</th>
                    <th className="px-4 py-3 font-medium">severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fogline">
                  {[...run.impacts]
                    .sort((a, b) => a.hop - b.hop)
                    .map((impact) => (
                      <tr key={impact.id} className="hover:bg-panel">
                        <td className="px-4 py-3">
                          <a
                            href={catalogLink(impact.name)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-fog hover:underline"
                          >
                            {impact.name}
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-fog-soft">
                          {impact.entityType}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-fog-soft">
                          {impact.owner ?? "unknown"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-fog-soft">{impact.hop}</td>
                        <td className="px-4 py-3">
                          {impact.viaColumn ? (
                            <code className="font-mono text-xs text-amberish">
                              {impact.viaColumn}
                            </code>
                          ) : (
                            <span className="text-fog-soft">-</span>
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
