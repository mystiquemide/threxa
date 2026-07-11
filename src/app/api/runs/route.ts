import type { NextRequest } from "next/server"
import { listRuns } from "@/lib/runs"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const repoParam = params.get("repo")
  const limit = Math.min(Number(params.get("limit")) || 50, 200)

  // Same read layer as the dashboard, so demo mode and real data stay consistent.
  const runs = await listRuns()
  const filtered = repoParam ? runs.filter((r) => r.repo === repoParam) : runs

  return Response.json({ runs: filtered.slice(0, limit) })
}
