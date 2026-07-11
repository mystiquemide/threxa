// Pre-seeded runs for demo mode (NEXT_PUBLIC_DEMO_MODE=true): the dashboard
// renders a realistic history without a database. Entities, owners, and counts
// mirror real output from the integration run against the showcase-ecommerce
// datapack (scripts/integration-lineage.mjs), so demo data matches what
// anyone reproducing the flow will actually see.
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000)

export const demoRuns = [
  {
    id: "demo-1",
    repo: "mystiquemide/threxa-demo-pipeline",
    prNumber: 14,
    prTitle: "refactor: drop cust_email from order_details",
    prUrl: "",
    headSha: "a3f8c21",
    status: "COMPLETED",
    severity: "BREAKING",
    summary:
      "Dropping cust_email from order_details breaks eight direct consumers, including the Customer Analytics Measures in PowerBI and the ORDER_DETAILS_REPLICA table, and ripples into the datahub_order_entries dashboard two hops out.",
    suggestedFix:
      "Deprecate first: keep cust_email as a passthrough for one release, migrate the eight consumers off it, then drop the column.",
    commentUrl: null,
    wroteBack: true,
    startedAt: hoursAgo(2),
    finishedAt: hoursAgo(2),
    intents: [
      {
        id: "demo-1-i1",
        entity: "order_details",
        entityUrn:
          "urn:li:dataset:(urn:li:dataPlatform:snowflake,b2fd91.order_entry_db.analytics.order_details,PROD)",
        column: "cust_email",
        changeType: "COLUMN_DROPPED",
        detail: "SELECT list no longer includes cust_email",
        renamedTo: null,
      },
    ],
    impacts: [
      { id: "demo-1-a1", sourceEntity: "order_details", urn: "urn:li:dataset:(powerbi,customer_analytics_measures)", name: "Customer Analytics Measures", entityType: "dataset", owner: "Karen Okonkwo", hop: 1, viaColumn: "cust_email", severity: "BREAKING" },
      { id: "demo-1-a2", sourceEntity: "order_details", urn: "urn:li:dataset:(snowflake,order_details_replica)", name: "ORDER_DETAILS_REPLICA", entityType: "dataset", owner: "Fiona Green", hop: 1, viaColumn: "cust_email", severity: "BREAKING" },
      { id: "demo-1-a3", sourceEntity: "order_details", urn: "urn:li:dataset:(powerbi,essential_kpi_measures)", name: "Essential KPI Measures", entityType: "dataset", owner: "Karen Okonkwo", hop: 1, viaColumn: "cust_email", severity: "BREAKING" },
      { id: "demo-1-a4", sourceEntity: "order_details", urn: "urn:li:dataset:(snowflake,order_history)", name: "ORDER_HISTORY", entityType: "dataset", owner: "Data Platform Team", hop: 1, viaColumn: null, severity: "RISKY" },
      { id: "demo-1-a5", sourceEntity: "order_details", urn: "urn:li:dashboard:(powerbi,datahub_order_entries)", name: "datahub_order_entries", entityType: "dashboard", owner: "Sarah Chen", hop: 2, viaColumn: null, severity: "RISKY" },
    ],
  },
  {
    id: "demo-2",
    repo: "mystiquemide/threxa-demo-pipeline",
    prNumber: 13,
    prTitle: "feat: add is_express_delivery flag to order_details",
    prUrl: "",
    headSha: "b7e1d09",
    status: "COMPLETED",
    severity: "SAFE",
    summary:
      "Adding is_express_delivery is additive; no downstream asset reads a column that changed shape.",
    suggestedFix: "None needed. Document the new column in the model YAML.",
    commentUrl: null,
    wroteBack: true,
    startedAt: hoursAgo(26),
    finishedAt: hoursAgo(26),
    intents: [
      {
        id: "demo-2-i1",
        entity: "order_details",
        entityUrn:
          "urn:li:dataset:(urn:li:dataPlatform:snowflake,b2fd91.order_entry_db.analytics.order_details,PROD)",
        column: "is_express_delivery",
        changeType: "COLUMN_ADDED",
        detail: "New computed column is_express_delivery added to SELECT list",
        renamedTo: null,
      },
    ],
    impacts: [],
  },
  {
    id: "demo-3",
    repo: "mystiquemide/threxa-demo-pipeline",
    prNumber: 12,
    prTitle: "fix: only completed orders in last 2 years in order_history",
    prUrl: "",
    headSha: "c4a9f77",
    status: "COMPLETED",
    severity: "RISKY",
    summary:
      "No columns change shape, but the filter feeding order_history changes what rows exist. Its direct upstream consumers keep working while silently reading different data.",
    suggestedFix:
      "Coordinate with the owners of the downstream marts before merge, and backfill or annotate the affected reporting windows.",
    commentUrl: null,
    wroteBack: true,
    startedAt: hoursAgo(50),
    finishedAt: hoursAgo(50),
    intents: [
      {
        id: "demo-3-i1",
        entity: "order_history",
        entityUrn:
          "urn:li:dataset:(urn:li:dataPlatform:snowflake,b2fd91.order_entry_db.analytics.order_history,PROD)",
        column: null,
        changeType: "LOGIC_CHANGED",
        detail: "WHERE clause now excludes cancelled orders older than two years",
        renamedTo: null,
      },
    ],
    impacts: [
      { id: "demo-3-a1", sourceEntity: "order_history", urn: "urn:li:dataset:(powerbi,time_intelligence_measures)", name: "Time Intelligence Measures", entityType: "dataset", owner: "Karen Okonkwo", hop: 1, viaColumn: null, severity: "RISKY" },
    ],
  },
]

export type DemoRun = (typeof demoRuns)[number]
