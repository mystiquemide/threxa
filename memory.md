# Threxa — Project Memory

## PROJECT OVERVIEW
AI agent that reviews data-model PRs: parses the diff, computes downstream blast radius from DataHub lineage, posts a SAFE/RISKY/BREAKING verdict comment, and writes change records/incidents back to DataHub. Built for the DataHub Agent Hackathon, deadline Aug 10, 2026. Primary track: Metadata-Aware Code Generation & Development.

## PROJECT STRUCTURE
Next.js 16 App Router monolith in `src/`, pipeline in `src/lib/pipeline/`, MCP sidecar config in `mcp/`, docs in `docs/` (PRD.md, TASKS.md, ARCHITECTURE.md). Boilerplate origin: AI SaaS starter (see BOILERPLATE.md). Auth and generic AI routes get stripped.

## CORE MODULES
Pipeline chain: gate → parse (Claude) → lineage (MCP client) → score (deterministic) → comment (GitHub upsert) → writeback (DataHub GraphQL) → persist (Prisma). Orchestrated by `src/lib/pipeline/index.ts`, triggered from the GitHub webhook route via Next `after()`.

## DATABASE / DATA MODELS
Postgres via Prisma 7. Models: Repo, Run (status, severity, summary, fix), ChangeIntent (entity, column, changeType), ImpactedAsset (urn, owner, hop, viaColumn). Full schema in docs/ARCHITECTURE.md §4.

## APIs & INTEGRATIONS
- POST /api/webhooks/github (HMAC, ack 202, process async)
- GET /api/runs, GET /api/runs/:id, GET /api/health (all public)
- GitHub REST (comments, statuses), Anthropic Messages API (claude-sonnet-5, forced tool use for structure), official mcp-server-datahub sidecar over streamable HTTP (read), DataHub GMS GraphQL (write-back).

## KEY DEPENDENCIES
next 16.2.9 (breaking changes vs training data — read node_modules/next/dist/docs before coding), prisma 7, @anthropic-ai/sdk, @modelcontextprotocol/sdk (to add), tailwind v4. npm install not yet run in this workspace.

## ENVIRONMENT VARIABLES
ANTHROPIC_API_KEY, DATABASE_URL, DATAHUB_GMS_URL, DATAHUB_TOKEN, MCP_SERVER_URL, GITHUB_WEBHOOK_SECRET, GITHUB_TOKEN.

## IMPORTANT DECISIONS MADE
- Railway hosts web + Python MCP sidecar + Postgres. vercel.json deleted. (ADR-1)
- Deterministic lineage traversal and scoring in code; Claude only parses diffs and writes explanations/fixes. (ADR-2)
- Postgres over SQLite. (ADR-3)
- Write-back via DataHub GraphQL from Node, no Python in the web app. (ADR-4)
- Webhook: ack immediately, process with after(), no queue. (ADR-5)
- PR comment upsert via `<!-- threxa -->` marker. (ADR-6)
- No auth, public dashboard, HMAC-protected webhook only. (ADR-7)

## ACTIVE WORK (design rebuild session)
DONE and pushed (c1a9381): Groq swap (smoke-tested), hex teardown doc, full landing redesign in (marketing) route group, dashboard in own dark layout, UX audit fixes (OG meta, reduced motion, aria-hidden marquee dupe, h2 eyebrows, flex-wrap). Landing verified rendering on dev :3001 (old dev server PID 38580 still on 3001, hot-reloads). Remaining blockers unchanged: demo repo push approval, railway up approval, favicon/logo asset from Mide. E2E now unblocked by Groq key.

## PREVIOUS ACTIVE WORK
Audit fixes done and pushed (github.com/mystiquemide/threxa, 4 commits). Lineage client verified against live stack and rewritten: 1-hop BFS parallel calls, column-level lineage via get_lineage column arg, 24s for full blast radius. DataHub + showcase-ecommerce + MCP server all running locally in WSL (keep-alive holds VM; ~/.datahubenv sets timeout_sec 120; MCP server task bh4embsj9). Demo repo threxa-demo-pipeline committed locally in scratchpad with 3 scripted branches, BLOCKED on user approving `gh repo create` (public surface). Railway web service created with env vars, BLOCKED on user approving `railway up`. E2E BLOCKED on ANTHROPIC_API_KEY (user must supply). GITHUB_TOKEN wired from gh CLI.

