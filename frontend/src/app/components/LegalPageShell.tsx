import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface LegalPageProps {
    eyebrow: string;
    title: string;
    updated: string;
    children: React.ReactNode;
}

/** Wspólny układ stron informacyjnych (regulamin, prywatność, dostawa, zwroty). */
export default function LegalPageShell({
    eyebrow,
    title,
    updated,
    children,
}: LegalPageProps) {
    return (
        <main className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <article className="max-w-4xl mx-auto">
                {/* Nawigacja okruszkowa */}
                <nav aria-label="Okruszki" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                    <Link href="/" className="transition-colors hover:text-emerald-400">
                        Strona główna
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="font-semibold text-neutral-300">{title}</span>
                </nav>

                {/* Nagłówek strony */}
                <header className="border-b border-neutral-800 pb-8 mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {eyebrow}
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
                        {title}
                    </h1>
                    <p className="text-neutral-500 mt-3 text-xs sm:text-sm">
                        Ostatnia aktualizacja: <time>{updated}</time>
                    </p>
                </header>

                <div className="space-y-10 text-sm sm:text-base leading-relaxed text-neutral-300">
                    {children}
                </div>
            </article>
        </main>
    );
}

export function LegalSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-3">
                {title}
            </h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}
