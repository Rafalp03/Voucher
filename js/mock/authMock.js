/**
 * @file authMock.js
 * @description Implementacja mock uwierzytelniania. Użytkownicy są przechowywani
 * w localStorage jako obiekt { [email]: user }. Hasło NIE jest zapisywane jawnie –
 * przechowywany jest skrót SHA-256(sól + hasło) oraz losowa sól.
 */
import { STORAGE_KEYS } from '../config.js';
import { read, write, respond, fail } from './mockDb.js';
import { sha256, randomHex } from '../utils.js';

/** @returns {Record<string, any>} Wszyscy zarejestrowani użytkownicy. */
export const getUsers = () => read(STORAGE_KEYS.USERS, {});
/** @param {Record<string, any>} users */
export const setUsers = (users) => write(STORAGE_KEYS.USERS, users);

/**
 * Zwraca publiczny profil (bez soli i skrótu hasła) – tak, jak zwracałoby go API.
 * @param {any} u Rekord użytkownika.
 * @returns {{name:string,email:string}}
 */
const publicUser = (u) => ({ name: u.name, email: u.email });

export const authMock = {
  /**
   * Odpowiednik POST /auth/register. Po rejestracji użytkownik jest od razu zalogowany.
   * @param {{name:string,email:string,password:string}} data
   * @returns {Promise<{token:string,user:{name:string,email:string}}>}
   */
  async register({ name, email, password }) {
    const users = getUsers();
    if (users[email]) return fail('Konto z tym e-mailem już istnieje.', 409);
    const salt = randomHex();
    users[email] = { name, email, salt, hash: await sha256(salt + password), orders: [] };
    setUsers(users);
    localStorage.setItem(STORAGE_KEYS.SESSION, email);
    return respond({ token: 'mock-' + email, user: publicUser(users[email]) });
  },

  /**
   * Odpowiednik POST /auth/login. Porównuje skrót podanego hasła z zapisanym.
   * @param {{email:string,password:string}} data
   * @returns {Promise<{token:string,user:{name:string,email:string}}>}
   */
  async login({ email, password }) {
    const u = getUsers()[email];
    // Ten sam komunikat dla złego e-maila i hasła – nie zdradzamy, które konto istnieje.
    if (!u || u.hash !== (await sha256(u.salt + password))) return fail('Nieprawidłowy e-mail lub hasło.', 401);
    localStorage.setItem(STORAGE_KEYS.SESSION, email);
    return respond({ token: 'mock-' + email, user: publicUser(u) });
  },

  /**
   * Odpowiednik POST /auth/logout.
   * @returns {Promise<void>}
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return respond(undefined);
  },

  /**
   * Odpowiednik GET /users/me – profil zalogowanego użytkownika lub null.
   * @returns {Promise<{name:string,email:string}|null>}
   */
  me() {
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    const u = email ? getUsers()[email] : null;
    return respond(u ? publicUser(u) : null);
  },
};
