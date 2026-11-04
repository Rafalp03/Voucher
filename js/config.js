/**
 * @file config.js
 * @description Centralna konfiguracja aplikacji. To jedyne miejsce, które trzeba
 * zmienić, aby przełączyć aplikację z danych testowych (mock) na prawdziwe REST API.
 */

/**
 * Adres bazowy backendu REST (bez końcowego ukośnika).
 * Przykład produkcyjny: 'https://api.vouchershop.pl/api/v1'.
 * @type {string}
 */
export const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Flaga trybu demonstracyjnego.
 * true  – dane z plików js/mock/* i localStorage (działa na GitHub Pages bez serwera),
 * false – wszystkie serwisy wywołują endpointy REST spod API_BASE_URL.
 * @type {boolean}
 */
export const USE_MOCK = true;

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
  LAST_ORDER: 'voucherLastOrder',
  USERS: 'voucherUsers',
  SESSION: 'voucherSession',
  TOKEN: 'voucherToken',
  GUEST_ORDERS: 'voucherGuestOrders',
});
