import type { NextConfig } from "next";

/**
 * Ile sekund zoptymalizowany obraz żyje w pamięci podręcznej.
 *
 * `images.minimumCacheTTL` steruje DWIEMA warstwami naraz:
 *   1. cache optimizera po stronie serwera (pliki w `.next/cache/images`,
 *      na Cloud Run przez symlink w `/tmp` — patrz Dockerfile),
 *   2. nagłówek `Cache-Control: public, max-age=<TTL>, must-revalidate`,
 *      który Next ustawia SAM w odpowiedzi `/_next/image` (własny wpis
 *      w `headers()` i tak by go nie nadpisał — dlatego go tu nie ma).
 *
 * Adres `/_next/image?url=…&w=…&q=…` jest deterministyczny dla danej
 * kombinacji parametrów, więc długi TTL jest bezpieczny: podmiana zdjęcia
 * w storage (ten sam URL) i tak nie byłaby widoczna wcześniej, bo serwer
 * trzyma własną kopię przez `minimumCacheTTL`.
 *
 * Efekt dla Lighthouse: audit „Używaj efektywnego czasu przechowywania
 * w pamięci podręcznej" wskazywał ~919 KiB zdjęć z `supabase.co` z TTL 1 h —
 * teraz obrazy są tego samego pochodzenia i mają TTL 30 dni.
 */
const IMAGE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dni

/**
 * Limit cache obrazów na dysku.
 *
 * Na Cloud Run zapisywalny jest wyłącznie `/tmp`, który jest tmpfs-em
 * (czyli zajmuje pamięć RAM instancji) — patrz symlink w `Dockerfile`.
 * Bez twardego limitu Next policzyłby go jako 50% dostępnego „dysku"
 * i mógłby zjeść pamięć potrzebną sharpowi.
 */
const IMAGE_DISK_CACHE_BYTES = 32 * 1024 * 1024; // 32 MB

const nextConfig: NextConfig = {
    output: "standalone",
    compress: true,
    poweredByHeader: false,
    // Trailing slashes — consistent URLs for SEO (no duplicates)
    trailingSlash: false,
    experimental: {
        // `optimizeCss` (critters) celowo WYŁĄCZONE: w Next 16 ten krok działa
        // wyłącznie w Pages Router (post-process HTML w `server/render.js`) i w
        // buildzie webpackowym. Ten projekt to App Router + Turbopack, więc flaga
        // nic nie robiła, a ciągnęła `critters` z zależnościami do obrazu
        // standalone (niepotrzebne MB i dłuższy cold start).
        optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
    },
    images: {
        // WAŻNE: `unoptimized: true` jest usunięte. Bez niego każde zdjęcie leciało
        // do przeglądarki prosto z Supabase w oryginalnym rozmiarze i formacie
        // (logo 8000×3572 / 791 KiB wyświetlane jako 149×66 px, miniatury produktów
        // jako JPEG). Teraz przechodzą przez optimizer Nexta (`/_next/image`),
        // który skaluje je do faktycznego rozmiaru wyświetlania i konwertuje
        // na AVIF/WebP — Lighthouse liczył tu ~964 KiB oszczędności na samej
        // stronie głównej.
        // WebP jest celowo pierwszym i jedynym formatem negocjowanym. AVIF bywa
        // o kilka procent mniejszy, ale jego kodowanie przy pierwszym trafieniu
        // w cache na Cloud Run trwa wielokrotnie dłużej. Raport wskazał 2,37 s
        // samego ładowania LCP; WebP usuwa kosztowne kodowanie AVIF z cold path,
        // zachowując bardzo dobrą kompresję i wsparcie wszystkich przeglądarek
        // z naszego browserslist.
        formats: ["image/webp"],
        // Lista szerokości jest jednocześnie listą kandydatów w `srcset` dla
        // zdjęć z `fill`/`sizes` — każdy dodatkowy wpis to ~190 znaków URL-a
        // w HTML-u przy KAŻDYM obrazku (i dodatkowy wariant do wygenerowania
        // przez optimizer). Dlatego tylko szerokości, których realnie używamy:
        //   64/128      — miniatury w galerii produktu (`sizes="64px"`, DPR 1–2)
        //   160/320     — logo w nawigacji (156 px × DPR 1–2)
        //   256/384     — karty produktów na telefonie
        //   640–1200    — karty/kafele kategorii, galeria produktu
        //   1920        — tło nagłówka kategorii na dużym ekranie (DPR 2)
        imageSizes: [64, 128, 160, 256, 320, 384],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        qualities: [60, 70, 75],
        minimumCacheTTL: IMAGE_CACHE_TTL_SECONDS,
        maximumDiskCacheSize: IMAGE_DISK_CACHE_BYTES,
        // `dangerouslyAllowSVG` pozostaje wyłączone: next/image i tak obsługuje
        // źródła `.svg` specjalnym przypadkiem (`unoptimized = true`), więc SVG
        // wgrany przez panel admina omija optimizer i wyświetla się bez zmian.
        remotePatterns: [
            {
                // `*.supabase.co` obejmuje też host projektu
                // (iyugrhskjjyegxppeqoj.supabase.co) — jeden wzorzec zamiast dwóch.
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    async headers() {
        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://m.stripe.network;
            style-src 'self' 'unsafe-inline';
            img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://unsplash.com;
            font-src 'self' data:;
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
            connect-src 'self' https://api.stripe.com https://m.stripe.network https://*.supabase.co;
        `.replace(/\s{2,}/g, ' ').trim();

        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: cspHeader,
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                ],
            },
            // Next sam ustawia `public, max-age=31536000, immutable` dla
            // fingerprintowanych plików `/_next/static/*`. Nie duplikujemy tej
            // reguły — własny nagłówek powodował ostrzeżenie podczas buildu i
            // mógł psuć zachowanie `next dev`.
            //
            // Celowo brak również własnego `Cache-Control` dla `/_next/image`.
            // Optimizer ustawia go sam (`public, max-age=<minimumCacheTTL>,
            // must-revalidate`).
        ];
    },
    async redirects() {
        return [
            // Redirect trailing slash to non-trailing slash for canonical URLs
            {
                source: "/kategoria/:slug/",
                destination: "/kategoria/:slug",
                permanent: true,
            },
            {
                source: "/products/:id/",
                destination: "/products/:id",
                permanent: true,
            },
            // Stara taksonomia agregatów (jedna kategoria + podkategorie)
            // → nowy podział na 4 kategorie po rodzaju napędu
            {
                source: "/kategoria/agregaty",
                destination: "/kategoria",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/inwerterowe",
                destination: "/kategoria/inwerterowe",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/gazowe",
                destination: "/kategoria/gazowe",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/benzynowe",
                destination: "/kategoria/benzynowe",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/diesla",
                destination: "/kategoria/diesla",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
