'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
    const { cart, loading, removeFromCart } = useCart();

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

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-8 border-b border-neutral-800 pb-4">
                    Koszyk zakupowy 🛒
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LISTA PRODUKTÓW */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => (
                            <div
                                key={item.productId}
                                className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm"
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">{item.productName}</h3>
                                    <p className="text-sm text-neutral-400">
                                        {item.productPrice.toFixed(2)} PLN x {item.quantity}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6">
                  <span className="text-lg font-semibold text-amber-400">
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
                    </div>

                    {/* PODSUMOWANIE ZAMÓWIENIA */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 h-fit space-y-6">
                        <h2 className="text-xl font-bold border-b border-neutral-800 pb-3">Podsumowanie</h2>

                        <div className="flex justify-between text-base text-neutral-400">
                            <span>Liczba pozycji:</span>
                            <span className="text-white font-medium">{cart.items.length}</span>
                        </div>

                        <div className="flex justify-between text-xl font-bold border-t border-neutral-800 pt-4">
                            <span>Do zapłaty:</span>
                            <span className="text-amber-400">{cart.cartTotal.toFixed(2)} PLN</span>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-full block text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-md"
                        >
                            Przejdź do płatności
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}