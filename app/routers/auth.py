from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Response
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError

from app.deps import CurrentUser, DbSession, get_token_payload
from app.errors import ApiError
from app.models import RevokedToken, User
from app.schemas import AuthOut, LoginIn, RegisterIn, UserMeOut, UserOut
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(tags=["Konta"])

EMAIL_TAKEN = ApiError(409, "Konto z tym e-mailem już istnieje.", "EMAIL_TAKEN")


def _auth_response(user: User) -> AuthOut:
    token, _ = create_access_token(user.id)
    return AuthOut(token=token, user=UserOut.model_validate(user))


@router.post("/auth/register", response_model=AuthOut, status_code=201)
def register(data: RegisterIn, db: DbSession):
    if db.scalar(select(User.id).where(User.email == data.email)) is not None:
        raise EMAIL_TAKEN
    user = User(name=data.name, email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # Dwie równoczesne rejestracje na ten sam e-mail
        db.rollback()
        raise EMAIL_TAKEN from None
    return _auth_response(user)


@router.post("/auth/login", response_model=AuthOut)
def login(data: LoginIn, db: DbSession):
    user = db.scalar(select(User).where(User.email == data.email))
    # Ten sam komunikat dla złego e-maila i hasła: nie zdradzamy, które konto istnieje
    if not verify_password(user.password_hash if user else None, data.password):
        raise ApiError(401, "Nieprawidłowy e-mail lub hasło.", "INVALID_CREDENTIALS")
    return _auth_response(user)


@router.post("/auth/logout", status_code=204)
def logout(
    db: DbSession,
    payload: Annotated[dict[str, Any] | None, Depends(get_token_payload)],
):
    """Unieważnia bieżący token."""
    if payload is None:
        raise ApiError(401, "Wymagane logowanie.", "UNAUTHORIZED")
    now = datetime.now(UTC)
    # Sprzątanie: wpisy dla tokenów, które i tak już wygasły, nie są potrzebne
    db.execute(delete(RevokedToken).where(RevokedToken.expires_at < now))
    db.add(RevokedToken(jti=payload["jti"], expires_at=datetime.fromtimestamp(payload["exp"], UTC)))
    db.commit()
    return Response(status_code=204)


@router.get("/users/me", response_model=UserMeOut)
def me(user: CurrentUser):
    return user
