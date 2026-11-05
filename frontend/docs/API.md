# Specyfikacja REST API – VoucherShop

Dokument opisuje endpointy backendu. Są zaimplementowane w repozytorium
[Voucher](https://github.com/Rafalp03/Voucher), a interaktywna dokumentacja (Swagger)
jest pod `http://localhost:8000/docs`. Frontend łączy się z nimi, gdy `USE_MOCK = false`
(zob. `js/config.js`).

## Konwencje

- Adres bazowy: `{API_BASE_URL}`, lokalnie `http://localhost:8000/api/v1`.
- Format danych: JSON (`Content-Type: application/json; charset=utf-8`).
- Kwoty w złotych jako liczby (`150` = 150,00 zł). Daty w ISO 8601 (UTC).
- Uwierzytelnianie: nagłówek `Authorization: Bearer <token>` (JWT) dla endpointów oznaczonych 🔒.
- Błędy mają jednolitą postać:

```json
{ "message": "Nieprawidłowy e-mail lub hasło.", "code": "INVALID_CREDENTIALS" }
```

| Kod | Znaczenie |
|---|---|
| 200 / 201 | Sukces / utworzono zasób |
| 204 | Sukces bez treści |
| 400 / 422 | Błędne lub niekompletne dane. Dla 422 z walidacji `code` to `VALIDATION_ERROR`, a pole `errors` zawiera szczegóły |
| 401 | Brak lub nieważny token |
| 404 | Nie znaleziono zasobu |
| 409 | Konflikt (np. e-mail zajęty) |

---

## 1. Vouchery

### `GET /vouchers`
Lista wszystkich aktywnych voucherów z progami cenowymi.
Opcjonalne parametry zapytania: `category`, `minPrice`, `maxPrice`.

**Odpowiedź 200**
```json
[
  {
    "id": "spa",
    "name": "Dzień w SPA",
    "category": "Relaks",
    "description": "Masaż, sauna i chwila wytchnienia w wybranym salonie SPA.",
    "image": "img/spa.jpg",
    "emoji": "💆",
    "gradient": "#ffafbd,#ffc3a0",
    "tiers": [
      { "value": 150, "description": "Masaż relaksacyjny całego ciała (60 min) z aromaterapią." },
      { "value": 250, "description": "Masaż gorącymi kamieniami (90 min) + 2 godziny w strefie saun i jacuzzi." }
    ]
  }
]
```

### `GET /vouchers/:id`
Szczegóły jednego vouchera (struktura jak element listy powyżej).
**404**, gdy voucher nie istnieje.

---

## 2. Uwierzytelnianie

### `POST /auth/register`
**Żądanie**
```json
{ "name": "Anna", "email": "anna@example.com", "password": "haslo1234" }
```
**Odpowiedź 201**
```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "user": { "id": 12, "name": "Anna", "email": "anna@example.com" } }
```
Błędy: **422** (walidacja), **409** (e-mail zajęty). Hasło hashowane po stronie serwera (bcrypt / Argon2).

### `POST /auth/login`
**Żądanie**
```json
{ "email": "anna@example.com", "password": "haslo1234" }
```
**Odpowiedź 200** – jak w rejestracji. **401** przy błędnych danych.

### `POST /auth/logout` 🔒
Unieważnia token (kolejne żądania z nim dostaną 401). **Odpowiedź 204.**

### `GET /users/me` 🔒
**Odpowiedź 200**
```json
{ "id": 12, "name": "Anna", "email": "anna@example.com", "createdAt": "2026-11-04T17:20:00Z" }
```

---

## 3. Koszyk

Koszyk jest przypisany do przeglądarki przez nagłówek `X-Cart-Id`: losowy UUID, który
`apiClient.js` tworzy przy pierwszym żądaniu, zapisuje w `localStorage` (`voucherCartId`)
i dołącza do każdego żądania. Działa tak samo dla gościa i zalogowanego użytkownika.
Bez nagłówka `GET /cart` zwraca `[]`, a operacje zmieniające koszyk – **400** (`CART_ID_REQUIRED`).
W trybie mock koszyk przechowywany jest w `localStorage`.

Ilość jednej pozycji jest ograniczona do 20. Dodanie nieistniejącego vouchera lub progu cenowego
zwraca **422** (`TIER_NOT_FOUND`).

### `GET /cart`
**Odpowiedź 200**
```json
[ { "voucherId": "spa", "value": 400, "qty": 1 } ]
```

### `POST /cart/items`
Dodaje pozycję lub zwiększa ilość, jeśli para (`voucherId`, `value`) już istnieje.
```json
{ "voucherId": "spa", "value": 400, "qty": 2 }
```
**Odpowiedź 200** – aktualna zawartość koszyka.

### `PUT /cart/items/:index`
```json
{ "qty": 3 }
```
`qty < 1` usuwa pozycję. **Odpowiedź 200** – zawartość koszyka.

### `DELETE /cart/items/:index` · `DELETE /cart`
Usuwa pozycję / czyści koszyk. **Odpowiedź 200** – zawartość koszyka (lub `[]`).

---

## 4. Zamówienia

### `POST /orders`
Składa zamówienie. Ceny i suma są **liczone po stronie serwera** na podstawie katalogu.
Jeśli żądanie ma ważny token, zamówienie trafia do historii użytkownika; bez tokenu (lub z nieważnym)
powstaje zamówienie gościa. Płatność jest symulowana, więc status to od razu `paid`.
Dane karty / kod BLIK nie są przesyłane do API – obsługuje je zewnętrzny operator płatności.

**Żądanie**
```json
{
  "customerName": "Anna Nowak",
  "email": "anna@example.com",
  "paymentMethod": "blik",
  "items": [ { "voucherId": "spa", "value": 400, "qty": 1 } ]
}
```
**Odpowiedź 201**
```json
{
  "id": "VS-MH3K2J1A",
  "customerName": "Anna Nowak",
  "email": "anna@example.com",
  "paymentMethod": "blik",
  "status": "paid",
  "items": [ { "voucherId": "spa", "name": "Dzień w SPA", "value": 400, "qty": 1 } ],
  "total": 400,
  "createdAt": "2026-11-04T17:30:00Z"
}
```

### `GET /orders` 🔒
Historia zamówień zalogowanego użytkownika (najnowsze pierwsze) – tablica obiektów jak wyżej.

### `GET /orders/:id`
Szczegóły zamówienia. Dostęp: właściciel konta (🔒) lub – dla zamówienia złożonego jako gość –
każdy, kto zna jego identyfikator. W pozostałych przypadkach **404**.
Frontend zapamiętuje identyfikator ostatniego zamówienia (`voucherLastOrderId`), żeby pokazać ekran sukcesu.

---

## Mapowanie na kod frontendu

| Serwis (`js/api/`) | Metoda | Endpoint |
|---|---|---|
| `vouchersService` | `getAll()` | `GET /vouchers` |
| | `getById(id)` | `GET /vouchers/:id` |
| `authService` | `register(data)` | `POST /auth/register` |
| | `login(data)` | `POST /auth/login` |
| | `logout()` | `POST /auth/logout` |
| | `current()` | `GET /users/me` |
| `cartService` | `get()` / `add()` / `setQty()` / `remove()` / `clear()` | `/cart`, `/cart/items[/:index]` |
| `ordersService` | `create(payload)` | `POST /orders` |
| | `listMine()` | `GET /orders` |
| | `getById(id)` | `GET /orders/:id` |
