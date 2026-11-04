/**
 * @file router.js
 * @description Prosty router oparty o hash URL (#/...). Hash działa na GitHub Pages
 * bez konfiguracji serwera (brak przeładowań i błędów 404 dla podstron).
 */
import { renderCatalog } from './views/catalog.js';
import { renderDetail } from './views/detail.js';
import { renderCart } from './views/cart.js';
import { renderPayment } from './views/payment.js';
import { renderSuccess } from './views/success.js';
import { renderLogin } from './views/login.js';
import { renderRegister } from './views/register.js';
import { renderAccount } from './views/account.js';
import { renderNotFound } from './views/notFound.js';
import { refreshHeader } from './views/header.js';

/**
 * Tablica tras: pierwszy segment hasha → funkcja renderująca.
 * Kolejne segmenty trafiają do parametrów (np. #/voucher/spa → { id: 'spa' }).
 * @type {Record<string,(app:HTMLElement, params:{id?:string})=>unknown>}
 */
const routes = {
  '': renderCatalog,
  voucher: renderDetail,
  koszyk: renderCart,
  platnosc: renderPayment,
  sukces: renderSuccess,
  logowanie: renderLogin,
  rejestracja: renderRegister,
  konto: renderAccount,
};

/**
 * Rozkłada hash na nazwę trasy i parametry.
 * @param {string} hash np. '#/voucher/spa'
 * @returns {{name:string, params:{id?:string}}}
 */
export function parseHash(hash) {
  const [name = '', id] = (hash || '#/').replace(/^#\/?/, '').split('/');
  return { name, params: { id } };
}

/**
 * Renderuje widok odpowiadający bieżącemu adresowi.
 * @param {HTMLElement} app Kontener główny.
 * @returns {Promise<void>}
 */
export async function navigate(app) {
  const { name, params } = parseHash(location.hash);
  window.scrollTo(0, 0);
  const view = routes[name] || renderNotFound;
  try {
    await view(app, params);
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="panel empty">Wystąpił błąd: ${String(err.message || err)}</div>`;
  }
  await refreshHeader();
}

/**
 * Uruchamia router: nasłuch zmian hasha i pierwszy render.
 * Hash „#katalog” (kotwica CTA) jest ignorowany, aby nie przerywać przewijania.
 * @param {HTMLElement} app
 */
export function startRouter(app) {
  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#/') && location.hash) return;
    navigate(app);
  });
  navigate(app);
}
