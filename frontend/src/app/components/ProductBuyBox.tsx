'use client';

import { useState } from "react";
import { Check, Heart, Minus, Plus, Zap } from "lucide-react";

import { Product } from "@/app/types/product";
import AddToCartButton from "@/app/components/AddToCart";
import BuyNowButton from "@/app/components/BuyNowButton";
import { useWishlist } from "@/app/hooks/useWishlist";
import { useCart } from "@/app/context/CartContext";
import { FIRST_STARTUP_FEE, formatPLN } from "@/app/lib/product";

interface ProductBuyBoxProps {
    product: Product;
}

export default function ProductBuyBox({ product }: ProductBuyBoxProps) {
    const [quantity, setQuantity] = useState(1);
    const { toggle, isWishlisted } = useWishlist();
    const { cart, setFirstStartup } = useCart();
    const firstStartup = Boolean(cart?.firstStartup);
    const wishlisted = isWishlisted(product.id);
    const outOfStock = !product.stock || product.stock <= 0;
    const max = Math.max(1, product.stock || 1);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-md border border-neutral-800 bg-[#0f1113]">
                    <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={outOfStock || quantity <= 1}
                        aria-label="Zmniejsz liczbę sztuk"
                        className="flex h-12 w-11 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:opacity-30"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span
                        className="min-w-[2.75rem] text-center text-base font-extrabold text-white"
                        aria-live="polite"
                    >
                        {quantity}
                    </span>
                    <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(max, q + 1))}
                        disabled={outOfStock || quantity >= max}
                        aria-label="Zwiększ liczbę sztuk"
                        className="flex h-12 w-11 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:opacity-30"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <AddToCartButton
                    product={product}
                    quantity={quantity}
                    label={
                        <span className="flex items-center justify-center gap-2">
                            <Check className="h-4 w-4" />
                            Dodaj do koszyka
                        </span>
                    }
                    onAdded={() => setQuantity(1)}
                    className="flex h-12 flex-1 items-center justify-center rounded-md bg-emerald-500 px-5 text-sm font-extrabold uppercase tracking-wide text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <BuyNowButton
                    product={product}
                    quantity={quantity}
                    label={
                        <span className="flex items-center justify-center gap-2">
                            <Zap className="h-4 w-4" />
                            Kup teraz
                        </span>
                    }
                    className="flex h-12 flex-1 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 px-5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-emerald-500/60 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                />
                <button
                    type="button"
                    onClick={() => toggle(product.id)}
                    aria-label={wishlisted ? "Usuń z listy życzeń" : "Dodaj do listy życzeń"}
                    aria-pressed={wishlisted}
                    className={`flex h-12 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
                        wishlisted
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            : "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white"
                    }`}
                >
                    <Heart className={`h-4 w-4 ${wishlisted ? "fill-emerald-400 text-emerald-400" : ""}`} />
                    {wishlisted ? "Zapisane" : "Do schowka"}
                </button>
            </div>

            <fieldset className="rounded-md border border-neutral-800 bg-[#0f1113] p-3">
                <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Pierwsze uruchomienie
                </legend>
                <div className="flex flex-col gap-2 text-sm text-neutral-300">
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="radio"
                            name={`first-startup-${product.id}`}
                            checked={!firstStartup}
                            onChange={() => setFirstStartup(false)}
                            className="accent-emerald-500"
                        />
                        Bez uruchomienia
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="radio"
                            name={`first-startup-${product.id}`}
                            checked={firstStartup}
                            onChange={() => setFirstStartup(true)}
                            className="accent-emerald-500"
                        />
                        Z pierwszym uruchomieniem (+ {formatPLN(FIRST_STARTUP_FEE)} netto)
                    </label>
                </div>
            </fieldset>

            {outOfStock && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    Produkt chwilowo niedostępny. Zostaw numer w dziale sprzedaży — oddzwonimy, gdy wróci na magazyn.
                </p>
            )}
        </div>
    );
}
