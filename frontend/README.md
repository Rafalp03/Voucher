# VoucherShop – internetowy sklep z voucherami prezentowymi

> Projekt zaliczeniowy · aplikacja typu SPA (Single Page Application) w czystym HTML, CSS i JavaScript (ES Modules).

## 1. Cel projektu

Celem projektu jest zaprojektowanie i implementacja warstwy frontendowej sklepu internetowego
sprzedającego vouchery prezentowe (np. dzień w SPA, skok ze spadochronem, warsztaty baristyczne).
Aplikacja ma czytelną, modułową architekturę z wydzieloną warstwą dostępu do danych,
dzięki czemu w kolejnym etapie można ją podłączyć do backendu z relacyjną bazą danych
**bez zmian w kodzie widoków**.

## 2. Funkcjonalności

- **Katalog** voucherów z sekcją hero i filtrowaniem po kategorii oraz przedziale cenowym.
- **Szczegóły vouchera** – wybór progu cenowego z opisem zawartości pakietu, wybór ilości.
- **Koszyk** – zmiana ilości, usuwanie pozycji, podsumowanie. W trybie API koszyk jest na serwerze
  (rozpoznawany po identyfikatorze przeglądarki), w trybie mock w `localStorage`.
- **Płatność (symulowana)** – karta lub BLIK, walidacja formularza; dane karty i kod BLIK nie są nigdzie
  wysyłane ani zapisywane. Zamówienie trafia do bazy backendu, a ceny przelicza serwer.
- **Konta użytkowników** – rejestracja z walidacją, logowanie, wylogowanie, profil z historią zamówień.
  W trybie API hasła hashuje serwer (Argon2), a logowanie działa na tokenach JWT.
  W trybie mock hasła są solone i hashowane SHA-256 (Web Crypto API).
- **Interfejs** – glassmorphism, responsywność (RWD), obsługa klawiatury, `prefers-reduced-motion`.

## 3. Architektura

