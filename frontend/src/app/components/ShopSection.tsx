'use client';

import { useEffect, useMemo, useState } from "react";
import {usePathname, useSearchParams, useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { Product } from "@/app/types/product";
import AddToCartButton from "@/app/components/AddToCart";
import BuyNowButton from "@/app/components/BuyNowButton";

interface ShopSectionProps {
    products: Product[];
}

type SortKey = "popularnosc" | "cena-asc" | "cena-desc" | "ocena-desc";

const badgeStyle: Record<string, string> = {
    Promocja: "bg-red-600 text-white",
    Nowosc: "bg-emerald-500 text-slate-950",
    Bestseller: "bg-neutral-100 text-black",
};

function ratingOf(p: Product): number {
    return p.rating ?? Math.round((4 + ((p.id * 37) % 10) / 10) * 10) / 10;
}

function reviewsOf(p: Product): number {
    return p.reviews ?? 5 + ((p.id * 13) % 46);
}

function badgeOf(p: Product): string {
    return p.badge ?? ["Promocja", "Bestseller", "Nowość"][p.id % 3];
}

function skuOf(p: Product): string {
    return p.sku ?? `TRA-${String(p.id).padStart(4, "0")}`;
}

export default function ShopSection({ products }: ShopSectionProps) {

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("Wszystkie");
    const [sort, setSort] = useState<SortKey>("popularnosc");
    const [wishlist, setWishlist] = useState<number[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Inicjalna kategoria z linku na karcie kategorii
    useEffect(() => {
        const setcategory = async () => {
            const fromUrl = searchParams.get("kategoria");
            if (fromUrl) setCategory(fromUrl);
        }
    void setcategory();
    }, [searchParams]);

    // Lista życzeń z localStorage
    useEffect(() => {
        const setwishlist = async () => {
            try {
                const stored = localStorage.getItem("trafo_wishlist");

                if (stored) setWishlist(JSON.parse(stored));
            } catch (error) {
                console.warn("Nie udało się odczytać listy życzeń:", error);
            }
        }
     void setwishlist();
    }, []);

    const toggleWishlist = (id: number) => {
        setWishlist((prev) => {
            const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
            try {
                localStorage.setItem("trafo_wishlist", JSON.stringify(next));
            } catch (error) {
                console.warn("Nie udało się zapisać listy życzeń:", error);
            }
            return next;
        });
    };

    const categories = useMemo(
        () => [
            "Wszystkie",
            ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
        ],
        [products]
    );

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
            setCategory("Wszystkie");
        }
        else {
            params.set("kategoria", selected);
            setCategory(selected);
        }

        const queryString = params.toString();
        const targetURL = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(targetURL, { scroll: false });
    };

    return (
        <section id="produkty" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
            {/* Nagłówek sekcji */}
            <div className="mb-8">
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

            {/* Panel: wyszukiwarka + sortowanie */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Szukaj: nazwa, SKU, kategoria..."
                        className="w-full rounded-md border border-neutral-800 bg-[#141618] py-3 pl-11 pr-10 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-emerald-500/60"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
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
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        aria-label="Sortowanie produktów"
                        className="w-full rounded-md border border-neutral-800 bg-[#141618] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/60 md:w-auto"
                    >
                        <option value="popularnosc">Sortuj: popularność</option>
                        <option value="cena-asc">Cena: od najniższej</option>
                        <option value="cena-desc">Cena: od najwyższej</option>
                        <option value="ocena-desc">Ocena: od najwyższej</option>
                    </select>
                </div>
            </div>

            {/* Filtry kategorii */}
            <div className="mb-8 flex flex-wrap gap-2">
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

            {/* Licznik wyników */}
            <p className="mb-6 text-xs text-neutral-500">
                Znaleziono: <span className="font-bold text-white">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "produkt" : "produktów"}
            </p>

            {/* Siatka produktów */}
            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-800 py-16 text-center">
                    <p className="text-sm font-semibold text-white">
                        Brak produktów spełniających kryteria
                    </p>
                    <button
                        onClick={() => {
                            setQuery("");
                            setCategory("Wszystkie");
                        }}
                        className="mt-4 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                    >
                        Wyczyść filtry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {filtered.map((product, index) => {
                        const badge = badgeOf(product);
                        const rating = ratingOf(product);
                        const reviews = reviewsOf(product);
                        const isWishlisted = wishlist.includes(product.id);

                        return (
                            <div
                                key={product.id}
                                className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1c1e] shadow-lg transition-all duration-300 hover:border-neutral-700"
                            >
                                {/* Zdjęcie */}
                                <div className="relative aspect-[3/2] w-full overflow-hidden bg-white p-4">
                                    <Link href={`/products/${product.id}`}>
                                        {product.images && product.images.length > 0 && (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                priority={index < 4}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                                            />
                                        )}
                                    </Link>

                                    {/* Badge */}
                                    {badge && (
                                        <span
                                            className={`absolute left-3 top-3 z-10 rounded px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${badgeStyle[badge] ?? "bg-neutral-100 text-black"}`}
                                        >
                                            {badge}
                                        </span>
                                    )}

                                    {/* Lista życzeń */}
                                    <button
                                        onClick={() => toggleWishlist(product.id)}
                                        aria-label={
                                            isWishlisted
                                                ? "Usuń z listy życzeń"
                                                : "Dodaj do listy życzeń"
                                        }
                                        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 shadow-md backdrop-blur transition-all hover:scale-110"
                                    >
                                        <Heart
                                            className={`h-4 w-4 transition-colors ${
                                                isWishlisted
                                                    ? "fill-emerald-500 text-emerald-500"
                                                    : "text-white"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Treść */}
                                <div className="flex flex-grow flex-col p-5">
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                        {skuOf(product)}
                                        {product.category ? ` · ${product.category}` : ""}
                                    </p>

                                    <Link
                                        href={`/products/${product.id}`}
                                        className="mb-3 block flex-grow"
                                    >
                                        <h3 className="text-sm font-bold uppercase leading-tight tracking-wide text-white transition-colors hover:text-emerald-300">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {/* Ocena */}
                                    <div className="mb-4 flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${
                                                        i < Math.round(rating)
                                                            ? "fill-emerald-400 text-emerald-400"
                                                            : "text-neutral-700"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-white">
                                            {rating.toFixed(1)}
                                        </span>
                                        <span className="text-[11px] text-neutral-500">
                                            ({reviews} opinii)
                                        </span>
                                    </div>

                                    {/* Cena + akcje */}
                                    <div className="mt-auto border-t border-neutral-800 pt-4">
                                        <div className="mb-4 flex flex-col">
                                            <span className="text-2xl font-extrabold text-white">
                                                {(product.price * 1.23).toFixed(2).replace(".", ",")} zł
                                                <span className="ml-2 text-[10px] font-normal text-neutral-500">
                                                    brutto
                                                </span>
                                            </span>
                                            {product.oldPrice ? (
                                                <span className="mt-0.5 text-xs text-neutral-500 line-through">
                                                    {(product.oldPrice * 1.23).toFixed(2).replace(".", ",")} zł
                                                </span>
                                            ) : (
                                                <span className="mt-0.5 text-xs font-medium text-neutral-500">
                                                    {product.price.toFixed(2).replace(".", ",")} zł netto
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-xs font-bold ${
                                                    product.stock > 0
                                                        ? "text-green-400"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {product.stock > 0 ? "✓ Dostępny" : "Niedostępny"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="transition-transform duration-300 hover:scale-110">
                                                    <AddToCartButton product={product} />
                                                </div>
                                                <div className="transition-transform duration-300 hover:scale-110">
                                                    <BuyNowButton product={product} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
