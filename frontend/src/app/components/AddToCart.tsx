'use client';

import { useCart } from '@/app/context/CartContext';
import { Product } from '../types/product';
import React, {useState} from "react";
import Loading from "@/app/completion/loading";

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useCart(); // Zakładam, że tak nazywa się funkcja w Twoim CartContext
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        (async () => {
        try {
            setIsAdding(true);
            await addToCart(product, 1);
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded transition-colors disabled:opacity-50 min-w-[110px]"
        >
            {isAdding ? (
                <Loading message="Dodawanie..." inline />
            ) : (
                "Do koszyka 🛒"
            )}
        </button>
    );
}