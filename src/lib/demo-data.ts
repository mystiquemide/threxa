// Pre-seeded runs for demo mode (NEXT_PUBLIC_DEMO_MODE=true): the dashboard
// renders a realistic history without a database. Shapes mirror the Prisma
// models used by the dashboard queries.
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000)

export const demoRuns = [
  {
    id: "demo-1",
    repo: "mystiquemide/threxa-demo-pipeline",
    prNumber: 14,
    prTitle: "refactor: drop customer_email from fct_orders",
    prUrl: "https://github.com/mystiquemide/threxa-demo-pipeline/pull/14",
    headSha: "a3f8c21",
    status: "COMPLETED",
    severity: "BREAKING",
    summary:
      "Dropping customer_email from fct_orders breaks the Customer 360 dashboard in Looker and the churn-model feature pipeline, both of which read the column directly.",
    suggestedFix:
      "Deprecate first: keep customer_email as a passthrough for one release, add a dbt deprecation warning, migrate the two consumers to dim_customers.email, then drop.",
    commentUrl: "https://github.com/mystiquemide/threxa-demo-pipeline/pull/14#issuecomment-demo",
    wroteBack: true,
    startedAt: hoursAgo(2),
    finishedAt: hoursAgo(2),
    intents: [
      {
        id: "demo-1-i1",
        entity: "fct_orders",
        entityUrn: "urn:li:dataset:(urn:li:dataPlatform:dbt,showcase.fct_orders,PROD)",
        column: "customer_email",
        changeType: "COLUMN_DROPPED",
        detail: "SELECT list no longer includes customer_email",
        renamedTo: null,
      },
    ],
    impacts: [
      { id: "demo-1-a1", sourceEntity: "fct_orders", urn: "urn:li:dashboard:(looker,customer_360)", name: "Customer 360", entityType: "dashboard", owner: "bi-team", hop: 2, viaColumn: "customer_email", severity: "BREAKING" },
      { id: "demo-1-a2", sourceEntity: "fct_orders", urn: "urn:li:mlFeatureTable:(feast,churn_features)", name: "churn_features", entityType: "mlFeatureTable", owner: "ml-platform", hop: 1, viaColumn: "customer_email", severity: "BREAKING" },
      { id: "demo-1-a3", sourceEntity: "fct_orders", urn: "urn:li:dataset:(urn:li:dataPlatform:snowflake,showcase.rpt_daily_orders,PROD)", name: "rpt_daily_orders", entityType: "dataset", owner: "analytics", hop: 1, viaColumn: null, severity: "RISKY" },
    ],
  },
  {
    id: "demo-2",
    repo: "mystiquemide/threxa-demo-pipeline",
    prNumber: 13,
    prTitle: "feat: add margin_pct to fct_orders",
    prUrl: "https://github.com/mystiquemide/threxa-demo-pipeline/pull/13",
    headSha: "b7e1d09",
    status: "COMPLETED",
    severity: "SAFE",
    summary: "Adding margin_pct is additive; no downstream asset reads a column that changes.",
    suggestedFix: "None needed. Document the new column in the model YAML.",
    commentUrl: "https://github.com/mystiquemide/threxa-demo-pipeline/pull/13#issuecomment-demo",
    wroteBack: true,
    startedAt: hoursAgo(26),
    finishedAt: hoursAgo(26),
    intents: [
      {
        id: "demo-2-i1",
        entity: "fct_orders",
        entityUrn: "urn:li:dataset:(urn:li:dataPlatform:dbt,showcase.fct_orders,PROD)",
        column: "margin_pct",
        changeType: "COLUMN_ADDED",
        detail: "New computed column margin_pct added to SELECT list",
        renamedTo: null,
      },
    ],
    impacts: [],
  },
  {
    id: "demo-3",
    repo: "mystiquemide/threxa-demo-pipeline",
    prNumber: 12,
    prTitle: "fix: rename order_ts to ordered_at in stg_orders",
    prUrl: "https://github.com/mystiquemide/threxa-demo-pipeline/pull/12",
    headSha: "c4a9f77",
    status: "COMPLETED",
    severity: "RISKY",
    summary:
      "Renaming order_ts changes the staging contract. Direct consumer fct_orders selects it explicitly; the rename ripples into three downstream marts unless aliased.",
    suggestedFix: "Alias the old name during transition: SELECT ordered_at AS order_ts until fct_orders is migrated.",
    commentUrl: "https://github.com/mystiquemide/threxa-demo-pipeline/pull/12#issuecomment-demo",
    wroteBack: true,
    startedAt: hoursAgo(50),
    finishedAt: hoursAgo(50),
    intents: [
      {
        id: "demo-3-i1",
        entity: "stg_orders",
        entityUrn: "urn:li:dataset:(urn:li:dataPlatform:dbt,showcase.stg_orders,PROD)",
        column: "order_ts",
        changeType: "COLUMN_RENAMED",
        detail: "Column order_ts renamed",
        renamedTo: "ordered_at",
      },
    ],
    impacts: [
      { id: "demo-3-a1", sourceEntity: "stg_orders", urn: "urn:li:dataset:(urn:li:dataPlatform:dbt,showcase.fct_orders,PROD)", name: "fct_orders", entityType: "dataset", owner: "data-eng", hop: 1, viaColumn: null, severity: "RISKY" },
    ],
  },
]

export type DemoRun = (typeof demoRuns)[number]
