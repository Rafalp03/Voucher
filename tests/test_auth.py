from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User
from tests.helpers import PASSWORD, register


def test_register_returns_token_and_user(client: TestClient, db_session: Session):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": " Anna ", "email": "Anna@Example.com", "password": PASSWORD},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["token"]
    assert body["user"]["name"] == "Anna"
    assert body["user"]["email"] == "anna@example.com"
    user = db_session.scalar(select(User).where(User.email == "anna@example.com"))
    assert user.password_hash != PASSWORD


def test_register_duplicate_email_returns_409(client: TestClient):
    register(client)

    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Anna", "email": "anna@example.com", "password": PASSWORD},
    )

    assert response.status_code == 409
    assert response.json()["code"] == "EMAIL_TAKEN"


def test_register_validates_password(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Anna", "email": "anna@example.com", "password": "krotkie"},
    )

    assert response.status_code == 422
    assert response.json()["message"] == "Hasło: min. 8 znaków, w tym litera i cyfra."


def test_login_and_me(client: TestClient):
    register(client)

    response = client.post(
        "/api/v1/auth/login", json={"email": "ANNA@example.com", "password": PASSWORD}
    )
    assert response.status_code == 200
    headers = {"Authorization": f"Bearer {response.json()['token']}"}

    me = client.get("/api/v1/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "anna@example.com"
    assert "createdAt" in me.json()


def test_login_wrong_password_returns_401(client: TestClient):
    register(client)

    response = client.post(
        "/api/v1/auth/login", json={"email": "anna@example.com", "password": "zlehaslo1"}
    )

    assert response.status_code == 401
    assert response.json()["message"] == "Nieprawidłowy e-mail lub hasło."


def test_login_unknown_email_returns_401(client: TestClient):
    response = client.post(
        "/api/v1/auth/login", json={"email": "nikt@example.com", "password": PASSWORD}
    )

    assert response.status_code == 401


def test_me_without_token_returns_401(client: TestClient):
    assert client.get("/api/v1/users/me").status_code == 401
    bad = {"Authorization": "Bearer to-nie-jest-token"}
    assert client.get("/api/v1/users/me", headers=bad).status_code == 401


def test_logout_revokes_token(client: TestClient):
    headers = register(client)

    assert client.post("/api/v1/auth/logout", headers=headers).status_code == 204
    assert client.get("/api/v1/users/me", headers=headers).status_code == 401
