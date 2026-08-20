'use client';

import { useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { Product } from "@/app/types/product";
import ProductCard, { ProductCardVariant } from "@/app/components/ProductCard";
import { CATEGORIES, allCategories } from "@/app/data/categories";
import { normalizeText, productsLabel, ratingOf, slugify } from "@/app/lib/product";

interface ShopSectionProps {
    products: Product[];
    /** Ile kart wyrenderować na starcie (reszta po kliknięciu — mniejszy DOM / TBT). */
    initialVisible?: number;
}

type SortKey = "popularnosc" | "cena-asc" | "cena-desc" | "ocena-desc";

export default function ShopSection({ products, initialVisible = 9 }: ShopSectionProps) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("popularnosc");
    const [view, setView] = useState<ProductCardVariant>("grid");
    const [expanded, setExpanded] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Źródłem prawdy dla aktywnej kategorii jest adres URL (?kategoria=...),
    // dzięki czemu filtr przetrwa odświeżenie strony i działa z przyciskiem „wstecz".
    const category = searchParams.get("kategoria") ?? "Wszystkie";

    const categories = useMemo(
        () => [
            "Wszystkie",
            ...(Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]),
        ],
        [products]
    );

    /** Strona kategorii odpowiadająca aktywnemu filtrowi (jeśli istnieje). */
    const activeCategorySlug = useMemo(() => {
        if (category === "Wszystkie") return null;
        const known = CATEGORIES.find((c) =>
            c.match.some((m) => normalizeText(m) === normalizeText(category))
        );
        return known?.slug ?? slugify(category);
    }, [category]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        const list = products.filter((p) => {
            const matchesCategory =
                category === "Wszystkie" || (p.category ?? "") === category;
            const matchesQuery =
                !q ||
                p.name.toLowerCase().includes(q) ||
                (p.sku ?? "").toLowerCase().includes(q) ||
                (p.category ?? "").toLowerCase().includes(q);
            return matchesCategory && matchesQuery;
        });

        switch (sort) {
            case "cena-asc":
                return [...list].sort((a, b) => a.price - b.price);
            case "cena-desc":
                return [...list].sort((a, b) => b.price - a.price);
            case "ocena-desc":
                return [...list].sort((a, b) => ratingOf(b) - ratingOf(a));
            default:
                return list;
        }
    }, [products, query, category, sort]);

    const handleCategorySelect = (selected: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (category === selected || selected === "Wszystkie") {
            params.delete("kategoria");
        } else {
            params.set("kategoria", selected);
        }

        const queryString = params.toString();
        const targetURL = queryString ? `${pathname}?${queryString}` : pathname;
        setExpanded(false);
        router.replace(targetURL, { scroll: false });
    };

    const visible = expanded ? filtered.length : initialVisible;
    const categoryCount = allCategories(products).length;

    return (
        <section id="produkty" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
            {/* Nagłówek sekcji */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Nasz sklep
                    </span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        Produkty ⚡
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                        Transformatory, zasilacze, rozdzielnice, kable i osprzęt — gotowe do wysyłki w 24 h.
                    </p>
                </div>
                <Link
                    href="/kategoria"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition-colors hover:text-emerald-300"
                >
                    Przeglądaj {categoryCount} kategorii
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Panel: wyszukiwarka + sortowanie */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setExpanded(false);
                        }}
                        placeholder="Szukaj: nazwa, SKU, kategoria..."
                        className="w-full rounded-md border border-neutral-800 bg-[#141618] py-3 pl-11 pr-10 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-emerald-500/60"
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery("");
                                setExpanded(false);
                            }}
                            aria-label="Wyczyść wyszukiwanie"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-500 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <SlidersHorizontal className="h-4 w-4 shrink-0 text-neutral-500" />
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value as SortKey);
                            setExpanded(false);
                        }}
                        aria-label="Sortowanie produktów"
                        className="w-full rounded-md border border-neutral-800 bg-[#141618] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/60 md:w-auto"
                    >
                        <option value="popularnosc">Sortuj: popularność</option>
                        <option value="cena-asc">Cena: od najniższej</option>
                        <option value="cena-desc">Cena: od najwyższej</option>
                        <option value="ocena-desc">Ocena: od najwyższej</option>
                    </select>

                    <div className="flex items-center rounded-md border border-neutral-800 bg-[#141618] p-1">
                        <button
                            type="button"
                            onClick={() => setView("grid")}
                            aria-label="Widok siatki"
                            aria-pressed={view === "grid"}
                            className={`rounded p-2 transition-colors ${
                                view === "grid" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("list")}
                            aria-label="Widok listy"
                            aria-pressed={view === "list"}
                            className={`rounded p-2 transition-colors ${
                                view === "list" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                            }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtry kategorii */}
            <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                            category === cat
                                ? "border-emerald-500 bg-emerald-500 text-slate-950"
                                : "border-neutral-800 bg-[#141618] text-neutral-300 hover:border-emerald-500/60 hover:text-emerald-300"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Licznik wyników + przejście na stronę kategorii */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-neutral-500">
                    Znaleziono: <span className="font-bold text-white">{filtered.length}</span>{" "}
                    {productsLabel(filtered.length)}
                </p>
                {activeCategorySlug && (
                    <Link
                        href={`/kategoria/${activeCategorySlug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                        Otwórz stronę kategorii &bdquo;{category}&rdquo;
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                )}
            </div>

            {/* Siatka produktów */}
            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-800 py-16 text-center">
                    <p className="text-sm font-semibold text-white">
                        Brak produktów spełniających kryteria
                    </p>
                    <button
                        onClick={() => {
                            setQuery("");
                            handleCategorySelect("Wszystkie");
                        }}
                        className="mt-4 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                    >
                        Wyczyść filtry
                    </button>
                </div>
            ) : (
                <>
                    {view === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.slice(0, visible).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {filtered.slice(0, visible).map((product) => (
                                <ProductCard key={product.id} product={product} variant="list" />
                            ))}
                        </div>
                    )}
                    {filtered.length > visible && (
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setExpanded(true)}
                                className="rounded-md border border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
                            >
                                Pokaż wszystkie {filtered.length} {productsLabel(filtered.length)}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
