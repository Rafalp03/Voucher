/**
 * @file success.js
 * @description Ekran potwierdzenia złożenia zamówienia.
 */
import { ordersService } from '../api/ordersService.js';
import { pln, esc } from '../utils.js';

/**
 * Renderuje podsumowanie ostatniego zamówienia.
 * @param {HTMLElement} app Kontener główny.
 * @returns {Promise<void>}
 */
export async function renderSuccess(app) {
  let o;
  try {
    o = await ordersService.getById();
  } catch {
    location.hash = '#/';
    return;
  }
  const date = new Date(o.createdAt).toLocaleString('pl-PL');
  app.innerHTML = `<div class="panel success"><div class="big">🎉</div><h1>Dziękujemy za zamówienie!</h1>
  <p>Numer zamówienia: <strong>${esc(o.id)}</strong></p><p class="cat">${date} · ${o.paymentMethod === 'blik' ? 'BLIK' : 'Karta'} (demo)</p>
  <p>Vouchery wyślemy na adres <strong>${esc(o.email)}</strong> (symulacja).</p>
  <div style="text-align:left">${o.items.map((i) => `<div class="row" style="justify-content:space-between"><span>${esc(i.name)} (${pln(i.value)}) × ${i.qty}</span><span>${pln(i.value * i.qty)}</span></div>`).join('')}
  <div class="total"><span>Zapłacono</span><span>${pln(o.total)}</span></div></div><a class="btn" href="#/">Wróć do katalogu</a></div>`;
}
