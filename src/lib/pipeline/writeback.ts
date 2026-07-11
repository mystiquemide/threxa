import { raiseIncident, writeChangeRecord } from "@/lib/datahub"
import type { ImpactReport, PrContext } from "@/lib/types"

/**
 * F5a: after every completed analysis, write a change record onto each touched
 * entity so the catalog carries institutional memory of the change.
 * Best-effort per entity; failures don't fail the run but are reported.
 */
export async function writeChangeRecords(
  ctx: PrContext,
  report: ImpactReport,
  resolved: Map<string, string>
): Promise<boolean> {
  let wroteAny = false
  for (const [entity, urn] of resolved) {
    const details = report.intents
      .filter((i) => i.entity === entity)
      .map((i) => i.detail)
      .join(" ")
    try {
      await writeChangeRecord(urn, {
        prUrl: ctx.prUrl,
        prTitle: ctx.prTitle,
        severity: report.severity,
        detail: details || "Change analyzed by Threxa",
      })
      wroteAny = true
    } catch (err) {
      console.error(`writeback failed for ${urn}:`, err)
    }
  }
  return wroteAny
}

/** F5b: a merged BREAKING PR raises incidents on every BREAKING downstream asset. */
export async function raiseIncidentsForMerge(
  ctx: PrContext,
  impacts: { urn: string; name: string; severity: string; viaColumn: string | null }[]
): Promise<string[]> {
  const urns: string[] = []
  for (const impact of impacts.filter((i) => i.severity === "BREAKING")) {
    try {
      const id = await raiseIncident(
        impact.urn,
        `Breaking upstream change merged: ${ctx.prTitle}`,
        `${ctx.prUrl} merged with a BREAKING verdict from Threxa.` +
          (impact.viaColumn ? ` This asset consumes the affected column "${impact.viaColumn}".` : "")
      )
      urns.push(id)
    } catch (err) {
      console.error(`incident failed for ${impact.urn}:`, err)
    }
  }
  return urns
}
