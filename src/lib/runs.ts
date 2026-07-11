// Read layer for the dashboard: real Prisma queries, or demo fixtures when
// NEXT_PUBLIC_DEMO_MODE=true so judges can click through without a backend.
import { db } from "@/lib/db"
import { demoRuns, isDemoMode } from "@/lib/demo-data"

export interface RunListItem {
  id: string
  repo: string
  prNumber: number
  prTitle: string
  prUrl: string
  status: string
  severity: string | null
  startedAt: Date
  finishedAt: Date | null
}

export interface RunDetail extends RunListItem {
  headSha: string
  summary: string | null
  suggestedFix: string | null
  commentUrl: string | null
  wroteBack: boolean
  intents: {
    id: string
    entity: string
    entityUrn: string | null
    column: string | null
    changeType: string
    detail: string
    renamedTo: string | null
  }[]
  impacts: {
    id: string
    urn: string
    name: string
    entityType: string
    owner: string | null
    hop: number
    viaColumn: string | null
    sourceEntity: string
    severity: string
  }[]
}

export async function listRuns(): Promise<RunListItem[]> {
  if (isDemoMode) return demoRuns
  const runs = await db.run.findMany({
    orderBy: { startedAt: "desc" },
    take: 100,
    include: { repo: true },
  })
  return runs.map((r) => ({
    id: r.id,
    repo: `${r.repo.owner}/${r.repo.name}`,
    prNumber: r.prNumber,
    prTitle: r.prTitle,
    prUrl: r.prUrl,
    status: r.status,
    severity: r.severity,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt,
  }))
}

export async function getRun(id: string): Promise<RunDetail | null> {
  if (isDemoMode) return demoRuns.find((r) => r.id === id) ?? null
  const run = await db.run.findUnique({
    where: { id },
    include: { repo: true, intents: true, impacts: true },
  })
  if (!run) return null
  return {
    id: run.id,
    repo: `${run.repo.owner}/${run.repo.name}`,
    prNumber: run.prNumber,
    prTitle: run.prTitle,
    prUrl: run.prUrl,
    headSha: run.headSha,
    status: run.status,
    severity: run.severity,
    summary: run.summary,
    suggestedFix: run.suggestedFix,
    commentUrl: run.commentUrl,
    wroteBack: run.wroteBack,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    intents: run.intents,
    impacts: run.impacts,
  }
}
