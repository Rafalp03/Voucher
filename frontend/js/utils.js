/**
 * @file utils.js
 * @description Funkcje pomocnicze współdzielone przez widoki i warstwę mock:
 * formatowanie kwot, bezpieczne wstawianie tekstu do HTML, kryptografia, fragmenty UI.
 */

/**
 * Formatuje kwotę w złotych według polskich zasad (np. „1 250,00 zł”).
 * @param {number} amount Kwota w PLN.
 * @returns {string} Sformatowana kwota.
 */
export const pln = (amount) =>
  amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';

/**
 * Ucieka znaki specjalne HTML – chroni przed XSS przy wstawianiu danych
 * pochodzących od użytkownika (imię, e-mail) do innerHTML.
 * @param {unknown} value Dowolna wartość.
 * @returns {string} Bezpieczny tekst.
 */
export const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Zamienia tablicę bajtów na zapis szesnastkowy.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Liczy skrót SHA-256 tekstu przy użyciu Web Crypto API (SubtleCrypto).
 * Używane wyłącznie w trybie mock – w docelowym systemie hasła hashuje serwer (np. bcrypt/argon2).
 * @param {string} text Tekst wejściowy.
 * @returns {Promise<string>} Skrót w postaci hex (64 znaki).
 */
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return toHex(new Uint8Array(buf));
}

/**
 * Generuje losowy ciąg hex (np. sól do hasła).
 * @param {number} [bytes=16] Liczba losowych bajtów.
 * @returns {string}
 */
export const randomHex = (bytes = 16) => toHex(crypto.getRandomValues(new Uint8Array(bytes)));

/**
 * Prosta walidacja adresu e-mail (format x@y.z).
 * @param {string} email
 * @returns {boolean}
 */
export const isEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

/**
 * Zwraca opis progu cenowego vouchera.
 * @param {import('./mock/data.js').Voucher} voucher
 * @param {number} value Wartość progu w PLN.
 * @returns {string} Opis lub pusty tekst, gdy próg nie istnieje.
 */
export const tierText = (voucher, value) => voucher?.tiers.find((t) => t.value === value)?.description || '';

/**
 * Najniższa cena vouchera (do etykiety „od … zł”).
 * @param {import('./mock/data.js').Voucher} voucher
 * @returns {number}
 */
export const minPrice = (voucher) => Math.min(...voucher.tiers.map((t) => t.value));

/**
 * Generuje HTML miniatury vouchera: zdjęcie na tle gradientu.
 * Gradient + emoji działają jako awaryjne tło – jeśli zdjęcie się nie wczyta,
 * atrybut onerror usuwa <img> i widoczny zostaje fallback.
 * @param {import('./mock/data.js').Voucher} v Voucher.
 * @param {string} [cls='thumb'] Klasa CSS kontenera.
 * @returns {string} Fragment HTML.
 */
export const thumb = (v, cls = 'thumb') =>
  `<div class="${cls}" style="background:linear-gradient(135deg,${v.gradient})"><span class="emo">${v.emoji}</span>` +
  (v.image ? `<img src="${v.image}" alt="${esc(v.name)}" loading="lazy" onerror="this.remove()">` : '') +
  `</div>`;

/**
 * Odczytuje dane formularza jako zwykły obiekt.
 * @param {HTMLFormElement} form
 * @returns {Record<string,string>}
 */
export const formData = (form) => Object.fromEntries(new FormData(form));

/**
 * Wyświetla listę błędów walidacji w elemencie #err.
 * @param {string[]} errors Komunikaty błędów.
 */
export const showErrors = (errors) => {
  const el = document.getElementById('err');
  if (el) el.innerHTML = errors.map(esc).join('<br>');
};

/** Komunikat informujący, że konta działają tylko lokalnie (tryb demo). */
export const DEMO_NOTE =
  '<div class="note">⚠️ DEMO – konta są przechowywane wyłącznie lokalnie w tej przeglądarce (localStorage). Brak serwera; nie używaj prawdziwego hasła.</div>';
