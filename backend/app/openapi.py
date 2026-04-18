from __future__ import annotations


def build_openapi_spec() -> dict:
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "BizMetric Secure Control Plane API",
            "version": "0.1.0",
            "description": "Flask control-plane API for secure agent orchestration, audit logging, and MCP tool execution.",
        },
        "paths": {
            "/health": {
                "get": {
                    "summary": "Health probe",
                    "responses": {"200": {"description": "Service health"}},
                }
            },
            "/api/chat": {
                "post": {
                    "summary": "Secure chat turn",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/ChatRequest"}
                            }
                        },
                    },
                    "responses": {
                        "200": {
                            "description": "Chat turn completed",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/ChatResponse"}
                                }
                            },
                        }
                    },
                }
            },
            "/api/dashboard/metrics": {
                "get": {
                    "summary": "Dashboard aggregates",
                    "parameters": [
                        {
                            "name": "window",
                            "in": "query",
                            "schema": {"type": "string", "default": "24h"},
                        }
                    ],
                    "responses": {"200": {"description": "Dashboard metrics"}},
                }
            },
            "/api/audit/{sessionId}": {
                "get": {
                    "summary": "Session audit trail",
                    "parameters": [
                        {
                            "name": "sessionId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                        }
                    ],
                    "responses": {"200": {"description": "Audit view for one session"}},
                }
            },
            "/api/tools": {
                "get": {
                    "summary": "Visible tool access for the current caller",
                    "parameters": [
                        {
                            "name": "domain",
                            "in": "query",
                            "schema": {"type": "string", "enum": ["demo", "finance", "ops", "hr"]},
                        }
                    ],
                    "responses": {"200": {"description": "Allowed and restricted tools"}},
                }
            },
        },
        "components": {
            "schemas": {
                "ChatRequest": {
                    "type": "object",
                    "properties": {
                        "sessionId": {"type": "string", "nullable": True},
                        "message": {"type": "string"},
                        "domain": {"type": "string", "enum": ["demo", "finance", "ops", "hr"]},
                    },
                    "required": ["message", "domain"],
                },
                "ChatResponse": {
                    "type": "object",
                    "properties": {
                        "requestId": {"type": "string"},
                        "sessionId": {"type": "string"},
                        "decision": {"type": "string", "enum": ["allowed", "blocked", "review_required"]},
                        "assistantMessage": {"type": "string"},
                        "toolExecutions": {"type": "array", "items": {"type": "object"}},
                        "policySummary": {"type": "object"},
                        "auditEventIds": {"type": "array", "items": {"type": "string"}},
                    },
                },
            }
        },
    }
