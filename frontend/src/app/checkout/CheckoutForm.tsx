'use client';

import { LinkAuthenticationElement, AddressElement, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (!email || !password) {
            alert("Wypełnij wszystkie pola!");
            return;
        }

        // Wywołanie logowania NextAuth
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        // Krytyczne sprawdzenie dostępności API Stripe
        if (!stripe || !elements) {
            console.log("🛑 STOP: Stripe.js nie został w pełni zainicjalizowany.");
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
                console.log("❌ Błąd płatności:", error.message);
                setMessage(error.message || "Wystąpił błąd płatności");
            }
        } catch (err) {
            console.error("💥 Krytyczny błąd wysyłania formularza:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <LinkAuthenticationElement/>

            <AddressElement options={{ mode: 'shipping', allowedCountries: ['PL']}}/>

            <PaymentElement />

            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                style={{
                    padding: '0.75rem',
                    backgroundColor: (isProcessing || !stripe || !elements) ? '#ccc' : '#635bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (isProcessing || !stripe || !elements) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                }}
            >
                {isProcessing ? "Przetwarzanie..." : "Zapłać teraz"}
            </button>

            {message && <div style={{ marginTop: '1rem', color: 'red' }}>{message}</div>}
        </form>
    );
}