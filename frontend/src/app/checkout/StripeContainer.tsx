'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51TnHNVFTuz7d5trJyVlFwYslaI0GEqzE1ISSBWjOUFGIydYaRg04RBKki0sdngfjTv50NVGjoI9i2fyRDPAh4Lq700sR7eDtAo';

const stripePromise = loadStripe(publishableKey);

interface StripeContainerProps {
    clientSecret: string;
}

export default function StripeContainer({ clientSecret }: StripeContainerProps) {
    const options = {
        clientSecret,
        locale: 'pl' as const,
        appearance: {
            theme: 'night' as const,
            variables: {
                colorPrimary: '#10b981',
                colorBackground: '#171717',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                borderRadius: '6px',
                fontFamily: 'Arial, Helvetica, sans-serif',
            },
        },
    };

    if (!publishableKey) {
        return (
            <p className="text-sm text-red-400">
                Brak klucza publicznego Stripe. Ustaw NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
            </p>
        );
    }

    return (
        <Elements stripe={stripePromise} options={options} key={clientSecret}>
            <CheckoutForm />
        </Elements>
    );
}
