"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import { safeCallbackUrl } from "@/app/lib/auth-redirect";

/** Polskie komunikaty dla błędów przekazywanych przez NextAuth w ?error=... */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
    AccessDenied:
        "Odmowa dostępu. Logowanie przez Google zostało odrzucone — spróbuj ponownie za chwilę lub użyj e-maila i hasła.",
    OAuthSignin:
        "Nie udało się rozpocząć logowania przez Google. Spróbuj ponownie.",
    OAuthCallback:
        "Logowanie przez Google zostało przerwane. Spróbuj ponownie.",
    OAuthCreateAccount:
        "Nie udało się utworzyć konta przez Google. Spróbuj ponownie.",
    OAuthAccountNotLinked:
        "Konto Google nie zostało połączone. Zaloguj się e-mailem i hasłem.",
    Configuration: "Błąd konfiguracji logowania. Spróbuj ponownie później.",
};

export default function SignInForm() {
    const searchParams = useSearchParams();
    const { status } = useSession();

    const callbackUrl = useMemo(
        () => safeCallbackUrl(searchParams.get("callbackUrl")),
        [searchParams]
    );
    const fromCheckout = callbackUrl.startsWith("/checkout");

    const authError = useMemo(() => {
        const code = searchParams.get("error");
        if (!code) return null;
        return (
            AUTH_ERROR_MESSAGES[code] ??
            "Nie udało się zalogować. Spróbuj ponownie."
        );
    }, [searchParams]);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            window.location.assign(callbackUrl);
        }
    }, [status, callbackUrl]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading || googleLoading) return;

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
            callbackUrl,
        });

        if (result?.error) {
            setError("Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.");
            setLoading(false);
            return;
        }

        window.location.assign(callbackUrl);
    };

    const handleGoogle = () => {
        if (loading || googleLoading) return;
        setError(null);
        setGoogleLoading(true);
        void signIn("google", { callbackUrl });
    };

    if (status === "authenticated") {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-sm text-neutral-400">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                Jesteś zalogowany — przekierowujemy...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    TRAFO ENERGIA
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                    {fromCheckout ? "Zaloguj się, aby dokończyć zakup" : "Zaloguj się"}
                </h2>
                <p className="mt-1.5 text-sm text-neutral-400">
                    {fromCheckout
                        ? "Konto przyspiesza kasę i zapisze fakturę do zamówienia."
                        : "Wejdź na konto, żeby śledzić zamówienia i szybciej wracać do kasy."}
                </p>
            </div>

            {authError && (
                <div
                    role="alert"
                    className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-center text-xs font-medium text-amber-400"
                >
                    {authError}
                </div>
            )}

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
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-neutral-400">
                        E-mail
                    </label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <input
                            id="email"
                            type="email"
                            name="email"
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
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-neutral-800 bg-black py-3 pl-10 pr-11 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Logowanie..." : "Zaloguj się"}
                </button>
            </form>

            <div className="relative flex items-center">
                <div className="flex-grow border-t border-neutral-800" />
                <span className="flex-shrink px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    lub
                </span>
                <div className="flex-grow border-t border-neutral-800" />
            </div>

            <button
                type="button"
                onClick={handleGoogle}
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-700 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                )}
                {googleLoading ? "Przekierowanie do Google..." : "Kontynuuj z Google"}
            </button>

            <p className="text-center text-sm text-neutral-400">
                Nie masz konta?{" "}
                <Link
                    href="/register"
                    className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                >
                    Załóż je w minutę
                </Link>
            </p>
        </div>
    );
}
