# dev-backend — atrapa API bez Javy

Lekki serwer HTTP w **czystym Node.js** (zero zależności npm), który odtwarza kontrakt REST
backendu Spring Boot dokładnie na tyle, by cały frontend działał bez Javy, Mavena i Postgresa.

Rozwiązuje błędy panelu typu:

```
Error: Nie udało się pobrać zamówień
Error: Nie udało się pobrać użytkowników
Błąd ładowania panelu — Nie udało się pobrać statystyk
Upewnij się, że backend działa (http://localhost:8080 lub /api/backend proxy).
```

— które pojawiają się, gdy nic nie nasłuchuje na `localhost:8080`.

## Uruchomienie

```bash
# z katalogu głównego repo (backend + frontend naraz)
npm run dev

# albo osobno
npm run dev:backend     # atrapa API na :8080
npm run dev:frontend    # Next.js na :3001
```

## Konta

| konto              | hasło      | rola  |
|--------------------|------------|-------|
| `admin@ebe-power.pl` | `admin123` | ADMIN |
| `klient@demo.pl`   | `klient123` | USER  |
| `anna@demo.pl`     | `anna1234` | USER  |

Hasło administratora nadpiszesz zmienną `ADMIN_PASSWORD` (albo `ADMIN_EMAIL` — konto jest
tworzone przy starcie, jak `AdminUserInitializer` w Springu).

## Co jest zaimplementowane

| endpoint | zachowanie |
|---|---|
| `GET/POST/PUT/DELETE /api/products` | CRUD jak `ProductController` (w tym `images`, `parameters`) |
| `GET /api/admin/stats`, `GET/DELETE /api/admin/users` | jak `AdminController` (ta sama struktura JSON) |
| `GET/PUT/DELETE /api/orders` | jak `OrderController` (w tym `PUT /{id}/status`) |
| `POST /api/auth/login` / `admin-login` / `register` / `oauth-success` | jak `AuthController` (`admin-login` wymaga roli ADMIN → 403 dla klienta) |
| `GET/POST/PATCH/DELETE /api/cart` | jak `CartController` + `CartDto` (token `user<id>`) |
| `POST /api/payment/create-payment-intent` | **503** — Stripe niedostępny w atrapie (jawny komunikat dla UI) |

- **Katalog produktów** czytany jest wprost z `backend/src/main/resources/data.sql`
  (wbudowany parser SQL), więc atrapa zawsze ma ten sam seed co prawdziwy backend.
- **Zamówienia i użytkownicy demo** (`DEV_SEED_DEMO=0` wyłącza) — 4 zamówienia w różnych
  statusach, żeby karty i filtry panelu miały co pokazać.
- **Ochrona `/api/admin` i `/api/orders`** działa jak `AdminAuthFilter`: bez `NEXTAUTH_SECRET`
  ostrzega i przepuszcza (tryb deweloperski Springa), z sekretem weryfikuje sesję NextAuth
  (obsługuje domyślne **JWE dir+A256GCM** oraz podpisane JWT) i wymaga `role=ADMIN`.

## Ograniczenia (świadome)

- dane trzymam **w pamięci** — restart czyści stan (dokładnie jak `ddl-auto=create` + `data.sql`
  na deweloperskim Springu); **nie używać na produkcji**,
- hasła porównywane jawnie (to atrapa — prawdziwy backend używa bcrypt),
- brak Stripe (płatności) i wysyłki maili.

## Zmienne środowiskowe

| zmienna | domyślnie | opis |
|---|---|---|
| `PORT` | `8080` | port atrapy (frontendowy proxy i tak celuje w 8080) |
| `ADMIN_EMAIL` | `admin@ebe-power.pl` | login administratora panelu |
| `ADMIN_PASSWORD` | `admin123` | hasło administratora (ustaw własne!) |
| `NEXTAUTH_SECRET` | — | gdy ustawiony, `/api/admin` i `/api/orders` wymagają sesji ADMIN |
| `DEV_SEED_DEMO` | `1` | `0` = bez demonstracyjnych zamówień i użytkowników |
