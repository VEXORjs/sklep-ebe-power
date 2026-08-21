import { Product } from '../types/product';
import { CATALOG_PRODUCTS } from '../data/catalogProducts';
import { getServerApiUrl } from '@/app/lib/api';

const API_URL = getServerApiUrl();

/** Katalog zmienia się rzadko — ISR zamiast force-dynamic obcina TTFB o setki ms. */
export const CATALOG_REVALIDATE_SECONDS = 60;

function normalizeProduct(raw: Partial<Product> & { id: number; name: string; price: number }): Product {
    return {
        id: Number(raw.id),
        name: raw.name,
        price: Number(raw.price),
        oldPrice: raw.oldPrice != null ? Number(raw.oldPrice) : undefined,
        description: raw.description ?? "",
        stock: Number(raw.stock ?? 0),
        images: Array.isArray(raw.images) ? raw.images : [],
        videos: Array.isArray(raw.videos) ? raw.videos : [],
        parameters: raw.parameters ?? {},
        category: raw.category,
        subcategory: raw.subcategory,
        sku: raw.sku,
        badge: raw.badge,
        rating: raw.rating,
        reviews: raw.reviews,
    };
}

export async function getProducts(): Promise<Product[]> {
    if (process.env.NODE_ENV !== "production") {
        console.log("👉 Next.js pobiera produkty z adresu:", `${API_URL}/api/products`);
    }
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            next: { revalidate: CATALOG_REVALIDATE_SECONDS },
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
            next: { revalidate: CATALOG_REVALIDATE_SECONDS },
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
