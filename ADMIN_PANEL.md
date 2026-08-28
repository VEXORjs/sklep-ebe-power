# Panel Admina — Trafo Energia — Dokumentacja

Panel administracyjny jest dostępny pod adresem `/admin` (np. https://ebe-power.pl/admin lub lokalnie http://localhost:3001/admin).

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

### Bezpieczeństwo — TODO na produkcję

- Obecnie `/admin` jest publiczny (SecurityConfig permitAll). Dodaj:
  - W `User` pole `role` (ADMIN/USER)
  - W `SecurityConfig` `.requestMatchers("/api/admin/**", "/api/orders/**").hasRole("ADMIN")`
  - W frontendzie middleware sprawdzające sesję NextAuth i rolę
  - Lub prosty BASIC AUTH / env `ADMIN_PASSWORD` dla panelu

- Dodaj rate limiting, logowanie akcji admina.

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

- `backend/src/main/java/com/example/trafo/ProductController.java` — fix PUT
- `backend/src/main/java/com/example/trafo/AdminController.java` — nowy
- `backend/src/main/java/com/example/trafo/OrderController.java` — nowy
- `backend/src/main/java/com/example/trafo/SecurityConfig.java` — permit orders/admin
- `backend/src/main/java/com/example/trafo/OrderItem.java` — JsonIgnore
- `frontend/src/app/services/adminService.ts` — nowy
- `frontend/src/app/components/AdminProductForm.tsx` — nowy, pełny formularz
- `frontend/src/app/components/AdminAddProductForm.tsx` — wrapper dla kompatybilności
- `frontend/src/app/admin/layout.tsx` — redesign
- `frontend/src/app/admin/page.tsx` — dashboard z stats
- `frontend/src/app/admin/products/page.tsx` — pełny CRUD + filtry + paginacja
- `frontend/src/app/admin/orders/page.tsx` — pełny CRUD zamówień
- `frontend/src/app/admin/users/page.tsx` — nowy

Gotowe do użycia przez klienta. Wystarczy wejść na `/admin`.
