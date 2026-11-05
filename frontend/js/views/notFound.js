/**
 * @file notFound.js
 * @description Widok błędu 404 dla nieznanej trasy lub vouchera.
 */

/**
 * @param {HTMLElement} app Kontener główny.
 */
export function renderNotFound(app) {
  app.innerHTML = `<div class="panel empty">Nie znaleziono strony. <a href="#/" style="color:var(--p)">Wróć</a></div>`;
}
