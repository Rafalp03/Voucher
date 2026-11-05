/**
 * @file data.js
 * @description Statyczne dane voucherów używane w trybie mock (USE_MOCK = true).
 * Struktura obiektu odpowiada odpowiedzi endpointu GET /vouchers (zob. docs/API.md)
 * oraz tabelom vouchers + voucher_tiers (zob. docs/schema.sql).
 */

/**
 * @typedef {Object} VoucherTier
 * @property {number} value        Wartość vouchera w PLN.
 * @property {string} description  Opis tego, co obejmuje dany próg cenowy.
 */

/**
 * @typedef {Object} Voucher
 * @property {string} id           Unikalny identyfikator (slug), np. "spa".
 * @property {string} name         Nazwa wyświetlana.
 * @property {string} category     Kategoria (Relaks, Gastronomia, ...).
 * @property {string} description  Krótki opis vouchera.
 * @property {string} image        Względna ścieżka do zdjęcia.
 * @property {string} emoji        Emoji wyświetlane, gdy zdjęcie się nie wczyta.
 * @property {string} gradient     Dwa kolory gradientu tła (fallback).
 * @property {VoucherTier[]} tiers Dostępne progi cenowe.
 */

/** @type {Voucher[]} */
export const VOUCHERS = [
  {
    "id": "spa",
    "name": "Dzień w SPA",
    "category": "Relaks",
    "description": "Masaż, sauna i chwila wytchnienia w wybranym salonie SPA.",
    "image": "img/spa.jpg",
    "emoji": "💆",
    "gradient": "#ffafbd,#ffc3a0",
    "tiers": [
      {
        "value": 150,
        "description": "Masaż relaksacyjny całego ciała (60 min) z aromaterapią."
      },
      {
        "value": 250,
        "description": "Masaż gorącymi kamieniami (90 min) + 2 godziny w strefie saun i jacuzzi."
      },
      {
        "value": 400,
        "description": "Całodniowy pakiet: masaż (90 min), zabieg na twarz, strefa saun i basen, lunch i herbata ziołowa."
      }
    ]
  },
  {
    "id": "kolacja",
    "name": "Kolacja dla dwojga",
    "category": "Gastronomia",
    "description": "Romantyczna kolacja w jednej z partnerskich restauracji.",
    "image": "img/kolacja.jpg",
    "emoji": "🍝",
    "gradient": "#f6d365,#fda085",
    "tiers": [
      {
        "value": 200,
        "description": "Trzydaniowe menu dla dwóch osób (przystawka, danie główne, deser) + woda."
      },
      {
        "value": 300,
        "description": "Czterodaniowe menu degustacyjne dla dwojga + butelka wina domowego."
      },
      {
        "value": 500,
        "description": "Siedmiodaniowe menu degustacyjne szefa kuchni z doborem win, stolik przy oknie i powitalny kieliszek prosecco."
      }
    ]
  },
  {
    "id": "skok",
    "name": "Skok ze spadochronem",
    "category": "Przygoda",
    "description": "Skok w tandemie z instruktorem – adrenalina gwarantowana.",
    "image": "img/skok.jpg",
    "emoji": "🪂",
    "gradient": "#84fab0,#8fd3f4",
    "tiers": [
      {
        "value": 600,
        "description": "Skok w tandemie z wysokości 3000 m, ok. 30 s swobodnego spadania, szkolenie przedskokowe i certyfikat."
      },
      {
        "value": 900,
        "description": "Skok w tandemie z wysokości 4000 m (ok. 50 s spadania) + profesjonalny film i zdjęcia z kamery instruktora."
      }
    ]
  },
  {
    "id": "kino",
    "name": "Bilety do kina",
    "category": "Rozrywka",
    "description": "Voucher na seanse w sieci kin w całej Polsce.",
    "image": "img/kino.jpg",
    "emoji": "🎬",
    "gradient": "#a18cd1,#fbc2eb",
    "tiers": [
      {
        "value": 50,
        "description": "2 bilety na seans 2D w dowolny dzień tygodnia."
      },
      {
        "value": 100,
        "description": "2 bilety na seans 3D lub IMAX + duży popcorn i 2 napoje."
      },
      {
        "value": 150,
        "description": "2 bilety na seans w sali VIP (fotele rozkładane) + zestaw przekąsek i napojów."
      }
    ]
  },
  {
    "id": "ksiazki",
    "name": "Karta do księgarni",
    "category": "Kultura",
    "description": "Do wykorzystania na książki, e-booki i audiobooki.",
    "image": "img/ksiazki.jpg",
    "emoji": "📚",
    "gradient": "#cfd9df,#e2ebf0",
    "tiers": [
      {
        "value": 50,
        "description": "Karta podarunkowa o wartości 50 zł – np. jedna nowość wydawnicza lub dwa e-booki."
      },
      {
        "value": 100,
        "description": "Karta o wartości 100 zł do wykorzystania na książki, e-booki i audiobooki w księgarni stacjonarnej i online."
      },
      {
        "value": 200,
        "description": "Karta o wartości 200 zł + darmowa dostawa zamówień online i 10% rabatu na kolejne zakupy."
      }
    ]
  },
  {
    "id": "gokarty",
    "name": "Jazda gokartami",
    "category": "Przygoda",
    "description": "Wyścig na profesjonalnym torze kartingowym.",
    "image": "img/gokarty.jpg",
    "emoji": "🏎️",
    "gradient": "#ff9a9e,#fecfef",
    "tiers": [
      {
        "value": 120,
        "description": "2 sesje po 10 minut na torze z pomiarem czasu, kask i kominiarka w cenie."
      },
      {
        "value": 220,
        "description": "Grand Prix: trening (10 min), kwalifikacje (8 min) i wyścig (15 min) + wydruk wyników i dyplom."
      }
    ]
  },
  {
    "id": "kawa",
    "name": "Warsztaty baristyczne",
    "category": "Gastronomia",
    "description": "Naucz się parzyć kawę jak profesjonalista.",
    "image": "img/kawa.jpg",
    "emoji": "☕",
    "gradient": "#d4a373,#faedcd",
    "tiers": [
      {
        "value": 180,
        "description": "Warsztaty podstawowe (3 h): espresso, mielenie i dobór ziaren, degustacja 3 kaw."
      },
      {
        "value": 280,
        "description": "Warsztaty rozszerzone (5 h): espresso, spienianie mleka i latte art, metody alternatywne (drip, aeropress) + 250 g kawy na wynos."
      }
    ]
  },
  {
    "id": "joga",
    "name": "Karnet na jogę",
    "category": "Relaks",
    "description": "Zajęcia jogi dla początkujących i zaawansowanych.",
    "image": "img/joga.jpg",
    "emoji": "🧘",
    "gradient": "#a1c4fd,#c2e9fb",
    "tiers": [
      {
        "value": 100,
        "description": "Karnet na 4 zajęcia grupowe (60 min) w ciągu miesiąca."
      },
      {
        "value": 250,
        "description": "Karnet na 12 zajęć grupowych + mata do ćwiczeń w prezencie."
      },
      {
        "value": 450,
        "description": "Karnet open na 3 miesiące (nielimitowane zajęcia) + 2 sesje indywidualne z instruktorem."
      }
    ]
  }
];
