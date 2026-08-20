import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nie znaleziono produktu",
    description: "Ten produkt mógł zostać wycofany z oferty. Sprawdź inne produkty w naszym sklepie.",
    robots: { index: false, follow: true },
};

export default function ProductNotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">404</p>
            <h1 className="mt-2 text-3xl font-extrabold">Nie znaleziono produktu</h1>
            <p className="mt-3 max-w-md text-sm text-neutral-400">
                Ten model mógł zostać wycofany z oferty albo link jest nieaktualny.
                Sprawdź podobne produkty w naszym sklepie.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                    href="/#produkty"
                    className="rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                >
                    Zobacz ofertę
                </Link>
                <Link
                    href="/kategoria"
                    className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-emerald-500/60"
                >
                    Kategorie
                </Link>
            </div>
        </main>
    );
}
