/**
 * @file catalog.js
 * @description Widok katalogu: sekcja hero, filtry (kategoria, przedział cen) i siatka kart.
 */
import { vouchersService } from '../api/vouchersService.js';
import { pln, esc, thumb, minPrice } from '../utils.js';

/** Przedziały cenowe filtra: etykieta → [min, max] w PLN (włącznie). */
const PRICE_RANGES = {
  'Wszystkie ceny': [0, Infinity],
  'Do 100 zł': [0, 100],
  '100–200 zł': [101, 200],
  '200–500 zł': [201, 500],
  'Powyżej 500 zł': [501, Infinity],
};

/** Stan filtrów zachowywany między wejściami na katalog (w obrębie sesji karty). */
const state = { category: 'Wszystkie', price: 'Wszystkie ceny' };

/**
 * Sprawdza, czy voucher pasuje do bieżących filtrów.
 * Voucher pasuje do przedziału cen, jeśli KTÓRYKOLWIEK z jego progów mieści się w przedziale.
 * @param {import('../mock/data.js').Voucher} v
 * @returns {boolean}
 */
function matches(v) {
  const [lo, hi] = PRICE_RANGES[state.price];
  const catOk = state.category === 'Wszystkie' || v.category === state.category;
  return catOk && v.tiers.some((t) => t.value >= lo && t.value <= hi);
}

/**
 * Renderuje kartę vouchera.
 * @param {import('../mock/data.js').Voucher} v
 * @returns {string}
 */
const card = (v) =>
  `<a class="card" href="#/voucher/${esc(v.id)}">${thumb(v)}<div class="card-body"><span class="cat">${esc(v.category)}</span>` +
  `<strong>${esc(v.name)}</strong><span class="price">od ${pln(minPrice(v))}</span></div></a>`;

/**
 * Renderuje widok katalogu.
 * @param {HTMLElement} app Kontener główny.
 * @returns {Promise<void>}
 */
export async function renderCatalog(app) {
  const vouchers = await vouchersService.getAll();
  const categories = ['Wszystkie', ...new Set(vouchers.map((v) => v.category))];
  const list = vouchers.filter(matches);

  app.innerHTML = `<section class="hero"><span class="eyebrow">🎁 Prezenty, które się przeżywa</span><h1>Podaruj <span class="grad">wyjątkowe chwile</span>,<br>nie kolejną rzecz.</h1><p>SPA, kolacje, skoki ze spadochronem i warsztaty – vouchery wysyłane e-mailem w kilka minut, ważne 12 miesięcy.</p><a class="btn" href="#katalog" id="cta">Wybierz voucher →</a></section><h2 id="katalog" class="section-title">Katalog voucherów</h2>
  <div class="filters">${categories.map((c) => `<button class="chip ${c === state.category ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="filters">${Object.keys(PRICE_RANGES).map((p) => `<button class="chip pchip ${p === state.price ? 'active' : ''}" data-p="${p}">💰 ${p}</button>`).join('')}</div>
  <div class="grid">${list.length ? list.map(card).join('') : '<p>Brak voucherów w tym przedziale.</p>'}</div>`;

  // Kliknięcie filtra: zmiana stanu i ponowny render, po czym przewinięcie do katalogu.
  app.querySelectorAll('.chip').forEach((b) => {
    b.onclick = async () => {
      if (b.dataset.p) state.price = b.dataset.p;
      else state.category = b.dataset.cat;
      await renderCatalog(app);
      document.getElementById('katalog').scrollIntoView();
    };
  });
  // CTA przewija płynnie – preventDefault, bo zmiana hasha uruchomiłaby router.
  document.getElementById('cta').onclick = (e) => {
    e.preventDefault();
    document.getElementById('katalog').scrollIntoView({ behavior: 'smooth' });
  };
}
