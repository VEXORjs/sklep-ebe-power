import { NextRequest } from "next/server";
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

function jsonError(status: number, error: string, message: string): Response {
    return new Response(JSON.stringify({ error, message }), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
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
 * Proxy z `/api/backend/*` na backend Spring Boot.
 *
 * Przeglądarka łączy się z tą samą domeną (https://ebe-power.pl), więc nie ma
 * ani CORS, ani mixed-content. Next.js dopiero po stronie serwera łączy się z
 * wewnętrznym adresem backendu (API_URL), którego adres nie jest wypalany w
 * klienckim bundle.
 *
 * Ścieżka z catch-all jest dołączana wprost, np.
 *   /api/backend/api/cart/123/add -> ${BACKEND_BASE}/api/cart/123/add
 */
async function proxy(req: NextRequest): Promise<Response> {
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
    responseHeaders.set("Cache-Control", "no-store");

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
