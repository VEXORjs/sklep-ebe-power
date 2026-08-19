/** Publiczny adres API (przeglądarka). */
export function getPublicApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

/** Adres API po stronie serwera Next.js. */
export function getServerApiUrl(): string {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}
