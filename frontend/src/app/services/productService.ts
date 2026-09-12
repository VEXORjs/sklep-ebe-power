import { Product } from '../types/product';
import { CATALOG_PRODUCTS } from '../data/catalogProducts';
import { getServerApiUrl } from '@/app/lib/api';
import { isLocalProductImage, supabaseProductImage } from '@/app/lib/supabase-assets';

const API_URL = getServerApiUrl();

/**
 * Katalog zmienia się rzadko — cache danych zamiast `0` obcina TTFB o setki ms.
 *
 * `0` oznaczało „odpytuj Spring Boota przy KAŻDYM żądaniu” (`/`, `/kategoria/**`,
 * `/products/[id]`), a TTFB jest pierwszą składową LCP. Teraz wynik fetcha żyje
 * w Data Cache Nexta 60 s (na Cloud Run w `/tmp` — patrz symlink `.next/cache`
 * w Dockerfile), więc backend jest odpytywany raz na minutę na instancję,
 * a nie raz na żądanie.
 *
 * Świeżość po edycji w panelu admina zapewnia `/api/revalidate`
 * (`revalidateTag("products", "max")`) — patrz `adminService.ts`. Tagi są
 * ustawione przy obu fetchach poniżej, więc zapis produktu czyści cache
 * natychmiast, bez czekania na TTL.
 *
 * Strony zostają przy `export const revalidate = 0` (render dynamiczny): HTML
 * jest liczony na żądanie, ale dane katalogu bierzemy z cache.
 */
export const CATALOG_REVALIDATE_SECONDS = 0;

function normalizeProduct(raw: Partial<Product> & { id: number; name: string; price: number }): Product {
    // Okładka zawsze ze storage Supabase (`product_images/products/{id}.jpg`).
    // Lokalne miniatury `/products/pramac-*` z seeda backendu są celowo
    // odrzucane — słaba jakość, dublowały galerię obok zdjęcia z Supabase.
    const cover = supabaseProductImage(Number(raw.id));
    const explicitImages = Array.isArray(raw.images)
        ? raw.images.filter(
              (img): img is string =>
                  typeof img === "string" && img.trim() !== "" && !isLocalProductImage(img)
          )
        : [];

    return {
        id: Number(raw.id),
        name: raw.name,
        price: Number(raw.price),
        oldPrice: raw.oldPrice != null ? Number(raw.oldPrice) : undefined,
        description: raw.description ?? "",
        stock: Number(raw.stock ?? 0),
        images: [cover, ...explicitImages.filter((img) => img !== cover)],
        videos: Array.isArray(raw.videos) ? raw.videos : [],
        parameters: raw.parameters ?? {},
        category: raw.category,
        subcategory: raw.subcategory,
        sku: raw.sku,
        badge: raw.badge,
        rating: raw.rating,
        reviews: raw.reviews,
        catalogPdf: raw.catalogPdf,
    };
}

export async function getProducts(): Promise<Product[]> {
    if (process.env.NODE_ENV !== "production") {
        console.log("👉 Next.js pobiera produkty z adresu:", `${API_URL}/api/products`);
    }
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            // Tag "products" pozwala natychmiast unieważnić ten wpis w Data Cache
            // wywołaniem revalidateTag("products") (zob. /api/revalidate) zaraz po
            // zapisie w panelu admina — bez czekania na 60s TTL i bez podwójnego
            // odświeżania strony przez klienta.
            next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["products"] },
            // Nie blokujemy renderowania strony, gdy backend jest niedostępny
            signal: AbortSignal.timeout(3000),
        });

        if (!res.ok) {
            throw new Error("Nie udało się pobrać produktów z serwera");
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            return data.map((item: Partial<Product> & { id: number; name: string; price: number }) =>
                normalizeProduct(item)
            );
        }
        throw new Error("Pusta lista produktów z serwera");
    } catch (error) {
        console.warn(
            "⚠️ Backend niedostępny — strona używa lokalnego katalogu produktów.",
            error
        );
        return CATALOG_PRODUCTS;
    }
}

export async function getProduct(id: string | number): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            next: {
                revalidate: CATALOG_REVALIDATE_SECONDS,
                tags: ["products", `product-${id}`],
            },
            signal: AbortSignal.timeout(3000),
        });

        if (!res.ok) {
            throw new Error(`Backend zwrócił kod: ${res.status}`);
        }

        const data = await res.json();
        return normalizeProduct(data);
    } catch (error) {
        console.warn(
            "⚠️ Backend niedostępny — podgląd produktu korzysta z lokalnego katalogu.",
            error
        );
        return CATALOG_PRODUCTS.find((p) => p.id === Number(id)) ?? null;
    }
}

export async function deleteProduct(id: number): Promise<void> {
    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            console.error("Serwer zwrócił kod błędu:", res.status);
            throw new Error("Nie udało się usunąć produktu");
        }
    } catch (error) {
        console.error("Błąd podczas usuwania produktu:", error);
        throw error;
    }
}

export async function updateProduct(id: number, productData: Product): Promise<Product> {
    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!res.ok) {
            throw new Error("Nie udało się zaktualizować produktu");
        }

        return await res.json();
    } catch (error) {
        console.error("Błąd podczas edycji produktu:", error);
        throw error;
    }
}

export async function addProduct(productData: Product): Promise<Product> {
    try {
        const res = await fetch(`${API_URL}/api/products/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!res.ok) {
            throw new Error("Nie udało się dodać produktu");
        }

        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}
