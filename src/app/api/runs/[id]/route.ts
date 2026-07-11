import { getRun } from "@/lib/runs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Same read layer as the dashboard, so demo mode and real data stay consistent.
  const run = await getRun(id)
  if (!run) return Response.json({ error: "not found" }, { status: 404 })
  return Response.json({ run })
}
