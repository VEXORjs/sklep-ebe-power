# Wydajność frontendu — co zostało zoptymalizowane i dlaczego

Punkt wyjścia: raport Lighthouse 13.4.1 (Moto G Power, throttling 4G, `https://sklep.ebe-power.pl`)
z 12.09.2026 — **Wydajność 0–49**, LCP **6,6 s**, TBT **310 ms**, Speed Index **3,3 s**,
FCP **1,1 s**, CLS **0**. Największe pozycje z raportu:

| Audit z raportu | Szacowana strata |
| --- | --- |
| Ulepsz dostarczanie obrazów | 964 KiB |
| Używaj efektywnego czasu przechowywania w pamięci podręcznej | 919 KiB |
| Wykrywanie żądań LCP (obraz w SVG, brak `fetchpriority`) | ~1030 ms opóźnienia startu żądania |
| Kod spoza witryny (`supabase.co`) | 1148 KiB |
| Ogranicz nieużywany JavaScript / starszy kod JavaScript | 24 KiB / 14 KiB |

---

## 1. Obrazy idą przez optimizer Nexta (największa zmiana)

`next.config.ts` miał `images.unoptimized: true`, więc **każde** zdjęcie leciało do przeglądarki
prosto z Supabase w oryginale:

* logo `EBE_Power_1_upscaled.jpeg` — **8000×3572 px / 791,5 KiB** wyświetlane jako **149×66 px**,
* miniatury produktów — JPEG-i bez konwersji do formatów nowoczesnych,
* brak `srcset` → ten sam plik na telefonie i na monitorze 4K,
* `Cache-Control: max-age=3600` z `supabase.co` (third-party, nie do zmiany z naszej strony).

Po zmianie wszystkie obrazy serwuje `/_next/image` (sharp): skalowanie do realnego rozmiaru,
AVIF/WebP wg `Accept`, `srcset` + `sizes`, `Cache-Control: public, max-age=2592000`
(30 dni, z `images.minimumCacheTTL`), odpowiedź tego samego pochodzenia (znika audit
„kod spoza witryny” i „krótki czas cache”).

Pomiar lokalny na pliku testowym 2400×1800 (JPEG 687 KiB):

| wariant | rozmiar |
| --- | --- |
| oryginał JPEG | 686 909 B |
| `w=1200` AVIF | 36 199 B |
| `w=828` AVIF | 21 978 B |
| `w=320` AVIF | 5 835 B |

Czyli **−97 %** dla wariantu 828 px. Dokładnie ten mechanizm obsługuje teraz logo
(156 px → warianty `160w`/`320w`, ~6–15 KiB zamiast 791 KiB) i zdjęcia produktów.

Konfiguracja:

* `formats: ["image/avif", "image/webp"]`,
* `imageSizes`/`deviceSizes` ograniczone do szerokości, których realnie używamy — ta lista jest
  jednocześnie listą kandydatów w `srcset`, więc każdy zbędny wpis to ~190 znaków URL-a
  w HTML-u **przy każdym obrazku** (i dodatkowy wariant do wyliczenia przez sharp),
* `qualities: [60, 70, 75]` (60 dla dekoracyjnego tła nagłówka kategorii),
* `minimumCacheTTL: 30 dni`, `maximumDiskCacheSize: 32 MB`,
* usunięta martwa reguła `headers()` dla `/_next/image` — optimizer ustawia `Cache-Control` sam,
  wpis z `headers()` go nie nadpisywał (było tam `max-age=86400`).

## 2. LCP: zdjęcie hero jest teraz prawdziwym `<img>`, a nie `<image>` w SVG

`HeroShot.tsx` rysował produkt jako `<image href="…">` wewnątrz SVG. Skutki:

* brak optimizera (pełny JPEG ze storage),
* przeglądarka odkrywa takie żądanie dopiero przy renderowaniu drzewa SVG
  (raport: „opóźnienie ładowania zasobu 1030 ms”),
* SVG `<image>` nie przyjmuje ani `loading`, ani `fetchpriority`, ani `srcset`
  → audit „Wykrywanie żądań LCP” był nie do zdania w tej konstrukcji.

Teraz kadr to trzy warstwy w tej samej ramce `relative aspect-[4/3]`:

1. SVG (spód) — biała „karta” z maską o poszarpanej krawędzi i miękkim zaniknięciem,
2. `<img>` — `next/image` (`fill` + `sizes`, `loading="eager"`, `fetchPriority="high"`),
3. SVG (wierzch) — poszarpany zielony border.

Geometria jest przeliczona 1:1 z viewBox 600×450 (`x=70 y=52 w=460 h=345` →
`left/right 11,6667 %`, `top 11,5556 %`, `bottom 11,7778 %`), a `object-contain` odpowiada
`preserveAspectRatio="xMidYMid meet"`. Kolejność warstw ma znaczenie: filtr
`feDisplacementMap` przesuwa obrys o ~7 px, a margines zdjęcia do krawędzi kadru to ~10 px
w pionie — border musi być rysowany **nad** zdjęciem.

