-- =====================================================================
--  VoucherShop – proponowany schemat relacyjnej bazy danych
--  Dialekt: PostgreSQL 15+ (łatwy do przeniesienia na MySQL/MariaDB)
-- =====================================================================

-- Użytkownicy sklepu. Hasło przechowywane wyłącznie jako skrót (bcrypt/Argon2).
CREATE TABLE users (
    id            SERIAL       PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Katalog voucherów (oferta).
CREATE TABLE vouchers (
    id          VARCHAR(50)  PRIMARY KEY,            -- slug, np. 'spa'
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(50)  NOT NULL,
    description TEXT         NOT NULL,
    image_url   VARCHAR(255),
    emoji       VARCHAR(16),
    gradient    VARCHAR(50),                         -- kolory tła zastępczego
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
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

-- Zamówienia. user_id może być NULL – zakup jako gość.
CREATE TABLE orders (
    id             VARCHAR(20)   PRIMARY KEY,        -- np. 'VS-MH3K2J1A'
    user_id        INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    customer_name  VARCHAR(150)  NOT NULL,
    email          VARCHAR(255)  NOT NULL,
    payment_method VARCHAR(10)   NOT NULL CHECK (payment_method IN ('card','blik')),
    status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','cancelled','refunded')),
    total          NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Pozycje zamówienia (relacja N:M między orders a voucher_tiers).
-- Cena i nazwa są kopiowane w chwili zakupu, aby zmiany katalogu nie zmieniały historii.
CREATE TABLE order_items (
    id           SERIAL        PRIMARY KEY,
    order_id     VARCHAR(20)   NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    voucher_id   VARCHAR(50)   NOT NULL REFERENCES vouchers(id),
    voucher_name VARCHAR(150)  NOT NULL,
    unit_value   NUMERIC(10,2) NOT NULL CHECK (unit_value > 0),
    qty          INTEGER       NOT NULL CHECK (qty BETWEEN 1 AND 20),
    voucher_code VARCHAR(32)   UNIQUE                -- kod do realizacji (generowany po opłaceniu)
);

-- Indeksy pod najczęstsze zapytania.
CREATE INDEX idx_vouchers_category ON vouchers(category);
CREATE INDEX idx_orders_user       ON orders(user_id, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Przykładowe dane
INSERT INTO vouchers (id, name, category, description, image_url, emoji, gradient) VALUES
 ('spa', 'Dzień w SPA', 'Relaks', 'Masaż, sauna i chwila wytchnienia w wybranym salonie SPA.', 'img/spa.jpg', '💆', '#ffafbd,#ffc3a0');
INSERT INTO voucher_tiers (voucher_id, value, description) VALUES
 ('spa', 150, 'Masaż relaksacyjny całego ciała (60 min) z aromaterapią.'),
 ('spa', 250, 'Masaż gorącymi kamieniami (90 min) + 2 godziny w strefie saun i jacuzzi.'),
 ('spa', 400, 'Całodniowy pakiet: masaż (90 min), zabieg na twarz, strefa saun i basen, lunch i herbata ziołowa.');
