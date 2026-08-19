/**
 * Bazowy adres API dla kodu działającego w PRZEGLĄDARCE.
 *
 * Na produkcji (https://ebe-power.pl) NIGDY nie zwracamy bezwzględnego
 * adresu backendu — przeglądarka mówiłaby użytkownikowi, by łączył się z
 * `http://localhost:8080`, co z wiadomych przyczyn nie działa (CORS,
 * mixed-content, 127.0.0.1 u klienta). Zamiast tego zwracamy ścieżkę
 * względną `/api/backend`, która jest serwowana przez Next.js i proxowana
 * do Spring Boota (zob. src/app/api/backend/[...path]/route.ts). Dzięki
 * temu żądanie jest tego samego pochodzenia (same-origin) — bez CORS.
 *
 * Lokalnie (npm run dev / Docker) zwracamy bezpośrednio backend, żeby można
 * było go uruchomić osobno.
 */
export function getPublicApiUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (explicit && explicit.length > 0) {
        return explicit.replace(/\/$/, "");
    }

    if (process.env.NODE_ENV === "production") {
        return "/api/backend";
    }

    return "http://localhost:8080";
}

/**
 * Adres backendu po stronie SERWERA Next.js (SSR / route handler).
 *
 * To jest połączenie serwer-serwer, więc tu bezwzględny adres jest
 * wymagany. W produkcji należy ustawić `API_URL` (lub `NEXT_PUBLIC_API_URL`)
 * na wewnętrzny adres Spring Boota, np.
 * `https://backend-....europe-west1.run.app` albo `http://backend-api:8080`
 * w sieci Cloud Run / Docker Compose.
 */
export function getServerApiUrl(): string {
    const explicit =
        process.env.API_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim();
    if (explicit && explicit.length > 0) {
        return explicit.replace(/\/$/, "");
    }

    return "http://localhost:8080";
}

export { getSiteUrl, getAppUrl } from "./site";
