"""Hashowanie haseł (Argon2) i tokeny logowania (JWT, HS256)."""

import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.config import get_settings

_hasher = PasswordHasher()
# Skrót sprawdzany, gdy konto nie istnieje. Dzięki temu czas odpowiedzi logowania
# nie zdradza, które adresy e-mail są zarejestrowane.
_DUMMY_HASH = _hasher.hash("konto-nie-istnieje")

JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str | None, password: str) -> bool:
    """Sprawdza hasło. Dla password_hash=None (brak konta) zawsze zwraca False."""
    try:
        matches = _hasher.verify(password_hash or _DUMMY_HASH, password)
    except (VerificationError, InvalidHashError):
        return False
    return matches and password_hash is not None


def create_access_token(user_id: int) -> tuple[str, datetime]:
    """Tworzy token logowania. Zwraca token i datę jego wygaśnięcia."""
    settings = get_settings()
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(user_id),
        # Unikalny identyfikator tokenu, pozwala go unieważnić przy wylogowaniu
        "jti": secrets.token_hex(16),
        "iat": now,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM), expires_at


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Zwraca zawartość poprawnego, niewygasłego tokenu albo None."""
    try:
        return jwt.decode(
            token,
            get_settings().jwt_secret,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "jti", "exp"]},
        )
    except jwt.PyJWTError:
        return None
