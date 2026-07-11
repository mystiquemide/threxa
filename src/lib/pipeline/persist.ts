import { db } from "@/lib/db"
import type { ImpactReport, PrContext } from "@/lib/types"

export async function createRun(ctx: PrContext): Promise<string> {
  const repo = await db.repo.upsert({
    where: { owner_name: { owner: ctx.owner, name: ctx.repo } },
    create: { owner: ctx.owner, name: ctx.repo },
    update: {},
  })
  const run = await db.run.create({
    data: {
      repoId: repo.id,
      prNumber: ctx.prNumber,
      prTitle: ctx.prTitle,
      prUrl: ctx.prUrl,
      headSha: ctx.headSha,
    },
  })
  return run.id
}

export async function saveResults(
  runId: string,
  report: ImpactReport,
  extras: { summary: string; suggestedFix: string; commentUrl?: string; wroteBack: boolean }
): Promise<void> {
  await db.run.update({
    where: { id: runId },
    data: {
      status: "COMPLETED",
      severity: report.severity,
      summary: extras.summary,
      suggestedFix: extras.suggestedFix,
      commentUrl: extras.commentUrl,
      wroteBack: extras.wroteBack,
      finishedAt: new Date(),
      intents: {
        create: report.intents.map((i) => ({
          entity: i.entity,
          entityUrn: i.entityUrn ?? null,
          column: i.column,
          changeType: i.changeType,
          detail: i.detail,
          renamedTo: i.renamedTo,
        })),
      },
      impacts: {
        create: report.impacts.map((a) => ({
          urn: a.urn,
          name: a.name,
          entityType: a.entityType,
          owner: a.owner,
          hop: a.hop,
          viaColumn: a.viaColumn,
          sourceEntity: a.sourceEntity,
          severity: a.severity,
        })),
      },
    },
  })
}

export async function markFailed(runId: string, error: string): Promise<void> {
  await db.run.update({
    where: { id: runId },
    data: { status: "FAILED", error: error.slice(0, 2000), finishedAt: new Date() },
  })
}

/** Latest completed run for a PR; used on merge to raise incidents. */
export async function latestRunForPr(owner: string, repo: string, prNumber: number) {
  return db.run.findFirst({
    where: { repo: { owner, name: repo }, prNumber, status: "COMPLETED" },
    orderBy: { startedAt: "desc" },
    include: { impacts: true, intents: true },
  })
}

export async function saveIncidents(runId: string, incidentUrns: string[]): Promise<void> {
  await db.run.update({ where: { id: runId }, data: { incidentUrns } })
}
