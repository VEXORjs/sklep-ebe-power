'use client';

import {
    AddressElement,
    LinkAuthenticationElement,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setMessage('Formularz płatności jeszcze się ładuje. Spróbuj za chwilę.');
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/completion`,
                },
            });

            if (error) {
                setMessage(error.message || 'Wystąpił błąd płatności');
            }
        } catch (err) {
            console.error('Krytyczny błąd wysyłania formularza:', err);
            setMessage('Nie udało się połączyć z systemem płatności. Spróbuj ponownie.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                    E-mail do potwierdzenia
                </label>
                <LinkAuthenticationElement />
            </div>

            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Adres dostawy
                </label>
                <AddressElement options={{ mode: 'shipping', allowedCountries: ['PL'] }} />
            </div>

            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Metoda płatności
                </label>
                <PaymentElement />
            </div>

            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="rounded-md bg-emerald-500 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isProcessing ? 'Przetwarzanie...' : 'Zapłać bezpiecznie'}
            </button>

            {message && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {message}
                </div>
            )}

            <p className="text-[11px] leading-relaxed text-neutral-500">
                Klikając „Zapłać bezpiecznie” akceptujesz regulamin sklepu. Płatność realizuje Stripe —
                dane karty nie przechodzą przez nasze serwery.
            </p>
        </form>
    );
}
