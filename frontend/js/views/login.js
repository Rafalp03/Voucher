/**
 * @file login.js
 * @description Widok logowania.
 */
import { authService } from '../api/authService.js';
import { formData, showErrors, DEMO_NOTE } from '../utils.js';
import { updateUserLink } from './header.js';

/**
 * Renderuje formularz logowania. Zalogowany użytkownik jest przekierowywany do profilu.
 * @param {HTMLElement} app Kontener główny.
 * @returns {Promise<void>}
 */
export async function renderLogin(app) {
  if (await authService.current()) {
    location.hash = '#/konto';
    return;
  }
  app.innerHTML = `<h1>Logowanie</h1><form class="panel narrow" id="f" novalidate>${DEMO_NOTE}
  <label for="l-email">E-mail</label><input id="l-email" name="email" type="email" autocomplete="email" required>
  <label for="l-pass">Hasło</label><input id="l-pass" name="pass" type="password" autocomplete="current-password" required>
  <div id="err" class="error" role="alert"></div><br><button class="btn" style="width:100%">Zaloguj się</button>
  <p>Nie masz konta? <a href="#/rejestracja" style="color:var(--p)">Zarejestruj się</a></p></form>`;

  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    const d = formData(/** @type {HTMLFormElement} */ (e.target));
    try {
      await authService.login({ email: d.email.trim().toLowerCase(), password: d.pass });
      await updateUserLink();
      location.hash = '#/konto';
    } catch (err) {
      showErrors([err.message]);
    }
  };
}
