/**
 * @file detail.js
 * @description Widok szczegółów vouchera: wybór progu cenowego (z opisem), ilość, dodanie do koszyka.
 */
import { vouchersService } from '../api/vouchersService.js';
import { cartService } from '../api/cartService.js';
import { pln, esc, thumb, tierText } from '../utils.js';
import { renderNotFound } from './notFound.js';

/**
 * Renderuje szczegóły vouchera.
 * @param {HTMLElement} app Kontener główny.
 * @param {{id:string}} params Parametry trasy (#/voucher/:id).
 * @returns {Promise<void>}
 */
export async function renderDetail(app, { id }) {
  let v;
  try {
    v = await vouchersService.getById(id);
  } catch {
    return renderNotFound(app);
  }
  // Lokalny stan widoku: wybrana wartość i ilość.
  let value = v.tiers[0].value;
  let qty = 1;

  app.innerHTML = `<a href="#/" class="btn ghost small">← Wróć do katalogu</a><br><br>
  <div class="detail">${thumb(v)}<div><span class="cat">${esc(v.category)}</span><h1>${esc(v.name)}</h1><p>${esc(v.description)}</p>
  <p class="cat">Ważny 12 miesięcy · wysyłka e-mailem (PDF)</p>
  <strong>Wybierz wartość</strong><div class="options">${v.tiers.map((t, i) => `<button class="opt ${i ? '' : 'active'}" data-v="${t.value}">${pln(t.value)}</button>`).join('')}</div>
  <p class="tier" id="tier">${esc(tierText(v, value))}</p>
  <strong>Ilość</strong><div class="row"><div class="qty"><button id="m" aria-label="Zmniejsz ilość">−</button><span id="q">1</span><button id="p" aria-label="Zwiększ ilość">+</button></div></div>
  <div class="total"><span>Razem</span><span id="sum">${pln(value)}</span></div>
  <button class="btn" id="add">Dodaj do koszyka</button> <span id="msg"></span></div></div>`;

  /** Odświeża ilość i sumę po każdej zmianie. */
  const update = () => {
    document.getElementById('q').textContent = String(qty);
    document.getElementById('sum').textContent = pln(value * qty);
  };

  // Wybór progu: podświetlenie przycisku i podmiana opisu progu.
  app.querySelectorAll('.opt').forEach((b) => {
    b.onclick = () => {
      app.querySelectorAll('.opt').forEach((o) => o.classList.remove('active'));
      b.classList.add('active');
      value = Number(b.dataset.v);
      document.getElementById('tier').textContent = tierText(v, value);
      update();
    };
  });
  document.getElementById('m').onclick = () => { if (qty > 1) qty--; update(); };
  document.getElementById('p').onclick = () => { if (qty < 20) qty++; update(); };
  document.getElementById('add').onclick = async () => {
    await cartService.add({ voucherId: v.id, value, qty });
    document.getElementById('msg').innerHTML =
      ' ✅ Dodano! <a href="#/koszyk" style="color:var(--p);font-weight:600">Przejdź do koszyka</a>';
  };
}
