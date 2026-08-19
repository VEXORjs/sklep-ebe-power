'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    Check,
    Heart,
    Minus,
    Package,
    Plus,
    ShieldCheck,
    Star,
    Truck,
    Zap,
} from "lucide-react";

import { Product } from "@/app/types/product";
import AddToCartButton from "@/app/components/AddToCart";
import BuyNowButton from "@/app/components/BuyNowButton";
import { useWishlist } from "@/app/hooks/useWishlist";
import { categorySlugOf } from "@/app/data/categories";
import {
    badgeOf,
    discountPercent,
    formatPLN,
    grossPrice,
    hasFreeShipping,
    installmentOf,
    INSTALLMENT_MONTHS,
    parseParameters,
    ratingOf,
    reviewsOf,
    savingsGross,
    skuOf,
    soldCountOf,
    stockInfo,
} from "@/app/lib/product";

export type ProductCardVariant = "grid" | "list";

interface ProductCardProps {
    product: Product;
    variant?: ProductCardVariant;
    /** Priorytet ładowania zdjęcia (pierwsze karty nad zgięciem strony). */
    priority?: boolean;
}

const BADGE_STYLE: Record<string, string> = {
    Promocja: "bg-red-600 text-white",
    Nowość: "bg-emerald-500 text-slate-950",
    Nowosc: "bg-emerald-500 text-slate-950",
    Bestseller: "bg-neutral-100 text-black",
    Wyprzedaż: "bg-amber-500 text-slate-950",
};

const STOCK_TONE: Record<string, { dot: string; text: string; bar: string }> = {
    in: { dot: "bg-emerald-400", text: "text-emerald-400", bar: "bg-emerald-500" },
    low: { dot: "bg-amber-400", text: "text-amber-400", bar: "bg-amber-500" },
    out: { dot: "bg-red-500", text: "text-red-400", bar: "bg-red-500" },
};

function Rating({ rating, reviews }: { rating: number; reviews: number }) {
    return (
        <div className="flex items-center gap-1.5">
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
            <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-neutral-500">({reviews} opinii)</span>
        </div>
    );
}

