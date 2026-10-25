from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

from app.config import get_settings
from app.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Generuje SQL bez łączenia z bazą (alembic upgrade head --sql)."""
    context.configure(
        url=get_settings().database_url.render_as_string(hide_password=False),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Testy przekazują własne połączenie (baza testowa), w pozostałych przypadkach
    # łączymy się z bazą z ustawień aplikacji
    connection = config.attributes.get("connection")
    if connection is not None:
        _run(connection)
        return

    engine = create_engine(get_settings().database_url, poolclass=pool.NullPool)
    with engine.connect() as connection:
        _run(connection)


def _run(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
