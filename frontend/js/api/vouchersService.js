/**
 * @file vouchersService.js
 * @description Serwis katalogu voucherów. Widoki korzystają wyłącznie z tego modułu –
 * nie wiedzą, czy dane pochodzą z mocka, czy z REST API (wzorzec Strategy/Adapter).
 */
import { USE_MOCK } from '../config.js';
import { api } from './apiClient.js';
import { vouchersMock } from '../mock/vouchersMock.js';

/** Implementacja oparta o REST API (zob. docs/API.md). */
const restImpl = {
  getAll: () => api.get('/vouchers'),
  getById: (id) => api.get(`/vouchers/${encodeURIComponent(id)}`),
};

const impl = USE_MOCK ? vouchersMock : restImpl;

export const vouchersService = {
  /**
   * Pobiera wszystkie vouchery.
   * @returns {Promise<import('../mock/data.js').Voucher[]>}
   */
  getAll: () => impl.getAll(),

  /**
   * Pobiera jeden voucher po identyfikatorze.
   * @param {string} id
   * @returns {Promise<import('../mock/data.js').Voucher>}
   */
  getById: (id) => impl.getById(id),
};
