# Voucher

System sprzedaży i obsługi voucherów: sklep internetowy **VoucherShop** (frontend) oraz REST API
z bazą PostgreSQL (backend), w jednym repozytorium.

## Szybki start

Wymagany jest tylko [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/Rafalp03/Voucher.git
cd Voucher
cp .env.example .env        # w Windows (PowerShell): copy .env.example .env
docker compose up --build
```

Sklep: **http://localhost:8080** · API (Swagger): **http://localhost:8000/docs**

Szczegóły w sekcji [Uruchomienie lokalne](#uruchomienie-lokalne).

## O projekcie

**Voucher** to system do sprzedaży i obsługi bonów (voucherów). Klient kupuje voucher, dostaje unikalny kod, a potem realizuje go u sprzedawcy. System pilnuje, żeby każdy voucher był ważny, wykorzystany tylko zgodnie z zasadami i żeby było wiadomo, co się z nim działo.

Planowany zakres (szczegóły ustala Product Owner, patrz [Otwarte pytania](#otwarte-pytania)):

- **Tworzenie i sprzedaż voucherów:** generowanie unikalnych kodów, wartość, data ważności, zamówienia.
- **Sprawdzanie i realizacja:** weryfikacja kodu, oznaczanie vouchera jako wykorzystanego.
- **Cykl życia vouchera:** statusy, np. utworzony, aktywny, wykorzystany, wygasły, anulowany.
- **API dla frontendu i integracji:** dokumentacja generowana automatycznie (Swagger).
- **Sklep internetowy:** katalog, koszyk, płatność (na razie symulowana), konta klientów.

Repozytorium składa się z dwóch części:

| Część        | Katalog     | Technologia                            | Dokumentacja |
|--------------|-------------|----------------------------------------|--------------|
| **Backend**  | `app/` (oraz `alembic/`, `tests/`) | Python, FastAPI, PostgreSQL | ten plik |
| **Frontend** | `frontend/` | HTML, CSS, JavaScript (moduły ES), bez procesu budowania | [`frontend/README.md`](frontend/README.md) |
| Kontrakt API | `docs/`     | opis endpointów i schemat bazy         | [`docs/API.md`](docs/API.md), [`docs/schema.sql`](docs/schema.sql) |

### Stan projektu

| Etap                                                      | Stan          |
|-----------------------------------------------------------|---------------|
| Środowisko Docker (API + PostgreSQL)                      | gotowe        |
| Połączenie API z bazą, `/health`                          | gotowe        |
| Migracje bazy (Alembic), testy (pytest), lint (ruff), CI  | gotowe        |
| Model danych: użytkownicy, katalog voucherów, koszyk, zamówienia | gotowe |
| Endpointy sklepu (`/api/v1`) zgodne z frontendem          | gotowe        |
| Frontend sklepu (`frontend/`) połączony z API             | gotowe        |
| Wspólne uruchomienie (frontend + API + baza) jednym poleceniem | gotowe    |
| Kody voucherów i ich realizacja                           | do zrobienia, czeka na decyzje PO |
| Prawdziwe płatności                                       | do zrobienia, czeka na decyzje PO |


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
- PyJWT (tokeny logowania), argon2-cffi (hashowanie haseł)
- pytest (testy), ruff (lint i formatowanie)
- Frontend: HTML5, CSS3, JavaScript ES2022 (moduły ES, Fetch API), serwowany przez nginx
- Docker, Docker Compose, GitHub Actions (CI, publikacja frontendu na GitHub Pages)

## Jak działa projekt

Projekt składa się z trzech kontenerów uruchamianych przez Docker Compose:

```
                          przeglądarka
               │                              │
               │ http://localhost:8080        │ REST /api/v1 (JSON)
               │ pliki HTML, CSS, JS          │ http://localhost:8000
               ▼                              ▼
 ┌──────────────────────┐      ┌──────────────────────┐        ┌──────────────────────┐
 │ voucher-web          │      │ voucher-api          │        │ voucher-db           │
 │ nginx                │      │ FastAPI + Uvicorn    │───────▶│ PostgreSQL 16        │
 │ pliki z frontend/    │      │ port 8000            │ db:5432│ dane w wolumenie     │
 └──────────────────────┘      └──────────────────────┘        │ pgdata               │
                                                               └──────────▲───────────┘
                                                                          │ localhost:5433
                                                                DBeaver / psql (podgląd bazy)
```

- **Frontend** to statyczne pliki. Kontener `web` (nginx) tylko wysyła je do przeglądarki, a cała logika
  działa w przeglądarce i rozmawia bezpośrednio z API (dlatego API ma ustawiony CORS dla `localhost:8080`).

- **API** startuje dopiero, gdy baza jest gotowa (healthcheck Postgresa).
- **Przy każdym starcie** API najpierw wykonuje migracje bazy (`alembic upgrade head`), więc struktura bazy jest zawsze aktualna.
- API łączy się z bazą po nazwie usługi `db` wewnątrz sieci Dockera. Dane logowania bierze z pliku `.env`.
- Dane bazy są trzymane w wolumenie `pgdata`, więc przetrwają restart i `docker compose down`. Znikają dopiero po `docker compose down -v`.
- Z Twojego komputera baza jest dostępna pod `localhost:5433`, tylko lokalnie (np. dla DBeavera).

## Uruchomienie lokalne

Wymagany jest [Docker Desktop](https://www.docker.com/products/docker-desktop/). Pythona ani Node.js nie trzeba instalować, bo wszystko działa w kontenerach.

```bash
git clone https://github.com/Rafalp03/Voucher.git
cd Voucher
cp .env.example .env        # w Windows (PowerShell): copy .env.example .env
docker compose up --build
```

Po uruchomieniu:

| Co                         | Adres                                    |
|----------------------------|------------------------------------------|
| **Sklep (frontend)**       | http://localhost:8080                    |
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
| `JWT_SECRET`        | klucz do podpisywania tokenów logowania, **min. 32 znaki**    | wartość przykładowa, zmień |
| `JWT_EXPIRE_MINUTES`| ważność tokenu logowania (opcjonalne)                         | `1440` (24 h)              |
| `CORS_ORIGINS`      | adresy frontendu, z których wolno wołać API, po przecinku (opcjonalne) | `localhost` na portach 8080, 5500, 3000 |

Własny `JWT_SECRET` wygenerujesz poleceniem:

```bash
docker compose exec api python -c "import secrets; print(secrets.token_hex(32))"
```

Adres bazy dla API (`DB_HOST=db`, `DB_PORT=5432`) jest ustawiony w `docker-compose.yml` i nie trzeba go zmieniać.

> **Uwaga:** Postgres ustawia hasło tylko przy pierwszym uruchomieniu, czyli przy pustym wolumenie. Po zmianie hasła w `.env` trzeba wyczyścić bazę (`docker compose down -v`), inaczej API zgłosi `password authentication failed`.

## Model danych

Tabele tworzą migracje Alembica (`alembic/versions/`), a modele są w `app/models/`.

| Tabela           | Co przechowuje                                                                 |
|------------------|--------------------------------------------------------------------------------|
| `vouchers`       | katalog: nazwa, kategoria, opis, zdjęcie, kolejność (`sort_order`), czy aktywny (`is_active`) |
| `voucher_tiers`  | progi cenowe vouchera (`value`) z opisem pakietu; para voucher + wartość jest unikalna |
| `users`          | konta klientów; hasło tylko jako skrót Argon2 (`password_hash`)                |
| `revoked_tokens` | tokeny unieważnione przy wylogowaniu (do daty ich wygaśnięcia)                 |
| `cart_items`     | pozycje koszyków; `cart_id` to wartość nagłówka `X-Cart-Id`, `tier_id` wskazuje próg cenowy |
| `orders`         | zamówienia: dane klienta, metoda płatności, status, suma; `user_id` pusty przy zakupie jako gość |
| `order_items`    | pozycje zamówienia z nazwą i ceną skopiowaną w chwili zakupu                   |

```
vouchers 1───N voucher_tiers 1───N cart_items
    │
    └──────1───N order_items N───1 orders N───1 users (opcjonalnie)
```

Pozycje zamówienia nie wskazują progu cenowego, tylko kopiują nazwę i cenę. Dzięki temu zmiana
katalogu nie zmienia historii zamówień.

Dane w bazie można bezpośrednio podejrzeć, patrz [Podgląd danych w bazie](#podgląd-danych-w-bazie).

## Endpointy

Wszystkie endpointy sklepu mają prefiks `/api/v1`. Pełna, interaktywna lista jest w Swaggerze
(http://localhost:8000/docs), a kontrakt z frontendem (przykłady żądań i odpowiedzi) opisuje
[`docs/API.md`](docs/API.md).

| Metoda i ścieżka                    | Opis                                                        | Logowanie |
|-------------------------------------|-------------------------------------------------------------|-----------|
| `GET /vouchers`                     | katalog (filtry `category`, `minPrice`, `maxPrice`)         | nie       |
| `GET /vouchers/{id}`                | jeden voucher z progami cenowymi                            | nie       |
| `POST /auth/register`               | rejestracja, zwraca token i użytkownika                     | nie       |
| `POST /auth/login`                  | logowanie, zwraca token i użytkownika                       | nie       |
| `POST /auth/logout`                 | unieważnia token                                            | tak       |
| `GET /users/me`                     | profil zalogowanego użytkownika                             | tak       |
| `GET /cart`                         | zawartość koszyka                                           | nie       |
| `POST /cart/items`                  | dodanie pozycji (lub zwiększenie ilości)                    | nie       |
| `PUT /cart/items/{index}`           | zmiana ilości (`qty < 1` usuwa pozycję)                     | nie       |
| `DELETE /cart/items/{index}`        | usunięcie pozycji                                           | nie       |
| `DELETE /cart`                      | wyczyszczenie koszyka                                       | nie       |
| `POST /orders`                      | złożenie zamówienia (ceny liczy serwer)                     | nie       |
| `GET /orders`                       | historia zamówień użytkownika                               | tak       |
| `GET /orders/{id}`                  | szczegóły zamówienia                                        | gość: tylko swoje zamówienie gościa |

Zasady:

- **Logowanie:** nagłówek `Authorization: Bearer <token>`. Token to JWT ważny 24 h. Wylogowanie wpisuje go do tabeli `revoked_tokens`. Hasła są hashowane algorytmem Argon2.
- **Koszyk** rozpoznajemy po nagłówku `X-Cart-Id` (losowy UUID, który frontend tworzy i trzyma w `localStorage`), także u gościa.
- **Zamówienie:** klient wysyła tylko `voucherId`, `value` i `qty`. Serwer sprawdza, czy taki próg cenowy istnieje, i sam liczy sumę. Płatność jest symulowana, więc zamówienie od razu ma status `paid`. Numer zamówienia (`VS-` + 10 losowych znaków) jest trudny do zgadnięcia, bo gość ogląda zamówienie właśnie po numerze.
- **Błędy** mają jedną postać, a `message` jest po polsku i frontend pokazuje go użytkownikowi:
  ```json
  {"message": "Nieprawidłowy e-mail lub hasło.", "code": "INVALID_CREDENTIALS"}
  ```
- **Dane startowe:** migracja `dane_startowe_katalogu` wstawia 8 voucherów (21 progów cenowych) z katalogu frontendu.

## Frontend

Frontend jest w katalogu [`frontend/`](frontend/). Jego architekturę, strukturę plików i źródła zdjęć
opisuje [`frontend/README.md`](frontend/README.md).

- `docker compose up` uruchamia go automatycznie pod http://localhost:8080 (kontener `web`).
- Katalog `frontend/` jest podmontowany do kontenera, więc po zmianie pliku wystarczy odświeżyć stronę
  (Ctrl+F5, jeśli przeglądarka trzyma starą wersję w pamięci podręcznej).
- Frontend łączy się z API pod `http://localhost:8000/api/v1` (ustawienie `API_BASE_URL` w `frontend/js/config.js`).
- Bez backendu frontend może działać na danych testowych: http://localhost:8080/?mock=1.

### Ręczne testowanie sklepu

1. **Katalog:** wybierz voucher, wartość i ilość, kliknij „Dodaj do koszyka”.
2. **Koszyk:** zmień ilość lub usuń pozycję. Licznik w nagłówku powinien się zmieniać.
3. **Płatność:** podaj dowolne dane testowe, np. BLIK `123456` albo kartę `4242 4242 4242 4242`, `12/30`, CVC `123`.
   Dane karty i kod BLIK nie są wysyłane do API. Po zapłacie pojawia się ekran z numerem zamówienia (`VS-...`).
4. **Konto:** zarejestruj się (hasło min. 8 znaków, litera i cyfra), złóż zamówienie i sprawdź je w „Moje konto”.
5. **Baza:** sprawdź, czy zamówienie zapisało się w tabelach `orders` i `order_items` (patrz niżej).

W przeglądarce (F12, zakładka Network) widać żądania do `http://localhost:8000/api/v1/...` i odpowiedzi API.

Frontend serwowany z innego portu niż 8080, 5500 lub 3000 (np. przez Live Server w VS Code na nietypowym porcie)
trzeba dopisać do `CORS_ORIGINS` w `.env`. Inaczej przeglądarka zablokuje żądania do API.

### Publikacja frontendu na GitHub Pages

Workflow `.github/workflows/pages.yml` publikuje katalog `frontend/` na GitHub Pages po każdej zmianie
w `frontend/` na gałęzi `main` (można go też uruchomić ręcznie w zakładce *Actions*).

1. Jednorazowo: *Settings → Pages → Build and deployment → Source: **GitHub Actions***.
2. Strona będzie pod `https://<użytkownik>.github.io/Voucher/`.

Na GitHub Pages nie ma backendu, więc frontend sam przełącza się tam na dane testowe (mock).

## Praca z kodem

W trybie lokalnym (`docker-compose.override.yml`, wczytywany automatycznie):

- cały katalog projektu jest podmontowany do kontenera, więc zmiany w kodzie widać od razu,
- serwer restartuje się sam po zapisaniu pliku w `app/`,
- zmiany we frontendzie (`frontend/`) widać po odświeżeniu strony,
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
- Testy endpointów sklepu są w plikach `test_vouchers.py`, `test_auth.py`, `test_cart.py`, `test_orders.py`
  i `test_cors.py`. Wspólne funkcje pomocnicze (rejestracja, przykładowe zamówienie) są w `tests/helpers.py`.
- Katalog voucherów jest w bazie testowej od początku, bo wstawia go migracja.
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

### Podgląd danych w bazie

**Konsola SQL w kontenerze** (najszybciej):

```bash
docker compose exec db psql -U voucher -d voucher
```

Przydatne zapytania (wyjście z konsoli: `\q`, lista tabel: `\dt`):

```sql
-- ostatnie zamówienia, z kontem (puste = zakup jako gość)
SELECT o.id, o.customer_name, o.email, o.payment_method, o.status, o.total,
       u.email AS konto, o.created_at
FROM orders o LEFT JOIN users u ON u.id = o.user_id
ORDER BY o.created_at DESC LIMIT 10;

-- pozycje wybranego zamówienia
SELECT voucher_name, unit_value, qty FROM order_items WHERE order_id = 'VS-XXXXXXXXXX';

-- konta (bez skrótów haseł)
SELECT id, name, email, created_at FROM users ORDER BY id DESC;

-- aktualne koszyki
SELECT c.cart_id, t.voucher_id, t.value, c.qty
FROM cart_items c JOIN voucher_tiers t ON t.id = c.tier_id ORDER BY c.cart_id, c.id;
```

**DBeaver:** nowe połączenie PostgreSQL, host `localhost`, port `5433` (lub `POSTGRES_PORT` z `.env`),
baza `voucher`, użytkownik i hasło z `.env`. Tabele są w schemacie `public`.
Danych w DBeaverze nie zmieniamy ręcznie, tylko je przeglądamy.

**Przez API:** zamówienie złożone jako gość widać pod `http://localhost:8000/api/v1/orders/<numer>`.

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

Osobny workflow `.github/workflows/pages.yml` publikuje frontend na GitHub Pages
(patrz [Publikacja frontendu na GitHub Pages](#publikacja-frontendu-na-github-pages)).

PR scalamy dopiero, gdy wszystkie kroki są zielone. Przed wysłaniem zmian warto uruchomić lokalnie `ruff check .`, `ruff format .` i `pytest`.

## Rozwiązywanie problemów

| Objaw                                              | Rozwiązanie                                                                 |
|----------------------------------------------------|-----------------------------------------------------------------------------|
| API nie startuje, w logach `jwt_secret Field required` lub `at least 32 characters` | dopisz `JWT_SECRET` (min. 32 znaki) do `.env`, wzór w `.env.example` |
| przeglądarka zgłasza błąd CORS, frontend pokazuje „Brak połączenia z serwerem” | dopisz adres frontendu do `CORS_ORIGINS` w `.env` i zrestartuj API; sprawdź też, czy API działa (`/health`) |
| `/health` zwraca 503, w logach `password authentication failed` | hasło w `.env` różni się od tego w bazie: `docker compose down -v`, potem `docker compose up` |
| API nie startuje, w logach błąd z `alembic`        | błąd w migracji: sprawdź ostatni plik w `alembic/versions/`                  |
| `port is already allocated` dla 5433               | zmień `POSTGRES_PORT` w `.env`                                               |
| `port is already allocated` dla 8000 lub 8080      | zatrzymaj program zajmujący ten port (np. wcześniej uruchomiony `http.server`) |
| sklep pokazuje stare pliki po zmianie we `frontend/` | odśwież stronę z pominięciem pamięci podręcznej (Ctrl+F5)                  |
| `ModuleNotFoundError` po dodaniu pakietu           | `docker compose up --build`                                                  |
| `pytest: not found` w kontenerze                   | obraz zbudowany bez narzędzi deweloperskich: `docker compose up --build`     |
| zmiany w kodzie nie są widoczne                    | sprawdź logi API (`docker compose logs -f api`), czy serwer się zrestartował |

## Struktura

```
frontend/                   sklep VoucherShop (HTML, CSS, JS), opis w frontend/README.md
  index.html                szkielet strony
  js/                       logika: router, widoki, serwisy API, dane testowe (mock)
  css/, img/                style i zdjęcia
docs/                       dokumentacja wspólna dla frontendu i backendu
  API.md                    kontrakt REST API (żądania, odpowiedzi, błędy)
  schema.sql                schemat bazy (poglądowo; źródłem są migracje)
app/                        backend: kod aplikacji (FastAPI)
  main.py                   aplikacja: CORS, obsługa błędów, podpięcie routerów, /health
  config.py                 ustawienia ze zmiennych środowiskowych
  db.py                     połączenie z bazą (SQLAlchemy), sesja get_db, klasa Base modeli
  models/                   modele ORM (tabele bazy)
  routers/                  endpointy /api/v1: vouchers, auth (i users/me), cart, orders
  schemas.py                schematy żądań i odpowiedzi (JSON w camelCase)
  deps.py                   zależności: zalogowany użytkownik, identyfikator koszyka
  security.py               hashowanie haseł (Argon2) i tokeny JWT
  errors.py                 jednolity format błędów {message, code}
alembic/                    migracje bazy
  versions/                 pliki migracji (commitujemy je do repo)
  env.py                    konfiguracja Alembica (adres bazy z app/config.py)
tests/                      testy (pytest)
  conftest.py               baza testowa i fixture'y client, db_session
  helpers.py                funkcje pomocnicze testów (rejestracja, przykładowe zamówienie)
scripts/entrypoint.sh       start kontenera: migracje, potem serwer
.github/workflows/ci.yml    CI: lint, testy, budowanie obrazu
.github/workflows/pages.yml publikacja frontendu na GitHub Pages
Dockerfile                  obraz API
docker-compose.yml          frontend (nginx) + API + baza PostgreSQL
docker-compose.override.yml ustawienia do pracy lokalnej (hot reload, narzędzia dev)
.env.example                wzór zmiennych środowiskowych
requirements.txt            zależności aplikacji
requirements-dev.txt        zależności do testów i lintu
pyproject.toml              konfiguracja ruff i pytest
alembic.ini                 konfiguracja Alembica
.editorconfig               wspólne ustawienia edytora (wcięcia, kodowanie, końce linii)
```

## Zasady pracy z repozytorium

- Nie commitujemy pliku `.env` ani żadnych haseł.
- Każda zmiana na osobnej gałęzi (np. `feature/nazwa`), do `main` tylko przez Pull Request.
- PR musi przejść CI (lint, testy, budowanie obrazu).
- Zmiany struktury bazy tylko przez migracje Alembica, commitowane razem z modelem.
- Nowa funkcjonalność razem z testami.
- Zmiana w API (nowy endpoint, inne pola) razem z aktualizacją [`docs/API.md`](docs/API.md)
  i serwisów frontendu (`frontend/js/api/`), w tym samym Pull Requeście.
- Zmiana struktury bazy razem z aktualizacją [`docs/schema.sql`](docs/schema.sql).
