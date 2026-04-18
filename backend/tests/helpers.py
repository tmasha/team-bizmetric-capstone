from __future__ import annotations

import tempfile
import unittest

from backend.app import create_app
from backend.app.db import get_db


class BackendTestCase(unittest.TestCase):
    disable_seed = True
    allow_dev_auth = True

    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.app = create_app(
            {
                "TESTING": True,
                "DATABASE_PATH": f"{self.tempdir.name}/test.db",
                "DISABLE_DB_SEED": self.disable_seed,
                "ALLOW_DEV_AUTH": self.allow_dev_auth,
                "APIM_SHARED_SECRET": "local-apim-secret",
            }
        )
        self.client = self.app.test_client()

    def tearDown(self):
        self.tempdir.cleanup()

    def dev_headers(self, role: str = "user", email: str = "user@bizmetric.local") -> dict[str, str]:
        return {
            "x-debug-user-id": email.split("@", 1)[0],
            "x-debug-user-email": email,
            "x-debug-user-roles": role,
            "x-debug-object-id": f"obj-{role}",
        }

    def apim_headers(self, role: str = "user", email: str = "user@bizmetric.local") -> dict[str, str]:
        return {
            "x-apim-authenticated": "true",
            "x-apim-shared-secret": "local-apim-secret",
            "x-user-email": email,
            "x-user-roles": role,
            "x-user-object-id": f"aad-{role}",
            "x-request-id": "req-apim-test",
        }

    def count_rows(self, table_name: str) -> int:
        with self.app.app_context():
            db = get_db()
            return db.execute(f"SELECT COUNT(*) AS count FROM {table_name}").fetchone()["count"]
