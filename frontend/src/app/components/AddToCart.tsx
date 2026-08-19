'use client';

import { useCart } from '@/app/context/CartContext';
import { Product } from '../types/product';
import React, {useState} from "react";
import Loading from "@/app/completion/loading";

interface AddToCartButtonProps {
    product: Product;
    /** Ile sztuk dodać do koszyka (domyślnie 1). */
    quantity?: number;
    /** Własna treść przycisku. */
    label?: React.ReactNode;
    /** Nadpisanie stylów — pozwala użyć przycisku w karcie produktu i na stronie produktu. */
    className?: string;
    /** Wywoływane po udanym dodaniu (np. do resetu licznika sztuk). */
    onAdded?: () => void;
}

const DEFAULT_CLASS =
    "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded transition-colors disabled:opacity-50 min-w-[110px]";

export default function AddToCartButton({
    product,
    quantity = 1,
    label,
    className,
    onAdded,
}: AddToCartButtonProps) {
    const { addToCart, openCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        (async () => {
        try {
            setIsAdding(true);
            await addToCart(product, quantity);
            openCart();
            onAdded?.();
        }
        catch (error) {
            console.error("Błąd podczas dodawania do koszyka:", error);
        }
        finally {
            setIsAdding(false);
        }
    })();
    };

    return (
        <button
            onClick={(e) => handleAdd(e)}
            disabled={product.stock === 0 || isAdding}
            className={className ?? DEFAULT_CLASS}
        >
            {isAdding ? (
                <Loading message="Dodawanie..." inline />
            ) : (
                label ?? "Do koszyka 🛒"
            )}
        </button>
    );
}
