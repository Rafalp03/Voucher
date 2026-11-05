/**
 * @file payment.js
 * @description Widok płatności (DEMO). Walidacja formularza po stronie klienta,
 * wybór metody (karta/BLIK), złożenie zamówienia przez ordersService.
 * Dane karty i kod BLIK są tylko walidowane – NIGDY nie są zapisywane ani wysyłane.
 */
import { cartService } from '../api/cartService.js';
import { vouchersService } from '../api/vouchersService.js';
import { ordersService } from '../api/ordersService.js';
import { authService } from '../api/authService.js';
import { pln, esc, isEmail, formData, showErrors } from '../utils.js';

/**
 * Waliduje dane formularza płatności.
 * @param {Record<string,string>} d Dane formularza.
 * @param {'card'|'blik'} method Wybrana metoda.
 * @returns {string[]} Lista błędów (pusta = poprawnie).
 */
export function validatePayment(d, method) {
  const err = [];
  if (!d.name.trim()) err.push('Podaj imię i nazwisko.');
  if (!isEmail(d.email)) err.push('Podaj poprawny e-mail.');
  if (method === 'card') {
    if (d.card.replace(/\D/g, '').length < 12) err.push('Numer karty jest za krótki.');
    if (!/^\d\d\/\d\d$/.test(d.exp)) err.push('Data w formacie MM/RR.');
    if (!/^\d{3,4}$/.test(d.cvc)) err.push('CVC: 3–4 cyfry.');
  } else if (!/^\d{6}$/.test(d.blik)) {
    err.push('Kod BLIK musi mieć 6 cyfr.');
  }
  return err;
}

/**
 * Renderuje formularz płatności.
 * @param {HTMLElement} app Kontener główny.
 * @returns {Promise<void>}
 */
export async function renderPayment(app) {
  const [items, vouchers, user] = await Promise.all([cartService.get(), vouchersService.getAll(), authService.current()]);
  if (!items.length) {
    location.hash = '#/koszyk';
    return;
  }
  const name = (id) => vouchers.find((v) => v.id === id)?.name || id;
  const total = cartService.total(items);
  /** @type {'card'|'blik'} */
  let method = 'card';

  // Dla zalogowanego użytkownika imię i e-mail są uzupełniane automatycznie.
  app.innerHTML = `<h1>Płatność</h1><div class="layout"><form class="panel" id="f" novalidate>
  <div class="note">⚠️ DEMO – formularz jest wyłącznie makietą. Nie wpisuj prawdziwych danych karty; nic nie jest wysyłane ani obciążane.</div>
  <div class="two"><div><label for="pay-name">Imię i nazwisko</label><input id="pay-name" name="name" value="${esc(user?.name || '')}" required placeholder="Jan Kowalski"></div>
  <div><label for="pay-email">E-mail (tu wyślemy vouchery)</label><input id="pay-email" name="email" type="email" value="${esc(user?.email || '')}" required placeholder="jan@przyklad.pl"></div></div>
  <label>Metoda płatności</label><div class="methods"><div class="method active" data-m="card">💳 Karta</div><div class="method" data-m="blik">📱 BLIK</div></div>
  <div id="karta"><label>Numer karty (demo)</label><input name="card" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19">
  <div class="two"><div><label>Data ważności</label><input name="exp" placeholder="MM/RR" maxlength="5"></div><div><label>CVC</label><input name="cvc" placeholder="123" maxlength="4" inputmode="numeric"></div></div></div>
  <div id="blik" hidden><label>Kod BLIK (demo, 6 cyfr)</label><input name="blik" inputmode="numeric" maxlength="6" placeholder="123456"></div>
  <div id="err" class="error"></div><br><button class="btn" style="width:100%">Zapłać ${pln(total)} (demo)</button></form>
  <div class="panel"><h3>Twoje zamówienie</h3>${items.map((i) => `<div class="row" style="justify-content:space-between"><span>${esc(name(i.voucherId))} × ${i.qty}</span><span>${pln(i.value * i.qty)}</span></div>`).join('')}
  <div class="total"><span>Razem</span><span>${pln(total)}</span></div></div></div>`;

  // Przełączanie metody płatności – pokazuje odpowiednią sekcję pól.
  app.querySelectorAll('.method').forEach((m) => {
    m.onclick = () => {
      method = /** @type {'card'|'blik'} */ (m.dataset.m);
      app.querySelectorAll('.method').forEach((x) => x.classList.toggle('active', x === m));
      document.getElementById('karta').hidden = method !== 'card';
      document.getElementById('blik').hidden = method !== 'blik';
    };
  });

  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    const d = formData(/** @type {HTMLFormElement} */ (e.target));
    const errors = validatePayment(d, method);
    if (errors.length) return showErrors(errors);
    try {
      // Do serwisu trafiają tylko dane zamówienia – bez numeru karty / kodu BLIK.
      await ordersService.create({
        customerName: d.name.trim(),
        email: d.email.trim(),
        paymentMethod: method,
        items: items.map(({ voucherId, value, qty }) => ({ voucherId, value, qty })),
      });
      await cartService.clear();
      location.hash = '#/sukces';
    } catch (err) {
      showErrors([err.message]);
    }
  };
}
