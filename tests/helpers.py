from fastapi.testclient import TestClient

CART_HEADERS = {"X-Cart-Id": "0b6c1c9e-1f0a-4c55-9a1e-6f2f6c1d2e3f"}
PASSWORD = "haslo1234"


def register(client: TestClient, email: str = "anna@example.com", name: str = "Anna") -> dict:
    """Rejestruje konto i zwraca nagłówek z tokenem."""
    response = client.post(
        "/api/v1/auth/register", json={"name": name, "email": email, "password": PASSWORD}
    )
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {response.json()['token']}"}


def order_payload(**overrides) -> dict:
    payload = {
        "customerName": "Anna Nowak",
        "email": "anna@example.com",
        "paymentMethod": "blik",
        "items": [{"voucherId": "spa", "value": 400, "qty": 1}],
    }
    return payload | overrides
