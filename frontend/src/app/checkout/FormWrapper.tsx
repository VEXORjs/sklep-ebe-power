'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

import Loading from '@/app/completion/loading';
import StripeContainer from '@/app/checkout/StripeContainer';
import { useCart } from '@/app/context/CartContext';
import { getPublicApiUrl } from '@/app/lib/api';
import Link from "next/link";

export default function FormWrapper() {
    const [clientSecret, setClientSecret] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isCartEmpty, setIsCartEmpty] = useState<boolean>(false);
    const [retryToken, setRetryToken] = useState(0);
    const hasFetched = useRef(false);
    const { cart, loading } = useCart();
    const { data: session, status } = useSession();
    const API_URL = getPublicApiUrl();

    useEffect(() => {
        const cartempty = async () => {
            if (loading || status === 'loading') return;

            if (!cart || !cart.items || cart.items.length === 0) {
                setIsCartEmpty(true);
                return;
            }

            if (hasFetched.current) return;
            hasFetched.current = true;

            const payload = {
                userId: session?.user?.id || null,
                customerEmail: session?.user?.email || null,
                firstStartup: Boolean(cart.firstStartup),
                items: cart.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            };

            fetch(`${API_URL}/api/payment/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
                .then(async (res) => {
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                        throw new Error(data.error || `Backend zwrócił błąd (${res.status})`);
                    }
                    if (!data.clientSecret) {
                        throw new Error(data.error || 'Brak clientSecret z serwera płatności');
                    }
                    setClientSecret(data.clientSecret);
                })
                .catch((err: Error) => {
                    console.error('Błąd backendu płatności:', err);
                    setError(err.message || 'Nie udało się zainicjować płatności');
                });
        }
        void cartempty();

    }, [cart, loading, status, session, API_URL, retryToken]);

    if (isCartEmpty) {
        return (
            <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
                <h3 className="text-xl font-bold text-white">Twój koszyk jest pusty</h3>
                <p className="text-sm text-neutral-400">
                    Dodaj produkty do koszyka, aby sfinalizować bezpieczną płatność.
                </p>
                <Link
                    href="/"
                    className="inline-block rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                    Wróć do sklepu
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-semibold text-red-400">
                <p>Błąd systemu płatności: {error}</p>
                <button
                    type="button"
                    onClick={() => {
                        hasFetched.current = false;
                        setError(null);
                        setClientSecret('');
                        setRetryToken((n) => n + 1);
                    }}
                    className="rounded-md bg-neutral-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-neutral-700"
                >
                    Spróbuj ponownie
                </button>
            </div>
        );
    }

    if (loading || status === 'loading' || !clientSecret) {
        return <Loading message="Generowanie bezpiecznej sesji płatności..." />;
    }

    return <StripeContainer clientSecret={clientSecret} defaultEmail={session?.user?.email ?? null} />;
}
