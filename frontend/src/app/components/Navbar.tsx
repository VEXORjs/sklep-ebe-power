'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useCart } from '@/app/context/CartContext';
import Image from "next/image";
import { currentPathCallbackUrl } from '@/app/lib/auth-redirect';
import ThemeToggle from '@/app/components/ThemeToggle';
import { CATEGORIES } from '@/app/data/categories';
import { ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();
    const { cart, openCart } = useCart();
    const pathname = usePathname();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const itemsCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

    // Automatyczne zamykanie menu mobilnego po zmianie podstrony
    useEffect(() => {
        const setters = async ()=> {
            setIsMobileMenuOpen(false);
            setIsDropdownOpen(false);
            setIsMobileCategoriesOpen(false);
        }
    void setters();
    }, [pathname]);

    // Zamykanie dropdownu po kliknięciu poza obszarem
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav aria-label="Nawigacja główna" className="bg-neutral-950 border-b border-neutral-800 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* LOGO */}
                <Link href="/" className="flex items-center h-10 w-auto">
                    <Image
                        src="https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/EBE_Power_1_upscaled.jpeg"
                        alt="EBE POWER"
                        className="h-full w-auto object-contain border border-neutral-800 rounded-md"
                        width={156}
                        height={67}
                        priority
                        quality={75}
                    />
                </Link>

                {/* NAWIGACJA (Desktop) */}
                <div className="hidden lg:flex items-center gap-6">
                    {/* DROPDOWN KATEGORIE */}
                    <div
                        className="relative"
                        ref={dropdownRef}
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <button
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 text-sm font-medium text-neutral-300 transition-colors hover:text-emerald-400 focus:outline-none py-2"
                            aria-expanded={isDropdownOpen}
                        >
                            <span>Kategorie</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute left-0 top-full pt-1 w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="rounded-xl border border-neutral-800 bg-[#101214] p-2 shadow-2xl">
                                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-800/60 mb-1">
                                        Wybierz kategorię
                                    </div>
                                    <div className="max-h-[380px] overflow-y-auto space-y-0.5">
                                        {CATEGORIES.map((category) => (
                                            <Link
                                                key={category.slug}
                                                href={`/kategoria/${category.slug}`}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="group flex flex-col px-3 py-2 rounded-lg text-sm transition-colors hover:bg-neutral-800/70"
                                            >
                                                <span className="font-semibold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                                                    {category.name}
                                                </span>
                                                <span className="text-xs text-neutral-500 line-clamp-1">
                                                    {category.tagline}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mt-1 pt-1 border-t border-neutral-800/60">
                                        <Link
                                            href="/kategoria"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block px-3 py-1.5 text-center text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            Wszystkie kategorie →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/#produkty" className="text-sm font-medium text-neutral-300 transition-colors hover:text-emerald-400">
                        Oferta
                    </Link>
                    {/* <Link href="/wynajem" className="text-sm font-medium text-neutral-300 transition-colors hover:text-emerald-400">
                        Wynajem
                    </Link>
                    <Link href="/serwis" className="text-sm font-medium text-neutral-300 transition-colors hover:text-emerald-400">
                        Serwis
                    </Link> */}
                </div>

                {/* PRAWA STRONA (Motyw, Koszyk, Logowanie, Hamburger) */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <ThemeToggle />

                    {/* KOSZYK */}
                    <button
                        onClick={() => openCart()}
                        className="relative p-2 text-neutral-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
                        aria-label="Otwórz koszyk"
                    >
                        <span className="text-xl leading-none">🛒</span>
                        <span className="text-sm font-medium hidden md:inline">Koszyk</span>
                        {itemsCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-slate-950 text-xs font-extrabold rounded-full h-5 w-5 flex items-center justify-center">
                                {itemsCount}
                            </span>
                        )}
                    </button>

                    <div className="h-5 w-px bg-neutral-800 hidden sm:block"></div>

                    {/* PROFIL / LOGOWANIE (Desktop) */}
                    <div className="hidden sm:flex items-center gap-3">
                        {session ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-400 hidden lg:inline">
                                    Cześć, <span className="text-white font-semibold">{session.user?.name}</span>
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="bg-neutral-900 hover:bg-red-950 hover:text-red-400 text-neutral-300 px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-800 hover:border-red-900 transition-all"
                                >
                                    Wyloguj
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/register"
                                    className="text-neutral-300 hover:text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                >
                                    Rejestracja
                                </Link>
                                <button
                                    onClick={() => signIn(undefined, { callbackUrl: currentPathCallbackUrl() })}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow transition-all"
                                >
                                    Zaloguj
                                </button>
                            </div>
                        )}
                    </div>

                    {/* PRZYCISK MENU MOBILNEGO (Hamburger) */}
                    <button
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="lg:hidden p-2 text-neutral-400 hover:text-white focus:outline-none transition-colors"
                        aria-label="Otwórz menu mobilne"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* ROZWIJANE MENU MOBILNE */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-neutral-850 bg-neutral-950/95 backdrop-blur-xl px-4 py-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col space-y-3">
                        {/* Akordeon kategorii na mobile */}
                        <div>
                            <button
                                onClick={() => setIsMobileCategoriesOpen((prev) => !prev)}
                                className="flex w-full items-center justify-between py-2 text-base font-semibold text-neutral-200 hover:text-emerald-400 transition-colors"
                            >
                                <span>Kategorie produktów</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                            </button>

                            {isMobileCategoriesOpen && (
                                <div className="ml-2 mt-1 space-y-1 border-l-2 border-neutral-800 pl-3">
                                    <Link
                                        href="/kategoria"
                                        className="block py-1.5 text-xs font-bold text-emerald-400"
                                    >
                                        Wszystkie kategorie →
                                    </Link>
                                    {CATEGORIES.map((c) => (
                                        <Link
                                            key={c.slug}
                                            href={`/kategoria/${c.slug}`}
                                            className="block py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/#produkty"
                            className="py-2 text-base font-semibold text-neutral-200 hover:text-emerald-400 transition-colors"
                        >
                            Oferta
                        </Link>
                        <Link
                            href="/wynajem"
                            className="py-2 text-base font-semibold text-neutral-200 hover:text-emerald-400 transition-colors"
                        >
                            Wynajem
                        </Link>
                        <Link
                            href="/serwis"
                            className="py-2 text-base font-semibold text-neutral-200 hover:text-emerald-400 transition-colors"
                        >
                            Serwis
                        </Link>

                        {/* Strefa autoryzacji w menu mobilnym */}
                        <div className="pt-4 mt-2 border-t border-neutral-850">
                            {session ? (
                                <div className="space-y-3">
                                    <div className="text-sm text-neutral-400">
                                        Zalogowano jako: <span className="font-bold text-white">{session.user?.name}</span>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="w-full text-center bg-neutral-900 border border-neutral-800 text-red-400 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors"
                                    >
                                        Wyloguj się
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/register"
                                        className="flex items-center justify-center border border-neutral-800 bg-neutral-900 text-neutral-200 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                                    >
                                        Rejestracja
                                    </Link>
                                    <button
                                        onClick={() => signIn(undefined, { callbackUrl: currentPathCallbackUrl() })}
                                        className="flex items-center justify-center bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-500 transition-colors"
                                    >
                                        Logowanie
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
