'use client';

import { useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";

export default function Newsletter() {
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubscribed(true);
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-950 via-[#0d1f1c] to-slate-950 p-8 md:p-12">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

                <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
                            <Mail className="h-4 w-4" />
                            Newsletter
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                            Bądź na bieżąco z promocjami
                        </h2>
                        <p className="max-w-lg text-sm leading-relaxed text-neutral-400">
                            Dołącz do listy odbiorców i otrzymuj informacje o nowościach,
                            promocjach oraz poradniki techniczne. Zero spamu — tylko konkret.
                        </p>
                    </div>

                    {subscribed ? (
                        <div className="flex items-center gap-3 rounded-md border border-teal-500/40 bg-teal-500/10 px-5 py-4">
                            <CheckCircle2 className="h-6 w-6 shrink-0 text-teal-300" />
                            <p className="text-sm font-semibold text-white">
                                Dziękujemy za zapis! Sprawdź swoją skrzynkę e-mail.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <input
                                type="email"
                                required
                                placeholder="Twój adres e-mail"
                                className="w-full flex-1 rounded-md border border-neutral-700 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-teal-400"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-500 px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-teal-400"
                            >
                                <Send className="h-4 w-4" />
                                Zapisz się
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
