import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerApiUrl } from "@/app/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_BASE = getServerApiUrl();

const BACKEND_MISCONFIGURED =
    process.env.NODE_ENV === "production" &&
    !process.env.API_URL?.trim() &&
    !process.env.NEXT_PUBLIC_API_URL?.trim();

const HOP_BY_HOP = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
]);

const RESPONSE_HEADERS_TO_STRIP = new Set([
    ...HOP_BY_HOP,
    // Node/undici automatycznie rozpakowuje gzip/br, ale potrafi zachować
    // oryginalne nagłówki upstreamu. Gdybyśmy odesłali je 1:1, Firefox kończy
    //łby żądanie błędem `NS_ERROR_INVALID_CONTENT_ENCODING`.
    "content-encoding",
    "content-length",
]);

/**
 * Nagłówek-marker dodawany do KAŻDEJ odpowiedzi tego handlera (także błędów).
 * Pozwala jednym rzutem oka w devtools/curl sprawdzić, że żądanie w ogóle
 * trafiło do proxy, a nie np. na domyślną stronę 404 Next.js starego wydania
 * (to była przyczyna produkcyjnego "Błąd: 404" przy koszyku).
 */
const PROXY_MARKER = "ebe-power-proxy/2";

function jsonError(status: number, error: string, message: string): Response {
    return new Response(JSON.stringify({ error, message }), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "X-Backend-Proxy": PROXY_MARKER,
        },
    });
}

function validateBackendBase(req: NextRequest): Response | null {
    let backendUrl: URL;
    try {
        backendUrl = new URL(BACKEND_BASE);
    } catch {
        return jsonError(
            502,
            "backend_invalid_url",
            "Zmienna API_URL musi być bezwzględnym adresem backendu Spring Boot (http/https)."
        );
    }

    if (backendUrl.origin === req.nextUrl.origin) {
        return jsonError(
            502,
            "backend_points_to_frontend",
            "Zmienna API_URL wskazuje na domenę frontendu zamiast na backend Spring Boot. Ustaw wewnętrzny adres usługi backendu."
        );
    }

    return null;
}

/**
 * Bramka autoryzacji API panelu administratora.
 *
 * Żądania do /api/admin/** i /api/orders/** wymagają sesji NextAuth z rolą
 * ADMIN (rola pochodzi z backendu i jest zapisywana w tokenie sesji przy
 * logowaniu przez /admin/login). Weryfikacja dzieje się na serwerze Next.js —
 * nie wymaga współdzielenia sekretu z backendem i działa od razu po wdrożeniu,
 * jako pierwsza linia obrony przed bezpośrednim wywołaniem API z przeglądarki.
 * Drugą linią jest AdminAuthFilter po stronie Spring Boota.
 */
async function authorizeAdminApi(req: NextRequest, path: string): Promise<Response | null> {
    if (!(path.startsWith("/api/admin") || path.startsWith("/api/orders"))) {
        return null;
    }

    let token = null;
    try {
        token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    } catch (error) {
        console.error("[backend-proxy] Błąd weryfikacji sesji:", error);
    }

    if (!token) {
        return jsonError(
            401,
            "admin_unauthorized",
            "Brak aktywnej sesji. Zaloguj się w panelu administratora (/admin/login)."
        );
    }

    if (token.role !== "ADMIN") {
        return jsonError(
            403,
            "admin_forbidden",
            "To konto nie ma uprawnień administratora."
        );
    }

    return null;
}

/**
 * Diagnostyka wdrożenia — GET /api/backend (bez żadnej ścieżki za proxy).
 *
 * Dzięki temu endpointowi po KAŻDYM deployu można jednym żądaniem stwierdzić,
 * że aktualna rewizja Cloud Run w ogóle serwuje ten handler. Gdyby handler
 * nie istniał w wydaniu, Next.js zwróciłby tu stronę 404 (HTML) — tak właśnie
 * wyglądał produkcyjny błąd koszyka ("Błąd: 404" przy pobieraniu/dodawaniu).
 *
 * Zwracamy tylko host backendu (bez pełnego URL-a) i rewizję Cloud Run
 * (K_REVISION jest wstrzykiwane automatycznie przez platformę).
 */
