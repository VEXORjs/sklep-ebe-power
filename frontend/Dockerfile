# --- Etap 1: Instalacja zależności ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- Etap 2: Budowanie aplikacji ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Informujemy Next.js, że budujemy obraz wewnątrz Dockera
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

ARG NEXT_PUBLIC_APP_URL=https://sklep.ebe-power.pl
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

ARG NEXT_PUBLIC_SITE_URL=https://sklep.ebe-power.pl
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ARG NEXTAUTH_URL=https://sklep.ebe-power.pl
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN npm run build

# --- Etap 3: Środowisko produkcyjne ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# NEXTAUTH_URL musi być ustawione RÓWNIEŻ tutaj (stage "runner"), a nie tylko
# w stage "builder". NextAuth czyta je w RUNTIME i buduje z niego redirect_uri
# wysyłane do Google (https://<domena>/api/auth/callback/google). Bez tej
# zmiennej w kontenerze NextAuth zgaduje adres po nagłówku Host żądania — gdy
# aplikacja jest wywoływana przez adres *.run.app (np. health-check Google),
# redirect_uri nie zgadza się z tym zarejestrowanym w Google Cloud Console
# i dostajemy błąd 400: redirect_uri_mismatch.
ARG NEXTAUTH_URL=https://sklep.ebe-power.pl
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# Kopiujemy tylko niezbędne pliki statyczne i wygenerowany serwer standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public

# Cache Next.js MUSI być zapisywalny, a Cloud Run montuje system plików
# kontenera jako read-only — jedynym zapisywalnym miejscem jest /tmp (tmpfs,
# wliczany w limit pamięci instancji).
#
# Co tu trafia:
#   • `.next/cache/images`  — wyniki optimizera obrazów (sharp). Bez tego każde
#     żądanie `/_next/image` pobierałoby oryginał z Supabase i transformowało go
#     od zera (setki ms CPU na zdjęcie), co zjada całą korzyść z optymalizacji.
#     Rozmiar jest ograniczony `images.maximumDiskCacheSize` (32 MB) w
#     next.config.ts, żeby tmpfs nie wyparł pamięci potrzebnej aplikacji.
#   • `.next/cache/fetch-cache` — Data Cache, z którego `productService` czyta
#     katalog produktów (TTL 5 min, czyszczony przez `/api/revalidate`).
#
# Zapis do cache i tak jest w Next.js owinięty w try/catch, więc nawet gdyby
# /tmp był niedostępny, sklep działa dalej — tylko wolniej.
RUN rm -rf /app/.next/cache && ln -s /tmp/next-cache /app/.next/cache

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
