import type { ChangeIntent, ImpactedAsset, ImpactReport, Severity } from "@/lib/types"

const DESTRUCTIVE = new Set([
  "COLUMN_DROPPED",
  "COLUMN_RENAMED",
  "TYPE_CHANGED",
  "ENTITY_DROPPED",
])

// Deterministic severity scoring (ADR-2). Claude never decides severity, and
// missing lineage data can never yield SAFE (AGENTS.md rule).
// Scoring is strictly per source entity: a destructive change to entity A never
// escalates the consumers of an untouched-in-that-way entity B.
export function score(
  intents: ChangeIntent[],
  impacts: Omit<ImpactedAsset, "severity">[],
  unresolvedEntities: string[]
): ImpactReport {
  const destructiveEntities = new Set(
    intents.filter((i) => DESTRUCTIVE.has(i.changeType)).map((i) => i.entity)
  )
  const droppedEntities = new Set(
    intents.filter((i) => i.changeType === "ENTITY_DROPPED").map((i) => i.entity)
  )
  const logicEntities = new Set(
    intents.filter((i) => i.changeType === "LOGIC_CHANGED").map((i) => i.entity)
  )

  const scoredImpacts: ImpactedAsset[] = impacts.map((impact) => {
    let severity: Severity = "SAFE"
    if (impact.viaColumn || droppedEntities.has(impact.sourceEntity)) {
      // This asset consumes the affected column, or its upstream entity is gone.
      severity = "BREAKING"
    } else if (
      destructiveEntities.has(impact.sourceEntity) ||
      logicEntities.has(impact.sourceEntity)
    ) {
      severity = "RISKY"
    }
    return { ...impact, severity }
  })

  let overall: Severity = "SAFE"
  if (scoredImpacts.some((i) => i.severity === "BREAKING")) {
    overall = "BREAKING"
  } else if (
    scoredImpacts.some((i) => i.severity === "RISKY") ||
    // Destructive change on an entity we couldn't resolve: unknown blast radius
    // is never SAFE.
    unresolvedEntities.some((e) => destructiveEntities.has(e)) ||
    unresolvedEntities.some((e) => logicEntities.has(e))
  ) {
    overall = "RISKY"
  } else if (unresolvedEntities.length > 0 && intents.length > 0) {
    overall = "RISKY"
  }

  return { severity: overall, intents, impacts: scoredImpacts, unresolvedEntities }
}
