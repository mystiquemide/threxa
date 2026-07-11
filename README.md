# Threxa

The agent that stops data breaking changes before they merge.

Someone renames a column in a dbt model, the PR looks harmless, it merges, and three days later the revenue dashboard is wrong. Impact analysis exists inside DataHub, but nobody opens the catalog during code review. Threxa closes that gap: it sits on the pull request, computes the downstream blast radius from DataHub lineage, and posts the verdict where the decision happens.

Built for the DataHub Agent Hackathon (Metadata-Aware Code Generation & Development track).

## What it does

1. A GitHub webhook fires when a PR touches SQL or dbt model files.
2. Claude parses the diff into structured change intents (columns dropped, renamed, retyped, logic changed).
3. Threxa queries DataHub through the official [MCP server](https://github.com/acryldata/mcp-server-datahub) for multi-hop downstream lineage, owners, and schemas, and checks whether affected columns are actually consumed downstream.
4. A deterministic scorer assigns SAFE, RISKY, or BREAKING. The LLM never decides severity, and missing lineage never yields SAFE.
5. One PR comment carries the verdict: severity, impact table (asset, type, owner, hop, via-column), a plain-language explanation, and a migration path referencing real column names. BREAKING also sets a failing commit status.
6. Every analysis writes a change record back to the touched DataHub entities. Merging a BREAKING PR raises incidents on the affected downstream assets. The catalog remembers.

A public dashboard shows run history and per-run blast radius.

## Judge quickstart (~10 minutes)

Prereqs: Docker, Python 3.10+, Node 20+, an Anthropic API key, a GitHub repo you can webhook.

```bash
# 1. DataHub with sample lineage (the hackathon's standard setup)
pip install acryl-datahub
datahub docker quickstart
datahub datapack load showcase-ecommerce
# UI: http://localhost:9002 — create an access token under Settings

# 2. The official DataHub MCP server
pip install mcp-server-datahub
DATAHUB_GMS_URL=http://localhost:8080 DATAHUB_GMS_TOKEN=<token> \
  mcp-server-datahub --transport streamable-http --port 8000

# 3. Threxa
git clone https://github.com/mystiquemide/threxa && cd threxa
npm install
cp .env.example .env   # fill in the values from steps 1-2
npx prisma migrate dev
npm run dev

# 4. Point a GitHub webhook (pull_request events, your GITHUB_WEBHOOK_SECRET)
#    at <your tunnel>/api/webhooks/github, then open a PR that drops a column
#    from a model matching a showcase-ecommerce entity. The verdict comment
#    lands on the PR and the run appears at /dashboard.
```

No DataHub? Set `NEXT_PUBLIC_DEMO_MODE=true` and open `/dashboard` to click through sample verdicts (clearly labeled as demo data).

## Architecture

```
GitHub PR ──webhook──▶ Next.js route ──after()──▶ pipeline
                                                    gate → parse (Claude) → lineage (MCP) →
                                                    score (deterministic) → comment (GitHub) →
                                                    writeback (DataHub GraphQL) → persist (Postgres)
```

- Next.js 16 monolith: webhook + API + dashboard. Postgres via Prisma.
- Lineage reads go through the official `mcp-server-datahub` (streamable HTTP).
- Write-back uses DataHub GraphQL: documentation change records plus `raiseIncident`.
- Full design, ADRs, and data model: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Product spec: [docs/PRD.md](docs/PRD.md).

## Hackathon criteria mapping

| Criterion | Where |
|---|---|
| Uses DataHub + official component | MCP server for all lineage reads (`src/lib/pipeline/lineage.ts`) |
| Contribution to the context graph | Change records + incidents written back (`src/lib/pipeline/writeback.ts`) |
| Does real work | Verdict comments, failing commit statuses, incident creation |
| Reproducible | Quickstart above; demo repo with scripted PRs |

## Development

```bash
npm test        # scorer + gate unit tests (the zero-false-SAFE invariant lives here)
npm run build   # typecheck + production build
```

## License

Apache 2.0
