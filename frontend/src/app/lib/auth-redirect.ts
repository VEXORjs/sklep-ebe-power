/**
 * NextAuth wrzuca do ?callbackUrl= pełny adres (z protokołem i hostem).
 * next/navigation.router.push() oraz część przekierowań traktują to jak ścieżkę
 * względną — w pasku pojawia się wtedy "/https://..." albo sam początek URL-a
 * bez domeny. Zostawiamy wyłącznie lokalną ścieżkę.
 */
export function safeCallbackUrl(raw: string | null | undefined, fallback = "/"): string {
    if (!raw) return fallback;

    let value = raw.trim();
    if (!value) return fallback;

    try {
        if (/^https?:\/\//i.test(value)) {
            const url = new URL(value);
            value = `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        return fallback;
    }

    if (!value.startsWith("/") || value.startsWith("//")) {
        return fallback;
    }

    // Nie wracamy na ekrany auth — kończyłoby się pętlą po udanym logowaniu.
    if (value.startsWith("/auth/") || value.startsWith("/api/auth")) {
        return fallback;
    }

    return value || fallback;
}

export function currentPathCallbackUrl(): string {
    if (typeof window === "undefined") return "/";
    return safeCallbackUrl(`${window.location.pathname}${window.location.search}`);
}
