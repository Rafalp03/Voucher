from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

# pool_pre_ping sprawdza połączenie przed użyciem, np. po restarcie bazy
engine = create_engine(get_settings().database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Klasa bazowa dla modeli ORM."""


def get_db() -> Iterator[Session]:
    """Zależność FastAPI: jedna sesja na żądanie, zamykana po odpowiedzi."""
    with SessionLocal() as session:
        yield session
