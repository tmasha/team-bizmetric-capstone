from __future__ import annotations

from flask import Flask

from backend.app.config import Config
from backend.app.db import init_db, register_db, seed_db
from backend.app.mcp_servers import build_mcp_clients
from backend.app.monitoring import init_monitoring
from backend.app.routes import register_routes


def create_app(config_overrides: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)

    init_monitoring(app)
    register_db(app)
    register_routes(app)
    app.extensions["mcp_clients"] = build_mcp_clients(app.config)

    with app.app_context():
        init_db()
        if not app.config.get("DISABLE_DB_SEED", False):
            seed_db()

    return app
