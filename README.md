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
- Docker, Docker Compose

## Uruchomienie lokalne

Wymagany jest [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/Rafalp03/Voucher.git
cd Voucher
cp .env.example .env        # w Windows (PowerShell): copy .env.example .env
docker compose up --build
```

Po uruchomieniu:

- API: http://localhost:8000
- Sprawdzenie działania: http://localhost:8000/health
- Dokumentacja API (Swagger): http://localhost:8000/docs
- Baza danych: `localhost:5433` (port `POSTGRES_PORT` i dane logowania z pliku `.env`)

W trybie lokalnym (`docker-compose.override.yml`) kod z katalogu `app/` jest podmontowany do kontenera, a serwer restartuje się automatycznie po zapisaniu pliku.

Zatrzymanie:

```bash
docker compose down        # zatrzymuje kontenery
docker compose down -v     # dodatkowo usuwa dane bazy
```

## Struktura

```
app/                        kod aplikacji (FastAPI)
Dockerfile                  obraz API
docker-compose.yml          API + baza PostgreSQL
docker-compose.override.yml ustawienia do pracy lokalnej (hot reload)
.env.example                wzór zmiennych środowiskowych
```

## Zasady pracy z repozytorium

- Nie commitujemy pliku `.env` ani żadnych haseł.
- Każda zmiana na osobnej gałęzi (np. `feature/nazwa`), do `main` tylko przez Pull Request.
