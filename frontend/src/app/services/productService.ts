import { Product } from '../types/product';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function getProducts(): Promise<Product[]> {
    console.log("👉 Next.js pobiera produkty z adresu:", `${API_URL}/api/products`);
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error("Nie udało się pobrać produktów z serwera");
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Błąd podczas pobierania produktów:", error);
        throw error; // Przekazujemy błąd dalej, aby komponent mógł go obsłużyć
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
    }catch (error) {
        console.error(error);
        throw error;
    }
}