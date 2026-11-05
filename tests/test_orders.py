from fastapi.testclient import TestClient

from tests.helpers import order_payload, register

URL = "/api/v1/orders"


def test_guest_order_prices_are_computed_on_server(client: TestClient):
    payload = order_payload(
        items=[
            {"voucherId": "spa", "value": 400, "qty": 2},
            {"voucherId": "kino", "value": 50, "qty": 1},
        ]
    )

    response = client.post(URL, json=payload)

    assert response.status_code == 201
    order = response.json()
    assert order["id"].startswith("VS-")
    assert order["status"] == "paid"
    assert order["paymentMethod"] == "blik"
    assert order["total"] == 850
    assert order["items"][0] == {"voucherId": "spa", "name": "Dzień w SPA", "value": 400, "qty": 2}
    assert "createdAt" in order


def test_guest_can_fetch_order_by_id(client: TestClient):
    order_id = client.post(URL, json=order_payload()).json()["id"]

    response = client.get(f"{URL}/{order_id}")

    assert response.status_code == 200
    assert response.json()["id"] == order_id


def test_order_with_unknown_tier_is_rejected(client: TestClient):
    response = client.post(
        URL, json=order_payload(items=[{"voucherId": "spa", "value": 1, "qty": 1}])
    )

    assert response.status_code == 422
    assert response.json()["code"] == "TIER_NOT_FOUND"


def test_order_validation(client: TestClient):
    response = client.post(URL, json=order_payload(email="zly-email", items=[]))

    assert response.status_code == 422
    assert response.json()["code"] == "VALIDATION_ERROR"
    assert "Podaj poprawny e-mail." in response.json()["message"]


def test_logged_in_user_sees_own_orders_only(client: TestClient):
    anna = register(client, "anna@example.com")
    jan = register(client, "jan@example.com", name="Jan")
    first = client.post(URL, json=order_payload(), headers=anna).json()
    second = client.post(URL, json=order_payload(paymentMethod="card"), headers=anna).json()
    client.post(URL, json=order_payload())  # zamówienie gościa

    response = client.get(URL, headers=anna)

    assert response.status_code == 200
    assert [o["id"] for o in response.json()] == [second["id"], first["id"]]
    assert client.get(URL, headers=jan).json() == []
    # Zamówienie z konta Anny nie jest widoczne dla innych ani dla gościa
    assert client.get(f"{URL}/{first['id']}", headers=anna).status_code == 200
    assert client.get(f"{URL}/{first['id']}", headers=jan).status_code == 404
    assert client.get(f"{URL}/{first['id']}").status_code == 404


def test_order_history_requires_login(client: TestClient):
    assert client.get(URL).status_code == 401


def test_expired_or_invalid_token_does_not_block_guest_checkout(client: TestClient):
    headers = {"Authorization": "Bearer stary-token"}

    response = client.post(URL, json=order_payload(), headers=headers)

    assert response.status_code == 201
