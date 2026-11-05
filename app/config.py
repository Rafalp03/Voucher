from functools import lru_cache

from pydantic import Field
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

    # Klucz do podpisywania tokenów logowania (JWT). Min. 32 znaki, w produkcji losowy.
    jwt_secret: str = Field(min_length=32)
    # Ważność tokenu logowania w minutach (domyślnie 24 h)
    jwt_expire_minutes: int = 60 * 24

    # Adresy frontendu, z których przeglądarka może wołać API (CORS), oddzielone przecinkami.
    # Domyślnie typowe porty serwerów deweloperskich: python -m http.server (8080),
    # Live Server w VS Code (5500), npx serve (3000).
    cors_origins: str = (
        "http://localhost:8080,http://127.0.0.1:8080,"
        "http://localhost:5500,http://127.0.0.1:5500,"
        "http://localhost:3000,http://127.0.0.1:3000"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]

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
