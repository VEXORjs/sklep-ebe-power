'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { useCart } from '@/app/context/CartContext';
import Loading from '@/app/completion/loading';

function CompletionContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Przetwarzanie...');
    const hasRun = useRef(false);

    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    const { clearCart } = useCart();
    const { data: session, status: sessionStatus } = useSession();

    useEffect(() => {
        if (hasRun.current || sessionStatus === 'loading') return;

        const finalizeOrder = async () => {
            if (redirectStatus === 'succeeded') {
                hasRun.current = true;
                setStatus('Sukces!');

                try {
                    await clearCart(session?.user?.id || 'guest');
                } catch (err) {
                    console.error('Błąd podczas wywoływania clearCart:', err);
                }
                return;
            }

            if (redirectStatus === 'failed' || redirectStatus === 'canceled') {
                hasRun.current = true;
                setStatus('Płatność nie powiodła się');
                return;
            }

            setStatus('Nieznany status płatności');
        };

        void finalizeOrder();
    }, [redirectStatus, paymentIntent, clearCart, session, sessionStatus]);

    const success = status === 'Sukces!';
    const failed = status === 'Płatność nie powiodła się';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-white">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
                {success ? (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-500">
                            ✓
                        </div>
                        <h1 className="text-2xl font-bold text-white">Dziękujemy za zamówienie!</h1>
                        <p className="text-sm text-neutral-400">
                            Płatność została pomyślnie zautoryzowana. Potwierdzenie wyślemy na podany adres e-mail.
                            {paymentIntent && (
                                <>
                                    <br />
                                    <span className="break-all font-mono text-xs text-neutral-500">
                                        {paymentIntent}
                                    </span>
                                </>
                            )}
                        </p>
                    </>
                ) : failed ? (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl text-red-400">
                            !
                        </div>
                        <h1 className="text-2xl font-bold text-white">Płatność nie powiodła się</h1>
                        <p className="text-sm text-neutral-400">
                            Środki nie zostały pobrane. Możesz wrócić do kasy i spróbować ponownie.
                        </p>
                    </>
                ) : (
                    <h1 className="text-xl font-medium text-neutral-300">{status}</h1>
                )}

                <div className="flex flex-wrap justify-center gap-3 pt-4">
                    {failed && (
                        <Link
                            href="/checkout"
                            className="inline-block rounded bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                        >
                            Wróć do kasy
                        </Link>
                    )}
                    <Link
                        href="/"
                        className="inline-block rounded bg-neutral-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                    >
                        Powrót do sklepu
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CompletionPage() {
    return (
        <Suspense fallback={<Loading message="Weryfikacja płatności..." />}>
            <CompletionContent />
        </Suspense>
    );
}
