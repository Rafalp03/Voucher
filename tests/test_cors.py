from fastapi.testclient import TestClient


def test_cors_preflight_allows_frontend_origin(client: TestClient):
    response = client.options(
        "/api/v1/cart/items",
        headers={
            "Origin": "http://localhost:8080",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type,x-cart-id",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:8080"


def test_unknown_route_uses_common_error_format(client: TestClient):
    response = client.get("/api/v1/nie-ma-takiej-sciezki")

    assert response.status_code == 404
    assert set(response.json()) == {"message", "code"}
