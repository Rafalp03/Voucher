import os

# Testy działają na osobnej bazie, żeby nie ruszać danych z bazy deweloperskiej.
# Musi być ustawione przed importem aplikacji, bo ustawienia czytane są przy imporcie.
TEST_DB = os.environ.get("TEST_POSTGRES_DB", "voucher_test")
os.environ["POSTGRES_DB"] = TEST_DB

from collections.abc import Iterator  # noqa: E402

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import Engine, create_engine, text  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.config import get_settings  # noqa: E402
from app.db import engine, get_db  # noqa: E402
from app.main import app  # noqa: E402


def _recreate_test_database() -> None:
    """Usuwa i tworzy od nowa bazę testową (łączy się z bazą systemową "postgres")."""
    admin_url = get_settings().database_url.set(database="postgres")
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB}" WITH (FORCE)'))
        conn.execute(text(f'CREATE DATABASE "{TEST_DB}"'))
    admin_engine.dispose()


@pytest.fixture(scope="session")
def db_engine() -> Iterator[Engine]:
    """Świeża baza testowa z wykonanymi wszystkimi migracjami."""
    _recreate_test_database()
    alembic_cfg = Config("alembic.ini")
    with engine.begin() as conn:
        alembic_cfg.attributes["connection"] = conn
        command.upgrade(alembic_cfg, "head")
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(db_engine: Engine) -> Iterator[Session]:
    """Sesja w transakcji wycofywanej po teście, więc każdy test zaczyna z czystą bazą."""
    with db_engine.connect() as conn:
        trans = conn.begin()
        session = Session(bind=conn, join_transaction_mode="create_savepoint")
        try:
            yield session
        finally:
            session.close()
            trans.rollback()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    """Klient HTTP do API, którego endpointy używają sesji testowej."""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