Bonus: React 19 sam wykłada taki obraz do `<head>` jako
`<link rel="preload" as="image" fetchPriority="high" imageSrcSet=…>`, więc żądanie startuje
przed parsowaniem reszty dokumentu. Wszystkie dotychczasowe obejścia błędów Safari
(filtry poza `<mask>`, brak filtra na grupie z obrazkiem) zostały zachowane w komentarzach.

## 3. Ikony nie pobierają już 791 KiB

`metadata.icons` (icon / apple / shortcut) wskazywało na ten sam JPEG 8000×3572 co logo,
więc przeglądarka ściągała go jako favicon na każdej podstronie. Wpis usunięty — ikony
serwuje konwencja plikowa App Routera (`src/app/favicon.ico`, 16/32/48 px).
Adres `BRAND_LOGO_URL` został tylko w Open Graph / Twitter / JSON-LD (pobierają go crawlery,
nie przeglądarka przy każdym wejściu) i jest teraz w jednym miejscu: `src/app/lib/brand.ts`.

## 4. TTFB: katalog produktów z Data Cache (60 s zamiast 0)

`CATALOG_REVALIDATE_SECONDS = 0` oznaczało odpytanie Spring Boota przy **każdym** żądaniu
`/`, `/kategoria/**`, `/products/[id]` — a TTFB to pierwsza składowa LCP. Teraz wynik fetcha
żyje 60 s w Data Cache Nexta. Strony zostają przy `export const revalidate = 0`
(render dynamiczny, świeży HTML), buforowane są wyłącznie dane katalogu.

Świeżość po edycji w panelu admina zapewnia istniejący `/api/revalidate`
(`revalidateTag("products", "max")`) — tagi są ustawione przy obu fetchach.

Zweryfikowane lokalnie: przy wyłączonym backendzie strona kategorii w oknie TTL nadal
renderowała produkt istniejący tylko w backendzie (`Pramac PMi 6500`), czyli dane poszły
z cache, a nie z awaryjnego `CATALOG_PRODUCTS`. Przy okazji znika efekt „backend mrugnął →
sklep pokazuje demo-katalog”.

## 5. Mniej JavaScriptu na każdej stronie

