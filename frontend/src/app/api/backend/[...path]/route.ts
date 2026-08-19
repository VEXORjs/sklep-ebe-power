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
    const path = req.nextUrl.pathname.replace(/^\/api\/backend/, "");
    const targetUrl = `${BACKEND_BASE}${path}${req.nextUrl.search}`;

    // Buforujemy ciało — małe payloady (JSON, formularze), unikamy problemów
    // ze streamingiem requestu w Node fetch (duplex).
    let body: BodyInit | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
        const buf = Buffer.from(await req.arrayBuffer());
        if (buf.length > 0) {
            body = buf;
        }
    }

    const headers = new Headers();
    req.headers.forEach((value, key) => {
        if (HOP_BY_HOP.has(key.toLowerCase())) return;
        // Origin/Referer przeglądarki byłyby domeną frontendu — backend i tak
        // widzi przychodzące połączenie serwer-serwer; nadpisywanie tych
        // nagłówków tylko myliłoby konfigurację CORS.
        if (key.toLowerCase() === "origin") return;
        if (key.toLowerCase() === "referer") return;
        headers.append(key, value);
    });

    if (BACKEND_MISCONFIGURED) {
        return new Response(
            JSON.stringify({
                error: "backend_not_configured",
                message:
                    "Ustaw zmienną środowiskową API_URL na wewnętrzny adres backendu Spring Boot.",
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
        );
    }

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
        return new Response(
            JSON.stringify({
                error: "backend_unreachable",
                message:
                    "Nie można połączyć się z backendem. Sprawdź zmienną API_URL.",
            }),
            {
                status: 502,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (HOP_BY_HOP.has(lower)) return;
        // Usuwamy nagłówki CORS — odpowiedź jest teraz tego samego pochodzenia,
        // a pozostawienie starych wartości (z innym Origin) myli przeglądarki.
        if (lower.startsWith("access-control-")) return;
        responseHeaders.append(key, value);
    });

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
