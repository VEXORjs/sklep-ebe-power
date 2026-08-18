'use client';

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart, Trash2, X, Zap } from "lucide-react";

export default function CartDrawer() {
    const { cart, isCartOpen, closeCart, removeFromCart } = useCart();

    const items = cart?.items ?? [];
    const count = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div
            className={`fixed inset-0 z-[100] ${isCartOpen ? "" : "pointer-events-none"}`}
            aria-hidden={!isCartOpen}
        >
            {/* Tło */}
            <div
                onClick={closeCart}
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
                    isCartOpen ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Panel boczny */}
            <aside
                className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl transition-transform duration-300 ${
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Nagłówek */}
                <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
                        <ShoppingCart className="h-5 w-5 text-emerald-500" />
                        Twój koszyk
                        {count > 0 && (
                            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                                {count}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={closeCart}
                        aria-label="Zamknij koszyk"
                        className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Zawartość */}
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
                            <ShoppingCart className="h-7 w-7 text-neutral-600" />
                        </div>
                        <p className="text-sm font-semibold text-white">Twój koszyk jest pusty</p>
                        <p className="text-xs text-neutral-500">
                            Dodaj produkty z naszej oferty, aby kontynuować zakupy.
                        </p>
                        <Link
                            href="/#produkty"
                            onClick={closeCart}
                            className="mt-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                        >
                            Przeglądaj ofertę
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-[#141618] p-3"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-neutral-900">
                                        <Zap className="h-5 w-5 text-emerald-500" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-bold text-white">
                                            {item.productName}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-neutral-500">
                                            {item.quantity} ×{" "}
                                            {item.productPrice.toFixed(2).replace(".", ",")} zł
                                        </p>
                                        <p className="mt-0.5 text-xs font-semibold text-emerald-400">
                                            {item.totalPrice.toFixed(2).replace(".", ",")} zł
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        aria-label={`Usuń ${item.productName} z koszyka`}
                                        className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-red-950 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Podsumowanie */}
                        <div className="border-t border-neutral-800 px-6 py-5">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm text-neutral-400">Razem (netto):</span>
                                <span className="text-xl font-extrabold text-white">
                                    {(cart?.cartTotal ?? 0).toFixed(2).replace(".", ",")} zł
                                </span>
                            </div>
                            <p className="mb-4 text-[11px] text-neutral-500">
                                Do kwoty doliczony zostanie podatek VAT (23%).
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="rounded-md bg-emerald-500 px-5 py-3 text-center text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                                >
                                    Przejdź do kasy ⚡
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={closeCart}
                                    className="rounded-md border border-neutral-700 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
                                >
                                    Zobacz szczegóły koszyka
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}
