/**
 * @file cartMock.js
 * @description Implementacja mock koszyka – pozycje zapisane w localStorage.
 * Pozycja koszyka: { voucherId, value, qty }. Ta sama para (voucherId, value) jest scalana.
 */
import { STORAGE_KEYS } from '../config.js';
import { read, write, respond } from './mockDb.js';

/** @typedef {{voucherId:string, value:number, qty:number}} CartItem */

/** @returns {CartItem[]} */
const load = () => read(STORAGE_KEYS.CART, []);
/** @param {CartItem[]} items */
const save = (items) => write(STORAGE_KEYS.CART, items);

/** Maksymalna liczba sztuk jednej pozycji. */
const MAX_QTY = 20;

export const cartMock = {
  /** Odpowiednik GET /cart. @returns {Promise<CartItem[]>} */
  get: () => respond(load()),

  /**
   * Odpowiednik POST /cart/items – dodaje pozycję lub zwiększa ilość istniejącej.
   * @param {CartItem} item
   * @returns {Promise<CartItem[]>}
   */
  add({ voucherId, value, qty }) {
    const items = load();
    const existing = items.find((i) => i.voucherId === voucherId && i.value === value);
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
    else items.push({ voucherId, value, qty });
    save(items);
    return respond(items);
  },

  /**
   * Odpowiednik PUT /cart/items/:index – ustawia ilość; ilość < 1 usuwa pozycję.
   * @param {number} index
   * @param {number} qty
   * @returns {Promise<CartItem[]>}
   */
  setQty(index, qty) {
    const items = load();
    if (!items[index]) return respond(items);
    if (qty < 1) items.splice(index, 1);
    else items[index].qty = Math.min(MAX_QTY, qty);
    save(items);
    return respond(items);
  },

  /** Odpowiednik DELETE /cart/items/:index. @param {number} index @returns {Promise<CartItem[]>} */
  remove(index) {
    const items = load();
    items.splice(index, 1);
    save(items);
    return respond(items);
  },

  /** Odpowiednik DELETE /cart. @returns {Promise<CartItem[]>} */
  clear() {
    save([]);
    return respond([]);
  },
};
