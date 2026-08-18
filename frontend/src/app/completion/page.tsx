'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from "@/app/context/CartContext";
import { useSession } from 'next-auth/react';

export default function CompletionPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Przetwarzanie...');

    const hasRun = useRef(false);

    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    const { clearCart } = useCart();
    const {data: session} = useSession();

    useEffect(() => {
        if (hasRun.current) return;

        const finalizeOrder = async () => {
            if (redirectStatus === 'succeeded') {
                hasRun.current = true; // Zamykamy furtkę
                setStatus('Sukces!');

                console.log("✅ Płatność zweryfikowana dla:", paymentIntent);

                if (session?.user?.id) {
                    await clearCart(session.user.id)
                        .then(() => console.log("🛒 Koszyk został pomyślnie wyczyszczony na froncie"))
                        .catch((err) => console.error("❌ Błąd podczas wywoływania clearCart:", err));
                }
                else {
                    localStorage.removeItem('guest_cart');
                    console.log("🛒 Koszyk gościa (localStorage) został wyczyszczony");
            }
            }
            else {
                setStatus("Nieznany status płatności");
            }
        };

        void finalizeOrder();
    }, [redirectStatus, paymentIntent, clearCart, session]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6">
            <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center space-y-6">
                {status === 'Sukces!' ? (
                    <>
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                            ✓
                        </div>
                        <h1 className="text-2xl font-bold text-white">Dziękujemy za zamówienie!</h1>
                        <p className="text-neutral-400 text-sm">
                            Płatność została pomyślnie zautoryzowana. Identyfikator transakcji:
                            <br />
                            <span className="font-mono text-neutral-500 text-xs break-all">{paymentIntent}</span>
                        </p>
                    </>
                ) : (
                    <h1 className="text-xl font-medium text-neutral-300">{status}</h1>
                )}

                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-block bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2.5 px-6 rounded transition-colors text-sm"
                    >
                        Powrót do sklepu
                    </Link>
                </div>
            </div>
        </div>
    );
}