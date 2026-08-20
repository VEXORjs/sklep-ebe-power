import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 — Strona nie została znaleziona",
    description: "Szukana strona nie istnieje. Sprawdź adres URL lub wróć do strony głównej sklepu ebe power.",
    robots: { index: false, follow: true },
};

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Błąd 404
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">
                Strona nie została znaleziona
            </h1>
            <p className="mt-3 max-w-md text-sm text-neutral-400">
                Przepraszamy, szukana strona nie istnieje, mogła zostać przeniesiona
                lub link jest nieaktualny.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                    href="/"
                    className="rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                >
                    Strona główna
                </Link>
                <Link
                    href="/kategoria"
                    className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-emerald-500/60"
                >
                    Kategorie produktów
                </Link>
                <Link
                    href="/#produkty"
                    className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-emerald-500/60"
                >
                    Wszystkie produkty
                </Link>
            </div>
        </main>
    );
}
