/**
 * Kanoniczny adres frontendu (używany m.in. jako Stripe return_url).
 *
 * Na produkcji musi wskazywać na https://sklep.ebe-power.pl — nigdy na
 * https://frontend-...run.app, który jest wewnętrznym adresem Cloud Run.
 *
 * Kolejność źródeł:
 * 1. NEXT_PUBLIC_APP_URL — ustawiane jako ARG podczas `docker build` / Cloud Build
 * 2. NEXT_PUBLIC_SITE_URL — alias dla kompatybilności
 * 3. window.location.origin — z runtime, z sanitacją `run.app` -> ebe-power.pl
 * 4. hardcoded fallback https://sklep.ebe-power.pl
 */
export function getSiteUrl(): string {
    const envUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

    if (envUrl && envUrl.trim().length > 0) {
        return envUrl.replace(/\/$/, "");
    }

    if (typeof window !== "undefined" && window.location?.origin) {
        const origin = window.location.origin.replace(/\/$/, "");
        // Nigdy nie zwracamy adresu Cloud Run jako return_url —
        // Stripe wyśle użytkownika z powrotem na run.app zamiast na domenę.
        // W dev (localhost / cloudworkstations) zostawiamy origin.
        if (origin.includes("run.app")) {
            return "https://sklep.ebe-power.pl";
        }
        return origin;
    }

    return "https://sklep.ebe-power.pl";
}

/** @deprecated użyj getSiteUrl() */
export function getAppUrl(): string {
    return getSiteUrl();
}
