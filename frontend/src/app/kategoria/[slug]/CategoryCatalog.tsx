'use client';

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";

import { Product } from "@/app/types/product";
import ProductCard, { ProductCardVariant } from "@/app/components/ProductCard";
import { formatPLN, grossPrice, productsLabel, ratingOf } from "@/app/lib/product";

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

type GeneratorFilter = "producent" | "fazy" | "paliwo" | "rozruch";
type GeneratorFilters = Record<GeneratorFilter, string[]>;

const GENERATOR_OPTIONS: Record<GeneratorFilter, string[]> = {
    producent: ["Pramac", "CGM"],
    fazy: ["Jednofazowy", "Trójfazowy", "DUAL"],
    paliwo: ["Benzyna", "Diesel", "LPG / NG"],
    rozruch: ["Ręczny", "Elektryczny", "Ręczny i elektryczny"],
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const parameterText = (product: Product) => {
    const parameters = product.parameters;
    return normalize(typeof parameters === "string" ? parameters : Object.entries(parameters ?? {}).flat().join(" "));
};

function powerInKw(product: Product): number | null {
    const parameters = product.parameters;
    const text = typeof parameters === "string"
        ? parameters
        : Object.entries(parameters ?? {})
            .filter(([key]) => /moc_(znamionowa|maksymalna|ciagla)/i.test(key))
            .map(([, value]) => value)
            .join(" ");
    const match = text.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(kva|kw|va|w)\b/i);
    if (!match) return null;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    return unit === "w" || unit === "va" ? value / 1000 : value;
}

function matchesGeneratorOption(product: Product, group: GeneratorFilter, option: string) {
    const text = `${normalize(product.name)} ${parameterText(product)}`;
    if (group === "producent") return text.includes(normalize(option));
    if (group === "fazy") {
        if (option === "Jednofazowy") return /jednofaz|liczba_faz.?[^]*?\b1\b|\b230\s*v/.test(text) && !/dual|400\s*\/\s*230/.test(text);
        if (option === "Trójfazowy") return /trojfaz|liczba_faz.?[^]*?\b3\b|\b400\s*v/.test(text) && !/dual|400\s*\/\s*230/.test(text);
        return /dual|400\s*\/\s*230|230\s*\/\s*400/.test(text);
    }
    if (group === "paliwo") {
        if (option === "Diesel") return /diesel|olej napedowy/.test(text);
        if (option === "LPG / NG") return /lpg|gaz ziemny|\bng\b|gaz plynny/.test(text);
        return text.includes("benzyna");
    }
    if (option === "Ręczny i elektryczny") return /reczny.*elektryczny|elektryczny.*reczny/.test(text);
    return text.includes(normalize(option));
}

export default function CategoryCatalog({ products, categoryName }: CategoryCatalogProps) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("popularnosc");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [onlyPromo, setOnlyPromo] = useState(false);
    const [view, setView] = useState<ProductCardVariant>("grid");
    const [generatorFilters, setGeneratorFilters] = useState<GeneratorFilters>({
        producent: [], fazy: [], paliwo: [], rozruch: [],
    });
    // Pola są zatwierdzane przyciskiem, aby klient mógł wygodnie wpisać cały zakres.
    const [powerDraft, setPowerDraft] = useState({ min: "", max: "" });
    const [powerRange, setPowerRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
    const isGeneratorCategory = normalize(categoryName).includes("agregat");

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
            const matchesGeneratorFilters = !isGeneratorCategory || (Object.keys(generatorFilters) as GeneratorFilter[]).every((group) =>
                generatorFilters[group].length === 0 || generatorFilters[group].some((option) => matchesGeneratorOption(p, group, option))
            );
            const power = powerInKw(p);
            // Brak deklaracji mocy nie wyklucza produktu, dopóki zakres nie jest użyty.
            const matchesPower = !isGeneratorCategory || (powerRange.min === null && powerRange.max === null) ||
                (power !== null && (powerRange.min === null || power >= powerRange.min) && (powerRange.max === null || power <= powerRange.max));
            return matchesQuery && matchesStock && matchesPromo && matchesPrice && matchesGeneratorFilters && matchesPower;
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
    }, [products, query, sort, onlyAvailable, onlyPromo, effectiveMax, generatorFilters, powerRange, isGeneratorCategory]);

    const hasGeneratorFilters = Object.values(generatorFilters).some((selected) => selected.length > 0) || powerRange.min !== null || powerRange.max !== null;
    const hasFilters =
        query.trim() !== "" || onlyAvailable || onlyPromo || (maxPrice !== null && maxPrice < priceBounds.max) || hasGeneratorFilters;

    const clearFilters = () => {
        setQuery("");
        setOnlyAvailable(false);
        setOnlyPromo(false);
        setMaxPrice(null);
        setGeneratorFilters({ producent: [], fazy: [], paliwo: [], rozruch: [] });
        setPowerDraft({ min: "", max: "" });
        setPowerRange({ min: null, max: null });
    };

    const toggleGeneratorFilter = (group: GeneratorFilter, option: string) => {
        setGeneratorFilters((current) => ({
            ...current,
            [group]: current[group].includes(option)
                ? current[group].filter((item) => item !== option)
                : [...current[group], option],
        }));
    };

    const applyPowerRange = () => {
        const parse = (value: string) => value.trim() === "" ? null : Number(value.replace(",", "."));
        const min = parse(powerDraft.min);
        const max = parse(powerDraft.max);
        if ((min !== null && (!Number.isFinite(min) || min < 0)) || (max !== null && (!Number.isFinite(max) || max < 0))) return;
        setPowerRange({ min, max });
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

                {isGeneratorCategory && (
                    <fieldset className="mt-4 border-t border-neutral-800 pt-4">
                        <legend className="text-sm font-bold text-white">Parametry agregatu mobilnego</legend>
                        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {(Object.keys(GENERATOR_OPTIONS) as GeneratorFilter[]).map((group) => (
                                <div key={group}>
                                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                        {{ producent: "Producent", fazy: "Liczba faz", paliwo: "Paliwo", rozruch: "Typ rozruchu" }[group]}
                                    </p>
                                    <div className="space-y-1.5">
                                        {GENERATOR_OPTIONS[group].map((option) => (
                                            <label key={option} className="flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
                                                <input type="checkbox" checked={generatorFilters[group].includes(option)} onChange={() => toggleGeneratorFilter(group, option)} className="h-3.5 w-3.5 rounded border-neutral-600 bg-[#0f1113] accent-emerald-500" />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-neutral-800 pt-4">
                            <div>
                                <label htmlFor="moc-od" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Moc od (kW / kVA)</label>
                                <input id="moc-od" inputMode="decimal" value={powerDraft.min} onChange={(e) => setPowerDraft((v) => ({ ...v, min: e.target.value }))} placeholder="np. 3" className="w-32 rounded-md border border-neutral-800 bg-[#0f1113] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/60" />
                            </div>
                            <div>
                                <label htmlFor="moc-do" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Moc do (kW / kVA)</label>
                                <input id="moc-do" inputMode="decimal" value={powerDraft.max} onChange={(e) => setPowerDraft((v) => ({ ...v, max: e.target.value }))} placeholder="np. 10" className="w-32 rounded-md border border-neutral-800 bg-[#0f1113] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/60" />
                            </div>
                            <button type="button" onClick={applyPowerRange} className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400">Zatwierdź zakres</button>
                        </div>
                    </fieldset>
                )}

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
                    {productsLabel(filtered.length)}
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