* `next/script` (`<Script strategy="beforeInteractive">`) w root layoucie zastąpiony zwykłym
  inline `<script>` — efekt w HTML-u identyczny (skrypt i tak był inline'owany w `<head>`),
  a nie ciągniemy runtime'u `next/script` (osobny chunk ~24 KB / ~7 KB gzip na każdą stronę).
  Razem z drobnicą: **−11 KB surowego / −4,4 KB gzip** JS-u na stronie głównej.
* `experimental.optimizeCss` usunięte: w Next 16 critters działa wyłącznie w Pages Router
  (`postProcessHTML` jest wywoływane tylko z `server/render.js`) i w buildzie webpackowym.
  Ten projekt to App Router + Turbopack, więc flaga była martwa, a ciągnęła `critters`
  z zależnościami (`css-select`, `htmlparser2`, …) do obrazu standalone.
* `optimizePackageImports` rozszerzone o `@supabase/supabase-js` (barrel używany w panelu admina).

## 6. Next 16: `priority` → `loading` / `fetchPriority` / `preload`

W Next 16 prop `priority` na `<Image>` jest przestarzały (alias `preload`). Zamienione:

* logo w nawigacji → `loading="eager"` (bez `high`, żeby nie konkurować z LCP),
* hero → `loading="eager"` + `fetchPriority="high"`,
* główne zdjęcie w galerii produktu (`/products/[id]`, element LCP) → `eager` + `high`,
* nagłówek kategorii → `eager` + `high`, `sizes` z sufitem 1280 px (zamiast `100vw`)
  i `quality={60}` — to dekoracyjne tło pod gradientem, przy 25 % krycia nie widać różnicy,
* karty produktów nad zgięciem → `loading="eager"` bez `high` (wysoki priorytet rezerwujemy
  dla jednego obrazu LCP na stronę).

## 7. Deploy: cache musi być zapisywalny (Cloud Run)

Cloud Run montuje system plików kontenera **read-only**; zapisywalny jest wyłącznie `/tmp`
(tmpfs, wliczany w limit pamięci). Next trzyma tam dwa cache:

* `.next/cache/images` — wyniki optimizera. Bez zapisu każde żądanie `/_next/image`
  pobierałoby oryginał z Supabase i transformowało go od zera (setki ms CPU na zdjęcie),
  czyli cała korzyść z punktu 1 wyparowuje,
* `.next/cache/fetch-cache` — Data Cache z punktu 4.

Stąd w `Dockerfile` (stage `runner`):

```dockerfile
RUN rm -rf /app/.next/cache && ln -s /tmp/next-cache /app/.next/cache
```

Rozmiar cache obrazów jest ograniczony `images.maximumDiskCacheSize: 32 MB`, żeby tmpfs nie
wyparł pamięci potrzebnej aplikacji (bez limitu Next policzyłby 50 % dostępnego „dysku”).
Zapis jest w Next.js owinięty w `try/catch`, więc nawet bez `/tmp` sklep działa — tylko wolniej.

`sharp` (wymagany przez optimizer w produkcji) jest `optionalDependencies` Nexta i trafia do
`.next/standalone/node_modules` automatycznie — sprawdzone, `npm ci` w alpine'owym stage
`deps` instaluje wariant `@img/sharp-linuxmusl-x64`. Dodatkowe kroki w Dockerfile nie są
potrzebne.

---

## Czego celowo NIE ruszaliśmy

| Pozycja z raportu | Dlaczego bez zmian |
| --- | --- |
| „Prośby o zablokowanie renderowania” — 16,4 KiB CSS / 150 ms | To jeden arkusz (Tailwind + `globals.css`), potrzebny do pierwszego painta; inline'owanie całości dodałoby ~15 KiB gzip do **każdego** HTML-a i zabiło cache między podstronami. Sekcja light-mode to tylko ~12 % arkusza, więc jej wydzielanie nic nie daje. `optimizeCss` i tak nie działa w App Routerze. |
| „Starszy kod JavaScript” — 14 KiB | To polyfile core-js dokładane przez Nexta (`polyfill-module`), niezależne od naszego `browserslist`. Wyłączanie ich aliasowaniem wewnętrznych modułów Nexta przy Turbopacku to ryzyko włamania się w runtime. |
| „Ogranicz nieużywany JavaScript” — 24 KiB | Wskazany chunk to `react-dom` — nie da się go dociąć. |
| „Unikaj nieskomponowanych animacji” — 55 elementów | To `transition-colors`/`transition-all` na hover (kolor, border, box-shadow nie są kompozytowalne z definicji). Animacje nie uruchamiają się przy ładowaniu strony (audit nie wpływa na wynik), a ich usunięcie oznaczałoby rezygnację z efektów hover. |
| „Optymalizuj rozmiar DOM” — 1351 elementów | Poniżej progu Lighthouse (1500). Najwięcej dają karty produktów (9 × ~70 elementów) — ich docięcie to decyzja produktowa, nie optymalizacja. |

## Największa pozostała dźwignia (do decyzji)

`next-auth/react` jest ładowany na **każej** stronie: `AuthProvider` (`SessionProvider`)
w root layoucie + `useSession` w `CartContext` i `Navbar`. To ~43 KB surowego / ~13 KB gzip JS-u
(osobny chunk) plus żądanie `/api/auth/session` i 2–3 dodatkowe rendery drzewa konsumentów
kontekstu podczas ładowania. Da się to zdjąć z krytycznej ścieżki (własny, lekki provider sesji
czytający `/api/auth/session` + `signIn`/`signOut` przez przekierowania), ale to ingerencja
w flow logowania (w tym Google OAuth) — bez możliwości przetestowania całości w sandboxie
zostawiamy to jako świadomy, osobny krok.

## Do zrobienia po stronie treści/deployu (poza kodem)

1. **Wgrać mniejsze logo do Supabase** (`product_images/EBE_Power_1_upscaled.jpeg` ma
   8000×3572 px / 791 KiB). Optimizer i tak serwuje miniaturę, ale przy każdym chybieniu
   cache musi pobrać i zdekodować 28-megapikselowy oryginał (~100–300 ms CPU). Wersja
   ~1200 px wystarczy; duży plik warto zostawić tylko jako obraz OG. Szczegóły:
   `src/app/lib/brand.ts`.
2. Po deployu rzucić okiem w DevTools → Network: `/_next/image?...` powinien zwracać
   `content-type: image/avif`, `cache-control: public, max-age=2592000, must-revalidate`,
   a przy drugim żądaniu `x-nextjs-cache: HIT`.
3. Odpalić Lighthouse ponownie na produkcji (ten plik opisuje zmiany, nie wyniki pomiaru —
   w sandboxie nie ma dostępu do `supabase.co`, więc pomiary obrazów były robione na
   lokalnym pliku testowym przez ten sam pipeline).
4. Cloud Run: `/tmp` jest tmpfs-em — przy 512 MB pamięci 32 MB cache obrazów jest bezpieczne,
   przy mniejszym limicie warto obniżyć `IMAGE_DISK_CACHE_BYTES` w `next.config.ts`.

## Jak to zweryfikować lokalnie

```bash
npm --prefix frontend ci
npm run dev:backend        # atrapa Spring Boota (produkty z data.sql)
npm --prefix frontend run build && npm --prefix frontend run start
```

W HTML-u strony głównej powinno być: 0 znaczników `<image>` w SVG, wszystkie `<img>` ze
`src="/_next/image?url=…"`, hero z `fetchPriority="high" loading="eager"`, w `<head>`
`<link rel="preload" as="image" … fetchPriority="high">` i wyłącznie lokalny `favicon.ico`.
