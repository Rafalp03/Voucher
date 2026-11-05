"""Zależności FastAPI wspólne dla endpointów: zalogowany użytkownik i koszyk."""

import re
from typing import Annotated, Any

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db import get_db
from app.errors import ApiError
from app.models import RevokedToken, User
from app.security import decode_access_token

DbSession = Annotated[Session, Depends(get_db)]

# auto_error=False: brak nagłówka Authorization nie jest błędem (zakupy jako gość)
_bearer = HTTPBearer(auto_error=False)


def get_token_payload(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict[str, Any] | None:
    """Zawartość ważnego, nieunieważnionego tokenu albo None."""
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None or db.get(RevokedToken, payload["jti"]) is not None:
        return None
    return payload


def get_optional_user(
    db: DbSession,
    payload: Annotated[dict[str, Any] | None, Depends(get_token_payload)],
) -> User | None:
    """Zalogowany użytkownik albo None (gość lub nieważny token)."""
    if payload is None:
        return None
    try:
        return db.get(User, int(payload["sub"]))
    except ValueError:
        return None


def get_current_user(user: Annotated[User | None, Depends(get_optional_user)]) -> User:
    """Wymaga zalogowania (endpointy oznaczone w docs/API.md kłódką)."""
    if user is None:
        raise ApiError(401, "Wymagane logowanie.", "UNAUTHORIZED")
    return user


OptionalUser = Annotated[User | None, Depends(get_optional_user)]
CurrentUser = Annotated[User, Depends(get_current_user)]


# Identyfikator koszyka generuje frontend (UUID) i wysyła w nagłówku X-Cart-Id
_CART_ID_RE = re.compile(r"^[A-Za-z0-9-]{16,64}$")


def get_cart_id(x_cart_id: Annotated[str | None, Header()] = None) -> str | None:
    if x_cart_id is None:
        return None
    if not _CART_ID_RE.match(x_cart_id):
        raise ApiError(400, "Nieprawidłowy identyfikator koszyka.", "INVALID_CART_ID")
    return x_cart_id


def require_cart_id(cart_id: Annotated[str | None, Depends(get_cart_id)]) -> str:
    if cart_id is None:
        raise ApiError(400, "Brak identyfikatora koszyka (nagłówek X-Cart-Id).", "CART_ID_REQUIRED")
    return cart_id


OptionalCartId = Annotated[str | None, Depends(get_cart_id)]
CartId = Annotated[str, Depends(require_cart_id)]
