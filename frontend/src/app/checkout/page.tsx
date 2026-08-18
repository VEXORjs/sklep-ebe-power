'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {useSession} from "next-auth/react";

const stripePromise = loadStripe('pk_test_51TnHNVFTuz7d5trJyVlFwYslaI0GEqzE1ISSBWjOUFGIydYaRg04RBKki0sdngfjTv50NVGjoI9i2fyRDPAh4Lq700sR7eDtAo');
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// const API_URL = 'http://localhost:8080';

export default function CheckoutPage() {
    const { cart } = useCart();
    const {data: session} = useSession();
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        const payload = {
            userId: session?.user?.id || null,
            items: cart?.items || []
        };
        if (payload?.items?.length !== 0) {
            fetch(`${API_URL}/api/payment/create-payment-intent`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret))
                .catch((err) => console.error('Błąd pobierania clientSecret:', err));
        }
    }, [cart?.items, session]);


    if (!cart || cart.items.length === 0) {
        return <div className="p-8 text-white bg-black">Twój koszyk jest pusty. Nie ma czego opłacić.</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Podsumowanie płatności</h2>
                <p className="text-neutral-400 mb-4">Kwota pobrana z koszyka: <span className="text-emerald-400 font-bold">{cart.cartTotal.toFixed(2)} PLN</span></p>

                {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm />
                    </Elements>
                ) : (
                    <p className="animate-pulse">Inicjalizacja bezpiecznej sesji Stripe...</p>
                )}
            </div>
        </div>
    );
}

// Komponent wewnętrzny formularza
function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/completion`, // Strona przekierowania po płatności (np. BLIK)
            },
        });

        if (error) {
            alert(`Błąd płatności: ${error.message}`);
        }
        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <button
                disabled={isProcessing || !stripe || !elements}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
                {isProcessing ? 'Przetwarzanie...' : 'Zapłać bezpiecznie ze Stripe'}
            </button>
        </form>
    );
}