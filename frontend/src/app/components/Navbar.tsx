'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useCart } from '@/app/context/CartContext';
import Image from "next/image";

export default function Navbar() {
    const { data: session } = useSession();
    const { cart, openCart } = useCart();

    const itemsCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <nav className="bg-neutral-950 border-b border-neutral-850 text-white py-4 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
            {/* LOGO */}
            <Link href="/" className="flex items-center h-11 w-auto">
                <Image src={"https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/Zrzut%20ekranu%202026-07-12%20165154.png"} alt={"logo"}
                     className="h-full w-auto object-contain"
                />
            </Link>

            {/* LINKI I PROFIL */}
            <div className="flex items-center gap-6">
                {/* NAWIGACJA (desktop) */}
                <div className="hidden items-center gap-6 lg:flex">
                    <Link href="/#produkty" className="text-sm font-medium text-neutral-300 transition-colors hover:text-emerald-400">
                        Oferta
                    </Link>
                    <Link href="/wynajem" className="text-sm font-medium text-neutral-300 transition-colors hover:text-emerald-400">
                        Wynajem
                    </Link>
                    <Link href="/serwis" className="text-sm font-medium text-neutral-300 transition-colors hover:text-emerald-400">
                        Serwis
                    </Link>
                </div>

                {/* KOSZYK */}
                <button
                    onClick={() => openCart()}
                    className="relative group p-2 hover:text-emerald-400 transition-colors flex items-center gap-2"
                    aria-label="Otwórz koszyk"
                >
                    <span className="text-xl">🛒</span>
                    <span className="text-sm font-medium hidden sm:inline">Koszyk</span>
                    {itemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemsCount}
            </span>
                    )}
                </button>

                <div className="h-6 w-px bg-neutral-800 hidden sm:block"></div>

                {/* PROFIL / LOGOWANIE */}
                {session ? (
                    <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400 hidden md:inline">
              Cześć, <span className="text-white font-semibold">{session.user?.name}</span>
            </span>
                        <button
                            onClick={() => signOut()}
                            className="bg-neutral-900 hover:bg-red-950 hover:text-red-400 text-neutral-300 px-4 py-2 rounded-md text-sm font-medium border border-neutral-800 hover:border-red-900 transition-all"
                        >
                            Wyloguj się
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/register"
                            className="text-neutral-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
                        >
                            Zarejestruj się
                        </Link>
                        <button
                            onClick={() => signIn()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md text-sm font-semibold shadow-md shadow-emerald-950/40 transition-all"
                        >
                            Zaloguj się
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}