// components/ProductCard.tsx
'use client';

import { useCart } from '@/app/context/CartContext';
import {Product} from "@/app/types/product";
import {Star} from "lucide-react";

interface ProductProps {
    product: Product;
}

const BADGE_STYLE: Record<string, string> = {
    Promocja: "bg-red-600 text-white",
    Nowość: "bg-emerald-500 text-slate-950",
    Bestseller: "bg-neutral-100 text-black",
    Wyprzedaż: "bg-amber-500 text-slate-950",
};

const STOCK_TONE: Record<string, { dot: string; text: string; bar: string }> = {
    in: { dot: "bg-emerald-400", text: "text-emerald-400", bar: "bg-emerald-500" },
    low: { dot: "bg-amber-400", text: "text-amber-400", bar: "bg-amber-500" },
    out: { dot: "bg-red-500", text: "text-red-400", bar: "bg-red-500" },
};

function Rating({ rating, reviews }: { rating: number; reviews: number }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                            i < Math.round(rating)
                                ? "fill-emerald-400 text-emerald-400"
                                : "text-neutral-700"
                        }`}
                    />
                ))}
            </div>
            <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-neutral-500">({reviews} opinii)</span>
        </div>
    );
}