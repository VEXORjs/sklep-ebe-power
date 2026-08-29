'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from '@/app/context/ThemeContext'; // Upewnij się, że ścieżka to @/app/...
import { useMemo } from 'react';
import CheckoutForm from './CheckoutForm';

const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51TnHNVFTuz7d5trJyVlFwYslaI0GEqzE1ISSBWjOUFGIydYaRg04RBKki0sdngfjTv50NVGjoI9i2fyRDPAh4Lq700sR7eDtAo';

const stripePromise = loadStripe(publishableKey);

interface StripeContainerProps {
    clientSecret: string;
    /** E-mail konta (NextAuth) — opcjonalnie wstępnie wypełnia pole e-mail w formularzu. */
    defaultEmail?: string | null;
}

export default function StripeContainer({ clientSecret, defaultEmail }: StripeContainerProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const options = useMemo(() => {
        return {
            clientSecret,
            locale: 'pl' as const,
            appearance: {
                theme: isDark ? 'night' : 'stripe',
                variables: {
                    colorPrimary: '#10b981',
                    colorBackground: isDark ? '#171717' : '#ffffff',
                    colorText: isDark ? '#ffffff' : '#171717',
                    colorDanger: '#ef4444',
                    borderRadius: '6px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                },
                rules: {
                    '.Input': {
                        border: isDark ? '1px solid #262626' : '1px solid #e5e5e5',
                        boxShadow: 'none',
                        backgroundColor: isDark ? '#141618' : '#ffffff',
                        padding: '12px 16px',
                    },
                    '.Input:focus': {
                        border: '1px solid #10b981',
                        boxShadow: 'none',
                    }
                }
            }
        };
    }, [clientSecret, isDark]);

    if (!publishableKey) {
        return (
            <p className="text-sm text-red-400">
                Brak klucza publicznego Stripe. Ustaw NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
            </p>
        );
    }

    return (
        <Elements stripe={stripePromise} options={options} key={clientSecret}>
            <CheckoutForm defaultEmail={defaultEmail} />
        </Elements>
    );
}
