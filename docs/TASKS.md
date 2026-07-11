# Threxa — Task Plan

Source: docs/PRD.md. Deadline: Aug 10, 2026 (DataHub Agent Hackathon).
Stack: Next.js 16 (App Router), Prisma + Postgres, Anthropic SDK, DataHub MCP server, GitHub webhooks.

Severity legend: S (under 2 hours), M (half day), L (full day+).

---

## Phase 1 — Setup

**Task 1: Stand up DataHub with the showcase-ecommerce datapack** — CRITICAL PATH
Owner: DevOps
Complexity: M
Depends on: none
Done when: A reachable DataHub instance shows showcase-ecommerce entities with lineage in the UI, and an access token exists for Threxa.

**Task 2: Verify DataHub MCP server access** — CRITICAL PATH
Owner: Backend
Complexity: M
Depends on: 1
Done when: A local script calls the official mcp-server-datahub and returns multi-hop downstream lineage plus owners for one showcase-ecommerce entity.

**Task 3: Prisma schema and database**
Owner: Backend
Complexity: S
Depends on: none
Done when: `prisma migrate` creates Repo, Run, ChangeIntent, and ImpactedAsset tables and the app connects to Postgres locally.

**Task 4: GitHub webhook plumbing**
Owner: Backend
Complexity: S
Depends on: none
Done when: A webhook secret and token are configured and a test delivery from GitHub reaches a local endpoint (via tunnel) with a verified signature.

**Task 5: Environment configuration**
Owner: DevOps
Complexity: S
Depends on: none
Done when: `.env.example` lists every required variable (ANTHROPIC_API_KEY, DATABASE_URL, DATAHUB_GMS_URL, DATAHUB_TOKEN, GITHUB_WEBHOOK_SECRET, GITHUB_TOKEN) and the app boots with a filled `.env`.

## Phase 2 — Contracts

**Task 6: Core type contracts** — CRITICAL PATH (blocks 7, 8, 9, 10, 12)
Owner: Architect
Complexity: S
Depends on: none
Done when: `src/lib/types.ts` defines ChangeIntent, ImpactedAsset, ImpactReport, and Severity (SAFE / RISKY / BREAKING) and both parser and engine import from it.

## Phase 3 — Backend

**Task 7: F1 webhook receiver route**
Owner: Backend
Complexity: M
Depends on: 4, 6
Done when: PR opened/synchronize events with .sql or dbt file changes create an analysis run, and PRs touching no data files produce no run.

**Task 8: F2 change parser (Claude step 1)**
Owner: Backend
Complexity: M
Depends on: 6
Done when: Given a real dbt-style SQL diff that drops a column, the parser returns a structured `{entity, column, change_type}` ChangeIntent array with no hallucinated entities.

**Task 9a: DataHub lineage client** — CRITICAL PATH
Owner: Backend
Complexity: M
Depends on: 2, 6
Done when: A typed client function takes an entity name and returns downstream assets with type, owner, and hop distance from the live DataHub instance.

**Task 9b: F3 blast-radius engine and severity scoring**
Owner: Backend
Complexity: M
Depends on: 8, 9a
Done when: For a showcase-ecommerce entity with known consumers, the engine lists every downstream asset and scores BREAKING only when a dropped/renamed column is actually consumed downstream.

**Task 10: F4 PR verdict comment**
Owner: Backend
Complexity: M
Depends on: 9b
Done when: One comment with severity badge, impact table, plain-language explanation, and Claude-generated fix (referencing real column names) appears on the PR, and a new push updates it instead of duplicating it.

**Task 11: F5 catalog write-back**
Owner: Backend
Complexity: M
Depends on: 9b
Done when: After a run, the touched DataHub entity shows Threxa's change record, and merging a BREAKING PR creates a visible incident on affected downstream assets.

**Task 12: Persist runs and impacts**
Owner: Backend
Complexity: S
Depends on: 3, 7
Done when: Every webhook run writes its verdict, intents, and impacted assets to the database and is queryable by repo.

