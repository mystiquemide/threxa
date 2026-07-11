// Core contracts shared by the parser, blast-radius engine, scorer, and UI.
// This is the only place these shapes are defined (AGENTS.md rule).

export type Severity = "SAFE" | "RISKY" | "BREAKING"

export type RunStatus = "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED"

export type ChangeType =
  | "COLUMN_DROPPED"
  | "COLUMN_RENAMED"
  | "COLUMN_ADDED"
  | "TYPE_CHANGED"
  | "LOGIC_CHANGED"
  | "ENTITY_DROPPED"

export interface ChangeIntent {
  /** Model/table name as written in the diff, e.g. "fct_orders" */
  entity: string
  /** Resolved DataHub URN; null until lineage stage resolves it */
  entityUrn?: string | null
  column?: string
  changeType: ChangeType
  /** One-sentence description of the specific change */
  detail: string
  /** New column name when changeType is COLUMN_RENAMED */
  renamedTo?: string
}

export interface ImpactedAsset {
  urn: string
  name: string
  /** dataset | dashboard | chart | mlFeature | dataJob | ... (DataHub entity type) */
  entityType: string
  owner?: string
  /** Lineage hop distance from the touched entity; 1 = direct downstream */
  hop: number
  /** Set when a dropped/renamed column is known to be consumed by this asset */
  viaColumn?: string
  /** The touched entity this impact descends from; scoring is per source entity */
  sourceEntity: string
  severity: Severity
}

export interface ImpactReport {
  severity: Severity
  intents: ChangeIntent[]
  impacts: ImpactedAsset[]
  /** Entities in the diff that could not be resolved in the catalog */
  unresolvedEntities: string[]
}

/** Minimal PR context threaded through the pipeline */
export interface PrContext {
  owner: string
  repo: string
  prNumber: number
  prTitle: string
  prUrl: string
  headSha: string
  action: "opened" | "synchronize" | "closed"
  merged: boolean
}
