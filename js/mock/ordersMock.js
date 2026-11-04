/**
 * @file ordersMock.js
 * @description Implementacja mock zamówień. Zamówienie zalogowanego użytkownika trafia
 * do jego historii (rekord w USERS), a ostatnie zamówienie – do LAST_ORDER (ekran sukcesu).
 */
import { STORAGE_KEYS } from '../config.js';
import { read, write, respond, fail } from './mockDb.js';
import { VOUCHERS } from './data.js';
import { getUsers, setUsers } from './authMock.js';

export const ordersMock = {
  /**
   * Odpowiednik POST /orders. Serwer (tu: mock) sam wylicza ceny i sumę
   * na podstawie katalogu – klient przesyła tylko identyfikatory i ilości.
   * @param {{customerName:string,email:string,paymentMethod:'card'|'blik',items:{voucherId:string,value:number,qty:number}[]}} payload
   * @returns {Promise<any>} Utworzone zamówienie.
   */
  create(payload) {
    if (!payload.items?.length) return fail('Koszyk jest pusty.', 422);
    const items = payload.items.map((i) => {
      const v = VOUCHERS.find((x) => x.id === i.voucherId);
      return { voucherId: i.voucherId, name: v ? v.name : i.voucherId, value: i.value, qty: i.qty };
    });
    const order = {
      id: 'VS-' + Date.now().toString(36).toUpperCase(),
      customerName: payload.customerName,
      email: payload.email,
      paymentMethod: payload.paymentMethod,
      status: 'paid',
      items,
      total: items.reduce((s, i) => s + i.value * i.qty, 0),
      createdAt: new Date().toISOString(),
    };
    write(STORAGE_KEYS.LAST_ORDER, order);
    // Przypisanie zamówienia do konta, jeśli użytkownik jest zalogowany.
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    const users = getUsers();
    if (email && users[email]) {
      (users[email].orders ||= []).unshift(order);
      setUsers(users);
    }
    return respond(order);
  },

  /** Odpowiednik GET /orders – zamówienia zalogowanego użytkownika (najnowsze pierwsze). */
  listMine() {
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    const u = email ? getUsers()[email] : null;
    return u ? respond(u.orders || []) : fail('Wymagane logowanie.', 401);
  },

  /**
   * Odpowiednik GET /orders/:id – w mocku zwraca ostatnie zamówienie z tej przeglądarki.
   * @param {string} [id]
   */
  getById(id) {
    const o = read(STORAGE_KEYS.LAST_ORDER, null);
    return o && (!id || o.id === id) ? respond(o) : fail('Nie znaleziono zamówienia.', 404);
  },
};
