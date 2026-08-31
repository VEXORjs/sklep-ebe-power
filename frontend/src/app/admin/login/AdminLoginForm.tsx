"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Eye, EyeOff, Loader2, Lock, LogOut, Mail, ShieldAlert } from "lucide-react";

import { safeCallbackUrl } from "@/app/lib/auth-redirect";

/**
 * Ekran logowania do panelu administratora (/admin/login).
 *
 * Używa dedykowanego przebiegu logowania (adminLogin=true → endpoint backendu
 * /api/auth/admin-login), który wymaga konta z rolą ADMIN — zwykły klient
 * sklepu, nawet z poprawnym hasłem, nie utworzy sesji administratora.
 * Dodatkowo middleware blokuje /admin/** dla tokenów bez roli ADMIN.
 */
export default function AdminLoginForm() {
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    const callbackUrl = useMemo(
        () => safeCallbackUrl(searchParams.get("callbackUrl"), "/admin"),
        [searchParams]
    );

    const isForbidden = searchParams.get("error") === "forbidden";

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Zalogowany administrator nie powinien widzieć ekranu logowania
    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "ADMIN" && !isForbidden) {
            window.location.assign(callbackUrl);
        }
    }, [status, session, callbackUrl, isForbidden]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading) return;

        setError(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const emailValue = String(formData.get("email") ?? "").trim();
        const passwordValue = String(formData.get("password") ?? "");

        if (!emailValue || !passwordValue) {
            setError("Wypełnij wszystkie pola.");
            setLoading(false);
            return;
        }

        const result = await signIn("credentials", {
            redirect: false,
            email: emailValue,
            password: passwordValue,
            adminLogin: "true",
            callbackUrl,
        });

        if (result?.error) {
            setError("Nieprawidłowy e-mail lub hasło.");
            setLoading(false);
            return;
        }

        // Pełne przeładowanie — middleware oceni rolę na świeżym ciasteczku sesji.
        // Konto bez roli ADMIN wróci tu z ?error=forbidden.
        window.location.assign(callbackUrl);
    };

    const sessionLoading = status === "loading" || loading;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
            <div className="w-full max-w-md">
                {/* Logo / nagłówek */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold shadow-lg shadow-blue-500/20">
                        e
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">ebe power Admin</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Panel zarządzania sklepem — dostęp tylko dla administratorów
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
                    {isForbidden && (
                        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                                <div>
                                    <p className="font-medium text-amber-300">
                                        To konto nie ma uprawnień administratora.
                                    </p>
                                    <p className="mt-1 text-slate-400">
                                        Zaloguj się na konto z rolą ADMIN.
                                    </p>
                                    {status === "authenticated" && (
                                        <button
                                            type="button"
                                            onClick={() => signOut({ callbackUrl: "/admin/login" })}
                                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            Wyloguj się i przełącz konto
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && !isForbidden && (
                        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    required
                                    disabled={sessionLoading}
                                    placeholder="admin@ebe-power.pl"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                                Hasło
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    disabled={sessionLoading}
                                    placeholder="••••••••••"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-12 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:text-slate-300"
                                    aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sessionLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Logowanie…
                                </>
                            ) : (
                                "Zaloguj się do panelu"
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                    <Link href="/" className="transition-colors hover:text-slate-300">
                        ← Wróć do sklepu
                    </Link>
                    <span className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        Połączenie szyfrowane
                    </span>
                </div>
            </div>
        </div>
    );
}
