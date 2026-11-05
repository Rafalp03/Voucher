/**
 * @file main.js
 * @description Punkt wejścia aplikacji (ładowany jako <script type="module">).
 * Inicjalizuje router i nasłuch zmian koszyka.
 */
import { startRouter } from './router.js';
import { updateCartBadge } from './views/header.js';

/** Kontener, w którym renderowane są widoki. */
const app = document.getElementById('app');

// Każda zmiana koszyka (zdarzenie z cartService) odświeża licznik w nagłówku.
window.addEventListener('cart:changed', (e) => updateCartBadge(/** @type {CustomEvent} */ (e).detail));

startRouter(app);
