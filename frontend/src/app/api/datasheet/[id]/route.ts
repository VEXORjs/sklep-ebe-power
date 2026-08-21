import { NextRequest } from "next/server";
import { supabaseCatalogPdf } from "@/app/lib/supabase-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin proxy karty katalogowej (PDF) z bucketu Supabase.
 *
 * Przeglądarka nie może wiarygodnie zrobić HEAD/GET bezpośrednio do storage
 * (CORS, atrybut `download` jest ignorowany dla obcego originu), dlatego
 * przycisk na karcie produktu linkuje tutaj:
 *
 *   GET  /api/datasheet/12  → strumień PDF (Content-Disposition: attachment)
 *   HEAD /api/datasheet/12  → 200 gdy plik jest, 404 gdy go brak
 *
 * Pobieramy wyłącznie URL wyliczony z ID — żadnych dowolnych adresów (SSRF).
 */
function datasheetUrl(idParam: string): string | null {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0 || id > 1_000_000) return null;
    return supabaseCatalogPdf(id);
}

async function fetchUpstream(idParam: string): Promise<{ status: number; upstream?: Response }> {
    const url = datasheetUrl(idParam);
    if (!url) return { status: 400 };

    try {
        const upstream = await fetch(url, { cache: "no-store", redirect: "follow" });
        if (!upstream.ok) {
            return { status: upstream.status === 404 ? 404 : 502 };
        }
        return { status: 200, upstream };
    } catch (error) {
        console.error("[datasheet] nie udało się pobrać PDF z Supabase", {
            id: idParam,
            error: error instanceof Error ? error.message : error,
        });
        return { status: 502 };
    }
}

export async function HEAD(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { status } = await fetchUpstream(id);
    return new Response(null, {
        status,
        headers: { "Cache-Control": "no-store" },
    });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { status, upstream } = await fetchUpstream(id);

    if (!upstream || !upstream.body) {
        return new Response("Nie znaleziono karty katalogowej.", {
            status,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        });
    }

    const contentType = upstream.headers.get("content-type") || "application/pdf";
    return new Response(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="karta-katalogowa-${id}.pdf"`,
            "Cache-Control": "public, max-age=3600",
        },
    });
}
