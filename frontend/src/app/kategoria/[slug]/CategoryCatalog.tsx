'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";

import { Product } from "@/app/types/product";
import ProductCard, { ProductCardVariant } from "@/app/components/ProductCard";
import { formatPLN, grossPrice, productsLabel, ratingOf } from "@/app/lib/product";
import { PRODUCER_LABELS, producerFromValue } from "@/app/components/ProducerParamLink";

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

// Funkcja normalizująca tekst (usuwa polskie znaki, małe litery)
const normalize = (value: string) =>
    (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Zrzuca całą wiedzę o produkcie do jednego stringa (żeby filtry łapały wszystko)
const parameterText = (product: Product) => {
    const paramsStr = typeof product.parameters === "string"
        ? product.parameters
        : JSON.stringify(product.parameters || {});
    return normalize(`${product.name} ${product.description || ""} ${paramsStr}`);
};

// Szuka wartości mocy (np. 3.5 kW, 4 kVA) i konwertuje do uniwersalnych kW
function powerInKw(product: Product): number | null {
    const text = parameterText(product).replace(/,/g, ".");
    const match = text.match(/(\d+(?:\.\d+)?)\s*(kva|kw|va|w)\b/i);
    if (!match) return null;

    const value = Number(match[1]);
    const unit = match[2];
    return (unit === "w" || unit === "va") ? value / 1000 : value;
}

// Logika sprawdzania, czy produkt pasuje do checkboxa
function matchesGeneratorOption(product: Product, group: GeneratorFilter, option: string) {
    const text = parameterText(product);

    if (group === "producent") return text.includes(normalize(option));

    if (group === "fazy") {
        if (option === "Jednofazowy") return /jednofaz|1-faz|230\s*v/.test(text) && !/dual|400\s*\/\s*230/.test(text);
        if (option === "Trójfazowy") return /trojfaz|3-faz|400\s*v/.test(text) && !/dual|400\s*\/\s*230/.test(text);
        return /dual|400\s*\/\s*230|230\s*\/\s*400/.test(text);
    }

    if (group === "paliwo") {
        if (option === "Diesel") return /diesel|olej napedowy|on\b/.test(text);
        if (option === "LPG / NG") return /lpg|gaz ziemny|gaz plynny|ng\b/.test(text);
        return text.includes("benzyna");
    }

    if (group === "rozruch") {
        if (option === "Ręczny i elektryczny") return /reczny.*elektryczny|elektryczny.*reczny/.test(text);
        return text.includes(normalize(option));
    }

    return false;
}

function CategoryCatalogInner({ products, categoryName }: CategoryCatalogProps) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("popularnosc");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [onlyPromo, setOnlyPromo] = useState(false);
    const [view, setView] = useState<ProductCardVariant>("grid");

    // Na mobile panel filtrów nie może stać pełnej szerokości między
    // kategoriami a produktami — chowamy go za przyciskiem „Filtry” i
    // otwieramy jako szufladę od dołu (bottom sheet).
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filtersRef = useRef<HTMLElement>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Producent wybrany przy wejściu w kategorię z siatki marek na stronie
    // głównej (?producent=pramac|cgm) — zaznaczamy go w checkboxach.
    // Sam stan katalogu jest kluczowany marką (patrz CategoryCatalog), więc
    // przy zmianie marki w adresie katalog startuje od czystych filtrów z
    // odpowiednim zaznaczonym producentem.
    const producerParam = producerFromValue(searchParams.get("producent"));
    const producerOption = producerParam ? PRODUCER_LABELS[producerParam] : null;

    const [generatorFilters, setGeneratorFilters] = useState<GeneratorFilters>(() => ({
        producent: producerOption ? [producerOption] : [], fazy: [], paliwo: [], rozruch: [],
    }));
    const [powerDraft, setPowerDraft] = useState({ min: "", max: "" });
    const [powerRange, setPowerRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });

    // Złapie zarówno "Agregaty", "Generator", jak i podobne słowa w nazwie kategorii
    const isGeneratorCategory = /agregat|generator/.test(normalize(categoryName));

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

            // Checkboxy Agregatów
            const matchesGeneratorFilters = !isGeneratorCategory || (Object.keys(generatorFilters) as GeneratorFilter[]).every((group) =>
                generatorFilters[group].length === 0 || generatorFilters[group].some((option) => matchesGeneratorOption(p, group, option))
            );

            // Zakres mocy
            const power = powerInKw(p);
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

        // Usuwamy producenta też z adresu, żeby po odświeżeniu strony
        // filtr nie wrócił sam.
        if (searchParams.has("producent")) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("producent");
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }
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

    // Ile filtrów jest aktywanych — pokazywane na przycisku „Filtry” na mobile,
    // żeby po zamknięciu szuflady było widać, że coś jednak zawęża wyniki.
    const activeFilterCount =
        (query.trim() !== "" ? 1 : 0) +
        (onlyAvailable ? 1 : 0) +
        (onlyPromo ? 1 : 0) +
        (maxPrice !== null && maxPrice < priceBounds.max ? 1 : 0) +
        Object.values(generatorFilters).reduce((sum, selected) => sum + selected.length, 0) +
        (powerRange.min !== null || powerRange.max !== null ? 1 : 0);

    // Otwarta szuflada: blokada przewijania strony + zamykanie klawiszem Escape.
    useEffect(() => {
        if (!filtersOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setFiltersOpen(false);
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);
        filtersRef.current?.focus({ preventScroll: true });

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [filtersOpen]);

    return (
        <section id="produkty" className="scroll-mt-24 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">

                {/*
                  =======================================================
                  LEWA KOLUMNA: FILTRY (Sidebar)
                  =======================================================
                */}
                <aside
                    ref={filtersRef}
                    id="katalog-filtry"
                    aria-label="Filtry w katalogu"
                    role={filtersOpen ? "dialog" : undefined}
                    aria-modal={filtersOpen ? true : undefined}
                    tabIndex={-1}
                    className={`space-y-6 rounded-xl border border-neutral-800 bg-[#151719] p-5 outline-none lg:sticky lg:top-24 lg:h-fit lg:w-[280px] lg:shrink-0 ${
                        filtersOpen
                            ? "filter-sheet max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[999] max-lg:max-h-[85dvh] max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-b-none max-lg:border-x-0 max-lg:border-b-0 max-lg:px-4 max-lg:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-lg:shadow-2xl"
                            : "hidden lg:block"
                    }`}
                >
                    {/* Uchwyt i zamknięcie — tylko w szufladzie mobilnej */}
                    <div className="mx-auto mb-3 hidden h-1 w-10 rounded-full bg-neutral-700 max-lg:block" aria-hidden="true" />
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <h2 className="text-base font-extrabold text-white">Filtruj wyniki</h2>
                        <div className="flex items-center gap-3">
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="hidden text-[11px] font-semibold text-neutral-500 hover:text-emerald-400 uppercase tracking-wider transition-colors lg:inline"
                                >
                                    Wyczyść
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(false)}
                                aria-label="Zamknij filtry"
                                className="-mr-1.5 hidden rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white max-lg:block"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Szukaj — w panelu tylko od lg; poniżej lg jest nad produktami */}
                    <div className="relative hidden lg:block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Szukaj modelu..."
                            className="w-full rounded-md border border-neutral-700 bg-[#0f1113] py-2.5 pl-10 pr-9 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500/60"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-500 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Dostępność i Promocje */}
                    <div className="space-y-3 border-t border-neutral-800 pt-5">
                        <label className="flex cursor-pointer items-center gap-3 group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={onlyAvailable}
                                    onChange={() => setOnlyAvailable(!onlyAvailable)}
                                    className="peer appearance-none h-4 w-4 rounded border border-neutral-600 bg-[#0f1113] checked:border-emerald-500 checked:bg-emerald-500 transition-all cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 text-neutral-950 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">Tylko dostępne</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-3 group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={onlyPromo}
                                    onChange={() => setOnlyPromo(!onlyPromo)}
                                    className="peer appearance-none h-4 w-4 rounded border border-neutral-600 bg-[#0f1113] checked:border-emerald-500 checked:bg-emerald-500 transition-all cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 text-neutral-950 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">Tylko w promocji</span>
                        </label>
                    </div>

                    {/* Filtry agregatów */}
                    {isGeneratorCategory && (
                        <>
                            {(Object.keys(GENERATOR_OPTIONS) as GeneratorFilter[]).map((group) => (
                                <div key={group} className="border-t border-neutral-800 pt-5">
                                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">
                                        {{ producent: "Producent", fazy: "Liczba faz", paliwo: "Paliwo", rozruch: "Typ rozruchu" }[group]}
                                    </h3>
                                    <div className="space-y-2.5">
                                        {GENERATOR_OPTIONS[group].map((option) => (
                                            <label key={option} className="flex cursor-pointer items-center gap-3 group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={generatorFilters[group].includes(option)}
                                                        onChange={() => toggleGeneratorFilter(group, option)}
                                                        className="peer appearance-none h-4 w-4 rounded border border-neutral-600 bg-[#0f1113] checked:border-emerald-500 checked:bg-emerald-500 transition-all cursor-pointer"
                                                    />
                                                    <svg className="absolute w-3 h-3 text-neutral-950 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Moc */}
                            <div className="border-t border-neutral-800 pt-5">
                                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Zakres mocy (kW / kVA)</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        inputMode="decimal"
                                        value={powerDraft.min}
                                        onChange={(e) => setPowerDraft((v) => ({ ...v, min: e.target.value }))}
                                        placeholder="Od"
                                        className="w-full rounded-md border border-neutral-700 bg-[#0f1113] px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500/60 placeholder:text-neutral-600 transition-colors"
                                    />
                                    <span className="text-neutral-500">-</span>
                                    <input
                                        inputMode="decimal"
                                        value={powerDraft.max}
                                        onChange={(e) => setPowerDraft((v) => ({ ...v, max: e.target.value }))}
                                        placeholder="Do"
                                        className="w-full rounded-md border border-neutral-700 bg-[#0f1113] px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500/60 placeholder:text-neutral-600 transition-colors"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={applyPowerRange}
                                    className="w-full mt-3 rounded-md bg-neutral-800 hover:bg-emerald-600 border border-neutral-700 hover:border-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all"
                                >
                                    Zastosuj moc
                                </button>
                            </div>
                        </>
                    )}

                    {/* Cena */}
                    {priceBounds.max > priceBounds.min && (
                        <div className="border-t border-neutral-800 pt-5 flex flex-col gap-2">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Maks. Cena</h3>
                                <span className="text-xs font-bold text-emerald-400">{formatPLN(effectiveMax)}</span>
                            </div>
                            <input
                                type="range"
                                min={priceBounds.min}
                                max={priceBounds.max}
                                step={1}
                                value={effectiveMax}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-500"
                            />
                            <span className="text-[10px] text-neutral-500 mt-1">
                                zakres: {formatPLN(priceBounds.min)} – {formatPLN(priceBounds.max)}
                            </span>
                        </div>
                    )}

                    {/* Stopka szuflady — mobile: liczba wyników od razu po zmianie filtrów */}
                    <div className="hidden items-center gap-3 border-t border-neutral-800 pt-4 max-lg:sticky max-lg:bottom-0 max-lg:flex max-lg:bg-[#151719]">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-md border border-neutral-700 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300 transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
                        >
                            Wyczyść
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltersOpen(false)}
                            className="flex-1 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                        >
                            Pokaż {filtered.length} {productsLabel(filtered.length)}
                        </button>
                    </div>
                </aside>

                {/* Tło szuflady filtrów (mobile) */}
                {filtersOpen && (
                    <div
                        onClick={() => setFiltersOpen(false)}
                        aria-hidden="true"
                        className="fixed inset-0 z-[998] bg-black/70 backdrop-blur-sm lg:hidden"
                    />
                )}


                {/*
                  =======================================================
                  PRAWA KOLUMNA: WYNIKI I SORTOWANIE
                  =======================================================
                */}
                <div className="flex-1">
                    {/* Szukaj — wyniesione przed panel filtrów, żeby na mobile
                        zostało zawsze widoczne nad produktami (od lg siedzi w
                        kolumnie filtrów po lewej). */}
                    <div className="relative mb-3 lg:hidden">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Szukaj produktu po nazwie, SKU lub opisie"
                            placeholder="Szukaj modelu..."
                            className="w-full rounded-lg border border-neutral-800 bg-[#151719] py-3 pl-11 pr-10 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500/60"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Wyczyść wyszukiwanie"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-500 transition-colors hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Górny pasek */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-neutral-800 bg-[#151719] p-2.5 px-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-neutral-400 font-medium">
                                Znaleziono: <span className="font-bold text-white">{filtered.length}</span>{" "}
                                {productsLabel(filtered.length)}
                            </p>

                            {/* Filtry jako szuflada — do lg kolumna filtrów jest ukryta */}
                            <button
                                type="button"
                                onClick={() => setFiltersOpen((open) => !open)}
                                aria-expanded={filtersOpen}
                                aria-controls="katalog-filtry"
                                className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-[#0f1113] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-emerald-500/60 hover:text-emerald-300 lg:hidden"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                                Filtry
                                {activeFilterCount > 0 && (
                                    <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-neutral-500 lg:block" />
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortKey)}
                                    aria-label="Sortowanie produktów"
                                    className="rounded-md border-none bg-transparent py-1 text-sm text-white outline-none focus:ring-0 cursor-pointer"
                                >
                                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                                        <option key={key} value={key} className="bg-[#151719]">
                                            {SORT_LABELS[key]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="h-5 w-px bg-neutral-800 hidden sm:block"></div>

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

                    {/* Siatka produktów */}
                    {filtered.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-800 py-20 text-center">
                            <p className="text-base font-semibold text-white">Brak produktów spełniających kryteria</p>
                            <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto">
                                Zmień filtry albo napisz do nas — sprowadzamy również towar na specjalne zamówienie.
                            </p>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-6 rounded-md bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                            >
                                Wyczyść filtry
                            </button>
                        </div>
                    ) : view === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
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
                </div>
            </div>
        </section>
    );
}

function CatalogFallback() {
    return (
        <section id="produkty" className="scroll-mt-24 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-[#151719] text-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-500" />
                <p className="text-sm text-neutral-500">Ładowanie katalogu…</p>
            </div>
        </section>
    );
}

function CategoryCatalogSuspender({ products, categoryName }: CategoryCatalogProps) {
    const searchParams = useSearchParams();
    const producer = producerFromValue(searchParams.get("producent"));

    // klucz = marka z adresu: zmiana marki (przejście m.in. z siatki marek na
    // stronie głównej) uruchamia katalog od nowa z zaznaczonym odpowiednim
    // producentem, bez dodatkowej synchronizacji stanu w efekcie.
    return <CategoryCatalogInner key={producer ?? "bez-marki"} products={products} categoryName={categoryName} />;
}

export default function CategoryCatalog(props: CategoryCatalogProps) {
    // useSearchParams() na statycznie generowanych stronach (generateStaticParams)
    // musi być wewnątrz granicy <Suspense> — inaczej Next.js blokuje build.
    return (
        <Suspense fallback={<CatalogFallback />}>
            <CategoryCatalogSuspender {...props} />
        </Suspense>
    );
}
