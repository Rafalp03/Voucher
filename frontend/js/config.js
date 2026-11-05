/**
 * @file config.js
 * @description Centralna konfiguracja aplikacji. To jedyne miejsce, które trzeba
 * zmienić, aby przełączyć aplikację między danymi testowymi (mock) a prawdziwym REST API.
 */

/**
 * Adres bazowy backendu REST (bez końcowego ukośnika).
 * Domyślnie lokalny backend z tego repozytorium (katalog app/, docker compose up).
 * Przykład produkcyjny: 'https://api.vouchershop.pl/api/v1'.
 * @type {string}
 */
export const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Flaga trybu demonstracyjnego.
 * true  – dane z plików js/mock/* i localStorage (działa bez serwera),
 * false – wszystkie serwisy wywołują endpointy REST spod API_BASE_URL.
 *
 * Domyślnie: mock na GitHub Pages (tam nie ma backendu), REST w każdym innym miejscu.
 * Tryb można wymusić parametrem adresu: ?mock=1 albo ?mock=0.
 * @type {boolean}
 */
export const USE_MOCK = (() => {
  const forced = new URLSearchParams(location.search).get('mock');
  if (forced !== null) return forced !== '0';
  return location.hostname.endsWith('github.io');
})();

/**
 * Sztuczne opóźnienie odpowiedzi w trybie mock (ms) – symuluje sieć,
 * dzięki czemu widoki od początku są pisane asynchronicznie.
 * @type {number}
 */
export const MOCK_DELAY_MS = 80;

/**
 * Klucze używane w localStorage. Zebrane w jednym miejscu, aby uniknąć literówek.
 * @type {Readonly<Record<string,string>>}
 */
export const STORAGE_KEYS = Object.freeze({
  CART: 'voucherCart',
  CART_ID: 'voucherCartId',
  LAST_ORDER: 'voucherLastOrder',
  LAST_ORDER_ID: 'voucherLastOrderId',
  USERS: 'voucherUsers',
  SESSION: 'voucherSession',
  TOKEN: 'voucherToken',
  GUEST_ORDERS: 'voucherGuestOrders',
});
