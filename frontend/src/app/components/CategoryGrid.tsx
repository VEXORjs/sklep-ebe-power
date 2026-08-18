import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/app/types/product";
import { allCategories, productsInCategory } from "@/app/data/categories";
import { formatPLN, grossPrice, productsLabel } from "@/app/lib/product";

interface CategoryGridProps {
    products: Product[];
    /** Ile kafelków pokazać na stronie głównej. */
    limit?: number;
}

export default function CategoryGrid({ products, limit = 9 }: CategoryGridProps) {
    // Najpierw kategorie, w których faktycznie mamy towar.
    const categories = allCategories(products)
        .map((category) => ({ category, items: productsInCategory(products, category) }))
        .sort((a, b) => b.items.length - a.items.length)
        .slice(0, limit);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Kategorie
                    </span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        Kupuj według kategorii
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-neutral-400">
                        Każda kategoria ma własną stronę z filtrami, poradnikiem doboru i pełną
                        specyfikacją produktów.
                    </p>
                </div>
                <Link
                    href="/kategoria"
                    className="text-sm font-semibold text-neutral-400 transition-colors hover:text-emerald-300"
                >
                    Wszystkie kategorie →
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(({ category, items }) => {
                    const cheapest =
                        items.length > 0 ? Math.min(...items.map((p) => grossPrice(p.price))) : null;

                    return (
                        <Link
                            key={category.slug}
                            href={`/kategoria/${category.slug}`}
                            className="group relative h-48 overflow-hidden rounded-lg border border-neutral-800 transition-all duration-300 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-950/30"
                        >
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />

                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                                <div>
                                    <h3 className="text-base font-extrabold text-white">{category.name}</h3>
                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-neutral-400">
                                        {category.tagline}
                                    </p>
                                    <p className="mt-1.5 text-[11px] font-semibold text-neutral-300">
                                        {items.length} {productsLabel(items.length)}
                                        {cheapest !== null && (
                                            <span className="text-emerald-400"> · od {formatPLN(cheapest)}</span>
                                        )}
                                    </p>
                                </div>
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/50 bg-black/40 text-emerald-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
