'use client';

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { Product } from "@/app/types/product";
import { useCart } from "@/app/context/CartContext";

type Status = "idle" | "adding" | "added" | "error";

export default function HeroAddToCart({ product }: { product: Product }) {
    const { addToCart, openCart } = useCart();
    const [status, setStatus] = useState<Status>("idle");
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Bez tego stan „Dodano" próbowałby się ustawić po odmontowaniu komponentu.
    useEffect(() => {
        return () => {
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, []);

    const outOfStock = product.stock === 0;

    const handleQuickAdd = async () => {
        if (outOfStock || status === "adding") return;

        if (resetTimer.current) clearTimeout(resetTimer.current);
        setStatus("adding");

        try {
            await addToCart(product, 1);
            setStatus("added");
            openCart();
        } catch (error) {
            // Wcześniej błąd lądował tylko w konsoli — z perspektywy
            // użytkownika przycisk „nie działał". Teraz mówi to wprost.
            console.error("Błąd podczas dodawania do koszyka:", error);
            setStatus("error");
        } finally {
            resetTimer.current = setTimeout(() => setStatus("idle"), 2500);
        }
    };

    const label = outOfStock
        ? "Chwilowo niedostępny"
        : status === "adding"
          ? "Dodawanie…"
          : status === "added"
            ? "Dodano do koszyka"
            : status === "error"
              ? "Spróbuj ponownie"
              : "Dodaj do koszyka";

    return (
        <div className="flex flex-col gap-1">
            <button
                type="button"
                onClick={handleQuickAdd}
                disabled={outOfStock || status === "adding"}
                aria-busy={status === "adding"}
                aria-label={`${label}: ${product.name}`}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {status === "adding" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : status === "added" ? (
                    <Check className="h-4 w-4" aria-hidden />
                ) : (
                    <ShoppingCart className="h-4 w-4" aria-hidden />
                )}
                {label}
            </button>

            <span aria-live="polite" className="min-h-4 text-xs text-neutral-500">
                {status === "error"
                    ? "Nie udało się dodać produktu — sprawdź połączenie i spróbuj ponownie."
                    : outOfStock
                      ? "Zapytaj o termin dostawy — chętnie sprowadzimy ten model."
                      : ""}
            </span>
        </div>
    );
}
