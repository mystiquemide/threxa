import { after } from "next/server"
import { fetchPrFiles, verifySignature } from "@/lib/github"
import { handleMerge, runAnalysis } from "@/lib/pipeline"
import { dataFiles } from "@/lib/pipeline/gate"
import { createRun } from "@/lib/pipeline/persist"
import type { PrContext } from "@/lib/types"

interface PrEvent {
  action: string
  pull_request: {
    number: number
    title: string
    html_url: string
    merged: boolean
    head: { sha: string }
  }
  repository: { name: string; owner: { login: string } }
}

// F1 entry point. Verify HMAC, gate, ack fast (GitHub times out at 10s),
// run the pipeline after the response (ADR-5).
export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get("x-hub-signature-256")
  if (!verifySignature(payload, signature)) {
    return Response.json({ error: "invalid signature" }, { status: 401 })
  }

  const eventName = request.headers.get("x-github-event")
  if (eventName !== "pull_request") {
    return Response.json({ skipped: `event ${eventName} not handled` })
  }

  const event = JSON.parse(payload) as PrEvent
  const ctx: PrContext = {
    owner: event.repository.owner.login,
    repo: event.repository.name,
    prNumber: event.pull_request.number,
    prTitle: event.pull_request.title,
    prUrl: event.pull_request.html_url,
    headSha: event.pull_request.head.sha,
    action: event.action as PrContext["action"],
    merged: event.pull_request.merged,
  }

  if (event.action === "closed") {
    if (!ctx.merged) return Response.json({ skipped: "PR closed without merge" })
    after(() => handleMerge(ctx))
    return new Response(JSON.stringify({ queued: "merge handling" }), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (event.action !== "opened" && event.action !== "synchronize") {
    return Response.json({ skipped: `action ${event.action} not handled` })
  }

  // Gate before creating a run: non-data PRs are ignored entirely (F1).
  const files = dataFiles(await fetchPrFiles(ctx.owner, ctx.repo, ctx.prNumber))
  if (files.length === 0) {
    return Response.json({ skipped: "no data-relevant files" })
  }

  const runId = await createRun(ctx)
  after(() => runAnalysis(ctx, runId))
  return new Response(JSON.stringify({ runId }), {
    status: 202,
    headers: { "Content-Type": "application/json" },
  })
}
