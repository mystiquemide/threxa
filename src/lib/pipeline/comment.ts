import { prose, withRetry } from "@/lib/ai"
import type { ImpactReport, PrContext } from "@/lib/types"

const SYSTEM = `You are Threxa, a data-change reviewer commenting on a pull request. You are given the structured change intents and the confirmed downstream blast radius from the data catalog. Write two short sections in markdown: "### What this changes" (2-4 sentences, plain language, name the affected downstream assets and owners) and "### Suggested fix" (a concrete migration path referencing the real column and asset names provided; for renames suggest a compatibility view or staged rename, for drops suggest deprecation first). No emoji. Do not repeat the impact table. Do not invent assets or columns not in the data.`

export interface VerdictComment {
  body: string
  summary: string
  suggestedFix: string
}

export async function buildComment(
  ctx: PrContext,
  report: ImpactReport
): Promise<VerdictComment> {
  const explanation = await withRetry(() =>
    prose(SYSTEM, JSON.stringify({ pr: ctx.prTitle, ...report }))
  )
  const [summary, suggestedFix] = splitSections(explanation)

  const table =
    report.impacts.length === 0
      ? "_No downstream assets found in the catalog._"
      : [
          "| Asset | Type | Owner | Hop | Via column | Severity |",
          "|---|---|---|---|---|---|",
          ...report.impacts
            .sort((a, b) => a.hop - b.hop)
            .map(
              (i) =>
                `| ${i.name} | ${i.entityType} | ${i.owner ?? "unknown"} | ${i.hop} | ${i.viaColumn ?? "-"} | ${i.severity} |`
            ),
        ].join("\n")

  const unresolved =
    report.unresolvedEntities.length > 0
      ? `\n> Not found in catalog (blast radius unknown): ${report.unresolvedEntities.join(", ")}\n`
      : ""

  const body = [
    `## Threxa verdict: \`${report.severity}\``,
    "",
    `**${report.intents.length} change(s) detected, ${report.impacts.length} downstream asset(s) in the blast radius.**`,
    unresolved,
    "### Impact",
    table,
    "",
    summary ? `### What this changes\n${summary}` : "",
    suggestedFix ? `### Suggested fix\n${suggestedFix}` : "",
    "",
    `<sub>Threxa analyzed ${ctx.headSha.slice(0, 7)} against the DataHub context graph.</sub>`,
  ]
    .filter(Boolean)
    .join("\n")

  return { body, summary, suggestedFix }
}

function splitSections(text: string): [string, string] {
  const fixIdx = text.indexOf("### Suggested fix")
  if (fixIdx === -1) return [text.replace(/^### What this changes\s*/m, "").trim(), ""]
  const summary = text
    .slice(0, fixIdx)
    .replace(/^### What this changes\s*/m, "")
    .trim()
  const fix = text.slice(fixIdx).replace(/^### Suggested fix\s*/m, "").trim()
  return [summary, fix]
}

/** Honest failure comment (never a silent skip, never a fake SAFE). */
export function failureComment(reason: string): string {
  return [
    "## Threxa verdict: `ANALYSIS FAILED`",
    "",
    `Threxa could not complete the blast-radius analysis: ${reason}`,
    "",
    "Treat this change as unreviewed. Do not assume it is safe.",
  ].join("\n")
}
