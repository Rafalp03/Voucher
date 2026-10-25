from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL


class Settings(BaseSettings):
    """Ustawienia aplikacji czytane ze zmiennych środowiskowych."""

    model_config = SettingsConfigDict(extra="ignore")

    postgres_user: str
    postgres_password: str
    postgres_db: str
    # Adres bazy widziany z kontenera API (w docker-compose: usługa "db")
    db_host: str = "db"
    db_port: int = 5432

    @property
    def database_url(self) -> URL:
        # URL.create sam koduje znaki specjalne w haśle (@, :, / itd.)
        return URL.create(
            "postgresql+psycopg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.db_host,
            port=self.db_port,
            database=self.postgres_db,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
