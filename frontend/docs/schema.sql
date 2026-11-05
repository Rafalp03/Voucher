-- =====================================================================
--  VoucherShop – schemat bazy danych backendu (PostgreSQL 16)
--
--  Plik poglądowy. Bazę tworzą i zmieniają wyłącznie migracje Alembica
--  w repozytorium backendu: https://github.com/Rafalp03/Voucher
--  (katalog alembic/versions/, modele w app/models/).
--  Przy zmianach w bazie aktualizuj ten plik razem z migracją.
-- =====================================================================

-- Konta klientów. Hasło przechowywane wyłącznie jako skrót Argon2.
CREATE TABLE users (
    id            SERIAL       PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,           -- zapisywany małymi literami
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Tokeny logowania (JWT) unieważnione przy wylogowaniu.
-- Wpisy po dacie wygaśnięcia tokenu są usuwane przy kolejnych wylogowaniach.
CREATE TABLE revoked_tokens (
    jti        VARCHAR(64) PRIMARY KEY,                   -- identyfikator tokenu z JWT
    expires_at TIMESTAMPTZ NOT NULL
);

-- Katalog voucherów (oferta).
CREATE TABLE vouchers (
    id          VARCHAR(50)  PRIMARY KEY,                 -- slug, np. 'spa'
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(50)  NOT NULL,
    description TEXT         NOT NULL,
    image_url   VARCHAR(255),                             -- w API pole "image"
    emoji       VARCHAR(16),
    gradient    VARCHAR(50),                              -- kolory tła zastępczego
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,       -- nieaktywne nie są widoczne w API
    sort_order  INTEGER      NOT NULL DEFAULT 0,          -- kolejność w katalogu (rosnąco)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Progi cenowe vouchera (relacja 1:N) wraz z opisem zawartości pakietu.
CREATE TABLE voucher_tiers (
    id          SERIAL        PRIMARY KEY,
    voucher_id  VARCHAR(50)   NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    value       NUMERIC(10,2) NOT NULL CHECK (value > 0),
    description TEXT          NOT NULL,
    UNIQUE (voucher_id, value)
);

-- Pozycje koszyków. Koszyk identyfikuje nagłówek X-Cart-Id (UUID tworzony
-- przez frontend i trzymany w localStorage), także dla gości.
CREATE TABLE cart_items (
    id         SERIAL      PRIMARY KEY,
    cart_id    VARCHAR(64) NOT NULL,
    tier_id    INTEGER     NOT NULL REFERENCES voucher_tiers(id) ON DELETE CASCADE,
    qty        INTEGER     NOT NULL CHECK (qty BETWEEN 1 AND 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cart_id, tier_id)                             -- ten sam próg = jedna pozycja
);

-- Zamówienia. user_id jest NULL przy zakupie jako gość.
CREATE TABLE orders (
    id             VARCHAR(20)   PRIMARY KEY,             -- np. 'VS-7K2M9QX4PA' (losowy)
    user_id        INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    customer_name  VARCHAR(150)  NOT NULL,
    email          VARCHAR(255)  NOT NULL,
    payment_method VARCHAR(10)   NOT NULL CHECK (payment_method IN ('card','blik')),
    status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','cancelled','refunded')),
    total          NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Pozycje zamówienia. Nazwa i cena są kopiowane w chwili zakupu,
-- aby zmiany katalogu nie zmieniały historii zamówień.
CREATE TABLE order_items (
    id           SERIAL        PRIMARY KEY,
    order_id     VARCHAR(20)   NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    voucher_id   VARCHAR(50)   NOT NULL REFERENCES vouchers(id),
    voucher_name VARCHAR(150)  NOT NULL,
    unit_value   NUMERIC(10,2) NOT NULL CHECK (unit_value > 0),
    qty          INTEGER       NOT NULL CHECK (qty BETWEEN 1 AND 20)
);

-- Indeksy pod najczęstsze zapytania.
CREATE INDEX ix_vouchers_category          ON vouchers(category);
CREATE INDEX ix_revoked_tokens_expires_at  ON revoked_tokens(expires_at);
CREATE INDEX ix_cart_items_cart_id         ON cart_items(cart_id);
CREATE INDEX ix_orders_user_id_created_at  ON orders(user_id, created_at);
CREATE INDEX ix_order_items_order_id       ON order_items(order_id);

-- Dane startowe: migracja backendu wstawia cały katalog z js/mock/data.js
-- (8 voucherów, 21 progów cenowych). Przykład dla jednego vouchera:
INSERT INTO vouchers (id, name, category, description, image_url, emoji, gradient, sort_order) VALUES
 ('spa', 'Dzień w SPA', 'Relaks', 'Masaż, sauna i chwila wytchnienia w wybranym salonie SPA.', 'img/spa.jpg', '💆', '#ffafbd,#ffc3a0', 10);
INSERT INTO voucher_tiers (voucher_id, value, description) VALUES
 ('spa', 150, 'Masaż relaksacyjny całego ciała (60 min) z aromaterapią.'),
 ('spa', 250, 'Masaż gorącymi kamieniami (90 min) + 2 godziny w strefie saun i jacuzzi.'),
 ('spa', 400, 'Całodniowy pakiet: masaż (90 min), zabieg na twarz, strefa saun i basen, lunch i herbata ziołowa.');
