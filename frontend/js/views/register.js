/**
 * @file register.js
 * @description Widok rejestracji z walidacją po stronie klienta.
 */
import { authService } from '../api/authService.js';
import { formData, showErrors, isEmail, DEMO_NOTE } from '../utils.js';
import { updateUserLink } from './header.js';

/**
 * Waliduje dane rejestracji.
 * Reguły: imię ≥ 2 znaki, poprawny e-mail, hasło ≥ 8 znaków z literą i cyfrą, zgodne powtórzenie.
 * @param {Record<string,string>} d Dane formularza.
 * @returns {string[]} Lista błędów.
 */
export function validateRegistration(d) {
  const err = [];
  if (d.name.trim().length < 2) err.push('Podaj imię (min. 2 znaki).');
  if (!isEmail(d.email.trim())) err.push('Podaj poprawny e-mail.');
  if (d.pass.length < 8 || !/[a-zA-Z]/.test(d.pass) || !/\d/.test(d.pass)) err.push('Hasło: min. 8 znaków, w tym litera i cyfra.');
  if (d.pass !== d.pass2) err.push('Hasła nie są identyczne.');
  return err;
}

/**
 * Renderuje formularz rejestracji.
 * @param {HTMLElement} app Kontener główny.
 */
export function renderRegister(app) {
  app.innerHTML = `<h1>Rejestracja</h1><form class="panel narrow" id="f" novalidate>${DEMO_NOTE}
  <label for="r-name">Imię</label><input id="r-name" name="name" autocomplete="given-name" required>
  <label for="r-email">E-mail</label><input id="r-email" name="email" type="email" autocomplete="email" required>
  <label for="r-pass">Hasło (min. 8 znaków, litera i cyfra)</label><input id="r-pass" name="pass" type="password" autocomplete="new-password" required>
  <label for="r-pass2">Powtórz hasło</label><input id="r-pass2" name="pass2" type="password" autocomplete="new-password" required>
  <div id="err" class="error" role="alert"></div><br><button class="btn" style="width:100%">Załóż konto</button>
  <p>Masz już konto? <a href="#/logowanie" style="color:var(--p)">Zaloguj się</a></p></form>`;

  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    const d = formData(/** @type {HTMLFormElement} */ (e.target));
    const errors = validateRegistration(d);
    if (errors.length) return showErrors(errors);
    try {
      await authService.register({ name: d.name.trim(), email: d.email.trim().toLowerCase(), password: d.pass });
      await updateUserLink();
      location.hash = '#/konto';
    } catch (err) {
      showErrors([err.message]); // np. „Konto z tym e-mailem już istnieje.”
    }
  };
}
