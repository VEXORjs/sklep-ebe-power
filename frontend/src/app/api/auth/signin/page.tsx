'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignInPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(loading) {
            return;
        }

        setError(null);
        setLoading(true);

        // 🟢 Pobieramy dane bezpośrednio z DOM (odporne na autouzupełnianie)
        const formData = new FormData(e.currentTarget);
        const emailValue = formData.get('email') as string;
        const passwordValue = formData.get('password') as string;

        if (!emailValue || !passwordValue) {
            setError("Wypełnij wszystkie pola!");
            return;
        }

        const result = await signIn('credentials', {
            redirect: false, // Blokujemy auto-redirect, żeby obsłużyć ewentualny błąd
            email: emailValue.trim(),
            password: passwordValue,
        });

        if (result?.error) {
            setError(`Błąd: ${result.error} (Status: ${result.status})`);
            setLoading(false);
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg max-w-sm w-full space-y-4">
                <h2 className="text-2xl font-bold text-center mb-6">Logowanie TRAFO</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded font-medium text-center">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm text-neutral-400 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        autoComplete="username"
                        required
                        className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-amber-500 outline-none"
                        placeholder="user@domain.com"
                    />
                </div>
                <div>
                    <label className="block text-sm text-neutral-400 mb-1">Hasło</label>
                    <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        required
                        className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 font-bold py-2 rounded transition-colors"
                >
                    {loading ? 'Logowanie...' : 'Zaloguj się'}
                </button>
                <div className="max-w-sm w-full mx-auto mt-4 space-y-3">
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-neutral-800"></div>
                        <span className="flex-shrink mx-4 text-neutral-500 text-xs uppercase">Lub</span>
                        <div className="flex-grow border-t border-neutral-800"></div>
                    </div>

                    {/* Przycisk Google */}
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-2 px-4 rounded flex items-center justify-center space-x-2 transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Zaloguj przez Google</span>
                    </button>
                </div>
            </form>
        </div>
    );
}