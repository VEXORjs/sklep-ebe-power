'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { FIRST_STARTUP_FEE, formatPLN, vatOf, grossPrice } from '@/app/lib/product';

export default function CartPage() {
    const { cart, loading, removeFromCart, updateQuantity, setFirstStartup } = useCart();

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-xl animate-pulse">Ładowanie zawartości koszyka...</p>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl font-bold tracking-wider text-neutral-400">Twój koszyk jest pusty</h1>
                <Link
                    href="/"
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-md transition-colors border border-neutral-700"
                >
                    Wróć do sklepu
                </Link>
            </div>
        );
    }

    const startup = Boolean(cart.firstStartup);
    const net = cart.cartTotal + (startup ? FIRST_STARTUP_FEE : 0);
    const payable = grossPrice(net);

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-8 border-b border-neutral-800 pb-4">
                    Koszyk zakupowy 🛒
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => (
                            <div
                                key={item.productId}
                                className="flex items-center justify-between gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white">{item.productName}</h3>
                                    <p className="text-sm text-neutral-400">
                                        {item.productPrice.toFixed(2)} PLN / szt.
                                    </p>
                                </div>

                                <div className="flex items-center rounded-md border border-neutral-700">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        aria-label="Zmniejsz ilość"
                                        className="flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-white"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="min-w-[2rem] text-center text-sm font-bold">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        aria-label="Zwiększ ilość"
                                        className="flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-white"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-semibold text-emerald-400">
                                        {item.totalPrice.toFixed(2)} PLN
                                    </span>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-neutral-500 hover:text-red-500 transition-colors p-2"
                                        title="Usuń z koszyka"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}

                        <fieldset className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                            <legend className="px-1 text-sm font-bold text-white">Pierwsze uruchomienie sprzętu</legend>
                            <p className="mb-3 text-xs text-neutral-400">
                                Serwis na miejscu — dopłata {formatPLN(FIRST_STARTUP_FEE)} netto.
                            </p>
                            <div className="flex flex-col gap-2 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="first-startup"
                                        checked={!startup}
                                        onChange={() => setFirstStartup(false)}
                                        className="accent-emerald-500"
                                    />
                                    Nie, uruchomię samodzielnie
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="first-startup"
                                        checked={startup}
                                        onChange={() => setFirstStartup(true)}
                                        className="accent-emerald-500"
                                    />
                                    Tak, chcę pierwsze uruchomienie (+ {formatPLN(FIRST_STARTUP_FEE)} netto)
                                </label>
                            </div>
                        </fieldset>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 h-fit space-y-6">
                        <h2 className="text-xl font-bold border-b border-neutral-800 pb-3">Podsumowanie</h2>

                        <div className="flex justify-between text-base text-neutral-400">
                            <span>Liczba pozycji:</span>
                            <span className="text-white font-medium">{cart.items.length}</span>
                        </div>

                        {startup && (
                            <div className="flex justify-between text-sm text-neutral-400">
                                <span>Uruchomienie:</span>
                                <span className="text-white font-medium">{formatPLN(FIRST_STARTUP_FEE)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm text-neutral-400">
                            <span>VAT 23%:</span>
                            <span className="text-white font-medium">{vatOf(net).toFixed(2)} PLN</span>
                        </div>

                        <div className="flex justify-between text-xl font-bold border-t border-neutral-800 pt-4">
                            <span>Do zapłaty:</span>
                            <span className="text-emerald-400">{payable.toFixed(2)} PLN</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">Kwota brutto. Dostawa doliczana w kasie.</p>

                        <Link
                            href="/checkout"
                            className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-md"
                        >
                            Przejdź do płatności
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