function healthResponse(req: NextRequest): Response {
    let backend: { configured: boolean; host: string | null } | { configured: false; host: null; reason: string };
    try {
        const url = new URL(BACKEND_BASE);
        const pointsToSelf = url.origin === req.nextUrl.origin;
        backend = {
            configured: !BACKEND_MISCONFIGURED && !pointsToSelf,
            host: url.host,
            ...(BACKEND_MISCONFIGURED ? { reason: "missing_api_url_env" } : {}),
            ...(pointsToSelf ? { reason: "api_url_points_to_frontend" } : {}),
        } as { configured: boolean; host: string | null };
    } catch {
        backend = { configured: false, host: null, reason: "invalid_api_url" };
    }

    return new Response(
        JSON.stringify({
            ok: true,
            proxy: PROXY_MARKER,
            revision: process.env.K_REVISION ?? null,
            backend,
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
                "X-Backend-Proxy": PROXY_MARKER,
            },
        }
    );
}

/**
 * Proxy z `/api/backend/*` na backend Spring Boot.
 *
 * Przeglądarka łączy się z tą samą domeną (https://sklep.ebe-power.pl), więc nie ma
 * ani CORS, ani mixed-content. Next.js dopiero po stronie serwera łączy się z
 * wewnętrznym adresem backendu (API_URL), którego adres nie jest wypalany w
 * klienckim bundle.
 *
 * Ścieżka z catch-all jest dołączana wprost, np.
 *   /api/backend/api/cart/123/add -> ${BACKEND_BASE}/api/cart/123/add
 *
 * Segment jest OPCJONALNY ([[...path]]), więc samo /api/backend zwraca
 * diagnostykę (zob. healthResponse) zamiast strony 404.
 */
async function proxy(req: NextRequest): Promise<Response> {
    const pathname = req.nextUrl.pathname.replace(/\/+$/, "") || "/";

    // Diagnostyka wdrożenia — tylko dla korzenia proxy.
    if ((req.method === "GET" || req.method === "HEAD") && pathname === "/api/backend") {
        return healthResponse(req);
    }

    if (BACKEND_MISCONFIGURED) {
        return jsonError(
            502,
            "backend_not_configured",
            "Ustaw zmienną środowiskową API_URL na wewnętrzny adres backendu Spring Boot."
        );
    }

    const backendValidationError = validateBackendBase(req);
    if (backendValidationError) {
        return backendValidationError;
    }

    const path = req.nextUrl.pathname.replace(/^\/api\/backend/, "");
    const targetUrl = `${BACKEND_BASE}${path}${req.nextUrl.search}`;

    // API panelu administratora — tylko sesje z rolą ADMIN
    const adminAuthError = await authorizeAdminApi(req, path);
    if (adminAuthError) {
        return adminAuthError;
    }

    let body: BodyInit | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
        const buf = Buffer.from(await req.arrayBuffer());
        if (buf.length > 0) {
            body = buf;
        }
    }

    const headers = new Headers();
    req.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (HOP_BY_HOP.has(lower)) return;
        if (lower === "origin") return;
        if (lower === "referer") return;
        if (lower === "accept-encoding") return;
        headers.append(key, value);
    });
    headers.set("accept-encoding", "identity");

    let upstream: Response;
    try {
        upstream = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
            redirect: "follow",
            cache: "no-store",
        });
    } catch (err) {
        console.error("[backend-proxy] Brak połączenia z backendem", {
            targetUrl,
            error: err instanceof Error ? err.message : err,
        });
        return jsonError(
            502,
            "backend_unreachable",
            "Nie można połączyć się z backendem. Sprawdź zmienną API_URL."
        );
    }

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (RESPONSE_HEADERS_TO_STRIP.has(lower)) return;
        if (lower.startsWith("access-control-")) return;
        responseHeaders.append(key, value);
    });
    // no-store przy odpowiedzi i brak cache'owalnych nagłówków z backendu —
    // żadna warstwa pośrednia (Cloud CDN / browser cache) nie może
    // z negatywnym cache'em przetrzymać starego błędu (np. 404).
    responseHeaders.set("Cache-Control", "no-store");
    responseHeaders.set("X-Backend-Proxy", PROXY_MARKER);

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
