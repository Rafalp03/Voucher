/**
 * @file header.js
 * @description Aktualizacja elementów nagłówka wspólnych dla wszystkich widoków:
 * licznik koszyka oraz link „Zaloguj” / nazwa użytkownika.
 */
import { cartService } from '../api/cartService.js';
import { authService } from '../api/authService.js';

/**
 * Ustawia licznik sztuk w koszyku.
 * @param {{qty:number}[]} [items] Pozycje; gdy brak – pobierane z serwisu.
 * @returns {Promise<void>}
 */
export async function updateCartBadge(items) {
  const list = items || (await cartService.get());
  document.getElementById('cart-count').textContent = String(cartService.count(list));
}

/**
 * Pokazuje „Zaloguj” (gość) lub „👤 Imię” z linkiem do profilu (zalogowany).
 * @returns {Promise<void>}
 */
export async function updateUserLink() {
  const user = await authService.current();
  const a = document.getElementById('user-link');
  if (!a) return;
  a.textContent = user ? '👤 ' + user.name : 'Zaloguj';
  a.href = user ? '#/konto' : '#/logowanie';
}

/** Odświeża cały nagłówek. @returns {Promise<void>} */
export const refreshHeader = () => Promise.all([updateCartBadge(), updateUserLink()]).then(() => {});