## Phase 4 — Frontend

**Task 13: F6 dashboard run list**
Owner: Frontend
Complexity: M
Depends on: 12
Done when: `/dashboard` lists all runs with repo, PR link, severity, and timestamp, publicly readable with no auth wall.

**Task 14: F6 run detail with blast-radius view**
Owner: Frontend
Complexity: M
Depends on: 13
Done when: Clicking a run shows the impact graph/table (asset, type, owner, hop) and the posted verdict, plus severity stats and a guarded-repos list.

**Task 15: Landing page rewrite for Threxa**
Owner: Frontend
Complexity: S
Depends on: none
Done when: Hero, features, and CTA describe Threxa's PR-gate story instead of boilerplate copy.

## Phase 5 — Demo Fixture

**Task 16: F7 demo repo `threxa-demo-pipeline`**
Owner: Backend
Complexity: M
Depends on: 1
Done when: A public repo contains dbt-style models whose names match showcase-ecommerce catalog entities and the Threxa webhook is installed on it.

**Task 17: Scripted demo PRs**
Owner: Backend
Complexity: S
Depends on: 16
Done when: Three reproducible branches exist (breaking drop, risky rename, safe formatting change) with a documented click path to open each as a PR.

## Phase 6 — Testing

**Task 18: End-to-end demo validation**
Owner: QA
Complexity: M
Depends on: 7, 8, 9b, 10, 11, 12, 17
Done when: All scripted PRs get correct verdicts (zero false SAFE), PR-open-to-comment latency is under 60 seconds, and results appear on the dashboard.

**Task 19: Write-back verification**
Owner: QA
Complexity: S
Depends on: 11, 18
Done when: The DataHub UI visibly shows Threxa's change record and the incident from the merged breaking PR, captured as screenshots for the submission.

## Phase 7 — Deploy & Submission

**Task 20: Production deploy**
Owner: DevOps
Complexity: M
Depends on: 13, 14, 18
Done when: The dashboard and webhook endpoint run on a public URL and a live PR against the demo repo completes the full flow in production.

**Task 21: README and judge quickstart**
Owner: DevOps
Complexity: M
Depends on: 20
Done when: A fresh reader can reproduce the full flow in under 10 minutes from the README, including catalog setup and demo PR path.

**Task 22: Demo video (under 3 minutes)**
Owner: PM
Complexity: M
Depends on: 20, 17
Done when: A recorded video walks the breaking-PR story end to end (PR open → verdict comment → DataHub write-back → dashboard) within the time limit.

**Task 23: Stretch S3 — CI status check**
Owner: Backend
Complexity: S
Depends on: 10
Done when: BREAKING verdicts set a failing commit status on the PR so merge is visibly blocked.

**Task 24: Bonus — upstream OSS contribution**
Owner: Backend
Complexity: M
Depends on: 9a
Done when: One merged or submitted PR/issue against datahub-skills or mcp-server-datahub is linked in the submission.

---

## Dependency notes

- Critical path: 1 → 2 → 9a → 9b → 10/11 → 18 → 20 → 21/22. Start Task 1 first, everything DataHub-shaped hangs off it.
- Parallel lanes while Task 1/2 are in flight: 3, 4, 5, 6, 8, 15 have no DataHub dependency.
- Task 6 blocks four tasks — settle contracts before writing parser or engine code.
- Stretch tasks S1 (Slack) and S2 (auto-fix commits) are unscheduled; only pick up 23 (cheap) if 18 passes early.

## PRD acceptance coverage

| PRD feature | Covered by |
|---|---|
| F1 webhook gate | 4, 7 |
| F2 change parser | 8 |
| F3 blast radius | 2, 9a, 9b |
| F4 verdict comment | 10 |
| F5 write-back | 11, 19 |
| F6 dashboard | 12, 13, 14 |
| F7 demo fixture | 16, 17 |
| KPIs (latency, zero false SAFE) | 18 |
| Submission requirements | 20, 21, 22, 24 |
