# VoucherShop – makieta sprintowa

Statyczna makieta sklepu z voucherami (HTML + CSS + czysty JavaScript, bez kroku budowania). Działa na GitHub Pages.

## Widoki (routing przez hash)
1. **Katalog** `#/` – siatka 8 przykładowych voucherów z filtrowaniem po kategorii.
2. **Szczegóły** `#/voucher/<id>` – opis, wybór wartości, ilość, „Dodaj do koszyka”.
3. **Koszyk** `#/koszyk` – zmiana ilości, usuwanie, suma; zapis w `localStorage`.
4. **Płatność** `#/platnosc` – imię, e-mail, karta lub BLIK. **Tylko DEMO – brak realnych płatności.**
5. **Sukces** `#/sukces` – numer zamówienia i podsumowanie.

Waluta: PLN.

## Uruchomienie
- Otwórz `index.html` w przeglądarce, albo
- `python3 -m http.server 8000` i wejdź na http://localhost:8000

## GitHub Pages
Settings → Pages → Deploy from branch → `main` / `(root)`.

## Pliki
`index.html`, `styles.css`, `app.js`, `README.md`
