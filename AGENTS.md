<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Threxa Conventions

Read `memory.md` first, then `docs/ARCHITECTURE.md` for the full design. docs/TASKS.md is the work queue.

## Stack
Next.js 16 App Router (TypeScript, `src/` dir), Prisma 7 + Postgres, Tailwind v4, Anthropic SDK (`claude-sonnet-5`), `@modelcontextprotocol/sdk` client → official `mcp-server-datahub` sidecar, DataHub GraphQL for write-back. Deployed on Railway (web + mcp + postgres).

## Rules
- All pipeline stages live in `src/lib/pipeline/`, one file per stage, pure functions where possible. The orchestrator is `pipeline/index.ts`.
- Shared types come from `src/lib/types.ts` only. Never redefine ChangeIntent/ImpactedAsset/Severity locally.
- Severity scoring is deterministic code in `score.ts`. Claude never decides severity.
- Never return SAFE when lineage data is missing or an entity is unresolved.
- LLM calls go through `src/lib/ai.ts` with forced tool use for structured output. No raw JSON.parse on completions.
- Webhook route acks within 10s (GitHub timeout); heavy work runs via `after()`.
- PR comments are upserted via the `<!-- threxa -->` marker, never duplicated.
- No auth code. Dashboard and read APIs are public; the webhook is HMAC-verified.
- Use boilerplate UI primitives in `src/components/ui/` before adding new ones.
- No emoji in UI copy, docs, or comments posted to PRs.
