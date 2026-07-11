# Threxa — System Architecture

Source: docs/PRD.md, docs/TASKS.md. Stack fixed: Next.js 16 App Router monolith, Prisma + Postgres, Anthropic SDK, official DataHub MCP server, GitHub webhooks. Not a Web3 project.

---

## 1. System Architecture (C4)

### Context

Actors and external systems:

- **PR author** pushes a branch and opens a PR on a guarded repo. Never talks to Threxa directly, only sees the verdict comment.
- **GitHub** sends `pull_request` webhooks (opened, synchronize, closed) and receives verdict comments and commit statuses via REST API.
- **DataHub** (hosted instance loaded with the showcase-ecommerce datapack) is both the read source (lineage, owners, schemas, usage) and the write target (change records, incidents).
- **Anthropic API** (Claude) parses diffs into structured change intents and writes explanations and fix suggestions.
- **Judge / platform lead** browses the public dashboard.

### Containers

Three deployable containers, one platform (Railway):

1. **threxa-web** — the Next.js 16 monolith. Route handlers for the webhook and read APIs, server-rendered dashboard, and the analysis pipeline running in-process. Node.js runtime.
2. **threxa-mcp** — the official `mcp-server-datahub` (Python, FastMCP) run with streamable-HTTP transport as a private sidecar service. threxa-web is its only client.
3. **Postgres** — Railway Postgres, accessed only through Prisma from threxa-web.

External managed services: GitHub REST API, Anthropic Messages API, DataHub (GMS GraphQL + UI).

### Components (inside threxa-web)

The analysis pipeline is a linear chain, each stage a module in `src/lib/pipeline/`:

```
webhook route → gate → parser → lineage → scorer → commenter → writeback → persist
```

- **webhook handler** (`app/api/webhooks/github/route.ts`): verifies HMAC signature, filters events, acks 202 immediately, schedules the pipeline with Next's `after()`.
- **gate** (`pipeline/gate.ts`): file filter. Only `.sql`, dbt model/schema files (`models/**`, `*.yml` schema files) pass. Non-data PRs end here with no Run created.
- **parser** (`pipeline/parse.ts`): Claude call. Diff in, `ChangeIntent[]` out via tool-forced structured output. Zero MCP involvement, pure text-to-structure.
- **lineage client** (`pipeline/lineage.ts`): Node MCP client (`@modelcontextprotocol/sdk`) speaking streamable HTTP to threxa-mcp. Resolves entity URNs, walks multi-hop downstream lineage, fetches owners and entity types. Deterministic code, no LLM.
- **scorer** (`pipeline/score.ts`): pure function. `ChangeIntent[] + ImpactGraph → Severity`. Deterministic so the "zero false SAFE" KPI is testable.
- **commenter** (`pipeline/comment.ts`): builds the verdict markdown, asks Claude for the plain-language explanation and migration path (with real DataHub schema context in the prompt), upserts the PR comment via a hidden `<!-- threxa -->` marker.
- **writeback** (`pipeline/writeback.ts`): DataHub GraphQL mutations. Change record on touched entities after every run; `raiseIncident` on downstream assets when a BREAKING PR merges (the `closed` + `merged` webhook).
- **persist** (`pipeline/persist.ts`): writes Run, ChangeIntents, ImpactedAssets through Prisma at each state transition, not just at the end, so the dashboard shows in-flight runs.
- **dashboard** (`app/dashboard/*`): server components reading Prisma directly. Public, no auth.

### Failure paths

| Failure | Behavior |
|---|---|
| Invalid webhook signature | 401, no side effects |
| DataHub / MCP unreachable | Run marked `FAILED`, PR comment posted saying analysis couldn't complete. Never emit SAFE on missing lineage. |
| Anthropic API error | One retry with backoff, then `FAILED` run + honest PR comment |
| Entity not found in catalog | Impact marked `UNKNOWN_ENTITY`, severity floor RISKY for destructive changes |
| GitHub comment API fails | Run persists with verdict, comment retried once, error stored on Run |
| Pipeline crash mid-run | Run stuck in `RUNNING` > 5 min is rendered as failed in the dashboard |

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router (existing scaffold) | One deployable for webhook API + dashboard. Note: this Next.js version has breaking changes, read `node_modules/next/dist/docs/` before coding (AGENTS.md rule). |
| Language | TypeScript everywhere | Scaffold default, one language across pipeline and UI |
| DB | Postgres (Railway) via Prisma 7 | Boilerplate ships SQLite, swap is one line. Postgres because Railway hosts it next to the app and survives redeploys. |
| LLM | Anthropic SDK, `claude-sonnet-5` for parse/explain | Structured output via forced tool use, fast enough for the 60s latency KPI |
| Lineage | Official `mcp-server-datahub` sidecar over streamable HTTP | Judging requires the official MCP server as a component. Sidecar keeps the Python dependency off the web container. |
| Write-back | DataHub GraphQL API direct from Node | No Python SDK in the web app. GraphQL covers documentation/properties updates and `raiseIncident`. |
| Catalog | DataHub quickstart on a VPS or DataHub Cloud trial, loaded with showcase-ecommerce | Must be reachable by threxa-mcp. Decided at Task 1. |
| Styling/UI | Tailwind v4 + boilerplate components (Button, Card, Modal, Toast, Skeleton) | Already there |
| Hosting | Railway (web + MCP sidecar + Postgres) | One platform, private networking between web and sidecar, no serverless timeout concerns. vercel.json gets deleted. |
| Auth | None | PRD: public read dashboard. NextAuth stripped from boilerplate. |

