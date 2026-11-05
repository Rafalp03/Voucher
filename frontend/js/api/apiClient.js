/**
 * @file apiClient.js
 * @description Cienka warstwa nad fetch() do komunikacji z REST API.
 * Odpowiada za: budowę adresu, nagłówki JSON, dołączanie tokenu JWT,
 * parsowanie odpowiedzi i ujednolicenie błędów (ApiError).
 */
import { API_BASE_URL, STORAGE_KEYS } from '../config.js';

/** Błąd zwracany przez API – zawiera kod HTTP i treść odpowiedzi. */
export class ApiError extends Error {
  /**
   * @param {string} message Komunikat dla użytkownika.
   * @param {number} status  Kod HTTP (0 = brak połączenia).
   * @param {unknown} [data] Treść odpowiedzi serwera.
   */
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/** @returns {string|null} Zapisany token uwierzytelniający (Bearer). */
export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

/**
 * Zapisuje lub usuwa token uwierzytelniający.
 * @param {string|null} token
 */
export const setToken = (token) =>
  token ? localStorage.setItem(STORAGE_KEYS.TOKEN, token) : localStorage.removeItem(STORAGE_KEYS.TOKEN);

/**
 * Wykonuje żądanie HTTP do API.
 * @template T
 * @param {string} path Ścieżka względem API_BASE_URL, np. '/vouchers'.
 * @param {{method?:string, body?:unknown, query?:Record<string,string|number>}} [options]
 * @returns {Promise<T>} Odpowiedź JSON (lub null dla 204 No Content).
 * @throws {ApiError} Gdy serwer zwróci kod spoza 2xx lub brak połączenia.
 */
export async function request(path, { method = 'GET', body, query } = {}) {
  const url = new URL(API_BASE_URL + path);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`; // autoryzacja JWT

  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new ApiError('Brak połączenia z serwerem.', 0);
  }
  if (res.status === 204) return /** @type {T} */ (null);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || `Błąd serwera (${res.status}).`, res.status, data);
  return data;
}

/** Skróty dla najczęstszych metod HTTP. */
export const api = {
  /** @param {string} p @param {Record<string,string|number>} [q] */
  get: (p, q) => request(p, { query: q }),
  /** @param {string} p @param {unknown} b */
  post: (p, b) => request(p, { method: 'POST', body: b }),
  /** @param {string} p @param {unknown} b */
  put: (p, b) => request(p, { method: 'PUT', body: b }),
  /** @param {string} p */
  del: (p) => request(p, { method: 'DELETE' }),
};
