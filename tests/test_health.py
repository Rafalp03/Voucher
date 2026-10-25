from unittest.mock import MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.db import get_db
from app.main import app


def test_health_ok(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_health_returns_503_when_database_unavailable(client: TestClient):
    broken_session = MagicMock()
    broken_session.execute.side_effect = OperationalError("SELECT 1", {}, Exception("brak bazy"))
    app.dependency_overrides[get_db] = lambda: broken_session

    response = client.get("/health")

    assert response.status_code == 503
    assert response.json() == {"status": "error", "database": "unavailable"}
