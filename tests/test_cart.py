from fastapi.testclient import TestClient

from tests.helpers import CART_HEADERS

URL = "/api/v1/cart"


def add(client: TestClient, voucher_id: str, value: int, qty: int = 1):
    return client.post(
        f"{URL}/items",
        json={"voucherId": voucher_id, "value": value, "qty": qty},
        headers=CART_HEADERS,
    )


def test_cart_without_id_is_empty(client: TestClient):
    response = client.get(URL)

    assert response.status_code == 200
    assert response.json() == []


def test_add_merges_same_voucher_and_value(client: TestClient):
    add(client, "spa", 400, 2)
    add(client, "kino", 50)
    response = add(client, "spa", 400, 1)

    assert response.status_code == 200
    assert response.json() == [
        {"voucherId": "spa", "value": 400, "qty": 3},
        {"voucherId": "kino", "value": 50, "qty": 1},
    ]
    assert client.get(URL, headers=CART_HEADERS).json() == response.json()


def test_qty_is_capped_at_20(client: TestClient):
    add(client, "spa", 150, 15)

    response = add(client, "spa", 150, 10)

    assert response.json()[0]["qty"] == 20


def test_add_unknown_tier_returns_422(client: TestClient):
    response = add(client, "spa", 999)

    assert response.status_code == 422
    assert response.json()["code"] == "TIER_NOT_FOUND"


def test_add_without_cart_id_returns_400(client: TestClient):
    response = client.post(f"{URL}/items", json={"voucherId": "spa", "value": 150, "qty": 1})

    assert response.status_code == 400
    assert response.json()["code"] == "CART_ID_REQUIRED"


def test_set_qty_and_remove_by_index(client: TestClient):
    add(client, "spa", 150)
    add(client, "kino", 50)

    response = client.put(f"{URL}/items/1", json={"qty": 4}, headers=CART_HEADERS)
    assert response.json()[1]["qty"] == 4

    response = client.put(f"{URL}/items/0", json={"qty": 0}, headers=CART_HEADERS)
    assert response.json() == [{"voucherId": "kino", "value": 50, "qty": 4}]

    response = client.delete(f"{URL}/items/0", headers=CART_HEADERS)
    assert response.json() == []


def test_clear(client: TestClient):
    add(client, "spa", 150)

    response = client.delete(URL, headers=CART_HEADERS)

    assert response.json() == []
    assert client.get(URL, headers=CART_HEADERS).json() == []


def test_carts_are_separate(client: TestClient):
    add(client, "spa", 150)

    other = {"X-Cart-Id": "ffffffff-1111-2222-3333-444444444444"}
    assert client.get(URL, headers=other).json() == []
