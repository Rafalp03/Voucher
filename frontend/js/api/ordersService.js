/**
 * @file ordersService.js
 * @description Serwis zamówień: złożenie zamówienia, historia użytkownika, szczegóły.
 */
import { USE_MOCK, STORAGE_KEYS } from '../config.js';
import { api, ApiError } from './apiClient.js';
import { ordersMock } from '../mock/ordersMock.js';

/**
 * Implementacja REST (zob. docs/API.md, sekcja „Zamówienia”).
 * Numer ostatniego zamówienia jest zapamiętywany, bo ekran sukcesu
 * wywołuje getById() bez parametru (jak w mocku).
 */
const restImpl = {
  async create(payload) {
    const order = await api.post('/orders', payload);
    localStorage.setItem(STORAGE_KEYS.LAST_ORDER_ID, order.id);
    return order;
  },
  listMine: () => api.get('/orders'),
  getById(id) {
    const orderId = id || localStorage.getItem(STORAGE_KEYS.LAST_ORDER_ID);
    if (!orderId) return Promise.reject(new ApiError('Nie znaleziono zamówienia.', 404));
    return api.get(`/orders/${encodeURIComponent(orderId)}`);
  },
};

const impl = USE_MOCK ? ordersMock : restImpl;

export const ordersService = {
  /**
   * Składa zamówienie. Płatność jest symulowana – do API nie są wysyłane dane karty.
   * @param {{customerName:string,email:string,paymentMethod:'card'|'blik',items:{voucherId:string,value:number,qty:number}[]}} payload
   * @returns {Promise<any>} Utworzone zamówienie.
   */
  create: (payload) => impl.create(payload),
  /** @returns {Promise<any[]>} Zamówienia zalogowanego użytkownika. */
  listMine: () => impl.listMine(),
  /** @param {string} [id] @returns {Promise<any>} Zamówienie. */
  getById: (id) => impl.getById(id),
};
