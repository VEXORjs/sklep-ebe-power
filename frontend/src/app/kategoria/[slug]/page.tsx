import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Package, ShieldCheck, Star, Truck } from "lucide-react";

import { getProducts } from "@/app/services/productService";
import {
    allCategories,
    productsInCategory,
    resolveCategory,
} from "@/app/data/categories";
import { formatPLN, grossPrice, ratingOf } from "@/app/lib/product";
import CategoryCatalog from "./CategoryCatalog";

export const dynamic = "force-dynamic";

/** Jedno pobranie produktów na żądanie — współdzielone przez metadane i stronę. */
const loadProducts = cache(getProducts);

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const products = await loadProducts();
    const category = resolveCategory(slug, products);

    if (!category) {
        return { title: "Nie znaleziono kategorii | TRAFO ENERGIA" };
    }

    return {
        title: `${category.name} — ${category.tagline} | TRAFO ENERGIA`,
        description: category.description.slice(0, 300),
        keywords: category.keywords,
        alternates: { canonical: `/kategoria/${category.slug}` },
        openGraph: {
            title: `${category.name} | TRAFO ENERGIA`,
            description: category.description.slice(0, 300),
            images: [category.image],
            type: "website",
        },
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const products = await loadProducts();
    const category = resolveCategory(slug, products);

    if (!category) {
        notFound();
    }

    const items = productsInCategory(products, category);
    const available = items.filter((p) => p.stock > 0).length;
    const cheapest = items.length > 0 ? Math.min(...items.map((p) => grossPrice(p.price))) : null;
    const avgRating =
        items.length > 0
            ? Math.round((items.reduce((sum, p) => sum + ratingOf(p), 0) / items.length) * 10) / 10
            : null;

    const otherCategories = allCategories(products)
        .filter((c) => c.slug !== category.slug)
        .slice(0, 8);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: category.name,
        description: category.description,
        breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Strona główna", item: "/" },
                { "@type": "ListItem", position: 2, name: "Kategorie", item: "/kategoria" },
                { "@type": "ListItem", position: 3, name: category.name, item: `/kategoria/${category.slug}` },
            ],
        },
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.slice(0, 20).map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.name,
                url: `/products/${p.id}`,
            })),
        },
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Nagłówek kategorii */}
            <header className="relative overflow-hidden border-b border-neutral-900">
                <Image
                    src={category.image}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />

                <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    {/* Okruszki */}
                    <nav aria-label="Okruszki" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                        <Link href="/" className="transition-colors hover:text-emerald-400">
                            Strona główna
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href="/kategoria" className="transition-colors hover:text-emerald-400">
                            Kategorie
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="font-semibold text-neutral-300">{category.name}</span>
                    </nav>

                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Kategoria
                    </span>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        {category.name}
                    </h1>
                    <p className="mt-2 text-base font-semibold text-neutral-300">{category.tagline}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-400">
                        {category.description}
                    </p>

                    {/* Statystyki */}
                    <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 sm:grid-cols-4">
                        <div className="bg-[#101214] px-4 py-4">
                            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Produkty</dt>
                            <dd className="mt-1 text-xl font-extrabold text-white">{items.length}</dd>
                        </div>
                        <div className="bg-[#101214] px-4 py-4">
                            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Ceny od</dt>
                            <dd className="mt-1 text-xl font-extrabold text-emerald-400">
                                {cheapest !== null ? formatPLN(cheapest) : "—"}
                            </dd>
                        </div>
                        <div className="bg-[#101214] px-4 py-4">
                            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Od ręki</dt>
                            <dd className="mt-1 text-xl font-extrabold text-white">{available} szt.</dd>
                        </div>
                        <div className="bg-[#101214] px-4 py-4">
                            <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Ocena</dt>
                            <dd className="mt-1 flex items-center gap-1.5 text-xl font-extrabold text-white">
                                {avgRating !== null ? (
                                    <>
                                        <Star className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                                        {avgRating.toFixed(1)}
                                    </>
                                ) : (
                                    "—"
                                )}
                            </dd>
                        </div>
                    </dl>

                    {/* Zastosowania */}
                    {category.applications.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {category.applications.map((app) => (
                                <span
                                    key={app}
                                    className="rounded-full border border-neutral-800 bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-neutral-300"
                                >
                                    {app}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* Wyróżniki */}
            <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {category.highlights.map((highlight, index) => {
                        const Icon = [ShieldCheck, Truck, Package][index % 3];
                        return (
                            <div
                                key={highlight.title}
                                className="rounded-xl border border-neutral-800 bg-[#141618] p-5"
                            >
                                <Icon className="mb-3 h-5 w-5 text-emerald-500" />
                                <h2 className="text-sm font-bold text-white">{highlight.title}</h2>
                                <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                                    {highlight.text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Katalog produktów */}
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-neutral-800 px-6 py-16 text-center">
                        <h2 className="text-lg font-bold text-white">
                            Kompletujemy asortyment w tej kategorii
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-400">
                            Produkty z kategorii {category.name} sprowadzamy na zamówienie — zwykle w 3–7 dni
                            roboczych. Napisz, czego szukasz, a przygotujemy wycenę.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/#produkty"
                                className="rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                            >
                                Zobacz cały sklep
                            </Link>
                            <a
                                href="mailto:kontakt@ebe-power.pl"
                                className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
                            >
                                Zapytaj o produkt
                            </a>
                        </div>
                    </div>
                ) : (
                    <CategoryCatalog products={items} categoryName={category.name} />
                )}
            </div>

            {/* Poradnik zakupowy */}
            {category.buyingGuide.length > 0 && (
                <section className="border-t border-neutral-900 bg-[#0b0d0e]">
                    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                Poradnik zakupowy
                            </span>
                            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                                Jak dobrać: {category.name.toLowerCase()}
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                                Pięć rzeczy, które nasi doradcy sprawdzają, zanim polecą konkretny model.
                                Masz wątpliwości? Zadzwoń — pomożemy dobrać sprzęt do Twojej instalacji.
                            </p>
                            <a
                                href="tel:+48123456789"
                                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 transition-colors hover:text-emerald-300"
                            >
                                +48 123 456 789
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>

                        <ol className="space-y-3">
                            {category.buyingGuide.map((tip, index) => (
                                <li
                                    key={tip}
                                    className="flex gap-4 rounded-lg border border-neutral-800 bg-[#141618] p-4"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-extrabold text-emerald-400">
                                        {index + 1}
                                    </span>
                                    <p className="text-sm leading-relaxed text-neutral-300">{tip}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* FAQ */}
            {category.faq.length > 0 && (
                <section className="border-t border-neutral-900">
                    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            FAQ
                        </span>
                        <h2 className="mt-2 mb-6 text-2xl font-extrabold tracking-tight text-white">
                            Najczęstsze pytania — {category.name.toLowerCase()}
                        </h2>
                        <div className="divide-y divide-neutral-900 overflow-hidden rounded-xl border border-neutral-800 bg-[#141618]">
                            {category.faq.map((item) => (
                                <details key={item.question} className="group px-5 py-4">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white">
                                        {item.question}
                                        <ChevronRight className="h-4 w-4 shrink-0 text-emerald-400 transition-transform group-open:rotate-90" />
                                    </summary>
                                    <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                                        {item.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Pozostałe kategorie */}
            <section className="border-t border-neutral-900 bg-[#0b0d0e]">
                <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-neutral-400">
                        Sprawdź też inne kategorie
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {otherCategories.map((other) => (
                            <Link
                                key={other.slug}
                                href={`/kategoria/${other.slug}`}
                                className="rounded-full border border-neutral-800 bg-[#141618] px-4 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
                            >
                                {other.name}
                            </Link>
                        ))}
                        <Link
                            href="/kategoria"
                            className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                        >
                            Wszystkie kategorie →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
