'use client';

import Link from 'next/link';
import { Lock, ShieldCheck, Truck } from 'lucide-react';

import { useCart } from '@/app/context/CartContext';
import FormWrapper from '@/app/checkout/FormWrapper';
import {
    formatPLN,
    FIRST_STARTUP_FEE,
    FREE_SHIPPING_THRESHOLD,
    grossPrice,
    shippingCostFor,
    vatOf,
} from '@/app/lib/product';

export default function CheckoutPage() {
    const { cart, loading } = useCart();

    if (loading) {
        return (
            <div className="min-h-screen bg-black px-4 py-16 text-center text-neutral-400">
                Przygotowujemy kasę...
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-black px-4 py-20 text-white">
                <div className="mx-auto max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
                    <h1 className="text-2xl font-extrabold">Koszyk jest pusty</h1>
                    <p className="mt-2 text-sm text-neutral-400">
                        Dodaj produkty, aby przejść do bezpiecznej płatności Stripe.
                    </p>
                    <Link
                        href="/#produkty"
                        className="mt-6 inline-block rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                    >
                        Wróć do sklepu
                    </Link>
                </div>
            </div>
        );
    }

    const startup = Boolean(cart.firstStartup);
    const net = cart.cartTotal + (startup ? FIRST_STARTUP_FEE : 0);
    const vat = vatOf(net);
    const gross = grossPrice(net);
    const shipping = shippingCostFor(gross);
    const payable = gross + shipping;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Kasa</p>
                    <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Podsumowanie i płatność</h1>
                    <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                        Kwota pobierana przez Stripe jest brutto (VAT 23%) i zawiera koszt dostawy,
                        jeśli zamówienie nie przekracza {formatPLN(FREE_SHIPPING_THRESHOLD)}.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    <aside className="space-y-4 lg:col-span-2">
                        <div className="rounded-xl border border-neutral-800 bg-[#141618] p-5">
                            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-400">
                                Twoje zamówienie
                            </h2>
                            <ul className="space-y-3">
                                {cart.items.map((item) => (
                                    <li
                                        key={item.productId}
                                        className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-3 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-white">{item.productName}</p>
                                            <p className="text-[11px] text-neutral-500">
                                                {item.quantity} × {formatPLN(item.productPrice)} netto
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-bold text-emerald-400">
                                            {formatPLN(item.totalPrice)}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <dl className="mt-5 space-y-2 text-sm">
                                {startup && (
                                    <div className="flex justify-between text-neutral-400">
                                        <dt>Pierwsze uruchomienie</dt>
                                        <dd className="text-white">{formatPLN(FIRST_STARTUP_FEE)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between text-neutral-400">
                                    <dt>Netto</dt>
                                    <dd className="text-white">{formatPLN(net)}</dd>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <dt>VAT 23%</dt>
                                    <dd className="text-white">{formatPLN(vat)}</dd>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <dt>Dostawa</dt>
                                    <dd className={shipping === 0 ? "font-bold text-emerald-400" : "text-white"}>
                                        {shipping === 0 ? "Darmowa" : formatPLN(shipping)}
                                    </dd>
                                </div>
                                <div className="flex justify-between border-t border-neutral-800 pt-3 text-base font-extrabold">
                                    <dt>Do zapłaty</dt>
                                    <dd className="text-emerald-400">{formatPLN(payable)}</dd>
                                </div>
                            </dl>
                        </div>

                        <ul className="space-y-2 text-xs text-neutral-400">
                            <li className="flex items-center gap-2">
                                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                                Płatność szyfrowana przez Stripe (PCI DSS)
                            </li>
                            <li className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                3-D Secure, BLIK, karta, Apple Pay
                            </li>
                            <li className="flex items-center gap-2">
                                <Truck className="h-3.5 w-3.5 text-emerald-500" />
                                Wysyłka w 24 h · 30 dni na zwrot
                            </li>
                        </ul>
                    </aside>

                    <div className="lg:col-span-3">
                        <div className="rounded-xl border border-neutral-800 bg-[#141618] p-5 sm:p-7">
                            <h2 className="mb-5 text-lg font-extrabold">Dane i płatność</h2>
                            <FormWrapper />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
