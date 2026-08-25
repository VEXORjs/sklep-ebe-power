import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
    BadgeCheck,
    ChevronRight,
    FileText,
    Package,
    ShieldCheck,
    Star,
    Truck,
} from "lucide-react";

import ProductGallery from "@/app/components/ProductGallery";
import ProductBuyBox from "@/app/components/ProductBuyBox";
import ProductInfoTabs from "@/app/components/ProductInfoTabs";
import CatalogPdfButton from "@/app/components/CatalogPdfButton";
import ProductCard from "@/app/components/ProductCard";
import { getProduct, getProducts } from "@/app/services/productService";
import { categoryOf, categorySlugOf } from "@/app/data/categories";
import {
    badgeOf,
    discountPercent,
    formatPLN,
    FREE_SHIPPING_THRESHOLD,
    grossPrice,
    hasFreeShipping,
    parseParameters,
    ratingOf,
    reviewEntriesOf,
    reviewsOf,
    savingsGross,
    SHIPPING_COST,
    skuOf,
    soldCountOf,
    stockInfo,
} from "@/app/lib/product";

export const revalidate = 60;

const loadProduct = cache(getProduct);
const loadProducts = cache(getProducts);

/** Pre-render all known product pages at build time for SEO. */
export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((p) => ({ id: String(p.id) }));
}

interface PageProps {
    params: Promise<{ id: string }>;
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await loadProduct(id);

    if (!product) {
        return { title: "Nie znaleziono produktu" };
    }

    const gross = grossPrice(product.price);
    const category = categoryOf(product);
    const descriptionText = product.description?.slice(0, 155) || `${product.name} — kup w sklepie ebe power. Wysyłka w 24 h, gwarancja 24 mies., faktura VAT.`;