function QuantityPicker({
    value,
    max,
    onChange,
}: {
    value: number;
    max: number;
    onChange: (next: number) => void;
}) {
    const limit = Math.max(1, max);
    return (
        <div className="flex items-center rounded-md border border-neutral-800 bg-[#0f1113]">
            <button
                type="button"
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value <= 1}
                aria-label="Zmniejsz liczbę sztuk"
                className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:opacity-30"
            >
                <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2.25rem] text-center text-sm font-bold text-white" aria-live="polite">
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(limit, value + 1))}
                disabled={value >= limit}
                aria-label="Zwiększ liczbę sztuk"
                className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-white disabled:opacity-30"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export default function ProductCard({
    product,
    variant = "grid",
    priority = false,
}: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [imageFailed, setImageFailed] = useState(false);
    const { toggle, isWishlisted } = useWishlist();

    const badge = badgeOf(product);
    const discount = discountPercent(product);
    const savings = savingsGross(product);
    const rating = ratingOf(product);
    const reviews = reviewsOf(product);
    const sku = skuOf(product);
    const stock = stockInfo(product.stock);
    const tone = STOCK_TONE[stock.tone];
    const specs = parseParameters(product.parameters);
    const categorySlug = categorySlugOf(product);
    const gross = grossPrice(product.price);
    const wishlisted = isWishlisted(product.id);
    const freeShipping = hasFreeShipping(product);
    const sold = soldCountOf(product);
    const href = `/products/${product.id}`;
    const cover = product.images?.[0];
    const hoverImage = product.images?.[1];

    const media = (
        <div
            className={`relative shrink-0 overflow-hidden bg-white ${
                variant === "list"
                    ? "aspect-[4/3] w-full sm:h-full sm:w-56 sm:aspect-auto"
                    : "aspect-[4/3] w-full"
            }`}
        >
            <Link href={href} aria-label={product.name} className="absolute inset-0 block p-6">
                {cover && !imageFailed && (
                    <Image
                        src={cover}
                        alt={product.name}
                        fill
                        priority={priority}
                        onError={() => setImageFailed(true)}
                        sizes={variant === "list" ? "224px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                        className={`object-contain p-4 transition-all duration-500 ${
                            hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
                        }`}
                    />
                )}
                {hoverImage && !imageFailed && (
                    <Image
                        src={hoverImage}
                        alt={`${product.name} — ujęcie dodatkowe`}
                        fill
                        sizes={variant === "list" ? "224px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                        className="object-contain p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                )}
                {(!cover || imageFailed) && (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400">
                        <Package className="h-8 w-8" />
                        <span className="px-4 text-center text-[11px] font-semibold uppercase tracking-wider">
                            {product.category ?? "Zdjęcie wkrótce"}
                        </span>
                    </span>
                )}
            </Link>

            {/* Etykiety */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
                {badge && (
                    <span
                        className={`rounded px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                            BADGE_STYLE[badge] ?? "bg-neutral-100 text-black"
                        }`}
                    >
                        {badge}
                    </span>
                )}
                {discount !== null && (
                    <span className="rounded bg-black px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-400">
                        −{discount}%
                    </span>
                )}
                {stock.tone === "low" && (
                    <span className="rounded bg-amber-500 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-950">
                        Ostatnie sztuki
                    </span>
                )}
            </div>

            {/* Lista życzeń */}
            <button
                type="button"
                onClick={() => toggle(product.id)}
                aria-label={wishlisted ? "Usuń z listy życzeń" : "Dodaj do listy życzeń"}
                aria-pressed={wishlisted}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 shadow-md backdrop-blur transition-all hover:scale-110"
            >
                <Heart
                    className={`h-4 w-4 transition-colors ${
                        wishlisted ? "fill-emerald-500 text-emerald-500" : "text-white"
                    }`}
                />
            </button>

            {/* Pasek podglądu */}
            <Link
                href={href}
                className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full items-center justify-center gap-2 bg-black/80 py-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur transition-transform duration-300 group-hover:translate-y-0"
            >
                Zobacz szczegóły
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );

    const specList = specs.length > 0 && (
        <dl
            className={`mb-4 grid gap-x-4 gap-y-1.5 rounded-md border border-neutral-800/80 bg-[#111315] p-3 ${
                variant === "list" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            }`}
        >
            {specs.slice(0, variant === "list" ? 6 : 4).map((spec) => (
                <div key={`${spec.label}-${spec.value}`} className="flex items-baseline justify-between gap-3">
                    <dt className="truncate text-[11px] text-neutral-500">{spec.label}</dt>
                    <dd className="shrink-0 text-[11px] font-semibold text-neutral-200">{spec.value}</dd>
                </div>
            ))}
            {specs.length > (variant === "list" ? 6 : 4) && (
                <Link
                    href={href}
                    className="text-[11px] font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                >
                    + {specs.length - (variant === "list" ? 6 : 4)} więcej parametrów
                </Link>
            )}
        </dl>
    );

    const availability = (
        <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className={`flex items-center gap-1.5 text-xs font-bold ${tone.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    {stock.label}
                </span>
                <span className="text-[11px] text-neutral-500">{stock.detail}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${stock.barPercent}%` }} />
            </div>
        </div>
    );

    const logistics = (
        <ul className="mb-4 space-y-1.5 text-[11px] text-neutral-400">
            <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {freeShipping ? (
                    <span>
                        <span className="font-semibold text-emerald-400">Darmowa dostawa</span> — wysyłka w 24 h
                    </span>
                ) : (
                    <span>Wysyłka w 24 h · kurier od 16,99 zł</span>
                )}
            </li>
            <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                24 miesiące gwarancji · faktura VAT
            </li>
            <li className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                30 dni na zwrot · sprzedano {sold} szt.
            </li>
        </ul>
    );

    const priceBlock = (
        <div className="mb-4">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-2xl font-extrabold leading-none text-white">{formatPLN(gross)}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">brutto</span>
                {product.oldPrice ? (
                    <span className="text-xs text-neutral-500 line-through">
                        {formatPLN(grossPrice(product.oldPrice))}
                    </span>
                ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[11px] text-neutral-500">{formatPLN(product.price)} netto</span>
                {savings !== null && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
                        Oszczędzasz {formatPLN(savings)}
                    </span>
                )}
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
                lub {INSTALLMENT_MONTHS} × {formatPLN(installmentOf(product))} w ratach 0 %
            </p>
        </div>
    );

    const actions = (
        <div className="space-y-2.5">
            <div className="flex items-center gap-2">
                <QuantityPicker value={quantity} max={product.stock} onChange={setQuantity} />
                <AddToCartButton
                    product={product}
                    quantity={quantity}
                    label={
                        <span className="flex items-center justify-center gap-2">
                            <Check className="h-4 w-4" />
                            Do koszyka
                        </span>
                    }
                    onAdded={() => setQuantity(1)}
                    className="flex h-9 flex-1 items-center justify-center rounded-md bg-emerald-500 px-4 text-xs font-extrabold uppercase tracking-wide text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                />
            </div>
            <div className="flex items-center gap-2">
                <BuyNowButton
                    product={product}
                    quantity={quantity}
                    label={
                        <span className="flex items-center justify-center gap-2">
                            <Zap className="h-4 w-4" />
                            Kup teraz
                        </span>
                    }
                    className="flex h-9 flex-1 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 px-4 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:border-emerald-500/60 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                />
                <Link
                    href={href}
                    className="flex h-9 items-center justify-center rounded-md border border-neutral-800 px-3 text-xs font-semibold text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                >
                    Szczegóły
                </Link>
            </div>
        </div>
    );

    const header = (
        <>
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <span className="rounded border border-neutral-800 px-1.5 py-0.5">{sku}</span>
                {product.category &&
                    (categorySlug ? (
                        <Link
                            href={`/kategoria/${categorySlug}`}
                            className="transition-colors hover:text-emerald-400"
                        >
                            {product.category}
                        </Link>
                    ) : (
                        <span>{product.category}</span>
                    ))}
            </div>

            <Link href={href}>
                <h3 className="mb-2 line-clamp-2 text-sm font-bold uppercase leading-snug tracking-wide text-white transition-colors hover:text-emerald-300">
                    {product.name}
                </h3>
            </Link>

            <div className="mb-3">
                <Rating rating={rating} reviews={reviews} />
            </div>

            {product.description && (
                <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                    {product.description}
                </p>
            )}
        </>
    );

    if (variant === "list") {
        return (
            <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#1a1c1e] shadow-lg transition-all duration-300 hover:border-neutral-700 sm:flex-row">
                {media}
                <div className="flex flex-1 flex-col gap-6 p-5 lg:flex-row">
                    <div className="flex-1">
                        {header}
                        {specList}
                    </div>
                    <div className="flex w-full shrink-0 flex-col border-neutral-800 lg:w-64 lg:border-l lg:pl-6">
                        {priceBlock}
                        {availability}
                        {logistics}
                        <div className="mt-auto">{actions}</div>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#1a1c1e] shadow-lg transition-all duration-300 hover:border-neutral-700 hover:shadow-emerald-950/20">
            {media}
            <div className="flex flex-1 flex-col p-5">
                {header}
                {specList}
                <div className="mt-auto border-t border-neutral-800 pt-4">
                    {priceBlock}
                    {availability}
                    {logistics}
                    {actions}
                </div>
            </div>
        </article>
    );
}
