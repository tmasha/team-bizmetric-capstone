# BizMetric UI + Flask Control Plane

This repository now contains:

- the React frontend prototype
- a Flask backend control plane under `backend/`
- in-process MCP protocol servers for read-only and sensitive-tool demo flows
- security tests and Azure APIM configuration artifacts

## Local development

### Frontend

1. `npm install`
2. `npm run dev`

Vite proxies `/api`, `/health`, and `/openapi.json` to `http://127.0.0.1:5000` by default.

### Backend

1. Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

2. Start the Flask control plane:

```bash
npm run backend:dev
```

The frontend sends debug headers automatically during local development so the backend can run with `ALLOW_DEV_AUTH=true`.

## Backend API

The MVP backend exposes:

- `POST /api/chat`
- `GET /api/tools`
- `GET /api/dashboard/metrics`
- `GET /api/audit/<session_id>`
- `GET /health`
- `GET /openapi.json`

## Backend tests

Run the current backend test suite with:

```bash
npm run test:backend
```

## Azure/APIM docs

Repo deployment artifacts live in:

- [docs/adr/0001-flask-control-plane.md](/mnt/c/CSCE_482/ui-prototype/docs/adr/0001-flask-control-plane.md)
- [docs/azure/apim-setup.md](/mnt/c/CSCE_482/ui-prototype/docs/azure/apim-setup.md)
- [docs/azure/apim-inbound-policy.xml](/mnt/c/CSCE_482/ui-prototype/docs/azure/apim-inbound-policy.xml)

## TypeScript backup

The original TypeScript prototype created from Figma still lives in `typescript-backup`.