## OLD ACTIVE WORK
DataHub plan final: local WSL2 quickstart (the hackathon's sanctioned path; no DataHub Cloud free trial exists, site is demo-gated; VPS too small). Docker was already installed in WSL Ubuntu, daemon now enabled via `wsl -u root systemctl enable --now docker`. DataHub CLI 1.6.0.13 in ~/datahub-venv. `datahub docker quickstart` downloading images in background. Next: `datahub datapack load showcase-ecommerce`, access token, Task 2 MCP verification (tool names in lineage.ts are unverified assumptions), Task 4 demo repo + webhook secret, Tasks 16/17 demo fixture. Judge story: PR comments persist statically, Railway dashboard reads Postgres, README reproduction = quickstart. Chrome extension has no localhost permission; visual checks via Invoke-WebRequest.

## COMPLETED
- Phase 4 frontend: dashboard run list (stats, guarded repos, run table), run detail (intents, verdict, blast-radius table), landing rewrite (hero/features/cta), severity-badge component, src/lib/runs.ts read layer with demo-mode fallback, threxa-shaped demo-data.ts. Build green, all three pages verified rendering via HTTP (2026-07-11)
- Scaffold from AI SaaS boilerplate
- docs/PRD.md, docs/TASKS.md, docs/ARCHITECTURE.md, memory.md, AGENTS.md conventions (2026-07-11)
- Phase 1/2: npm install, boilerplate stripped (api/ai routes, vercel.json), src/lib/types.ts contract, Prisma schema rewritten (Repo/Run/ChangeIntent/ImpactedAsset), prisma.config.ts + @prisma/adapter-pg (Prisma 7 style), .env.example + .env, mcp/Dockerfile, @modelcontextprotocol/sdk installed, prisma generate + next build green (2026-07-11)
- Railway project "threxa" created (fa2fa2ed-b23e-4497-88cd-a9287a28672d) with Postgres; migration 20260711003658_init applied. Local .env points at the public proxy URL; prod must use DATABASE_URL internal variant.
- Phase 3 backend complete: ai.ts (structured/prose/withRetry), github.ts (HMAC verify, PR files, comment upsert, commit status), datahub.ts (GraphQL write-back + incidents), pipeline (gate, parse, lineage via MCP streamable HTTP, deterministic score, comment, writeback, persist, orchestrator), routes /api/webhooks/github, /api/runs, /api/runs/[id], /api/health. Build green. Smoke-tested live: /api/health db:true, unsigned webhook 401, signed webhook with unhandled action returns skipped (2026-07-11)

## BUGS / GOTCHAS
- WSL2 VM died twice under DataHub quickstart memory spikes (all containers Exited 255, uptime reset). Fixed with C:\Users\Prince\.wslconfig: memory=12GB, swap=8GB. Avoid heavy Windows-side builds while the stack boots.
- .gitignore `.env*` also ignored .env.example; fixed with `!.env.example`.
- Repo live at github.com/mystiquemide/threxa. All commits use Co-Authored-By: MystiqueMide <splashmediahub@gmail.com>, never the Claude default trailer (explicit instruction).
- Prisma 7: no `url` in schema datasource. URL lives in prisma.config.ts (needs `import "dotenv/config"`, Prisma no longer auto-loads .env). Client needs PrismaPg adapter from @prisma/adapter-pg.
- No Docker and no Postgres on this machine. DataHub quickstart can't run locally.
- Never emit SAFE when lineage lookup fails — floor is RISKY/FAILED.

## SESSION LOG
- 2026-07-11: PRD written (session 1). Tasks, architecture, memory, AGENTS conventions, Phase 1 setup + contracts built and building green (session 2).
