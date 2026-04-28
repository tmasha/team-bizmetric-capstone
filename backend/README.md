# BizMetric Backend

This backend is the Flask control plane for the BizMetric secure agentic AI prototype.

## What it does

- Accepts `/api` requests from the React frontend
- Applies trusted-header auth rules for Azure APIM or local development bypass
- Evaluates deterministic policy decisions by role, domain, and requested tool
- Calls two MCP protocol servers, either:
  - in-process for local/demo use
  - remote HTTP MCP endpoints for Azure deployment
- Stores sessions, messages, and audit events in SQLite
- Exposes an importable OpenAPI document at `/openapi.json`

## Run locally

1. Create a virtual environment if you want an isolated Python install.
2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Start the Flask app:

```bash
python3 backend/run.py
```

The default local URL is `http://127.0.0.1:5000`.

## Environment variables

Use [backend/.env.example](/mnt/c/CSCE_482/ui-prototype/backend/.env.example) as the starting point.

- `ALLOW_DEV_AUTH=true` lets local requests through with debug headers.
- `APIM_SHARED_SECRET` is the shared secret APIM forwards to the backend in protected environments.
- `CHAT_PROVIDER=mock` keeps the MVP deterministic for expo and test use.
- `CHAT_PROVIDER=azure_openai` enables live Azure OpenAI responses.
- `MCP_TRANSPORT=remote` switches tool execution to remote MCP services.
- `MCP_SERVER_CONFIG` or the `MCP_*_URL` variables point the backend at Azure-hosted MCP servers.
- `AZURE_OPENAI_API_KEY` is optional if App Service managed identity is enabled for Azure OpenAI.
- `AZURE_MONITOR_CONNECTION_STRING` enables Azure Monitor / Application Insights export.
- request logs are emitted as structured JSON and include `x-request-id` correlation values.

## Azure App Service target shape

Use these settings in Azure:

- Startup command: `gunicorn --bind 0.0.0.0:$PORT backend.run:app`
- `ALLOW_DEV_AUTH=false`
- `CHAT_PROVIDER=azure_openai`
- `MCP_TRANSPORT=remote`
- either `AZURE_OPENAI_API_KEY=<key>` or App Service managed identity with Cognitive Services access
- `MCP_SERVER_CONFIG` with your MCP endpoint URLs and optional per-server headers
- `AZURE_MONITOR_CONNECTION_STRING=<application-insights-connection-string>`

Example `MCP_SERVER_CONFIG`:

```json
{
  "business-read": {
    "url": "https://bizmetric-mcp-read.internal/api/mcp"
  },
  "sensitive-action": {
    "url": "https://bizmetric-mcp-sensitive.internal/api/mcp"
  }
}
```

## Test suite

Run the current backend tests with the built-in unittest runner:

```bash
python3 -m unittest discover -s backend/tests -t . -p 'test_*.py'
```

Coverage:

```bash
python3 -m coverage run -m unittest discover -s backend/tests -t . -p 'test_*.py'
python3 -m coverage report -m
```

The directory structure mirrors the capstone security categories:

- `backend/tests/unit`
- `backend/tests/integration`
- `backend/tests/security/prompt_injection`
- `backend/tests/security/tool_abuse`
- `backend/tests/security/data_exfiltration`
- `backend/tests/security/mcp`
- `backend/tests/security/infrastructure`
