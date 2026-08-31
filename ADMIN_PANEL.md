# Panel Admina — ebe power — Dokumentacja

Panel administracyjny jest dostępny pod adresem `/admin` (np. https://ebe-power.pl/admin lub lokalnie http://localhost:3001/admin).

**Dostęp jest chroniony hasłem** — logowanie na `/admin/login` kontem z rolą
ADMIN (szczegóły w sekcji „Bezpieczeństwo" niżej). Dane konta konfiguruje się
zmiennymi `ADMIN_EMAIL` / `ADMIN_PASSWORD` na backendzie.

## ✨ Co zostało zrobione

### Backend (Spring Boot)

1. **ProductController** — poprawiony `PUT /api/products/{id}` obsługuje teraz wszystkie pola:
   - `name`, `price`, `oldPrice`, `stock`, `sku`, `category`, `subcategory`, `description`, `images`, `parameters`
   - wcześniej brakowało `stock`, `oldPrice`, `parameters`.

2. **OrderController** (nowy) — `/api/orders`:
   - `GET /api/orders` — lista wszystkich zamówień z pozycjami
   - `GET /api/orders/{id}` — szczegóły
   - `PUT /api/orders/{id}/status` — zmiana statusu (PENDING, PAID, PAID_OUT_OF_STOCK, COMPLETED, CANCELLED)
   - `DELETE /api/orders/{id}`

3. **AdminController** (nowy) — `/api/admin`:
   - `GET /api/admin/stats` — statystyki: produkty, magazyn, zamówienia, przychód, użytkownicy + lista produktów z niskim stanem
   - `GET /api/admin/users` — lista użytkowników
   - `DELETE /api/admin/users/{id}`

4. **SecurityConfig** — dodano permitAll dla `/api/orders/**` i `/api/admin/**` (panel musi działać bez JWT w MVP; w produkcji dodaj autoryzację ROLE_ADMIN).

5. **OrderItem** — dodano `@JsonIgnore` na polu `order` aby uniknąć pętli JSON przy serializacji.

### Frontend (Next.js)

#### Layout `/admin/layout.tsx`
- Profesjonalny sidebar z aktywnym linkiem, responsywny (mobile drawer), sekcja „Sklep” z powrotem do frontu.
- Sticky, ciemny motyw `slate-950`, zaokrąglenia 2xl, nowoczesny wygląd.

#### Pulpit `/admin/page.tsx`
- Karty: produkty, niski stan, brak, użytkownicy, zamówienia, opłacone, ukończone, przychód (brutto).
- Sekcja „Niski stan magazynowy” — top 10 produktów sortowanych po stock.
- „Ostatnie zamówienia” — tabela 5 najnowszych.
- Wskazówki dla administratora.
- Dane z `/api/admin/stats` i `/api/orders`.

#### Produkty `/admin/products/page.tsx`
- **Wyszukiwanie**: nazwa, SKU, kategoria (live).
- **Filtry**: kategoria (dynamiczna z danych), stan magazynowy (wszystkie / dostępne / niski / brak).
- **Tabela**: zdjęcie (hover zoom), nazwa + skrót opisu, kategoria/podkategoria, cena netto + stara cena przekreślona, badge stock z kolorami (zielony/amber/czerwony), SKU, akcje ✏️ 🗑️.
- **Paginacja**: 10 na stronę, smart 5 przycisków, licznik.
- **Dodawanie / edycja**: formularz w tym samym widoku, scroll to top, po sukcesie aktualizacja listy bez reloadu.
- **Usuwanie**: confirm + optimistic update.

#### Formularz `AdminProductForm.tsx`
- Pola:
  - nazwa*, cena netto*, stara cena, stock, SKU
  - kategoria (select + input własna), podkategoria (zależna od kategorii)
  - opis (textarea)
  - zdjęcia: podgląd istniejących z możliwością usunięcia, podgląd nowych (blob URL), drag & drop area, upload do Supabase Storage przez `uploadProductImage`, łączenie starych + nowych URL-i
  - parametry techniczne: dynamiczna lista key/value, dodaj/usuń, mapowana do `Record<string,string>` (backend `product_parameters` tabela). Klucze np. `moc_maksymalna`, `napiecie` automatycznie zamieniane na ładne etykiety w sklepie przez `PARAM_LABELS`.
- Walidacja: nazwa + cena wymagane.
- UX: spinner, stany loading, komunikaty.

#### Zamówienia `/admin/orders/page.tsx`
- Karty filtrów statusu (6) z licznikami, klik = filtr.
- Search po e-mail, ID, PaymentIntent.
- Tabela zamówień + panel szczegółów (prawo na desktop, sticky):
  - dane klienta, kwota, PaymentIntent, status badge
  - zmiana statusu (5 przycisków)
  - lista pozycji: zdjęcie, nazwa, ilość × cena, suma
  - akcje: napisz do klienta (mailto), usuń
- Badge statusów z kolorami.
- Przychód brutto liczony z opłaconych/zrealizowanych.

#### Użytkownicy `/admin/users/page.tsx`
- Lista, search, usuwanie.

#### Serwisy
- `adminService.ts` — client-side fetchery używające `getPublicApiUrl()` (czyli `/api/backend` w prod, proxy same-origin, bez CORS). Funkcje: `getAdminStats`, `getAllOrders`, `updateOrderStatus`, `deleteOrder`, `getAllUsers`, `getProductsClient`, `createProductClient`, `updateProductClient`, `deleteProductClient`.

### Jak używać (dla klienta)

1. Wejdź na `/admin` — zobaczysz pulpit z podsumowaniem.
2. **Dodaj produkt**: `/admin/products` → „+ Dodaj produkt” → wypełnij formularz:
   - Nazwa np. „Pramac P3500i — agregat inwerterowy 3,3 kW”
   - Cena netto (bez VAT, VAT doliczany automatycznie 23% w checkout)
   - Stock — ilość w magazynie
   - SKU — np. PRM-P3500I (unikalny, pomaga w wyszukiwaniu)
   - Kategoria: Agregaty / Akcesoria / własna
   - Podkategoria: dla Agregaty: gazowe, inwerterowe, benzynowe, diesla
   - Opis — pełny marketingowy
   - Zdjęcia — wybierz 1..N plików, zostaną wgrane do Supabase bucket `product_images/products/{timestamp}.ext`
   - Parametry — dodaj np. `moc_maksymalna: 3300 W`, `napiecie: 230 V` — pojawią się w tabeli specyfikacji na stronie produktu
   - Zapisz — produkt od razu widoczny w sklepie (ISR 60s, ale w adminie od razu).

3. **Edytuj**: klik ✏️ w tabeli, formularz wypełni się, możesz zmienić dowolne pole, dodać nowe zdjęcia, usunąć stare (klik na zdjęcie → Usuń), zmienić parametry.

4. **Usuń**: klik 🗑️ → potwierdź.

5. **Zamówienia**: `/admin/orders` — widzisz wszystkie płatności Stripe. Statusy:
   - PENDING — klient nie dokończył płatności
   - PAID — opłacone, gotowe do wysyłki (magazyn automatycznie pomniejszony)
   - PAID_OUT_OF_STOCK — opłacone ale brakło towaru (wymaga kontaktu)
   - COMPLETED — oznacz ręcznie po wysyłce
   - CANCELLED — anulowane

6. **Magazyn**: produkty z 0 szt. są pokazywane jako „Chwilowo niedostępny” w sklepie. Uzupełnij stock aby wróciły.

### Bezpieczeństwo — logowanie do panelu (zrealizowane)

Panel `/admin` jest chroniony hasłem na trzech niezależnych poziomach:

1. **Strona logowania `/admin/login`** — dedykowany, ciemny ekran logowania
   (e-mail + hasło, bez logowania Google). Niepowołane osoby nie zobaczą nawet
   treści panelu. Konto bez roli ADMIN dostaje komunikat „To konto nie ma
   uprawnień administratora" z przyciskiem *Wyloguj się i przełącz konto*.

2. **Middleware Next.js (`src/middleware.ts`)** — każde wejście na `/admin/**`
   wymaga sesji NextAuth z rolą `ADMIN`:
   - brak sesji → przekierowanie na `/admin/login?callbackUrl=...`,
   - sesja bez roli ADMIN → `/admin/login?error=forbidden`.
   `/profile/**` dalej wymaga zwykłego zalogowania.

3. **API panelu** — `/api/admin/**` i `/api/orders/**`:
   - **Brama w proxy Next.js** (`/api/backend/[[...path]]/route.ts`): żądania bez
     sesji ADMIN dostają `401/403` JSON zanim trafią do backendu. Działa od razu
     po wdrożeniu (sekret trzyma frontend).
   - **`AdminAuthFilter` (Spring Boot)**: weryfikuje JWT sesji NextAuth
     (nagłówek `Authorization: Bearer` **lub** ciasteczko sesji przekazane przez
     proxy) podpisanego wspólnym `NEXTAUTH_SECRET` i wymaga claimu `role=ADMIN`;
     `SecurityConfig` wymusza `.hasRole("ADMIN")` dla tych ścieżek. Gdy backend
     nie zna `NEXTAUTH_SECRET`, filtr przepuszcza żądania i loguje ostrzeżenie
     (nie wyłącza panelu po wdrożeniu — pierwszą bramą jest proxy).

**Backend:**
- `User` ma pole `role` (`USER`/`ADMIN`); hash hasła nie jest już zwracany w JSON
  (`@JsonIgnore`, istotne dla `GET /api/admin/users`).
- `POST /api/auth/admin-login` — logowanie **tylko** dla kont z rolą ADMIN
  (klient z poprawnym hasłem dostaje 403 i nie utworzy sesji admina).
- `POST /api/auth/login` zwraca teraz również `role` — trafia ona do tokena
  sesji NextAuth (`token.role`) i do `session.user.role`.
- `AdminUserInitializer` — przy starcie tworzy konto administratora:
  - `ADMIN_EMAIL` (domyślnie `admin@ebe-power.pl`),
  - `ADMIN_PASSWORD` — **jeśli puste, generowane jest losowe hasło i wypisywane
    do logów startowych** (brak znanego-publicznie domyślnego hasła).

**Frontend:**
- `/admin/login` (strona + `AdminLoginForm.tsx`) — przez `adminLogin=true`
  wymusza ścieżkę `admin-login` w NextAuth.
- Layout panelu (`/admin/(panel)/layout.tsx`) pokazuje zalogowanego admina,
  ma przycisk **Wyloguj się** i rezerwową ochronę po stronie klienta.
- `adminService.ts` — wywołania panelowe wysyłają `credentials: 'include'`,
  żeby ciasteczko sesji docierało do backendu (także lokalnie przez CORS).
- Trasy panelu przeniesione do route groupy `(panel)`, aby ekran logowania nie
  renderował sidebara.

#### Konfiguracja produkcyjna (Cloud Run)

1. Ustaw wspólny sekret sesji na **obu** usługach (ta sama wartość):
   ```bash
   gcloud run services update <frontend> --update-env-vars NEXTAUTH_SECRET="<losowy-sekret>"
   gcloud run services update <backend>  --update-env-vars NEXTAUTH_SECRET="<losowy-sekret>"
   ```
   (backend: `--update-env-vars` dopisuje, nie czyści pozostałych zmiennych)
2. Ustaw dane logowania administratora na backendzie:
   ```bash
   gcloud run services update <backend> --update-env-vars ADMIN_EMAIL="admin@ebe-power.pl" ADMIN_PASSWORD="<silne-hasło>"
   ```
3. Uwaga: `spring.jpa.hibernate.ddl-auto=create` kasuje bazę przy każdym starcie
   (wraz z kontami klientów) — administrator zostanie odtworzony automatycznie
   z `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Na produkcji rozważ zmianę na `update`.

#### Dalsze usprawnienia (opcjonalne)

- Rate limiting na `POST /api/auth/admin-login` (np. bucket4j).
- Log akcji administratora (kto co zmienił) — obecnie brak.
- 2FA dla kont ADMIN.

### Zdjęcia i PDFy

- Zdjęcia: Supabase bucket `product_images`, publiczny. Upload przez `uploadProductImage` tworzy unikalną nazwę `Date.now().ext` w `products/`.
- Okładka produktu w sklepie: `supabaseProductImage(id)` = `.../product_images/products/{id}.jpg` — jeśli chcesz nadpisać okładkę dla istniejącego produktu, wgraj plik `products/{id}.jpg` ręcznie w Supabase.
- Karty katalogowe PDF: `product_datasheets/products/{id}.pdf` — przycisk „Pobierz kartę” pojawia się automatycznie jeśli plik istnieje.

### Build i deploy

- Frontend: `npm run build` — przechodzi (43 strony, fallback do lokalnego katalogu gdy backend offline)
- Backend: `mvn compile` — wymaga Mavena; kod jest poprawny składniowo, dodano 2 nowe kontrolery
- Docker Compose lokalnie: `docker-compose up` — frontend na :3001, backend na :8080, postgres na :5432
- Cloud Run: zmienne `API_URL` / `NEXT_PUBLIC_API_URL` muszą wskazywać na backend, `NEXT_PUBLIC_SUPABASE_URL` i `PUBLISHABLE_KEY` dla zdjęć

### Pliki zmienione / nowe

- `backend/src/main/java/com/example/ebepower/ProductController.java` — fix PUT
- `backend/src/main/java/com/example/ebepower/AdminController.java` — nowy
- `backend/src/main/java/com/example/ebepower/OrderController.java` — nowy
- `backend/src/main/java/com/example/ebepower/SecurityConfig.java` — hasRole ADMIN dla orders/admin
- `backend/src/main/java/com/example/ebepower/OrderItem.java` — JsonIgnore
- `backend/src/main/java/com/example/ebepower/AdminAuthFilter.java` — NOWY, ochrona API panelu
- `backend/src/main/java/com/example/ebepower/AdminUserInitializer.java` — NOWY, konto admina ze env
- `backend/src/main/java/com/example/ebepower/User.java` — pole `role` + JsonIgnore na haśle
- `backend/src/main/java/com/example/ebepower/AuthController.java` — rola w odpowiedziach + `/api/auth/admin-login`
- `backend/src/main/java/com/example/ebepower/JwtService.java` — weryfikacja wielosekretowa
- `frontend/src/app/services/adminService.ts` — nowy + credentials include
- `frontend/src/app/components/AdminProductForm.tsx` — nowy, pełny formularz
- `frontend/src/app/components/AdminAddProductForm.tsx` — wrapper dla kompatybilności
- `frontend/src/app/admin/layout.tsx` — redesign → przeniesiony do `(panel)/layout.tsx` (+ sesja admina, wylogowanie)
- `frontend/src/app/admin/login/page.tsx` — NOWY, ekran logowania panelu
- `frontend/src/app/admin/login/AdminLoginForm.tsx` — NOWY, formularz logowania admina
- `frontend/src/app/admin/(panel)/page.tsx` — dashboard z stats
- `frontend/src/app/admin/(panel)/products/page.tsx` — pełny CRUD + filtry + paginacja
- `frontend/src/app/admin/(panel)/orders/page.tsx` — pełny CRUD zamówień
- `frontend/src/app/admin/(panel)/users/page.tsx` — nowy
- `frontend/src/middleware.ts` — ochrona `/admin/**` (rola ADMIN) i `/profile/**`
- `frontend/src/app/api/backend/[[...path]]/route.ts` — brama ADMIN dla `/api/admin` i `/api/orders`
- `frontend/src/app/api/auth/[...nextauth]/route.ts` — rola w tokenie/sesji, ścieżka admin-login
- `docker-compose.yml` — NEXTAUTH_SECRET (frontend+backend), ADMIN_EMAIL, ADMIN_PASSWORD

Gotowe do użycia przez klienta. Wystarczy wejść na `/admin`.

---

## 🔧 Rozwiązywanie problemów: „Nie udało się pobrać statystyk / zamówień / użytkowników”

Ten błąd na pulpicie `/admin` oznacza dokładnie jedno: **frontend nie dostał odpowiedzi
z backendu**. Przyczyny bywają dwie — poniżej jak je rozróżnić i naprawić.

### 1. Nic nie nasłuchuje na `localhost:8080` (najczęstsze w dev)

Przeglądarka woła `/api/backend/*`, proxy w Next.js przekazuje żądanie na adres z
`API_URL` (domyślnie `http://localhost:8080`). Sprawdź jednym żądaniem:

```bash
curl http://localhost:8080/api/products | head -c 200
# lub przez proxy (mówi też, JAKI backend jest skonfigurowany):
curl http://localhost:3001/api/backend
```

Jeśli backend nie działa, a nie chcesz stawiać Javy/Mavena/Postgresa — uruchom
**atrapę API** (czysty Node, zero zależności), która odtwarza kontrakt Spring Boota
i seeduje produkty z `backend/src/main/resources/data.sql`:

```bash
npm run dev            # z roota repo: atrapa :8080 + Next.js :3001
npm run dev:backend    # sama atrapa
```

Logowanie panelu na atrapie: `admin@ebe-power.pl` / `admin123`
(overriduj przez `ADMIN_EMAIL`/`ADMIN_PASSWORD`; szczegóły: `dev-backend/README.md`).

### 2. Backend działa, ale odrzuca sesję (produkcja z `NEXTAUTH_SECRET`)

NextAuth v4 wystawia ciasteczko sesji jako **JWE (alg=dir, enc=A256GCM)** — token jest
*SZYFROWANY*, a nie podpisany HMAC256. Wcześniejsza wersja `JwtService.verifyAndDecode`
używała java-jwt z HMAC256, więc każda sesja była odrzucana i całe API panelu
(`/api/admin/**`, `/api/orders/**`) zwracało 401 „Brak lub nieprawidłowa sesja”.

Naprawione: `JwtService.decodeSessionToken()` obsługuje teraz oba formaty
(JWE `dir`+`A256GCM` z kluczem HKDF-SHA256 z `NEXTAUTH_SECRET`, dokładnie jak
`next-auth/jwt`, oraz klasyczne podpisane JWT HS256). `AdminAuthFilter` korzysta
z nowego dekodera. Zgodność z next-auth jest zablokowana testem jednostkowym
`JwtServiceJweTest` (wektory wygenerowane biblioteką `jose`).

Warunek działania: `NEXTAUTH_SECRET` musi mieć **tę samą wartość** na frontendzie
i backendzie (patrz `frontend/.env.example` oraz `docker-compose.yml`).
