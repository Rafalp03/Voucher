/**
 * @file mockDb.js
 * @description Minimalna „baza danych” w localStorage dla trybu mock.
 * Udostępnia odczyt/zapis JSON oraz symulację opóźnienia sieci.
 */
import { MOCK_DELAY_MS } from '../config.js';

/**
 * Odczytuje i parsuje wartość JSON z localStorage.
 * @template T
 * @param {string} key Klucz.
 * @param {T} fallback Wartość domyślna przy braku danych lub błędzie parsowania.
 * @returns {T}
 */
export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Zapisuje wartość jako JSON w localStorage.
 * @param {string} key
 * @param {unknown} value
 */
export const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

/**
 * Zwraca Promise rozwiązywany po krótkim opóźnieniu – symuluje odpowiedź serwera.
 * Wynik jest głęboko kopiowany, aby widok nie mógł przypadkiem zmodyfikować „bazy”.
 * @template T
 * @param {T} value
 * @returns {Promise<T>}
 */
export const respond = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value === undefined ? value : structuredClone(value)), MOCK_DELAY_MS));

/**
 * Zwraca odrzucony Promise z komunikatem błędu (jak błąd 4xx z API).
 * @param {string} message
 * @param {number} [status=400]
 * @returns {Promise<never>}
 */
export const fail = (message, status = 400) =>
  new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error(message), { status })), MOCK_DELAY_MS));
