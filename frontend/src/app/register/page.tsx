"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, User } from "lucide-react";

import AuthShell from "@/app/components/AuthShell";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push("/auth/signin");
                return;
            }

            const message = await res.text();
            setError(message || "Nie udało się założyć konta. Spróbuj ponownie.");
        } catch {
            setError("Brak połączenia z serwerem. Sprawdź sieć i spróbuj jeszcze raz.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        if (loading || googleLoading) return;
        setError("");
        setGoogleLoading(true);
        // Google nie rozróżnia rejestracji od logowania — pierwsze zalogowanie
        // automatycznie tworzy konto (backend robi to w /api/auth/oauth-success).
        void signIn("google", { callbackUrl: "/" });
    };

    return (
        <AuthShell
            eyebrow="Nowy klient"
            headline="Załóż konto w TRAFO ENERGIA"
            description="Jedno konto — faktury VAT, historia zamówień i szybsza kasa przy kolejnych zakupach."
        >
            <div className="space-y-6">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        TRAFO ENERGIA
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                        Rejestracja
                    </h2>
                    <p className="mt-1.5 text-sm text-neutral-400">
                        Uzupełnij dane — potem od razu przejdziesz do logowania.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-center text-xs font-medium text-red-400"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-neutral-400">
                            Imię
                        </label>
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                autoComplete="name"
                                required
                                placeholder="Jan Kowalski"
                                className="w-full rounded-lg border border-neutral-800 bg-black py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-neutral-400">
                            E-mail
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="username"
                                required
                                placeholder="jan@firma.pl"
                                className="w-full rounded-lg border border-neutral-800 bg-black py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-neutral-400">
                            Hasło
                        </label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password"
                                required
                                minLength={6}
                                placeholder="Minimum 6 znaków"
                                className="w-full rounded-lg border border-neutral-800 bg-black py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Tworzenie konta..." : "Załóż konto"}
                    </button>
                </form>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-neutral-800" />
                    <span className="flex-shrink px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        lub
                    </span>
                    <div className="flex-grow border-t border-neutral-800" />
                </div>

                <GoogleSignInButton
                    loading={googleLoading}
                    disabled={loading}
                    onClick={handleGoogle}
                    label="Zarejestruj się z Google"
                    loadingLabel="Przekierowanie do Google..."
                />

                <p className="text-center text-sm text-neutral-400">
                    Masz już konto?{" "}
                    <Link
                        href="/auth/signin"
                        className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </AuthShell>
    );
}
