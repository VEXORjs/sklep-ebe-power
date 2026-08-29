"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import GoogleSignInButton from "@/app/components/GoogleSignInButton";
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

    // Wyłapywanie powrotu strzałką "Wstecz" w przeglądarce (Bfcache)
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                setGoogleLoading(false);
                setLoading(false);
            }
        };
        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    // Wyłapywanie przekierowania z powrotem przez NextAuth (gdy w URL pojawia się error)
    useEffect(() => {
        const handleGoogleLoading = async () => {
            if (searchParams.has("error")) {
                setGoogleLoading(false);
            }
        }
        void handleGoogleLoading();
    }, [searchParams]);

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
                    EBE POWER
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

            <GoogleSignInButton
                loading={googleLoading}
                disabled={loading}
                onClick={handleGoogle}
            />

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
