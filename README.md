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
`index.html`, `styles.css`, `app.js`, `README.md`, `img/`

## Konta użytkowników (DEMO)
Logowanie (`#/logowanie`), rejestracja (`#/rejestracja`) i profil (`#/konto`) działają wyłącznie w `localStorage` przeglądarki – bez backendu. Hasła są solone i hashowane SHA-256 (SubtleCrypto), ale to nadal tylko makieta – nie używaj prawdziwych haseł. Zamówienia zalogowanego użytkownika trafiają do jego historii.

## CREDITS – zdjęcia
Wszystkie zdjęcia to prawdziwe fotografie (nie AI) z Wikimedia Commons, przeskalowane do 800 px.

| Voucher | Autor | Źródło | Licencja |
|---|---|---|---|
| SPA (`img/spa.jpg`) | el ancora service (Panoramio) | https://commons.wikimedia.org/wiki/File:EL_ANCORA_SERVICE_-_panoramio.jpg | CC BY 3.0 |
| Kolacja (`img/kolacja.jpg`) | Robert Couse-Baker | https://commons.wikimedia.org/wiki/File:Candlelight_dinner_-_Flickr_-_Robert_Couse-Baker.jpg | CC BY 2.0 |
| Skok (`img/skok.jpg`) | Wlodek k1 | https://commons.wikimedia.org/wiki/File:Parachuting_at_the_Opole-Polska_Nowa_Wie%C5%9B_airfield,_2022.05.29_05.jpg | CC BY 3.0 |
| Kino (`img/kino.jpg`) | Carol M. Highsmith (Library of Congress) | https://commons.wikimedia.org/wiki/File:Auditorium_at_the_Perot_Theatre,_a_landmark_since_1924,_when_it_opened_as_the_Saenger_Amusement_Company%27s_%22Gateway_to_the_West%22_movie_theater_in_Texarkana,_Texas_LCCN2014630215.tif | Domena publiczna |
| Książki (`img/ksiazki.jpg`) | Immanuel Giel | https://commons.wikimedia.org/wiki/File:Richard_Booth%27s_Bookshop_09.jpg | CC0 |
| Gokarty (`img/gokarty.jpg`) | Genevieve (Flickr) | https://commons.wikimedia.org/wiki/File:Go_kart_racing_(6238710513).jpg | CC BY 2.0 |
| Kawa (`img/kawa.jpg`) | Kim Sanso | https://commons.wikimedia.org/wiki/File:Latte_art_3.jpg | CC0 |
| Joga (`img/joga.jpg`) | David Scott Yglesias | https://commons.wikimedia.org/wiki/File:Energy_Yoga_Teacher_Training_with_David_Scott_Yglesias.jpg | CC BY 4.0 |

Zdjęcia zostały przeskalowane i skompresowane (zmiana formatu), bez innych modyfikacji.
