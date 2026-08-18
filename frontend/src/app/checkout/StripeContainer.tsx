'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

// 🟢 Bezpiecznie wyciągamy klucz z .env.local na poziomie modułu
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripeContainerProps {
    clientSecret: string;
}

export default function StripeContainer({ clientSecret }: StripeContainerProps) {
    const options = {
        clientSecret,
        locale: 'pl' as const,
    };

    return (
        // 🟢 Klucz 'key' gwarantuje, że dla danej płatności instancja Stripe stworzy się dokładnie raz
        <Elements stripe={stripePromise} options={options} key={clientSecret}>
            <CheckoutForm />
        </Elements>
    );
}