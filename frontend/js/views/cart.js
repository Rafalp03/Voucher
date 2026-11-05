/**
 * @file cart.js
 * @description Widok koszyka: lista pozycji z opisem progu, zmiana ilości, usuwanie, podsumowanie.
 */
import { cartService } from '../api/cartService.js';
import { vouchersService } from '../api/vouchersService.js';
import { pln, esc, thumb, tierText } from '../utils.js';

/**
 * Renderuje koszyk.
 * @param {HTMLElement} app Kontener główny.
 * @returns {Promise<void>}
 */
export async function renderCart(app) {
  const [items, vouchers] = await Promise.all([cartService.get(), vouchersService.getAll()]);
  if (!items.length) {
    app.innerHTML = `<h1>Koszyk</h1><div class="panel empty">Twój koszyk jest pusty.<br><br><a class="btn" href="#/">Przeglądaj vouchery</a></div>`;
    return;
  }
  // Mapa id → voucher, aby szybko dołączyć nazwę, zdjęcie i opis progu do pozycji.
  const byId = new Map(vouchers.map((v) => [v.id, v]));

  const rows = items.map((i, k) => {
    const v = byId.get(i.voucherId);
    if (!v) return '';
    return `<div class="cart-item">${thumb(v)}<div class="info"><strong>${esc(v.name)}</strong><div class="cat">Wartość: ${pln(i.value)}</div><div class="tier small">${esc(tierText(v, i.value))}</div></div>
  <div class="qty"><button data-k="${k}" data-d="-1" aria-label="Mniej">−</button><span>${i.qty}</span><button data-k="${k}" data-d="1" aria-label="Więcej">+</button></div>
  <strong style="min-width:90px;text-align:right">${pln(i.value * i.qty)}</strong><button class="btn ghost small" data-rm="${k}">Usuń</button></div>`;
  });

  app.innerHTML = `<h1>Koszyk</h1><div class="layout"><div class="panel">${rows.join('')}</div>
  <div class="panel"><h3>Podsumowanie</h3><div class="total"><span>Do zapłaty</span><span>${pln(cartService.total(items))}</span></div><a class="btn" style="display:block;text-align:center" href="#/platnosc">Przejdź do płatności</a></div></div>`;

  // Zmiana ilości (−/+). Ilość 0 usuwa pozycję (obsługuje serwis).
  app.querySelectorAll('[data-d]').forEach((b) => {
    b.onclick = async () => {
      const k = Number(b.dataset.k);
      await cartService.setQty(k, items[k].qty + Number(b.dataset.d));
      renderCart(app);
    };
  });
  app.querySelectorAll('[data-rm]').forEach((b) => {
    b.onclick = async () => {
      await cartService.remove(Number(b.dataset.rm));
      renderCart(app);
    };
  });
}
