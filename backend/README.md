# BizMetric Backend

This backend is the Flask control plane for the BizMetric secure agentic AI prototype.

## What it does

- Accepts `/api` requests from the React frontend
- Applies trusted-header auth rules for Azure APIM or local development bypass
- Evaluates deterministic policy decisions by role, domain, and requested tool
- Calls two in-process MCP protocol servers:
  - `business-read`
  - `sensitive-action`
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

## Test suite

Run the current backend tests with the built-in unittest runner:

```bash
python3 -m unittest discover -s backend/tests -t . -p 'test_*.py'
```

The directory structure mirrors the capstone security categories:

- `backend/tests/unit`
- `backend/tests/integration`
- `backend/tests/security/prompt_injection`
- `backend/tests/security/tool_abuse`
- `backend/tests/security/data_exfiltration`
- `backend/tests/security/mcp`
- `backend/tests/security/infrastructure`
