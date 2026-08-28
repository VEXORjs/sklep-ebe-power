'use client';

import {
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { getSiteUrl } from '@/app/lib/site';

interface CheckoutFormProps {
    /** E-mail z konta (NextAuth) — opcjonalnie wstępnie wypełnia pole. */
    defaultEmail?: string | null;
}

const inputClassName =
    'w-full rounded-md border border-neutral-800 bg-[#141618] px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-emerald-500/60';

const labelClassName =
    'mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400';

export default function CheckoutForm({ defaultEmail }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [email, setEmail] = useState(defaultEmail ?? '');
    const [fullName, setFullName] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setMessage('Formularz płatności jeszcze się ładuje. Spróbuj za chwilę.');
            return;
        }

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setMessage('Podaj poprawny adres e-mail do potwierdzenia zamówienia.');
            return;
        }

        const required: Array<[string, string]> = [
            [fullName, 'Podaj imię i nazwisko odbiorcy.'],
            [street, 'Podaj ulicę i numer domu.'],
            [postalCode, 'Podaj kod pocztowy (format 00-000).'],
            [city, 'Podaj miasto.'],
            [phone, 'Podaj numer telefonu do kontaktu.'],
        ];
        for (const [value, errorMessage] of required) {
            if (!value.trim()) {
                setMessage(errorMessage);
                return;
            }
        }

        setIsProcessing(true);
        setMessage(null);

        const billingDetails = {
            name: fullName.trim(),
            email: trimmedEmail,
            phone: phone.trim(),
            address: {
                line1: street.trim(),
                postal_code: postalCode.trim(),
                city: city.trim(),
                country: 'PL',
            },
        };

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${getSiteUrl()}/completion`,
                    payment_method_data: {
                        billing_details: billingDetails,
                    },
                    shipping: {
                        name: fullName.trim(),
                        phone: phone.trim(),
                        address: {
                            line1: street.trim(),
                            postal_code: postalCode.trim(),
                            city: city.trim(),
                            country: 'PL',
                        },
                    },
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* E-mail — własne pole zamiast LinkAuthenticationElement */}
            <div>
                <label htmlFor="checkout-email" className={labelClassName}>
                    E-mail do potwierdzenia
                </label>
                <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="np. jan.kowalski@poczta.pl"
                    className={inputClassName}
                />
            </div>

            {/* Adres dostawy — własne pola zamiast AddressElement */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="checkout-name" className={labelClassName}>
                        Imię i nazwisko
                    </label>
                    <input
                        id="checkout-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="np. Jan Kowalski"
                        className={inputClassName}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="checkout-street" className={labelClassName}>
                        Ulica i numer
                    </label>
                    <input
                        id="checkout-street"
                        type="text"
                        autoComplete="street-address"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="np. Polna 12/3"
                        className={inputClassName}
                    />
                </div>

                <div>
                    <label htmlFor="checkout-postal" className={labelClassName}>
                        Kod pocztowy
                    </label>
                    <input
                        id="checkout-postal"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="np. 97-400"
                        className={inputClassName}
                    />
                </div>

                <div>
                    <label htmlFor="checkout-city" className={labelClassName}>
                        Miasto
                    </label>
                    <input
                        id="checkout-city"
                        type="text"
                        autoComplete="address-level2"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="np. Bełchatów"
                        className={inputClassName}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="checkout-phone" className={labelClassName}>
                        Telefon kontaktowy
                    </label>
                    <input
                        id="checkout-phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="np. +48 600 000 000"
                        className={inputClassName}
                    />
                </div>
            </div>

            {/* Metoda płatności — Stripe PaymentElement (BLIK, karta, 3-D Secure) */}
            <div>
                <label className={labelClassName}>
                    Metoda płatności
                </label>
                <PaymentElement
                    options={{
                        fields: {
                            billingDetails: {
                                name: 'never',
                                email: 'never',
                                phone: 'never',
                                address: 'never',
                            },
                        },
                    }}
                />
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