## 3. Folder Structure

```
threxa/
├── docs/                      # PRD, TASKS, ARCHITECTURE
├── prisma/
│   └── schema.prisma          # Repo, Run, ChangeIntent, ImpactedAsset
├── mcp/                       # threxa-mcp sidecar (Dockerfile + config, no app code)
│   └── Dockerfile             # pip install mcp-server-datahub, runs streamable-http
├── src/
│   ├── app/
│   │   ├── page.tsx           # landing (rewritten for Threxa)
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # run list + severity stats + guarded repos
│   │   │   └── runs/[id]/page.tsx  # blast-radius detail view
│   │   └── api/
│   │       ├── webhooks/github/route.ts   # F1 entry point
│   │       └── runs/route.ts              # JSON list for polling/refresh
│   ├── components/
│   │   ├── ui/                # boilerplate primitives (keep)
│   │   ├── landing/           # hero, features, cta (rewrite copy)
│   │   └── dashboard/         # RunCard, SeverityBadge, ImpactTable, ImpactGraph
│   └── lib/
│       ├── types.ts           # ChangeIntent, ImpactedAsset, ImpactReport, Severity — Task 6 contract
│       ├── db.ts              # Prisma singleton (exists)
│       ├── ai.ts              # Anthropic client + structured-output helper
│       ├── github.ts          # signature verify, comment upsert, commit status
│       ├── datahub.ts         # GraphQL client for write-back
│       └── pipeline/
│           ├── index.ts       # runAnalysis(orchestrator)
│           ├── gate.ts
│           ├── parse.ts
│           ├── lineage.ts     # MCP client
│           ├── score.ts
│           ├── comment.ts
│           ├── writeback.ts
│           └── persist.ts
├── railway.toml               # two services: web, mcp
└── .env.example
```

Deleted from boilerplate: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/`, `src/app/api/ai/` (generic AI routes), `next-auth` dependency, `vercel.json`.

## 4. Data Models

ERD: `Repo 1—N Run 1—N ChangeIntent`, `Run 1—N ImpactedAsset`.

```prisma
model Repo {
  id        String  @id @default(cuid())
  owner     String
  name      String
  runs      Run[]
  createdAt DateTime @default(now())
  @@unique([owner, name])
}

model Run {
  id           String    @id @default(cuid())
  repo         Repo      @relation(fields: [repoId], references: [id])
  repoId       String
  prNumber     Int
  prTitle      String
  prUrl        String
  headSha      String
  status       RunStatus @default(RUNNING)   // RUNNING | COMPLETED | FAILED | SKIPPED
  severity     Severity?                     // SAFE | RISKY | BREAKING (null until scored)
  summary      String?                       // Claude's plain-language explanation
  suggestedFix String?
  commentUrl   String?
  error        String?
  wroteBack    Boolean   @default(false)
  incidentUrns String[]                      // set when merged BREAKING raises incidents
  intents      ChangeIntent[]
  impacts      ImpactedAsset[]
  startedAt    DateTime  @default(now())
  finishedAt   DateTime?
  @@index([repoId, prNumber])
}

model ChangeIntent {
  id         String     @id @default(cuid())
  run        Run        @relation(fields: [runId], references: [id])
  runId      String
  entity     String                        // model/table name from the diff
  entityUrn  String?                       // resolved DataHub URN, null if not found
  column     String?
  changeType ChangeType                    // COLUMN_DROPPED | COLUMN_RENAMED | COLUMN_ADDED | TYPE_CHANGED | LOGIC_CHANGED | ENTITY_DROPPED
  detail     String
}

model ImpactedAsset {
  id        String  @id @default(cuid())
  run       Run     @relation(fields: [runId], references: [id])
  runId     String
  urn       String
  name      String
  entityType String                        // dataset | dashboard | chart | mlFeature | dataJob
  owner     String?
  hop       Int                            // 1 = direct downstream
  viaColumn String?                        // set when a dropped/renamed column is consumed here
  severity  Severity                       // per-asset contribution
}
```

Severity scoring rule (scorer, deterministic):

- **BREAKING**: destructive intent (drop/rename/type change) AND at least one downstream asset, with `viaColumn` match or the whole entity dropped.
- **RISKY**: destructive intent with `UNKNOWN_ENTITY` or unresolved column usage, or `LOGIC_CHANGED` with downstream consumers.
- **SAFE**: additive-only changes, or no downstream consumers at any hop.

## 5. API Contracts

```
POST /api/webhooks/github
  Headers: X-Hub-Signature-256 (HMAC verified), X-GitHub-Event
  Events handled: pull_request [opened, synchronize, closed]
  202 {"runId": "..."}       queued for analysis
  200 {"skipped": "reason"}  non-data PR or unhandled action
  401                        bad signature
  Side effects: Run row, PR comment, DataHub write-back (async via after())

