# Azure APIM Setup Checklist

This repo now contains the backend contract and policy assumptions needed to configure Azure API Management for the BizMetric control plane.

## 1. Create the correct Azure resource

Create a real `API Management service` resource inside `rg-tamu-csce-related`.

Do not configure the Microsoft Entra enterprise application blade as if it were the APIM service itself. The enterprise app is part of identity integration, but APIM policies, APIs, products, diagnostics, and backends are managed from the API Management resource.

Recommended tier:

- `Standard v2` for the target architecture
- `Basic v2` only if credits are tight and the environment is short-lived

## 2. Create the Entra app registrations

Create:

- `bizmetric-ui-spa`
- `bizmetric-api`

Configure `bizmetric-api` with:

- exposed scope: `access_as_user`
- app roles: `user`, `security_analyst`, `admin`

Configure `bizmetric-ui-spa` with:

- localhost SPA redirect URI for local testing
- deployed frontend redirect URI for the hosted environment

## 3. Deploy the backend

Deploy the Flask service to Azure App Service.

Enable:

- system-assigned managed identity
- Application Insights
- environment variables matching [backend/.env.example](/mnt/c/CSCE_482/ui-prototype/backend/.env.example)

In shared environments:

- set `ALLOW_DEV_AUTH=false`
- set a real `APIM_SHARED_SECRET`

## 4. Import the API into APIM

Use the backend OpenAPI document:

- local validation path: `http://127.0.0.1:5000/openapi.json`
- deployed validation path: `https://<app-service>/openapi.json`

Import that document as a REST API in APIM and use `/api` as the API URL suffix.

Set the backend service URL to the App Service base URL.

## 5. Configure inbound policies

Apply policies in this order:

1. `validate-azure-ad-token`
2. `validate-content`
3. `rate-limit-by-key`
4. `set-header`
5. `set-backend-service`

Use the template in [apim-inbound-policy.xml](/mnt/c/CSCE_482/ui-prototype/docs/azure/apim-inbound-policy.xml) and replace placeholders before publishing.

## 6. Forward only trusted headers

Forward these headers from APIM to Flask:

- `x-apim-authenticated=true`
- `x-request-id`
- `x-user-object-id`
- `x-user-email`
- `x-user-roles`
- `x-apim-shared-secret`

The backend is already implemented to reject direct access if `ALLOW_DEV_AUTH=false` and the APIM secret is missing or invalid.

## 7. Disable subscription keys for the SPA path

For the browser-facing API:

- disable APIM subscription-key requirements for the SPA flow
- rely on Microsoft Entra bearer tokens at the gateway

Portal test-console or admin-only use can still keep subscription-key access where appropriate.

## 8. Enable diagnostics

Configure API-level diagnostics to:

- Application Insights
- Log Analytics

Keep payload logging minimal. The backend already emits request IDs and audit-event IDs so APIM requests can be correlated with backend traces.

## 9. Sponsor-ready hardening

When sponsor access is available:

- move MCP services to internal-only Azure Container Apps
- keep the React frontend talking only to APIM
- keep the App Service talking only to private MCP backends
- keep synthetic demo data until enterprise data access is explicitly approved
