'use client';

import { useRouter } from 'next/navigation';
import { Product } from '../types/product';
import { useCart } from "@/app/context/CartContext";
import React, {useState} from "react";
import Loading from "@/app/completion/loading";

interface BuyNowButtonProps {
    product: Product;
}

export default function BuyNowButton({ product }: BuyNowButtonProps) {
    const router = useRouter();
    const { addToCart} = useCart();
    const[isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            setIsProcessing(true);
            await addToCart(product, 1);
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
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2 px-3 rounded transition-colors disabled:opacity-50 min-w-[110px]"
        >
            {isProcessing ? (
                <Loading message="Przekierowanie..." inline />
            ) : (
                'Kup teraz ⚡'
            )}
        </button>
    );
}