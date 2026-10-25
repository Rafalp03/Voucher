# Voucher

System sprzedaży i obsługi voucherów, udostępniany jako API (REST).

## O projekcie

**Voucher** to backend do sprzedaży i obsługi bonów (voucherów). Klient kupuje voucher, dostaje unikalny kod, a potem realizuje go u sprzedawcy. System pilnuje, żeby każdy voucher był ważny, wykorzystany tylko zgodnie z zasadami i żeby było wiadomo, co się z nim działo.

Planowany zakres (szczegóły ustala Product Owner, patrz [Otwarte pytania](#otwarte-pytania)):

- **Tworzenie i sprzedaż voucherów:** generowanie unikalnych kodów, wartość, data ważności, zamówienia.
- **Sprawdzanie i realizacja:** weryfikacja kodu, oznaczanie vouchera jako wykorzystanego.
- **Cykl życia vouchera:** statusy, np. utworzony, aktywny, wykorzystany, wygasły, anulowany.
- **API dla frontendu i integracji:** dokumentacja generowana automatycznie (Swagger).

### Stan projektu

| Etap                                                      | Stan          |
|-----------------------------------------------------------|---------------|
| Środowisko Docker (API + PostgreSQL)                      | gotowe        |
| Połączenie API z bazą, `/health`                          | gotowe        |
| Migracje bazy (Alembic), testy (pytest), lint (ruff), CI  | gotowe        |
| Model danych: tabele voucherów, zamówień itd.             | do zrobienia, czeka na decyzje PO |
| Endpointy i logika biznesowa                              | do zrobienia  |
| Frontend                                                  | do zrobienia  |

### Otwarte pytania

Decyzje, od których zależy model danych (Product Owner):

1. Voucher kwotowy (np. 100 zł) czy na konkretną usługę lub produkt? Czy można go wykorzystać częściowo?
2. Jakie statusy ma voucher i kto je zmienia?
3. Jakie są role użytkowników (kupujący, administrator, sprzedawca lub partner)? Czy potrzebne jest logowanie?
4. Płatności: na start ręcznie oznaczane czy od razu przez bramkę (np. Przelewy24, Stripe)?
5. Realizacja: wpisanie kodu czy skan QR? Czy voucher wysyłamy mailem lub jako PDF?
6. Ważność: stały okres? Czy można ją przedłużyć?

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
- Alembic (migracje bazy)
- pydantic-settings (konfiguracja ze zmiennych środowiskowych)
- pytest (testy), ruff (lint i formatowanie)
- Docker, Docker Compose, GitHub Actions (CI)

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
- **Przy każdym starcie** API najpierw wykonuje migracje bazy (`alembic upgrade head`), więc struktura bazy jest zawsze aktualna.
- API łączy się z bazą po nazwie usługi `db` wewnątrz sieci Dockera. Dane logowania bierze z pliku `.env`.
- Dane bazy są trzymane w wolumenie `pgdata`, więc przetrwają restart i `docker compose down`. Znikają dopiero po `docker compose down -v`.
- Z Twojego komputera baza jest dostępna pod `localhost:5433`, tylko lokalnie (np. dla DBeavera).

## Uruchomienie lokalne

Wymagany jest [Docker Desktop](https://www.docker.com/products/docker-desktop/). Pythona nie trzeba instalować, bo wszystko działa w kontenerach.

```bash
git clone https://github.com/Rafalp03/Voucher.git
cd Voucher
cp .env.example .env        # w Windows (PowerShell): copy .env.example .env
docker compose up --build
```

Po uruchomieniu:

| Co                         | Adres                                    |
|----------------------------|------------------------------------------|
| API                        | http://localhost:8000                    |
| Sprawdzenie działania      | http://localhost:8000/health             |
| Dokumentacja API (Swagger) | http://localhost:8000/docs               |
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

W trybie lokalnym (`docker-compose.override.yml`, wczytywany automatycznie):

- cały katalog projektu jest podmontowany do kontenera, więc zmiany w kodzie widać od razu,
- serwer restartuje się sam po zapisaniu pliku w `app/`,
- obraz zawiera narzędzia deweloperskie (pytest, ruff).

Obraz trzeba przebudować (`docker compose up --build`) tylko po zmianie `requirements*.txt` lub `Dockerfile`.

Wszystkie polecenia poniżej uruchamiamy w działającym kontenerze API (`docker compose up` musi być włączone).

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

### Zmiany w strukturze bazy (migracje)

Strukturę bazy zmieniamy **wyłącznie przez migracje Alembica**, nigdy ręcznie w DBeaverze. Dzięki temu każdy w zespole i CI mają identyczną bazę.

1. Dodaj lub zmień model w `app/models/`. Modele dziedziczą po `Base` z `app/db.py`, a nowy model trzeba zaimportować w `app/models/__init__.py`.
2. Wygeneruj migrację:
   ```bash
   docker compose exec api alembic revision --autogenerate -m "dodanie tabeli vouchers"
   ```
3. **Przejrzyj** wygenerowany plik w `alembic/versions/`, bo autogenerowanie nie wykrywa wszystkiego, np. zmiany nazwy kolumny.
4. Zastosuj migrację:
   ```bash
   docker compose exec api alembic upgrade head
   ```
   albo po prostu zrestartuj API, bo migracje uruchamiają się przy starcie.
5. Plik migracji commitujesz razem z modelem.

Inne przydatne polecenia:

```bash
docker compose exec api alembic current      # aktualna wersja bazy
docker compose exec api alembic history      # lista migracji
docker compose exec api alembic downgrade -1 # cofnięcie ostatniej migracji
docker compose exec api alembic check        # czy modele i migracje są zgodne
```

### Testy

```bash
docker compose exec api pytest               # wszystkie testy
docker compose exec api pytest -v            # ze szczegółami
docker compose exec api pytest tests/test_health.py   # jeden plik
```

- Testy działają na **osobnej bazie `voucher_test`**, która przy każdym uruchomieniu jest tworzona od nowa i migrowana. Twoje dane w bazie `voucher` nie są ruszane.
- Każdy test działa w transakcji wycofywanej na końcu, więc testy nie wpływają na siebie nawzajem.
- Gotowe fixture'y w `tests/conftest.py`:
  - `client`: klient HTTP do API,
  - `db_session`: sesja bazy do przygotowania danych testowych.

Przykład testu:

```python
def test_health_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
```

### Lint i formatowanie

```bash
docker compose exec api ruff check .         # szukanie błędów
docker compose exec api ruff check --fix .   # automatyczne poprawki
docker compose exec api ruff format .        # formatowanie kodu
```

Konfiguracja ruffa i pytesta jest w `pyproject.toml`.

### Inne przydatne polecenia

```bash
docker compose ps                             # stan kontenerów (powinny być "healthy")
docker compose logs -f api                    # logi API na żywo
docker compose exec db psql -U voucher        # konsola SQL bazy
```

## CI (GitHub Actions)

Przy każdym Pull Requeście i każdej zmianie na `main` GitHub automatycznie uruchamia (`.github/workflows/ci.yml`):

| Krok               | Co sprawdza                                            |
|--------------------|--------------------------------------------------------|
| **Lint (ruff)**    | błędy w kodzie i formatowanie (`ruff check`, `ruff format --check`) |
| **Testy (pytest)** | wszystkie testy na prawdziwej bazie PostgreSQL 16      |
| **Budowanie obrazu** | czy obraz produkcyjny Dockera się buduje             |

PR scalamy dopiero, gdy wszystkie kroki są zielone. Przed wysłaniem zmian warto uruchomić lokalnie `ruff check .`, `ruff format .` i `pytest`.

## Rozwiązywanie problemów

| Objaw                                              | Rozwiązanie                                                                 |
|----------------------------------------------------|-----------------------------------------------------------------------------|
| `/health` zwraca 503, w logach `password authentication failed` | hasło w `.env` różni się od tego w bazie: `docker compose down -v`, potem `docker compose up` |
| API nie startuje, w logach błąd z `alembic`        | błąd w migracji: sprawdź ostatni plik w `alembic/versions/`                  |
| `port is already allocated` dla 5433               | zmień `POSTGRES_PORT` w `.env`                                               |
| `port is already allocated` dla 8000               | zatrzymaj program zajmujący port 8000                                        |
| `ModuleNotFoundError` po dodaniu pakietu           | `docker compose up --build`                                                  |
| `pytest: not found` w kontenerze                   | obraz zbudowany bez narzędzi deweloperskich: `docker compose up --build`     |
| zmiany w kodzie nie są widoczne                    | sprawdź logi API (`docker compose logs -f api`), czy serwer się zrestartował |

## Struktura

```
app/                        kod aplikacji (FastAPI)
  main.py                   aplikacja i endpointy
  config.py                 ustawienia ze zmiennych środowiskowych
  db.py                     połączenie z bazą (SQLAlchemy), sesja get_db, klasa Base modeli
  models/                   modele ORM (tabele bazy)
alembic/                    migracje bazy
  versions/                 pliki migracji (commitujemy je do repo)
  env.py                    konfiguracja Alembica (adres bazy z app/config.py)
tests/                      testy (pytest)
  conftest.py               baza testowa i fixture'y client, db_session
scripts/entrypoint.sh       start kontenera: migracje, potem serwer
.github/workflows/ci.yml    CI: lint, testy, budowanie obrazu
Dockerfile                  obraz API
docker-compose.yml          API + baza PostgreSQL
docker-compose.override.yml ustawienia do pracy lokalnej (hot reload, narzędzia dev)
.env.example                wzór zmiennych środowiskowych
requirements.txt            zależności aplikacji
requirements-dev.txt        zależności do testów i lintu
pyproject.toml              konfiguracja ruff i pytest
alembic.ini                 konfiguracja Alembica
```

## Zasady pracy z repozytorium

- Nie commitujemy pliku `.env` ani żadnych haseł.
- Każda zmiana na osobnej gałęzi (np. `feature/nazwa`), do `main` tylko przez Pull Request.
- PR musi przejść CI (lint, testy, budowanie obrazu).
- Zmiany struktury bazy tylko przez migracje Alembica, commitowane razem z modelem.
- Nowa funkcjonalność razem z testami.
