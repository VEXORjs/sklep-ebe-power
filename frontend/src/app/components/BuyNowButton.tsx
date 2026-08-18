'use client';

import { useRouter } from 'next/navigation';
import { Product } from '../types/product';
import { useCart } from "@/app/context/CartContext";
import React, {useState} from "react";
import Loading from "@/app/completion/loading";

interface BuyNowButtonProps {
    product: Product;
    /** Ile sztuk kupić (domyślnie 1). */
    quantity?: number;
    label?: React.ReactNode;
    className?: string;
}

const DEFAULT_CLASS =
    "bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded transition-colors disabled:opacity-50 min-w-[110px]";

export default function BuyNowButton({ product, quantity = 1, label, className }: BuyNowButtonProps) {
    const router = useRouter();
    const { addToCart} = useCart();
    const[isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setIsProcessing(true);
            await addToCart(product, quantity);
            router.push('/checkout');
        }
        catch (error)  {
            console.error(error);
            setIsProcessing(false);
        }
    };

    return (
        <button
            onClick={handleBuyNow}
            disabled={product.stock === 0 || isProcessing}
            className={className ?? DEFAULT_CLASS}
        >
            {isProcessing ? (
                <Loading message="Przekierowanie..." inline />
            ) : (
                label ?? 'Kup teraz ⚡'
            )}
        </button>
    );
}
