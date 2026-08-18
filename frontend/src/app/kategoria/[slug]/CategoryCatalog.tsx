'use client';

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";

import { Product } from "@/app/types/product";
import ProductCard, { ProductCardVariant } from "@/app/components/ProductCard";
import { formatPLN, grossPrice, ratingOf } from "@/app/lib/product";

interface CategoryCatalogProps {
    products: Product[];
    categoryName: string;
}

type SortKey = "popularnosc" | "cena-asc" | "cena-desc" | "ocena-desc" | "nazwa-asc" | "nowosci";

const SORT_LABELS: Record<SortKey, string> = {
    popularnosc: "Sortuj: popularność",
    "cena-asc": "Cena: od najniższej",
    "cena-desc": "Cena: od najwyższej",
    "ocena-desc": "Ocena: od najwyższej",
    "nazwa-asc": "Nazwa: A–Z",
    nowosci: "Najnowsze",
};

export default function CategoryCatalog({ products, categoryName }: CategoryCatalogProps) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("popularnosc");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [onlyPromo, setOnlyPromo] = useState(false);
    const [view, setView] = useState<ProductCardVariant>("grid");

    const priceBounds = useMemo(() => {
        if (products.length === 0) return { min: 0, max: 0 };
        const values = products.map((p) => grossPrice(p.price));
        return {
            min: Math.floor(Math.min(...values)),
            max: Math.ceil(Math.max(...values)),
        };
    }, [products]);

    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const effectiveMax = maxPrice ?? priceBounds.max;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        const list = products.filter((p) => {
            const matchesQuery =
                !q ||
                p.name.toLowerCase().includes(q) ||
                (p.sku ?? "").toLowerCase().includes(q) ||
                (p.description ?? "").toLowerCase().includes(q);
            const matchesStock = !onlyAvailable || p.stock > 0;
            const matchesPromo = !onlyPromo || p.oldPrice != null || p.badge === "Promocja";
            const matchesPrice = grossPrice(p.price) <= effectiveMax + 0.01;
            return matchesQuery && matchesStock && matchesPromo && matchesPrice;
        });

        switch (sort) {
            case "cena-asc":
                return [...list].sort((a, b) => a.price - b.price);
            case "cena-desc":
                return [...list].sort((a, b) => b.price - a.price);
            case "ocena-desc":
                return [...list].sort((a, b) => ratingOf(b) - ratingOf(a));
            case "nazwa-asc":
                return [...list].sort((a, b) => a.name.localeCompare(b.name, "pl"));
            case "nowosci":
                return [...list].sort((a, b) => b.id - a.id);
            default:
                return list;
        }
    }, [products, query, sort, onlyAvailable, onlyPromo, effectiveMax]);

    const hasFilters =
        query.trim() !== "" || onlyAvailable || onlyPromo || (maxPrice !== null && maxPrice < priceBounds.max);

    const clearFilters = () => {
        setQuery("");
        setOnlyAvailable(false);
        setOnlyPromo(false);
        setMaxPrice(null);
    };

    return (
        <section id="produkty" className="scroll-mt-24">
            {/* Pasek narzędzi */}
            <div className="mb-6 rounded-xl border border-neutral-800 bg-[#141618] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Szukaj w kategorii ${categoryName}...`}
                            aria-label={`Szukaj w kategorii ${categoryName}`}
                            className="w-full rounded-md border border-neutral-800 bg-[#0f1113] py-3 pl-11 pr-10 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500/60"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Wyczyść wyszukiwanie"
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-500 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setOnlyAvailable((v) => !v)}
                            aria-pressed={onlyAvailable}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                                onlyAvailable
                                    ? "border-emerald-500 bg-emerald-500 text-slate-950"
                                    : "border-neutral-800 bg-[#0f1113] text-neutral-300 hover:border-emerald-500/60"
                            }`}
                        >
                            Tylko dostępne
                        </button>
                        <button
                            type="button"
                            onClick={() => setOnlyPromo((v) => !v)}
                            aria-pressed={onlyPromo}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                                onlyPromo
                                    ? "border-emerald-500 bg-emerald-500 text-slate-950"
                                    : "border-neutral-800 bg-[#0f1113] text-neutral-300 hover:border-emerald-500/60"
                            }`}
                        >
                            Promocje
                        </button>

                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 shrink-0 text-neutral-500" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortKey)}
                                aria-label="Sortowanie produktów"
                                className="rounded-md border border-neutral-800 bg-[#0f1113] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500/60"
                            >
                                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                                    <option key={key} value={key}>
                                        {SORT_LABELS[key]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center rounded-md border border-neutral-800 bg-[#0f1113] p-1">
                            <button
                                type="button"
                                onClick={() => setView("grid")}
                                aria-label="Widok siatki"
                                aria-pressed={view === "grid"}
                                className={`rounded p-1.5 transition-colors ${
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
                                className={`rounded p-1.5 transition-colors ${
                                    view === "list" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                                }`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtr ceny */}
                {priceBounds.max > priceBounds.min && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:gap-5">
                        <label htmlFor="cena-max" className="text-xs font-semibold text-neutral-400">
                            Cena maksymalna
                        </label>
                        <input
                            id="cena-max"
                            type="range"
                            min={priceBounds.min}
                            max={priceBounds.max}
                            step={1}
                            value={effectiveMax}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="h-1 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-500"
                        />
                        <span className="text-xs font-bold text-white">do {formatPLN(effectiveMax)}</span>
                        <span className="text-[11px] text-neutral-500">
                            zakres: {formatPLN(priceBounds.min)} – {formatPLN(priceBounds.max)}
                        </span>
                    </div>
                )}
            </div>

            {/* Wyniki */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-neutral-500">
                    Znaleziono: <span className="font-bold text-white">{filtered.length}</span>{" "}
                    {filtered.length === 1 ? "produkt" : "produktów"}
                    {products.length !== filtered.length && ` z ${products.length}`}
                </p>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                        <X className="h-3.5 w-3.5" />
                        Wyczyść filtry
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-800 py-16 text-center">
                    <p className="text-sm font-semibold text-white">Brak produktów spełniających kryteria</p>
                    <p className="mt-1 text-xs text-neutral-500">
                        Zmień filtry albo napisz do nas — sprowadzamy towar na zamówienie.
                    </p>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-5 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                    >
                        Wyczyść filtry
                    </button>
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((product, index) => (
                        <ProductCard key={product.id} product={product} priority={index < 3} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {filtered.map((product, index) => (
                        <ProductCard key={product.id} product={product} variant="list" priority={index < 2} />
                    ))}
                </div>
            )}
        </section>
    );
}
