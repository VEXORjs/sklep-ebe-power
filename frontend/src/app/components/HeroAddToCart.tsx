'use client';

import { ShoppingCart } from "lucide-react";
import { Product } from "@/app/types/product";
import { useCart } from "@/app/context/CartContext";

export default function HeroAddToCart({ product }: { product: Product }) {
    const { addToCart, openCart } = useCart();

    const handleQuickAdd = async () => {
        try {
            await addToCart(product, 1);
            openCart();
        } catch (error) {
            console.error("Błąd podczas dodawania do koszyka:", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-950/40 transition-opacity hover:bg-emerald-400 disabled:opacity-50"
        >
            <ShoppingCart className="h-4 w-4" />
            Dodaj do koszyka
        </button>
    );
}