Aplikacja ma budowę warstwową. Widoki nie odwołują się bezpośrednio do `localStorage` ani do `fetch` –
korzystają wyłącznie z **serwisów**, które zwracają `Promise`. Serwis, w zależności od flagi
`USE_MOCK` w `js/config.js`, deleguje wywołanie do implementacji testowej (mock) albo do REST API
(wzorzec *Strategy / Adapter*). Backend REST jest w repozytorium
[Voucher](https://github.com/Rafalp03/Voucher) (FastAPI + PostgreSQL).

```mermaid
flowchart TD
    U[Użytkownik / przeglądarka] --> R[router.js<br/>routing po hashu URL]
    R --> V[views/*<br/>catalog, detail, cart, payment,<br/>success, login, register, account]
    V --> S[api/*Service.js<br/>vouchers, auth, cart, orders]
    S -->|USE_MOCK = true| M[mock/*<br/>dane statyczne + localStorage]
    S -->|USE_MOCK = false| C[api/apiClient.js<br/>fetch + JWT + X-Cart-Id]
    C --> B[(Backend Voucher<br/>FastAPI + PostgreSQL)]
```

Dodatkowe mechanizmy:
- **Router** (`js/router.js`) – mapuje `#/trasa/parametr` na funkcję renderującą widok; hash pozwala
  hostować aplikację na GitHub Pages bez konfiguracji serwera.
- **Zdarzenia** – `cartService` emituje `cart:changed`, na które reaguje licznik koszyka w nagłówku.
- **Bezpieczeństwo** – wszystkie dane użytkownika wstawiane do HTML przechodzą przez `esc()` (ochrona przed XSS).

## 4. Struktura katalogów

```
voucher-shop/
├── index.html              # szkielet strony, nagłówek z logo, ładowanie modułów
├── logo.svg                # logo i favicon
├── css/
│   ├── base.css            # zmienne motywu, typografia, tło
│   ├── layout.css          # nagłówek, stopka, hero
│   ├── components.css      # przyciski, chipy filtrów, karty
│   ├── views.css           # style widoków (szczegóły, koszyk, formularze…)
│   └── responsive.css      # RWD i dostępność
├── js/
│   ├── main.js             # punkt wejścia
│   ├── config.js           # API_BASE_URL, USE_MOCK (wybór mock/REST), klucze localStorage
│   ├── router.js           # routing po hashu
│   ├── utils.js            # formatowanie, escapowanie, SHA-256, miniatury
│   ├── api/
│   │   ├── apiClient.js    # wrapper na fetch (JSON, token, identyfikator koszyka, błędy)
│   │   ├── vouchersService.js
│   │   ├── authService.js
│   │   ├── cartService.js
│   │   └── ordersService.js
│   ├── mock/
│   │   ├── data.js         # dane voucherów i progów cenowych
│   │   ├── mockDb.js       # „baza” w localStorage + symulacja opóźnienia
│   │   ├── vouchersMock.js
│   │   ├── authMock.js
│   │   ├── cartMock.js
│   │   └── ordersMock.js
│   └── views/
│       ├── header.js       # licznik koszyka, link konta
│       ├── catalog.js  detail.js  cart.js  payment.js  success.js
│       ├── login.js  register.js  account.js  notFound.js
├── img/                    # zdjęcia voucherów i tło (JPG/WebP)
└── docs/
    ├── API.md              # kontrakt REST API (zaimplementowany w backendzie Voucher)
    └── schema.sql          # schemat bazy backendu (poglądowo; źródłem są migracje backendu)
```

## 5. Uruchomienie lokalne

Domyślnie aplikacja uruchomiona lokalnie korzysta z backendu pod `http://localhost:8000/api/v1`.
Najpierw uruchom backend (repozytorium [Voucher](https://github.com/Rafalp03/Voucher)):

```bash
cd Voucher
cp .env.example .env        # tylko za pierwszym razem; w PowerShell: copy .env.example .env
docker compose up --build
```

Moduły ES wymagają serwowania plików przez HTTP (nie działają z `file://`). Przykładowo:

```bash
# Python 3 (Linux / macOS)
python3 -m http.server 8080
# Python 3 (Windows) – polecenie python często otwiera Microsoft Store, wtedy użyj py
py -m http.server 8080
# lub Node.js (domyślnie port 3000)
npx serve .
```

Następnie otwórz <http://localhost:8080>. Projekt nie wymaga instalacji zależności ani procesu budowania.
Serwer zatrzymasz klawiszami `Ctrl+C`.

Backend przyjmuje żądania (CORS) z `localhost` i `127.0.0.1` na portach **8080**, **5500** (Live Server w VS Code)
i **3000** (`npx serve`). Inny port trzeba dopisać do `CORS_ORIGINS` w `.env` backendu.

Bez backendu otwórz <http://localhost:8080/?mock=1> – aplikacja użyje danych testowych.

**GitHub Pages:** Settings → Pages → *Deploy from branch* → `main` / `(root)`.
Na `*.github.io` aplikacja automatycznie działa w trybie mock (tam nie ma backendu).

### Jak przetestować ręcznie

1. **Katalog** → wybierz voucher, wartość i ilość → „Dodaj do koszyka”.
2. **Koszyk** → zmień ilość lub usuń pozycję; licznik w nagłówku powinien się zmieniać.
3. **Płatność** → dane testowe, np. BLIK `123456` albo karta `4242 4242 4242 4242`, `12/30`, CVC `123`.
   Po zapłacie pojawia się ekran z numerem zamówienia (`VS-...`).
4. **Konto** → zarejestruj się (hasło min. 8 znaków, litera i cyfra), złóż zamówienie i sprawdź je w „Moje konto”.

W narzędziach przeglądarki (F12 → Network) widać żądania do `http://localhost:8000/api/v1/...`.
Czy zamówienie zapisało się w bazie, sprawdzisz według sekcji „Podgląd danych w bazie” w README backendu.
Komunikat „Brak połączenia z serwerem” oznacza, że backend nie działa albo blokuje go CORS
(adres frontendu musi być w `CORS_ORIGINS`).

## 6. Tryb mock i tryb API

O źródle danych decyduje `USE_MOCK` w `js/config.js`:

| Gdzie działa aplikacja | Tryb | Dane |
|---|---|---|
| `*.github.io` | mock | `js/mock/*` + `localStorage` |
| każdy inny adres (np. `localhost`) | API | backend spod `API_BASE_URL` |
| adres z `?mock=1` / `?mock=0` | wymuszony | jak wyżej |

Wdrożenie z backendem na serwerze:

1. W `js/config.js` ustaw `API_BASE_URL`, np. `'https://twoj-serwer/api/v1'`.
2. Dodaj domenę frontendu do `CORS_ORIGINS` w konfiguracji backendu.

Żadne widoki nie wymagają modyfikacji – zmienia się wyłącznie implementacja wybierana przez serwisy.
Kontrakt API: [`docs/API.md`](docs/API.md).

## 7. Technologie

| Obszar | Technologia |
|---|---|
| Struktura | HTML5 (semantyczne znaczniki, ARIA) |
| Style | CSS3 – zmienne, Grid, Flexbox, `backdrop-filter`, media queries |
| Logika | JavaScript ES2022, moduły ES (`type="module"`), `async/await`, Fetch API |
| Bezpieczeństwo (demo) | Web Crypto API (SHA-256 + sól) |
| Czcionki | Google Fonts – Inter, Poppins |
| Hosting | GitHub Pages |
| Backend | REST API (FastAPI) + PostgreSQL – repozytorium [Voucher](https://github.com/Rafalp03/Voucher) |

## 8. Zespół

| Rola | Osoby |
|---|---|
| Frontend | Adrian, Szymon |

## 9. Ograniczenia wersji demonstracyjnej

- Płatności są symulowane – żadne środki nie są pobierane.
- Konta i zamówienia w trybie mock istnieją tylko w `localStorage` danej przeglądarki.
  W trybie API są zapisywane w bazie backendu.


## 10. Źródła zdjęć (CREDITS)
Wszystkie zdjęcia to prawdziwe fotografie (nie AI) z Wikimedia Commons, przeskalowane do 800 px.

| Voucher | Autor | Źródło | Licencja |
|---|---|---|---|
| SPA (`img/spa.jpg`) | el ancora service (Panoramio) | https://commons.wikimedia.org/wiki/File:EL_ANCORA_SERVICE_-_panoramio.jpg | CC BY 3.0 |
| Kolacja (`img/kolacja.jpg`) | Robert Couse-Baker | https://commons.wikimedia.org/wiki/File:Candlelight_dinner_-_Flickr_-_Robert_Couse-Baker.jpg | CC BY 2.0 |
| Skok (`img/skok.jpg`) | Wlodek k1 | https://commons.wikimedia.org/wiki/File:Parachuting_at_the_Opole-Polska_Nowa_Wie%C5%9B_airfield,_2022.05.29_05.jpg | CC BY 3.0 |
| Kino (`img/kino.jpg`) | Carol M. Highsmith (Library of Congress) | https://commons.wikimedia.org/wiki/File:Auditorium_at_the_Perot_Theatre,_a_landmark_since_1924,_when_it_opened_as_the_Saenger_Amusement_Company%27s_%22Gateway_to_the_West%22_movie_theater_in_Texarkana,_Texas_LCCN2014630215.tif | Domena publiczna |
| Książki (`img/ksiazki.jpg`) | Immanuel Giel | https://commons.wikimedia.org/wiki/File:Richard_Booth%27s_Bookshop_09.jpg | CC0 |
| Gokarty (`img/gokarty.jpg`) | Genevieve (Flickr) | https://commons.wikimedia.org/wiki/File:Go_kart_racing_(6238710513).jpg | CC BY 2.0 |
| Kawa (`img/kawa.jpg`) | Kim Sanso | https://commons.wikimedia.org/wiki/File:Latte_art_3.jpg | CC0 |
| Joga (`img/joga.jpg`) | David Scott Yglesias | https://commons.wikimedia.org/wiki/File:Energy_Yoga_Teacher_Training_with_David_Scott_Yglesias.jpg | CC BY 4.0 |
| Tło strony (`img/bg.jpg`, `img/bg.webp`) | The Roaming Picture Taker (Flickr) | https://commons.wikimedia.org/wiki/File:Christmas_Lights,_Market_Place,_Derby_(54223053964).jpg | CC BY 2.0 |

Zdjęcia zostały przeskalowane i skompresowane (zmiana formatu), bez innych modyfikacji.
