# threxa-mcp: official DataHub MCP server as a streamable-HTTP sidecar.
# Read-only bridge between the web app's lineage client and DataHub GMS.
FROM python:3.12-slim

RUN pip install --no-cache-dir mcp-server-datahub

# Required at runtime:
#   DATAHUB_GMS_URL   - GMS endpoint of the DataHub instance
#   DATAHUB_GMS_TOKEN - access token for that instance
#   PORT              - injected by Railway (defaults to 8000 locally)
ENV FASTMCP_HOST=0.0.0.0
EXPOSE 8000

CMD ["sh", "-c", "mcp-server-datahub --transport streamable-http --port ${PORT:-8000}"]
