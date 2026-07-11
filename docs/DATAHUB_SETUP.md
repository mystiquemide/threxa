# DataHub Cloud — Setup Runbook (Task 1)

Target: a DataHub Cloud free trial instance loaded with the showcase-ecommerce datapack. Hosted, publicly reachable, nothing to run ourselves. Replaces the earlier VPS plan (too big for the available VPS).

## Step 1 — Sign up (Mide, ~5 minutes)

1. Go to https://datahub.com and start the free trial (DataHub Cloud, was Acryl).
2. Pick an org slug; the instance lands at `https://<slug>.acryl.io`.
3. In the UI: Settings > Access Tokens > Generate new token. Copy it.
4. Hand back two values: the instance URL and the token.

## Step 2 — Wire into Threxa

Local `.env` and later both Railway services:

```
DATAHUB_GMS_URL=https://<slug>.acryl.io/gms
DATAHUB_TOKEN=<token>
```

The UI for screenshots/judges is `https://<slug>.acryl.io`.

## Step 3 — Load the showcase-ecommerce datapack (from this machine)

Python 3.11 is available locally, so ingestion runs here with the DataHub CLI pointed at the cloud instance:

```powershell
pip install --upgrade acryl-datahub
# use the datapack/recipe the hackathon provides; generic shape:
datahub ingest -c showcase-ecommerce.yml
```

with the recipe's sink pointed at the cloud instance:

```yaml
sink:
  type: datahub-rest
  config:
    server: https://<slug>.acryl.io/gms
    token: ${DATAHUB_TOKEN}
```

Done when the showcase-ecommerce entities and their lineage render in the cloud UI.

## Step 4 — Verify MCP access (Task 2, from this machine)

The official MCP server installs via pip, Docker not required locally:

```powershell
pip install mcp-server-datahub
$env:DATAHUB_GMS_URL = "https://<slug>.acryl.io/gms"
$env:DATAHUB_GMS_TOKEN = "<token>"
mcp-server-datahub --transport streamable-http --port 8000
# in another shell: npm run dev, then
# curl http://localhost:3001/api/health  → mcp: true, datahub: true
```

Task 2 is done when a lineage query for a showcase-ecommerce entity returns downstream assets with owners. The tool names assumed in `src/lib/pipeline/lineage.ts` (search, get_lineage, get_entity) must be checked against the live server's tool list and corrected if they differ.

## Production

Railway keeps the `mcp/Dockerfile` sidecar unchanged; it just points at the cloud GMS URL instead of a VPS. Trial length is typically 14-30 days, which covers the Aug 10 deadline only if the trial starts around late July. If the trial is shorter, start it closer to submission and re-run the datapack ingestion (one command).
