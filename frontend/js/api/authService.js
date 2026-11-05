/**
 * @file authService.js
 * @description Serwis uwierzytelniania: rejestracja, logowanie, wylogowanie, profil.
 * Przechowuje token (JWT w trybie API) i buforuje dane bieżącego użytkownika.
 */
import { USE_MOCK } from '../config.js';
import { api, setToken, getToken } from './apiClient.js';
import { authMock } from '../mock/authMock.js';

/** Implementacja REST (zob. docs/API.md, sekcja „Uwierzytelnianie”). */
const restImpl = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout', {}).catch(() => null),
  me: () =>
    getToken()
      ? api.get('/users/me').catch((err) => {
          // Token wygasł lub został unieważniony – usuwamy go, żeby nie wysyłać go dalej.
          if (err.status === 401) setToken(null);
          return null;
        })
      : Promise.resolve(null),
};

const impl = USE_MOCK ? authMock : restImpl;

/** Bufor profilu – unika ponownego pytania serwera przy każdym renderze nagłówka. */
let currentUser;

export const authService = {
  /**
   * Rejestruje nowe konto i loguje użytkownika.
   * @param {{name:string,email:string,password:string}} data
   * @returns {Promise<{name:string,email:string}>}
   */
  async register(data) {
    const { token, user } = await impl.register(data);
    setToken(token);
    return (currentUser = user);
  },

  /**
   * Loguje użytkownika.
   * @param {{email:string,password:string}} data
   * @returns {Promise<{name:string,email:string}>}
   */
  async login(data) {
    const { token, user } = await impl.login(data);
    setToken(token);
    return (currentUser = user);
  },

  /** Wylogowuje i czyści token. @returns {Promise<void>} */
  async logout() {
    await impl.logout();
    setToken(null);
    currentUser = null;
  },

  /**
   * Zwraca zalogowanego użytkownika lub null (z bufora, jeśli dostępny).
   * @returns {Promise<{name:string,email:string}|null>}
   */
  async current() {
    if (currentUser === undefined) currentUser = await impl.me();
    return currentUser;
  },
};
