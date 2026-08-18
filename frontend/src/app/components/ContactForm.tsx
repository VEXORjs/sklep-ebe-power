'use client';

import React, { useState } from 'react';

export default function ContactForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const recipient = 'kontakt@ebe-power.pl';
        const subject = encodeURIComponent('Twoje zapytanie ze strony ebe-power.pl');
        const fullMessage = `Wiadomość od: ${email}\n\nTreść:\n${message}`;
        const body = encodeURIComponent(fullMessage);

        window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Twój adres e-mail"
                required
                className="w-full sm:w-1/3 px-4 py-2 text-sm text-white placeholder-neutral-400 bg-white/10 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="W czym możemy pomóc?"
                required
                className="w-full sm:flex-1 px-4 py-2 text-sm text-white placeholder-neutral-400 bg-white/10 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded transition-colors shadow-sm whitespace-nowrap"
            >
                Wyślij
            </button>
        </form>
    );
}