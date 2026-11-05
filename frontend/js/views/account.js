/**
 * @file account.js
 * @description Widok profilu użytkownika: dane konta, historia zamówień, wylogowanie.
 */
import { authService } from '../api/authService.js';
import { ordersService } from '../api/ordersService.js';
import { pln, esc, DEMO_NOTE } from '../utils.js';
import { updateUserLink } from './header.js';

/**
 * Renderuje pojedyncze zamówienie z historii.
 * @param {any} o Zamówienie.
 * @returns {string}
 */
const orderRow = (o) =>
  `<div class="order"><div class="row" style="justify-content:space-between"><strong>${esc(o.id)}</strong><span class="cat">${new Date(o.createdAt).toLocaleString('pl-PL')}</span></div>
  ${o.items.map((i) => `<div>${esc(i.name)} (${pln(i.value)}) × ${i.qty}</div>`).join('')}<div class="total"><span>Razem</span><span>${pln(o.total)}</span></div></div>`;

/**
 * Renderuje profil. Niezalogowany użytkownik trafia na stronę logowania.
 * @param {HTMLElement} app Kontener główny.
 * @returns {Promise<void>}
 */
export async function renderAccount(app) {
  const user = await authService.current();
  if (!user) {
    location.hash = '#/logowanie';
    return;
  }
  const orders = await ordersService.listMine().catch(() => []);
  app.innerHTML = `<h1>Moje konto</h1><div class="panel">${DEMO_NOTE}<p><strong>Imię:</strong> ${esc(user.name)}<br><strong>E-mail:</strong> ${esc(user.email)}</p>
  <h3>Historia zamówień</h3>${orders.length ? orders.map(orderRow).join('') : '<p class="cat">Brak zamówień.</p>'}
  <button class="btn ghost" id="out">Wyloguj się</button></div>`;

  document.getElementById('out').onclick = async () => {
    await authService.logout();
    await updateUserLink();
    location.hash = '#/';
  };
}
