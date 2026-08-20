# Wdrażanie i weryfikacja produkcji (ebe-power.pl)

## Objaw, który ten dokument wyjaśnia

Konsola przeglądarki na https://ebe-power.pl pokazywała:

```
Błąd pobierania koszyka: Error: Błąd: 404
Error: Błąd podczas dodawania do koszyka
```

Diagnostyka wykazała, że `GET https://ebe-power.pl/api/backend/api/cart`
zwraca **stronę 404 renderowaną przez Next.js** (HTML), a nie odpowiedź
z backendu ani JSON proxy. Ponieważ `/api/auth/*` działało, usługa Cloud Run
żyła — ale serwowana rewizja **nie zawierała działającego handlera
`/api/backend/[...path]`** (wdrożenie było nieaktualne względem `master`).
Kod na bieżącym `master` został zweryfikowany lokalnie w trybie produkcyjnym
(`output: "standalone"`, jak w Dockerfile) — proxy działa poprawnie.

## Rozwiązanie: pełny redeploy frontendu

1. Upewnij się, że trigger Cloud Build wskazuje na gałąź `master` i uruchom go
   ponownie (albo ręcznie):

   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

2. Upewnij się, że usługa Cloud Run `frontend` ma ustawioną zmienną
   **środowiskową `API_URL`** (wewnętrzny adres backendu Spring Boot, np.
   `https://trafo-xxxx.europe-west1.run.app`). Bez niej proxy odpowie
   celowo czytelnym błędem `502 {"error":"backend_not_configured"}`.

3. Zweryfikuj wdrożenie — **jedno żądanie wystarczy**:

   ```bash
   curl -i https://ebe-power.pl/api/backend
   ```

   Poprawna odpowiedź to JSON podobny do:

   ```json
   {"ok":true,"proxy":"ebe-power-proxy/2","revision":"frontend-00042-abc","backend":{"configured":true,"host":"trafo-xxxx.europe-west1.run.app"}}
   ```

   Jeżeli zamiast tego widać stronę HTML „404 / This page could not be found.”
   → **usługa nadal serwuje stare wydanie** (sprawdź tag `:v1` w Artifact
   Registry i aktualną rewizję Cloud Run).

4. Kontrolnie, pełna ścieżka koszyka (bez logowania zwraca koszyk gościa):

   ```bash
   curl -i https://ebe-power.pl/api/backend/api/cart
   # oczekiwane: 200 + {"items":[],"totalItems":0,"isGuest":true}
   # oraz nagłówek:  X-Backend-Proxy: ebe-power-proxy/2
   ```

5. Jeżeli mimo poprawnego wdrożenia odpowiedzi nadal są stare, a przed
   usługą stoi Cloud CDN — wyczyść cache:

   ```bash
   gcloud compute url-maps invalidate-cdn-cache <URL_MAP> --path "/api/*"
   ```

## Backend: usługa `trafo` musi serwować Spring Boot, nie frontend

Drugi, niezależny powód 404 na koszyku: usługa Cloud Run **`trafo`**
(to na nią wskazuje `API_URL` frontendu) serwowała **HTML sklepu Next.js**
zamiast API Spring Boot. Trigger Cloud Build o nazwie `backend` budował
główny `cloudbuild.yaml` (`./frontend`) i wdrażał ten obraz na `trafo`.
Wtedy:

```
curl https://trafo-….europe-west1.run.app/api/products
# HTML sklepu  →  frontend nadpisał backend
# JSON produktów → Spring działa
```

Proxy na ebe-power.pl jest wtedy sprawne (`X-Backend-Proxy: ebe-power-proxy/2`),
ale upstream zwraca 404 HTML, więc koszyk i tak sypie błędem.

### Naprawa — w tej kolejności

Projekt GCP: `trafo-500415`, region: `europe-west1`.

**1. Zdejmij wadliwy trigger, zanim znowu nadpisze backend:**

```bash
gcloud builds triggers delete backend --project trafo-500415
```

**2. Wdróż prawdziwy backend** (Dockerfile w `./backend`):

```bash
gcloud run deploy trafo --source ./backend --region europe-west1 --project trafo-500415
```

Albo, po zmergowaniu tego PR, przez Cloud Build:

