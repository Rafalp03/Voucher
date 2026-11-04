/**
 * @file cartService.js
 * @description Serwis koszyka. Po każdej zmianie emituje zdarzenie 'cart:changed',
 * dzięki czemu licznik w nagłówku odświeża się niezależnie od widoku.
 */
import { USE_MOCK } from '../config.js';
import { api } from './apiClient.js';
import { cartMock } from '../mock/cartMock.js';

/** Implementacja REST (zob. docs/API.md, sekcja „Koszyk”). */
const restImpl = {
  get: () => api.get('/cart'),
  add: (item) => api.post('/cart/items', item),
  setQty: (index, qty) => api.put(`/cart/items/${index}`, { qty }),
  remove: (index) => api.del(`/cart/items/${index}`),
  clear: () => api.del('/cart'),
};

const impl = USE_MOCK ? cartMock : restImpl;

/**
 * Wywołuje operację i powiadamia resztę aplikacji o nowej zawartości koszyka.
 * @param {Promise<import('../mock/cartMock.js').CartItem[]>} p
 */
const notify = async (p) => {
  const items = (await p) || [];
  window.dispatchEvent(new CustomEvent('cart:changed', { detail: items }));
  return items;
};

export const cartService = {
  /** @returns {Promise<import('../mock/cartMock.js').CartItem[]>} Pozycje koszyka. */
  get: () => impl.get(),
  /** @param {{voucherId:string,value:number,qty:number}} item */
  add: (item) => notify(impl.add(item)),
  /** @param {number} index @param {number} qty */
  setQty: (index, qty) => notify(impl.setQty(index, qty)),
  /** @param {number} index */
  remove: (index) => notify(impl.remove(index)),
  clear: () => notify(impl.clear()),

  /**
   * Suma wartości pozycji.
   * @param {{value:number,qty:number}[]} items
   * @returns {number}
   */
  total: (items) => items.reduce((s, i) => s + i.value * i.qty, 0),

  /**
   * Łączna liczba sztuk (do licznika w nagłówku).
   * @param {{qty:number}[]} items
   * @returns {number}
   */
  count: (items) => items.reduce((s, i) => s + i.qty, 0),
};
