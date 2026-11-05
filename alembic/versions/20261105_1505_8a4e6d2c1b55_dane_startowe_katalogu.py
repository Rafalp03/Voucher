"""dane startowe katalogu voucherów (z js/mock/data.js frontendu)

Revision ID: 8a4e6d2c1b55
Revises: 3f1c2a9b7d10
Create Date: 2026-11-05 15:05:00+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "8a4e6d2c1b55"
down_revision: str | None = "3f1c2a9b7d10"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Uproszczone definicje tabel: migracja nie może importować modeli z app/,
# bo modele będą się zmieniać, a migracja musi działać zawsze tak samo.
vouchers = sa.table(
    "vouchers",
    sa.column("id", sa.String),
    sa.column("name", sa.String),
    sa.column("category", sa.String),
    sa.column("description", sa.Text),
    sa.column("image_url", sa.String),
    sa.column("emoji", sa.String),
    sa.column("gradient", sa.String),
    sa.column("sort_order", sa.Integer),
)
voucher_tiers = sa.table(
    "voucher_tiers",
    sa.column("voucher_id", sa.String),
    sa.column("value", sa.Numeric),
    sa.column("description", sa.Text),
)

VOUCHERS = [
    {
        'id': 'spa',
        'name': 'Dzień w SPA',
        'category': 'Relaks',
        'description': 'Masaż, sauna i chwila wytchnienia w wybranym salonie SPA.',
        'image_url': 'img/spa.jpg',
        'emoji': '💆',
        'gradient': '#ffafbd,#ffc3a0',
        'sort_order': 10,
    },
    {
        'id': 'kolacja',
        'name': 'Kolacja dla dwojga',
        'category': 'Gastronomia',
        'description': 'Romantyczna kolacja w jednej z partnerskich restauracji.',
        'image_url': 'img/kolacja.jpg',
        'emoji': '🍝',
        'gradient': '#f6d365,#fda085',
        'sort_order': 20,
    },
    {
        'id': 'skok',
        'name': 'Skok ze spadochronem',
        'category': 'Przygoda',
        'description': 'Skok w tandemie z instruktorem – adrenalina gwarantowana.',
        'image_url': 'img/skok.jpg',
        'emoji': '🪂',
        'gradient': '#84fab0,#8fd3f4',
        'sort_order': 30,
    },
    {
        'id': 'kino',
        'name': 'Bilety do kina',
        'category': 'Rozrywka',
        'description': 'Voucher na seanse w sieci kin w całej Polsce.',
        'image_url': 'img/kino.jpg',
        'emoji': '🎬',
        'gradient': '#a18cd1,#fbc2eb',
        'sort_order': 40,
    },
    {
        'id': 'ksiazki',
        'name': 'Karta do księgarni',
        'category': 'Kultura',
        'description': 'Do wykorzystania na książki, e-booki i audiobooki.',
        'image_url': 'img/ksiazki.jpg',
        'emoji': '📚',
        'gradient': '#cfd9df,#e2ebf0',
        'sort_order': 50,
    },
    {
        'id': 'gokarty',
        'name': 'Jazda gokartami',
        'category': 'Przygoda',
        'description': 'Wyścig na profesjonalnym torze kartingowym.',
        'image_url': 'img/gokarty.jpg',
        'emoji': '🏎️',
        'gradient': '#ff9a9e,#fecfef',
        'sort_order': 60,
    },
    {
        'id': 'kawa',
        'name': 'Warsztaty baristyczne',
        'category': 'Gastronomia',
        'description': 'Naucz się parzyć kawę jak profesjonalista.',
        'image_url': 'img/kawa.jpg',
        'emoji': '☕',
        'gradient': '#d4a373,#faedcd',
        'sort_order': 70,
    },
    {
        'id': 'joga',
        'name': 'Karnet na jogę',
        'category': 'Relaks',
        'description': 'Zajęcia jogi dla początkujących i zaawansowanych.',
        'image_url': 'img/joga.jpg',
        'emoji': '🧘',
        'gradient': '#a1c4fd,#c2e9fb',
        'sort_order': 80,
    },
]

TIERS = [
    {
        'voucher_id': 'spa',
        'value': 150,
        'description': 'Masaż relaksacyjny całego ciała (60 min) z aromaterapią.',
    },
    {
        'voucher_id': 'spa',
        'value': 250,
        'description': 'Masaż gorącymi kamieniami (90 min) + 2 godziny w strefie saun i jacuzzi.',
    },
    {
        'voucher_id': 'spa',
        'value': 400,
        'description': 'Całodniowy pakiet: masaż (90 min), zabieg na twarz, strefa saun i basen, lunch i herbata ziołowa.',
    },
    {
        'voucher_id': 'kolacja',
        'value': 200,
        'description': 'Trzydaniowe menu dla dwóch osób (przystawka, danie główne, deser) + woda.',
    },
    {
        'voucher_id': 'kolacja',
        'value': 300,
        'description': 'Czterodaniowe menu degustacyjne dla dwojga + butelka wina domowego.',
    },
    {
        'voucher_id': 'kolacja',
        'value': 500,
        'description': 'Siedmiodaniowe menu degustacyjne szefa kuchni z doborem win, stolik przy oknie i powitalny kieliszek prosecco.',
    },
    {
        'voucher_id': 'skok',
        'value': 600,
        'description': 'Skok w tandemie z wysokości 3000 m, ok. 30 s swobodnego spadania, szkolenie przedskokowe i certyfikat.',
    },
    {
        'voucher_id': 'skok',
        'value': 900,
        'description': 'Skok w tandemie z wysokości 4000 m (ok. 50 s spadania) + profesjonalny film i zdjęcia z kamery instruktora.',
    },
    {
        'voucher_id': 'kino',
        'value': 50,
        'description': '2 bilety na seans 2D w dowolny dzień tygodnia.',
    },
    {
        'voucher_id': 'kino',
        'value': 100,
        'description': '2 bilety na seans 3D lub IMAX + duży popcorn i 2 napoje.',
    },
    {
        'voucher_id': 'kino',
        'value': 150,
        'description': '2 bilety na seans w sali VIP (fotele rozkładane) + zestaw przekąsek i napojów.',
    },
    {
        'voucher_id': 'ksiazki',
        'value': 50,
        'description': 'Karta podarunkowa o wartości 50 zł – np. jedna nowość wydawnicza lub dwa e-booki.',
    },
    {
        'voucher_id': 'ksiazki',
        'value': 100,
        'description': 'Karta o wartości 100 zł do wykorzystania na książki, e-booki i audiobooki w księgarni stacjonarnej i online.',
    },
    {
        'voucher_id': 'ksiazki',
        'value': 200,
        'description': 'Karta o wartości 200 zł + darmowa dostawa zamówień online i 10% rabatu na kolejne zakupy.',
    },
    {
        'voucher_id': 'gokarty',
        'value': 120,
        'description': '2 sesje po 10 minut na torze z pomiarem czasu, kask i kominiarka w cenie.',
    },
    {
        'voucher_id': 'gokarty',
        'value': 220,
        'description': 'Grand Prix: trening (10 min), kwalifikacje (8 min) i wyścig (15 min) + wydruk wyników i dyplom.',
    },
    {
        'voucher_id': 'kawa',
        'value': 180,
        'description': 'Warsztaty podstawowe (3 h): espresso, mielenie i dobór ziaren, degustacja 3 kaw.',
    },
    {
        'voucher_id': 'kawa',
        'value': 280,
        'description': 'Warsztaty rozszerzone (5 h): espresso, spienianie mleka i latte art, metody alternatywne (drip, aeropress) + 250 g kawy na wynos.',
    },
    {
        'voucher_id': 'joga',
        'value': 100,
        'description': 'Karnet na 4 zajęcia grupowe (60 min) w ciągu miesiąca.',
    },
    {
        'voucher_id': 'joga',
        'value': 250,
        'description': 'Karnet na 12 zajęć grupowych + mata do ćwiczeń w prezencie.',
    },
    {
        'voucher_id': 'joga',
        'value': 450,
        'description': 'Karnet open na 3 miesiące (nielimitowane zajęcia) + 2 sesje indywidualne z instruktorem.',
    },
]


def upgrade() -> None:
    op.bulk_insert(vouchers, VOUCHERS)
    op.bulk_insert(voucher_tiers, TIERS)


def downgrade() -> None:
    ids = [v["id"] for v in VOUCHERS]
    # Progi usuwa ON DELETE CASCADE
    op.execute(vouchers.delete().where(vouchers.c.id.in_(ids)))
