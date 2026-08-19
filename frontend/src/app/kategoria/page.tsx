import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, ChevronRight, Package, ShieldCheck, Truck } from "lucide-react";

import { getProducts } from "@/app/services/productService";
import { allCategories, productsInCategory } from "@/app/data/categories";
import { pluralPL } from "@/app/lib/product";
import { formatPLN, grossPrice, productsLabel } from "@/app/lib/product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Kategorie produktów | TRAFO ENERGIA",
    description:
        "Pełna oferta sklepu TRAFO ENERGIA w podziale na kategorie: transformatory, zasilacze, rozdzielnice, bezpieczniki, kable, mierniki, agregaty, stacje ładowania EV i akcesoria.",
};

export default async function CategoriesPage() {
    const products = await getProducts();
    const categories = allCategories(products);

    return (
        <main className="min-h-screen bg-black text-white">
            <header className="border-b border-neutral-900 bg-[#0b0d0e]">
                <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <nav aria-label="Okruszki" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
                        <Link href="/" className="transition-colors hover:text-emerald-400">
                            Strona główna
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="font-semibold text-neutral-300">Kategorie</span>
                    </nav>

                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Katalog
                    </span>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Wszystkie kategorie
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
                        {products.length} {productsLabel(products.length)} w {categories.length} {pluralPL(categories.length, "kategorii", "kategoriach", "kategoriach")}. Każda sekcja ma własną
                        stronę z filtrami, poradnikiem doboru i odpowiedziami na najczęstsze pytania.
                    </p>

                    <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-400">
                        <li className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-emerald-500" /> Wysyłka w 24 h
                        </li>
                        <li className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" /> 24 miesiące gwarancji
                        </li>
                        <li className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-emerald-500" /> Darmowa dostawa od 500 zł
                        </li>
                    </ul>
                </div>
            </header>

            <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => {
                        const items = productsInCategory(products, category);
                        const cheapest =
                            items.length > 0 ? Math.min(...items.map((p) => grossPrice(p.price))) : null;

                        return (
                            <Link
                                key={category.slug}
                                href={`/kategoria/${category.slug}`}
                                className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#141618] transition-all duration-300 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-950/30"
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#141618] via-black/50 to-black/10" />
                                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/50 bg-black/50 text-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <h2 className="text-lg font-extrabold text-white">{category.name}</h2>
                                        <p className="text-[11px] text-neutral-400">{category.tagline}</p>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-neutral-400">
                                        {category.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between border-t border-neutral-800 pt-4 text-xs">
                                        <span className="font-bold text-white">
                                            {items.length} {productsLabel(items.length)}
                                        </span>
                                        <span className="text-neutral-500">
                                            {cheapest !== null ? (
                                                <>
                                                    od{" "}
                                                    <span className="font-bold text-emerald-400">
                                                        {formatPLN(cheapest)}
                                                    </span>
                                                </>
                                            ) : (
                                                "na zamówienie"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
