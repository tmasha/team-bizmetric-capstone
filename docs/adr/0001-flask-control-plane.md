# ADR 0001: Standardize on Flask for the Control Plane

## Status

Accepted

## Context

The project materials were inconsistent about the backend stack. Some documents referenced `Node.js`, while the implementation plan and the current capstone direction require a policy-aware orchestration service with a Python-friendly testing and security workflow.

The repository already contained only the React frontend prototype and no backend implementation. The fastest path to an expo-ready MVP was to standardize on a single backend stack and remove ambiguity for APIM import, security testing, and MCP integration.

## Decision

The official backend stack for this repository is now:

- `Python Flask` for the HTTP control plane
- `SQLite` for MVP persistence
- Deterministic policy evaluation in Python
- MCP-compatible tool servers implemented locally for the MVP

The backend owns:

- session handling
- policy evaluation
- tool access checks
- MCP tool execution
- output filtering
- audit logging
- OpenAPI exposure for Azure APIM import

Any older references to `Node.js` in project documents should be treated as stale and updated before expo or assignment submission.

## Team roster recorded in this repo

Using the most recent uploaded team-status material, the working roster recorded in this repository is:

- Michael Jeffery
- Minh Nguyen
- Thomas Masha
- Owen Schillaci
- Quang Huy Le

If the sponsor or course staff confirms a different official roster, update this ADR and the presentation documents together so the repo and submissions stay aligned.

## Consequences

- The frontend will continue calling `/api/...` and does not need a structural rewrite.
- Azure APIM can import the backend from `/openapi.json`.
- Python-based unit, integration, and security tests can live beside the control-plane code.
- The repo now has one official backend direction instead of two conflicting ones.