    return {
        title: `${product.name}${category ? ` — ${category.name}` : ""} | Kup online`,
        description: `${descriptionText} Cena: ${gross.toFixed(2).replace(".", ",")} zł brutto. Darmowa dostawa od 500 zł.`,
        alternates: { canonical: `/products/${product.id}` },
        keywords: [
            product.name,
            product.category ?? "",
            "kup online",
            "sklep elektryczny",
            "ebe power",
        ].filter(Boolean),
        openGraph: {
            title: `${product.name} — Kup w ebe power`,
            description: descriptionText,
            images: product.images?.length
                ? product.images.map((img) => ({
                      url: img,
                      width: 800,
                      height: 600,
                      alt: product.name,
                  }))
                : [],
            type: "article",
            url: `/products/${product.id}`,
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: descriptionText,
            images: product.images?.[0] ? [product.images[0]] : [],
        },
        robots: { index: true, follow: true },
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;
    const product = await loadProduct(id);

    if (!product) {
        notFound();
    }

    const [catalog] = await Promise.all([loadProducts()]);
    const specs = parseParameters(product.parameters);
    const categorySlug = categorySlugOf(product);
    const category = categoryOf(product);
    const badge = badgeOf(product);
    const discount = discountPercent(product);
    const savings = savingsGross(product);
    const rating = ratingOf(product);
    const reviews = reviewsOf(product);
    const sku = skuOf(product);
    const stock = stockInfo(product.stock);
    const tone = STOCK_TONE[stock.tone];
    const gross = grossPrice(product.price);
    const freeShipping = hasFreeShipping(product);
    const sold = soldCountOf(product);
    const reviewEntries = reviewEntriesOf(product);

    const related = catalog
        .filter((item) => item.id !== product.id)
        .sort((a, b) => {
            const aMatch = a.category && a.category === product.category ? 1 : 0;
            const bMatch = b.category && b.category === product.category ? 1 : 0;
            return bMatch - aMatch;
        })
        .slice(0, 3);

    const site = "https://ebe-power.pl";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        sku,
        mpn: sku,
        image: product.images,
        brand: { "@type": "Brand", name: "TRAFO ENERGIA" },
        category: product.category,
        url: `${site}/products/${product.id}`,
        offers: {
            "@type": "Offer",
            priceCurrency: "PLN",
            price: gross.toFixed(2),
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            availability:
                product.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            url: `${site}/products/${product.id}`,
            seller: {
                "@type": "Organization",
                name: "ebe power — TRAFO ENERGIA",
                url: site,
            },
            shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                    "@type": "MonetaryAmount",
                    value: hasFreeShipping(product) ? "0" : "16.99",
                    currency: "PLN",
                },
                shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "PL",
                },
                deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "d" },
                    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "d" },
                },
            },
            hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "PL",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 30,
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
            },
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: reviews,
        },
        review: reviewEntries.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: 5,
            },
            reviewBody: r.text,
        })),
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Strona główna", item: site },
            { "@type": "ListItem", position: 2, name: "Kategorie", item: `${site}/kategoria` },
            ...(category
                ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${site}/kategoria/${category.slug}` }]
                : []),
            { "@type": "ListItem", position: category ? 4 : 3, name: product.name, item: `${site}/products/${product.id}` },
        ],
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <nav
                    aria-label="Okruszki"
                    className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500"
                >
                    <Link href="/" className="transition-colors hover:text-emerald-400">
                        Strona główna
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/kategoria" className="transition-colors hover:text-emerald-400">
                        Kategorie
                    </Link>
                    {product.category && categorySlug && (
                        <>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <Link
                                href={`/kategoria/${categorySlug}`}
                                className="transition-colors hover:text-emerald-400"
                            >
                                {product.category}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="font-semibold text-neutral-300">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
                    <ProductGallery product={product} />

                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
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
                                <span className="rounded bg-black px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-500/40">
                                    −{discount}%
                                </span>
                            )}
                            {stock.tone === "low" && (
                                <span className="rounded bg-amber-500 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-950">
                                    Ostatnie sztuki
                                </span>
                            )}
                            <span className="rounded border border-neutral-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                {sku}
                            </span>
                            {product.category &&
                                (categorySlug ? (
                                    <Link
                                        href={`/kategoria/${categorySlug}`}
                                        className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 transition-colors hover:text-emerald-400"
                                    >
                                        {product.category}
                                    </Link>
                                ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                        {product.category}
                                    </span>
                                ))}
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            {product.name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                            i < Math.round(rating)
                                                ? "fill-emerald-400 text-emerald-400"
                                                : "text-neutral-700"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-white">{rating.toFixed(1)}</span>
                            <span className="text-xs text-neutral-500">
                                {reviews} opinii · sprzedano {sold} szt.
                            </span>
                        </div>

                        <div className="mt-6 border-t border-neutral-800 pt-6">
                            <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                                <span className="text-4xl font-extrabold leading-none text-white">
                                    {formatPLN(gross)}
                                </span>
                                <span className="pb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                                    brutto
                                </span>
                                {product.oldPrice ? (
                                    <span className="pb-1 text-lg text-neutral-500 line-through">
                                        {formatPLN(grossPrice(product.oldPrice))}
                                    </span>
                                ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-sm text-neutral-500">
                                    {formatPLN(product.price)} netto + VAT 23%
                                </span>
                                {savings !== null && (
                                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                                        Oszczędzasz {formatPLN(savings)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {product.description && (
                            <p className="mt-5 text-sm leading-relaxed text-neutral-400">
                                {product.description}
                            </p>
                        )}

                        {specs.length > 0 && (
                            <dl className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {specs.slice(0, 6).map((spec) => (
                                    <div
                                        key={`${spec.label}-${spec.value}`}
                                        className="flex items-baseline justify-between gap-3 rounded-md border border-neutral-800 bg-[#111315] px-3 py-2"
                                    >
                                        <dt className="truncate text-[11px] text-neutral-500">{spec.label}</dt>
                                        <dd className="shrink-0 text-[11px] font-semibold text-neutral-200">
                                            {spec.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        <div className="mt-6">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                                <span className={`flex items-center gap-1.5 text-sm font-bold ${tone.text}`}>
                                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                                    {stock.label}
                                </span>
                                <span className="text-xs text-neutral-500">{stock.detail}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                                <div
                                    className={`h-full rounded-full ${tone.bar}`}
                                    style={{ width: `${stock.barPercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <ProductBuyBox product={product} />
                        </div>

                        <div className="mt-4">
                            <CatalogPdfButton
                                productId={product.id}
                                productName={product.name}
                                href={product.catalogPdf}
                            />
                        </div>

                        <ul className="mt-6 space-y-2.5 rounded-xl border border-neutral-800 bg-[#111315] p-4 text-sm text-neutral-300">
                            <li className="flex items-start gap-3">
                                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                {freeShipping ? (
                                    <span>
                                        <span className="font-semibold text-emerald-400">Darmowa dostawa</span>
                                        {" — "}wysyłka w 24 h, kurier na magazynie.
                                    </span>
                                ) : (
                                    <span>
                                        Wysyłka w 24 h · kurier {formatPLN(SHIPPING_COST)} · darmowa od{" "}
                                        {formatPLN(FREE_SHIPPING_THRESHOLD)}
                                    </span>
                                )}
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                24 miesiące gwarancji · serwis we własnym warsztacie
                            </li>
                            <li className="flex items-start gap-3">
                                <Package className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                30 dni na zwrot · sprzedano {sold} szt.
                            </li>
                            <li className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                Faktura VAT 23% · BLIK i karta przez Stripe
                            </li>
                            <li className="flex items-start gap-3">
                                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                Karta katalogowa i deklaracja zgodności w każdej paczce
                            </li>
                        </ul>

                        {category && (
                            <p className="mt-4 text-xs text-neutral-500">
                                Z kategorii{" "}
                                <Link
                                    href={`/kategoria/${category.slug}`}
                                    className="font-semibold text-emerald-400 hover:text-emerald-300"
                                >
                                    {category.name}
                                </Link>
                                : {category.tagline}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-14">
                    <ProductInfoTabs
                        description={product.description}
                        specs={specs}
                        reviews={reviewEntries}
                        reviewCount={reviews}
                        rating={rating}
                    />
                </div>

                {related.length > 0 && (
                    <section className="mt-16" aria-labelledby="related-products-heading">
                        <div className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                    Dobierz do zamówienia
                                </span>
                                <h2 id="related-products-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                                    Podobne produkty
                                </h2>
                            </div>
                            {categorySlug && (
                                <Link
                                    href={`/kategoria/${categorySlug}`}
                                    className="text-sm font-semibold text-neutral-400 transition-colors hover:text-emerald-300"
                                >
                                    Cała kategoria →
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
