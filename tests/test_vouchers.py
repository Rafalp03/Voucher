from fastapi.testclient import TestClient


def test_list_returns_seeded_catalog_in_frontend_format(client: TestClient):
    response = client.get("/api/v1/vouchers")

    assert response.status_code == 200
    vouchers = response.json()
    assert [v["id"] for v in vouchers][:3] == ["spa", "kolacja", "skok"]
    spa = vouchers[0]
    assert spa["name"] == "Dzień w SPA"
    assert spa["image"] == "img/spa.jpg"
    assert [t["value"] for t in spa["tiers"]] == [150, 250, 400]
    assert set(spa) == {
        "id",
        "name",
        "category",
        "description",
        "image",
        "emoji",
        "gradient",
        "tiers",
    }


def test_list_filters_by_category_and_price(client: TestClient):
    response = client.get(
        "/api/v1/vouchers", params={"category": "Przygoda", "minPrice": 700, "maxPrice": 1000}
    )

    assert [v["id"] for v in response.json()] == ["skok"]


def test_get_by_id(client: TestClient):
    response = client.get("/api/v1/vouchers/kino")

    assert response.status_code == 200
    assert response.json()["name"] == "Bilety do kina"


def test_get_unknown_voucher_returns_404_with_message(client: TestClient):
    response = client.get("/api/v1/vouchers/nie-ma")

    assert response.status_code == 404
    assert response.json() == {"message": "Nie znaleziono vouchera.", "code": "VOUCHER_NOT_FOUND"}
