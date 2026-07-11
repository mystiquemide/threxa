import { db } from "@/lib/db"
import { datahubReachable } from "@/lib/datahub"
import { mcpReachable } from "@/lib/pipeline/lineage"

export async function GET() {
  const [dbOk, mcpOk, datahubOk] = await Promise.all([
    db.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    mcpReachable(),
    datahubReachable(),
  ])
  return Response.json(
    { db: dbOk, mcp: mcpOk, datahub: datahubOk },
    { status: dbOk ? 200 : 503 }
  )
}
