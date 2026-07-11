import { fetchPrFiles, setCommitStatus, upsertPrComment } from "@/lib/github"
import type { PrContext } from "@/lib/types"
import { buildComment, failureComment } from "./comment"
import { dataFiles } from "./gate"
import { computeLineage } from "./lineage"
import { parseChanges } from "./parse"
import {
  createRun,
  latestRunForPr,
  markFailed,
  saveIncidents,
  saveResults,
} from "./persist"
import { score } from "./score"
import { raiseIncidentsForMerge, writeChangeRecords } from "./writeback"

/**
 * Full analysis for opened/synchronize events:
 * gate → parse → lineage → score → comment → writeback → persist.
 * Runs after the webhook has already acked (ADR-5).
 */
export async function runAnalysis(ctx: PrContext, runId: string): Promise<void> {
  try {
    const files = dataFiles(await fetchPrFiles(ctx.owner, ctx.repo, ctx.prNumber))
    const intents = await parseChanges(files)
    const lineage = await computeLineage(intents)
    for (const intent of intents) {
      intent.entityUrn = lineage.resolved.get(intent.entity) ?? null
    }
    const report = score(intents, lineage.impacts, lineage.unresolved)

    const comment = await buildComment(ctx, report)
    let commentUrl: string | undefined
    try {
      commentUrl = await upsertPrComment(ctx.owner, ctx.repo, ctx.prNumber, comment.body)
    } catch (err) {
      // Verdict still persists; comment failure is recorded, retried once.
      console.error("comment failed:", err)
      try {
        commentUrl = await upsertPrComment(ctx.owner, ctx.repo, ctx.prNumber, comment.body)
      } catch {}
    }

    const wroteBack = await writeChangeRecords(ctx, report, lineage.resolved)
    await saveResults(runId, report, {
      summary: comment.summary,
      suggestedFix: comment.suggestedFix,
      commentUrl,
      wroteBack,
    })

    // Stretch S3: BREAKING visibly blocks merge via commit status.
    await setCommitStatus(
      ctx.owner,
      ctx.repo,
      ctx.headSha,
      report.severity === "BREAKING" ? "failure" : "success",
      `Threxa: ${report.severity} (${report.impacts.length} downstream assets)`
    ).catch(() => {})
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    await markFailed(runId, reason)
    await upsertPrComment(
      ctx.owner,
      ctx.repo,
      ctx.prNumber,
      failureComment(reason)
    ).catch(() => {})
  }
}

/** Merge handler: a merged BREAKING PR raises incidents on downstream assets (F5b). */
export async function handleMerge(ctx: PrContext): Promise<void> {
  const run = await latestRunForPr(ctx.owner, ctx.repo, ctx.prNumber)
  if (!run || run.severity !== "BREAKING") return
  const urns = await raiseIncidentsForMerge(ctx, run.impacts)
  if (urns.length > 0) await saveIncidents(run.id, urns)
}
