import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/app/types/product";
import { allCategories, productsInCategory } from "@/app/data/categories";
import { formatPLN, grossPrice, productsLabel } from "@/app/lib/product";

interface CategoryGridProps {
    products: Product[];
    /** Ile kafelków pokazać w danej kolumnie (domyślnie 4 na kolumnę dla równowagi). */
    limit?: number;
}

export default function CategoryGrid({ products, limit = 6 }: CategoryGridProps) {
    // Sprawdzanie, czy produkt należy do podanej marki na podstawie nazwy i parametrów
    const isBrand = (product: Product, brand: string) => {
        const text = `${product.name} ${JSON.stringify(product.parameters || "")}`.toLowerCase();
        return text.includes(brand.toLowerCase());
    };

    // Podział puli produktów
    const pramacProducts = products.filter((p) => isBrand(p, "pramac"));
    const cgmProducts = products.filter((p) => isBrand(p, "cgm"));

    // Funkcja wyciągająca kategorie dla danej grupy produktów
    const getCategories = (prods: Product[]) => {
        return allCategories(prods)
            .map((category) => ({ category, items: productsInCategory(prods, category) }))
            .filter(({ items }) => items.length > 0)
            .sort((a, b) => b.items.length - a.items.length)
            .slice(0, limit);
    };

    const cgmCategories = getCategories(cgmProducts);
    const pramacCategories = getCategories(pramacProducts);

    // Komponent pomocniczy renderujący pojedynczy kafelek kategorii
    const renderCategoryCard = ({ category, items }: { category: any; items: Product[] }) => {
        const cheapest = items.length > 0 ? Math.min(...items.map((p) => grossPrice(p.price))) : null;

        return (
            <Link
                key={category.slug}
                href={`/kategoria/${category.slug}`}
                className="group relative h-48 overflow-hidden rounded-lg border border-neutral-800 transition-all duration-300 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-950/30"
            >
                <Image
                    src={category.image}
                    alt={`${category.name} — ${category.tagline}`}
                    fill
                    quality={70}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <div>
                        <h4 className="text-sm font-extrabold text-white">{category.name}</h4>
                        <p className="mt-0.5 line-clamp-1 text-[10px] text-neutral-400">
                            {category.tagline}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-neutral-300">
                            {items.length} {productsLabel(items.length)}
                            {cheapest !== null && (
                                <span className="text-emerald-400"> · od {formatPLN(cheapest)}</span>
                            )}
                        </p>
                    </div>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-500/50 bg-black/40 text-emerald-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                </div>
            </Link>
        );
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            {/* GŁÓWNY NAGŁÓWEK */}
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Top Producenci
                    </span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        Wybierz markę i kategorię
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-neutral-400">
                        Podzieliliśmy naszą ofertę na dwóch czołowych europejskich producentów.
                        Wybierz markę, która spełnia Twoje oczekiwania.
                    </p>
                </div>
                <Link
                    href="/kategoria"
                    className="shrink-0 text-sm font-semibold text-neutral-400 transition-colors hover:text-emerald-300"
                >
                    Wszystkie kategorie →
                </Link>
            </div>

            {/* PODZIAŁ NA DWIE KOLUMNY */}
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-center">

                {/* LEWA STRONA: CGM */}
                <div className="flex w-full flex-1 flex-col rounded-2xl border border-neutral-800 bg-[#151719] p-5 shadow-xl sm:p-6">
                    <div className="mb-6 flex flex-col items-center gap-1 border-b border-neutral-800/80 pb-4 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-wide text-white">Agregaty CGM</h3>
                        <p className="text-xs text-neutral-400">Włoska niezawodność i solidne rozwiązania</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 [&>a]:w-full [&>a]:sm:w-[calc(50%-0.5rem)]">
                        {cgmCategories.length > 0 ? (
                            cgmCategories.map(renderCategoryCard)
                        ) : (
                            <p className="w-full py-10 text-center text-sm text-neutral-500">
                                Brak kategorii dla marki CGM.
                            </p>
                        )}
                    </div>
                </div>

                {/* PRAWA STRONA: PRAMAC */}
                <div className="flex w-full flex-1 flex-col rounded-2xl border border-neutral-800 bg-[#151719] p-5 shadow-xl sm:p-6">
                    <div className="mb-6 flex flex-col items-center gap-1 border-b border-neutral-800/80 pb-4 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-wide text-white">Agregaty Pramac</h3>
                        <p className="text-xs text-neutral-400">Światowy lider w branży zasilania awaryjnego</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 [&>a]:w-full [&>a]:sm:w-[calc(50%-0.5rem)]">
                        {pramacCategories.length > 0 ? (
                            pramacCategories.map(renderCategoryCard)
                        ) : (
                            <p className="w-full py-10 text-center text-sm text-neutral-500">
                                Brak kategorii dla marki Pramac.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
}