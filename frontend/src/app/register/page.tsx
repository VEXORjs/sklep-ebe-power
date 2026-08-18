"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' || 'http://localhost:3000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
            })
        });
        if (res.status === 200) {
            router.push("/api/auth/signin");
        }
        else {
            const error = await res.text();
            setError(error || "Coś poszło nie tak");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg max-w-sm w-full space-y-4">
                <h2 className="text-2xl font-bold text-center mb-6">Rejestracja TRAFO</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded font-medium text-center">
                        {error}
                    </div>
                )}

                {/* POLE: IMIĘ */}
                <div>
                    <label className="block text-sm text-neutral-400 mb-1">Imię</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-amber-500 outline-none"
                        placeholder="Twoje imię"
                    />
                </div>

                {/* POLE: EMAIL */}
                <div>
                    <label className="block text-sm text-neutral-400 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                        className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-amber-500 outline-none"
                        placeholder="user@domain.com"
                    />
                </div>

                {/* POLE: HASŁO */}
                <div>
                    <label className="block text-sm text-neutral-400 mb-1">Hasło</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        className="w-full bg-black border border-neutral-800 rounded p-2 text-white focus:border-amber-500 outline-none"
                    />
                </div>

                {/* PRZYCISK */}
                <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 font-bold py-2 rounded transition-colors mt-2"
                >
                    Zarejestruj się
                </button>
            </form>
        </div>
    );
}