```bash
gcloud builds submit --config backend/cloudbuild.yaml --project trafo-500415
```

**3. Zmienne środowiskowe.** Bez `SPRING_DATASOURCE_URL` Spring połączy się
z hostem Dockera `postgres-db` (nieistniejącym na Cloud Run) i nie wstanie.
`MAIL_USERNAME` / `MAIL_PASSWORD` mają puste defaulty w
`application.properties` — brak ich nie zabija startu, ale poczta nie wyjdzie.

```bash
# host bazy:
gcloud sql instances list --project trafo-500415

gcloud run services update trafo --region europe-west1 --project trafo-500415 \
  --update-env-vars SPRING_DATASOURCE_URL='jdbc:postgresql://<HOST_BAZY>:5432/sklep_db' \
  --update-env-vars SPRING_DATASOURCE_USERNAME=shop_user \
  --update-env-vars SPRING_DATASOURCE_PASSWORD='<hasło>' \
  --update-env-vars MAIL_USERNAME='<mailtrap-user>' \
  --update-env-vars MAIL_PASSWORD='<mailtrap-pass>'
# + dla płatności: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

`--update-env-vars` dopisuje, nie czyści. Nie używaj `--set-env-vars`.

**4. Weryfikacja:**

```bash
curl -s https://trafo-1078992546635.europe-west1.run.app/api/products | head -c 150
# JSON z produktami = Spring działa (HTML sklepu = nadal frontend)

curl -s https://ebe-power.pl/api/backend/api/cart
# oczekiwane: {"items":[],"totalItems":0,"isGuest":true}
```

`API_URL` na usłudze `frontend` zostaje jak jest — wskazuje na tę samą
usługę `trafo`, która od teraz serwuje właściwą aplikację.

### Odtworzenie triggera (żeby nie wrócił błąd)

```bash
gcloud builds triggers create github \
  --name=backend \
  --repo-owner=VEXORjs \
  --repo-name=trafo \
  --branch-pattern='^master$' \
  --build-config=backend/cloudbuild.yaml \
  --project=trafo-500415 \
  --region=europe-west1
```

Kluczowe: `--build-config=backend/cloudbuild.yaml`. Ten plik buduje
`./backend` i wdraża **wyłącznie** na usługę `trafo` (nazwa zahardkodowana,
nie substytucja). Główny `cloudbuild.yaml` analogicznie wdraża wyłącznie
na `frontend`.

## Ułatwienia wprowadzone w kodzie

- `src/app/api/backend/[[...path]]/route.ts`
  - Segment jest teraz **opcjonalny**: samo `GET /api/backend` zwraca
    diagnostyczny JSON (host backendu, rewizja Cloud Run `K_REVISION`).
  - Każda odpowiedź proxy (także błędy 502) ma nagłówek
    **`X-Backend-Proxy: ebe-power-proxy/2`** — w DevTools od razu widać,
    czy żądanie dotarło do proxy, czy skończyło na stronie 404.
  - Odpowiedzi proxy dostają `Cache-Control: no-store`, żeby warstwy
    pośrednie nie przetrzymywały starych błędów w negatywnym cache.
- `src/app/context/CartContext.tsx`
  - Błędy HTTP zawierają teraz kod statusu i ścieżkę żądania, np.
    `Błąd podczas dodawania do koszyka: HTTP 404 na /api/backend/api/cart/…/add?…`,
    więc przyszłe logi w konsoli są jednoznaczne.

## Uwagi poboczne

- Ostrzeżenie Firefox `treść … https://ebe-power.pl/ nie może zostać
  wczytana lub powiązana z file:///` **nie pochodzi z aplikacji** — to
  zabezpieczenie przeglądarki przy próbie powiązania strony z zasobem
  lokalnym `file:///` (np. rozszerzenie przeglądarki albo lokalnie zapisany
  plik). Nie wymaga działań w kodzie.
- DNS: `ebe-power.pl` (bez www) wskazuje na infrastrukturę Google
  (usługa Cloud Run), natomiast `www.ebe-power.pl` wskazuje na inny hosting.
  Warto ujednolicić rekord `www`, żeby cały ruch trafiał do sklepu Next.js.
