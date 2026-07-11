// Write-back client for DataHub GMS GraphQL (ADR-4). The MCP sidecar stays read-only;
// this is the only module that mutates the catalog.

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${process.env.DATAHUB_GMS_URL}/api/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DATAHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`DataHub GraphQL failed: ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(`DataHub GraphQL: ${json.errors[0].message}`)
  return json.data as T
}

const GET_DESCRIPTION = `
  query getDataset($urn: String!) {
    dataset(urn: $urn) {
      editableProperties { description }
      properties { description }
    }
  }`

const UPDATE_DESCRIPTION = `
  mutation updateDescription($input: DescriptionUpdateInput!) {
    updateDescription(input: $input)
  }`

const RAISE_INCIDENT = `
  mutation raiseIncident($input: RaiseIncidentInput!) {
    raiseIncident(input: $input)
  }`

const THREXA_SECTION = "## Threxa change log"

/**
 * F5 institutional memory: append a change record to the entity's editable
 * documentation so the catalog remembers what changed, when, and in which PR.
 */
export async function writeChangeRecord(
  urn: string,
  record: { prUrl: string; prTitle: string; severity: string; detail: string }
): Promise<void> {
  const data = await gql<{
    dataset: {
      editableProperties: { description: string | null } | null
      properties: { description: string | null } | null
    } | null
  }>(GET_DESCRIPTION, { urn })

  const current =
    data.dataset?.editableProperties?.description ??
    data.dataset?.properties?.description ??
    ""
  const entry = `- ${new Date().toISOString().slice(0, 10)} [${record.severity}] [${record.prTitle}](${record.prUrl}): ${record.detail}`
  const description = current.includes(THREXA_SECTION)
    ? current.replace(THREXA_SECTION, `${THREXA_SECTION}\n${entry}`)
    : `${current}\n\n${THREXA_SECTION}\n${entry}`.trim()

  await gql(UPDATE_DESCRIPTION, {
    input: { description, resourceUrn: urn },
  })
}

/** F5 incident: raised on downstream assets when a BREAKING PR merges. */
export async function raiseIncident(
  urn: string,
  title: string,
  description: string
): Promise<string> {
  const data = await gql<{ raiseIncident: string }>(RAISE_INCIDENT, {
    input: {
      type: "CUSTOM",
      customType: "Breaking upstream change",
      title: title.slice(0, 200),
      description,
      resourceUrn: urn,
    },
  })
  return data.raiseIncident
}

/** Health probe for /api/health. */
export async function datahubReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.DATAHUB_GMS_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}