GET /api/runs?repo=owner/name&limit=50
  200 {"runs": [{id, repo, prNumber, prTitle, prUrl, status, severity, startedAt, finishedAt}]}
  Public, no auth. Powers dashboard refresh.

GET /api/runs/:id
  200 {"run": {...full run, intents: [...], impacts: [...]}}
  404 if unknown.

GET /api/health
  200 {"db": true, "mcp": true, "datahub": true}   used by Railway healthcheck and demo-day sanity
```

Internal contract (`src/lib/types.ts`, Task 6 — the parser/engine boundary):

```ts
type Severity = "SAFE" | "RISKY" | "BREAKING"
type ChangeType = "COLUMN_DROPPED" | "COLUMN_RENAMED" | "COLUMN_ADDED"
                | "TYPE_CHANGED" | "LOGIC_CHANGED" | "ENTITY_DROPPED"

interface ChangeIntent { entity: string; column?: string; changeType: ChangeType;
                         detail: string; renamedTo?: string }

interface ImpactedAsset { urn: string; name: string; entityType: string;
                          owner?: string; hop: number; viaColumn?: string;
                          severity: Severity }

interface ImpactReport { severity: Severity; intents: ChangeIntent[];
                         impacts: ImpactedAsset[]; unresolvedEntities: string[] }
```

## 6. Architecture Decision Records

### ADR-1: Railway monolith + MCP sidecar, not Vercel
Context: the official DataHub MCP server is Python. The Anthropic MCP connector or a Node MCP client both need it reachable over HTTP. Vercel functions can't host a persistent Python sidecar next to the app.
Options: (a) Vercel web + MCP hosted elsewhere, (b) Railway with both services, (c) rewrite lineage calls against raw GraphQL and skip MCP.
Decision: (b). One platform, private networking, no cross-cloud secrets. (c) rejected because the official MCP server is the hackathon's required component.
Consequences: delete vercel.json, railway.toml gains a second service. Slightly slower cold deploys than Vercel, irrelevant here.

### ADR-2: Deterministic pipeline with LLM at the edges, not a free agentic loop
Context: we could hand Claude the MCP tools and let it explore lineage itself.
Options: (a) full agentic loop with MCP connector, (b) deterministic traversal in code, Claude only for parse (diff → intents) and explain (verdict prose + fix).
Decision: (b). The "zero false SAFE" KPI must be testable, and a deterministic scorer is auditable in the demo. Claude still does the genuinely hard NLP parts.
Consequences: lineage.ts owns traversal logic, more code but predictable latency and cost. The MCP server is still exercised on every run (judging component satisfied).

### ADR-3: Postgres over boilerplate SQLite
Context: SQLite dies on Railway redeploys and can't be shared by future workers.
Decision: Railway Postgres, one-line datasource swap plus `prisma migrate`.
Consequences: DATABASE_URL required in all environments, local dev uses a local Postgres or Railway dev DB.

### ADR-4: Write-back via DataHub GraphQL from Node, not the Python SDK
Context: F5 needs change records and incidents written to DataHub. The Python SDK (Agent Context Kit) is idiomatic but would drag Python into the web app.
Decision: call GMS GraphQL directly (`updateDescription`/custom properties for change records, `raiseIncident` for incidents) from `src/lib/datahub.ts`.
Consequences: a thin hand-rolled client, a few mutations to maintain. The MCP sidecar stays read-only.

### ADR-5: Webhook ack-then-process with `after()`, no queue
Context: GitHub webhooks time out at 10s, pipeline takes up to 60s.
Options: (a) queue (BullMQ/Redis), (b) Next `after()` on a persistent Node server.
Decision: (b). Railway keeps the process alive, `after()` schedules post-response work, zero new infrastructure. A queue is post-hackathon scope.
Consequences: a crash mid-run loses that run (acceptable, re-push retriggers). Dashboard treats stale RUNNING as failed.

### ADR-6: Comment upsert via marker
Decision: find existing comment containing `<!-- threxa -->` and PATCH it, else POST. Satisfies F4's "regenerated, not duplicated".

### ADR-7: No auth anywhere
Decision: per PRD, dashboard and read APIs are public, NextAuth is stripped from the boilerplate. Only the webhook is protected (HMAC). Revisit only if abuse shows up, which it won't during judging.

## 7. Component Ownership

| Component | Owner |
|---|---|
| Webhook, pipeline, github.ts, datahub.ts, lineage MCP client | Backend |
| types.ts contract | Architect (this doc), enforced by Backend |
| Dashboard pages + components, landing rewrite | Frontend |
| Railway config, mcp/Dockerfile, DataHub instance, .env.example | DevOps |
| Demo repo + scripted PRs | Backend |
| E2E validation | QA |
