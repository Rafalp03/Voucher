from collections.abc import Iterator

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

# pool_pre_ping sprawdza połączenie przed użyciem, np. po restarcie bazy
engine = create_engine(get_settings().database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

# Stałe nazwy indeksów i ograniczeń, żeby migracje Alembica były przewidywalne
NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Klasa bazowa dla modeli ORM."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


def get_db() -> Iterator[Session]:
    """Zależność FastAPI: jedna sesja na żądanie, zamykana po odpowiedzi."""
    with SessionLocal() as session:
        yield session
