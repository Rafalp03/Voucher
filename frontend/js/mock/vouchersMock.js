/**
 * @file vouchersMock.js
 * @description Implementacja mock serwisu voucherów – dane ze statycznej tablicy VOUCHERS.
 */
import { VOUCHERS } from './data.js';
import { respond, fail } from './mockDb.js';

export const vouchersMock = {
  /**
   * Odpowiednik GET /vouchers.
   * @returns {Promise<import('./data.js').Voucher[]>}
   */
  getAll: () => respond(VOUCHERS),

  /**
   * Odpowiednik GET /vouchers/:id.
   * @param {string} id
   * @returns {Promise<import('./data.js').Voucher>}
   */
  getById: (id) => {
    const v = VOUCHERS.find((x) => x.id === id);
    return v ? respond(v) : fail('Nie znaleziono vouchera.', 404);
  },
};
