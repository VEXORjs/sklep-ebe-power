'use client';

import {useEffect, useRef, useState} from 'react';
import Loading from "@/app/completion/loading";
import StripeContainer from "@/app/checkout/StripeContainer";
import {useCart} from "@/app/context/CartContext";

export default function FormWrapper() {
    const [clientSecret, setClientSecret] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isCartEmpty, setIsCartEmpty] = useState<boolean>(false);
    const hasFetched = useRef(false);
    const {cart, loading} = useCart();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' || 'http://localhost:3000';

    useEffect(() => {
        if(!loading && (!cart || !cart.items || cart.items.length === 0)){
            setIsCartEmpty(true);
            return;
        }

        if (loading) return;
        if (!cart || !cart.items) return;

        if(hasFetched.current) return;
        hasFetched.current = true;

        // Pobieramy clientSecret z Spring Boota
        fetch(`${API_URL}/api/payment/create-payment-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: 'user123',
                items: cart.items.map(item => ({
                    productId: item.productId, // Ścieżka z Twojej struktury CartItem
                    quantity: item.quantity
                }))
            }),
        })
            .then((res) => {
                if (res.status === 400 || res.status === 422){
                    setIsCartEmpty(true);
                    return null;
                }
                if (!res.ok) throw new Error("Backend zwrócił błąd połączenia");
                return res.json();
            })
            .then((data) => {
                if (data && data.clientSecret){
                    setClientSecret(data.clientSecret);
                }
            })
            .catch((err) => {
                console.error("Błąd backendu:", err);
                setError(err.message);
            });
    }, [cart, loading]);

    if (error) return <div style={{ color: '#ef4444', fontWeight: 'bold', padding: '1rem' }}>Błąd systemu: {error}</div>;

    if (isCartEmpty) {
        return (
            <div className="text-center p-8 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white">Twój koszyk jest pusty</h3>
                <p className="text-neutral-400 text-sm">Dodaj produkty do koszyka, aby móc sfinalizować bezpieczną płatność.</p>
                <button
                    onClick={() => {
                        window.location.href = `${window.location.origin}`;
                    }}
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
                    Wróć do sklepu
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="animate-pulse text-neutral-400 text-sm">Weryfikacja koszyka...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 font-bold p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto text-center">
                Błąd systemu: {error}
            </div>
        );
    }

    // Dopóki nie ma klucza z Javy, wyświetlamy tylko loader
    if (!clientSecret) {
        return <Loading message="Generowanie bezpiecznej sesji płatności..."/>;
    }

    // Przekazujemy clientSecret do kontenera Stripe
    return <StripeContainer clientSecret={clientSecret} />;
}