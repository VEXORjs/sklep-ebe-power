import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * On-demand revalidation po zmianach w katalogu produktów.
 *
 * Problem, który to rozwiązuje: strony produktowe (`/`, `/products/[id]`,
 * `/kategoria/**`) korzystają z ISR (revalidate co 60s), żeby nie odpytywać
 * backendu przy każdym żądaniu. Next.js realizuje ISR jako
 * "stale-while-revalidate": po wygaśnięciu TTL PIERWSZE żądanie nadal dostaje
 * STARĄ wersję strony, a nowa jest przeliczana dopiero W TLE — widoczna jest
 * dopiero przy KOLEJNYM wejściu/odświeżeniu. Stąd wrażenie "ceny/produkty
 * aktualizują się dopiero po odświeżeniu strony" po edycji w panelu admina.
 *
 * Rozwiązanie: panel admina (zob. `adminService.ts`) po każdym udanym
 * dodaniu/edycji/usunięciu produktu wywołuje ten endpoint, który natychmiast
 * czyści tag "products" (i opcjonalnie konkretną stronę produktu) w Next.js
 * Data/Full Route Cache. Kolejne żądanie od klienta dostaje już świeże dane
 * — bez czekania na 60s TTL i bez podwójnego odświeżania przeglądarki.
 */
async function handleRevalidate(req: NextRequest): Promise<Response> {
    // Tylko zalogowany administrator (ta sama sesja NextAuth, co reszta
    // panelu) może wymusić rewalidację — endpoint nie jest publiczny.
    let token = null;
    try {
        token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    } catch (error) {
        console.error("[revalidate] Błąd weryfikacji sesji:", error);
    }

    if (!token || token.role !== "ADMIN") {
        return NextResponse.json(
            { revalidated: false, error: "unauthorized" },
            { status: 401 }
        );
    }

    let productId: string | number | undefined;
    try {
        const body = await req.json();
        productId = body?.productId;
    } catch {
        // brak/niepoprawne body — rewalidujemy tylko ogólny tag "products"
    }

    // Next.js 16 wymaga drugiego argumentu profilu ("max" = natychmiastowe
    // wygaśnięcie, bez czekania na kolejne okno cache'a).
    revalidateTag("products", "max");
    revalidatePath("/", "page");
    revalidatePath("/kategoria", "layout");

    if (productId != null) {
        revalidateTag(`product-${productId}`, "max");
        revalidatePath(`/products/${productId}`, "page");
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
}

export const POST = handleRevalidate;
