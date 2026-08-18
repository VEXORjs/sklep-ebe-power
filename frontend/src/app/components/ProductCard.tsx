// components/ProductCard.tsx
'use client';

import { useCart } from '@/app/context/CartContext';
import {Product} from "@/app/types/product";

interface ProductProps {
    product: Product;
}

export default function ProductCard({ product }: ProductProps) {
    const { addToCart } = useCart();

    return (
        <div className="border p-4 rounded-lg shadow-sm bg-neutral-900 text-white">
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-amber-400 font-semibold">{product.price.toFixed(2)} PLN</p>
            <button
                onClick={() => addToCart(product, 1)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
                Dodaj do koszyka 🛒
            </button>
        </div>
    );
}