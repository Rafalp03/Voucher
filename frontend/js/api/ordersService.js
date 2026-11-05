/**
 * @file ordersService.js
 * @description Serwis zamówień: złożenie zamówienia, historia użytkownika, szczegóły.
 */
import { USE_MOCK } from '../config.js';
import { api } from './apiClient.js';
import { ordersMock } from '../mock/ordersMock.js';

/** Implementacja REST (zob. docs/API.md, sekcja „Zamówienia”). */
const restImpl = {
  create: (payload) => api.post('/orders', payload),
  listMine: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${encodeURIComponent(id)}`),
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
