# Voucher

Projekt systemu sprzedaży i obsługi voucherów z API.

## Zespół

| Imię i nazwisko   | Rola                                         |
|-------------------|----------------------------------------------|
| Rafał Pawelec     | DevOps, Programista backend                  |
| Piotr Babik       | Koordynator projektu, Przedstawiciel         |
| Jakub Kazano      | Tester manualny, Tester automatyczny         |
| Adrian Karpowicz  | Programista interfejsu użytkownika, DevOps   |
| Hubert Bojarski   | Product Owner, Analityk                      |
| Hasan Jadou       | Tester manualny, Tester automatyczny         |

## Technologie

- Python 3.12, FastAPI, Uvicorn
- PostgreSQL 16
- SQLAlchemy 2 (ORM) + psycopg 3 (sterownik bazy)
- pydantic-settings (konfiguracja ze zmiennych środowiskowych)
- Docker, Docker Compose

## Jak działa projekt

Projekt składa się z dwóch kontenerów uruchamianych przez Docker Compose:

```
 przeglądarka / frontend / testy
            │  http://localhost:8000
            ▼
 ┌──────────────────────┐        ┌──────────────────────┐
 │ voucher-api          │        │ voucher-db           │
 │ FastAPI + Uvicorn    │───────▶│ PostgreSQL 16        │
 │ port 8000            │ db:5432│ dane w wolumenie     │
 └──────────────────────┘        │ pgdata               │
                                 └──────────▲───────────┘
                                            │ localhost:5433
                                  DBeaver / psql (podgląd bazy)
```

- **API** startuje dopiero, gdy baza jest gotowa (healthcheck Postgresa).
- API łączy się z bazą po nazwie usługi `db` wewnątrz sieci Dockera. Dane logowania bierze z pliku `.env`.
- Dane bazy są trzymane w wolumenie `pgdata`, więc przetrwają restart i `docker compose down`. Znikają dopiero po `docker compose down -v`.
- Z Twojego komputera baza jest dostępna pod `localhost:5433`, tylko lokalnie (np. dla DBeavera).

## Uruchomienie lokalne

Wymagany jest [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/Rafalp03/Voucher.git
cd Voucher
cp .env.example .env        # w Windows (PowerShell): copy .env.example .env
docker compose up --build
```

Po uruchomieniu:

| Co                         | Adres                                  |
|----------------------------|----------------------------------------|
| API                        | http://localhost:8000                  |
| Sprawdzenie działania      | http://localhost:8000/health           |
| Dokumentacja API (Swagger) | http://localhost:8000/docs             |
| Baza danych                | `localhost:5433`, login i hasło z `.env` |

Poprawnie działający projekt zwraca na `/health`:

```json
{"status": "ok", "database": "ok"}
```

Jeśli baza jest niedostępna, `/health` zwraca kod `503` i `{"status": "error", "database": "unavailable"}`, a przyczyna błędu pojawia się w logach API.

Zatrzymanie:

```bash
docker compose down        # zatrzymuje kontenery, dane bazy zostają
docker compose down -v     # dodatkowo usuwa dane bazy (czysta baza przy następnym starcie)
```

## Konfiguracja (`.env`)

| Zmienna             | Opis                                                          | Domyślnie w `.env.example` |
|---------------------|---------------------------------------------------------------|----------------------------|
| `POSTGRES_USER`     | użytkownik bazy                                               | `voucher`                  |
| `POSTGRES_PASSWORD` | hasło do bazy                                                 | `zmien_mnie`               |
| `POSTGRES_DB`       | nazwa bazy                                                    | `voucher`                  |
| `POSTGRES_PORT`     | port bazy na Twoim komputerze (zmień, jeśli 5433 jest zajęty) | `5433`                     |

Adres bazy dla API (`DB_HOST=db`, `DB_PORT=5432`) jest ustawiony w `docker-compose.yml` i nie trzeba go zmieniać.

> **Uwaga:** Postgres ustawia hasło tylko przy pierwszym uruchomieniu, czyli przy pustym wolumenie. Po zmianie hasła w `.env` trzeba wyczyścić bazę (`docker compose down -v`), inaczej API zgłosi `password authentication failed`.

## Praca z kodem

W trybie lokalnym (`docker-compose.override.yml`, wczytywany automatycznie) katalog `app/` jest podmontowany do kontenera, a serwer restartuje się sam po zapisaniu pliku. Nie trzeba przebudowywać obrazu przy zmianach w kodzie.

Obraz trzeba przebudować (`docker compose up --build`) tylko po zmianie `requirements.txt` lub `Dockerfile`.

### Endpoint korzystający z bazy

Sesję bazy dostajesz przez zależność `get_db`. Jest tworzona na każde żądanie i zamykana automatycznie. Przykład w `app/main.py`:

```python
from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db


@app.get("/przyklad")
def przyklad(db: Session = Depends(get_db)):
    return {"wynik": db.execute(text("SELECT 1")).scalar_one()}
```

Modele ORM dziedziczą po klasie `Base` z `app/db.py`.

### Przydatne polecenia

```bash
docker compose ps                             # stan kontenerów (powinny być "healthy")
docker compose logs -f api                    # logi API na żywo
docker compose exec db psql -U voucher        # konsola SQL bazy
```

## Rozwiązywanie problemów

| Objaw                                              | Rozwiązanie                                                                 |
|----------------------------------------------------|-----------------------------------------------------------------------------|
| `/health` zwraca 503, w logach `password authentication failed` | hasło w `.env` różni się od tego w bazie: `docker compose down -v`, potem `docker compose up` |
| `port is already allocated` dla 5433               | zmień `POSTGRES_PORT` w `.env`                                               |
| `port is already allocated` dla 8000               | zatrzymaj program zajmujący port 8000                                        |
| `ModuleNotFoundError` po dodaniu pakietu           | `docker compose up --build`                                                  |
| zmiany w kodzie nie są widoczne                    | sprawdź logi API (`docker compose logs -f api`), czy serwer się zrestartował |

## Struktura

```
app/                        kod aplikacji (FastAPI)
  main.py                   aplikacja i endpointy
  config.py                 ustawienia ze zmiennych środowiskowych
  db.py                     połączenie z bazą (SQLAlchemy), sesja get_db, klasa Base modeli
Dockerfile                  obraz API
docker-compose.yml          API + baza PostgreSQL
docker-compose.override.yml ustawienia do pracy lokalnej (hot reload)
.env.example                wzór zmiennych środowiskowych
requirements.txt            zależności Pythona
```

## Zasady pracy z repozytorium

- Nie commitujemy pliku `.env` ani żadnych haseł.
- Każda zmiana na osobnej gałęzi (np. `feature/nazwa`), do `main` tylko przez Pull Request.
