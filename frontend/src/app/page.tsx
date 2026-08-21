import { Suspense } from "react";
import { getProducts } from "@/app/services/productService";
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";
import ShopSection from "@/app/components/ShopSection";
import BrandMarquee from "@/app/components/BrandMarquee";
import TrustBar from "@/app/components/FeatureBar";
import type { Metadata } from "next";
import { getSiteUrl } from "@/app/lib/site";
import { allCategories } from "@/app/data/categories";
import Link from "next/link";

export const metadata: Metadata = {
    title: {
        absolute: "ebe power — Agregaty prądotwórcze PRAMAC | Sklep online",
    },
    description:
        "Sklep z agregatami PRAMAC: inwerterowe, benzynowe, diesla i gazowe. Karty katalogowe PDF, wysyłka 24 h, gwarancja 24 mies., faktura VAT. Bełchatów.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "ebe power — Agregaty prądotwórcze PRAMAC | Sklep online",
        description:
            "Agregaty PRAMAC: inwerterowe, benzynowe, diesla i gazowe. Karta katalogowa PDF, wysyłka 24 h, gwarancja 24 mies.",
        url: "/",
        siteName: "ebe power",
        locale: "pl_PL",
        type: "website",
    },
};

export const revalidate = 60;

export default async function HomePage() {
    const products = await getProducts();

    // Produkt promocyjny trafia do sekcji „Oferta tygodnia"
    const featured =
        products.find((p) => p.badge === "Promocja") ??
        products.find((p) => p.oldPrice != null) ??
        products[0] ??
        null;

    const site = getSiteUrl();
    const categories = allCategories(products);

    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Popularne produkty w sklepie ebe power",
        numberOfItems: Math.min(products.length, 9),
        itemListElement: products.slice(0, 9).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: `${site}/products/${p.id}`,
            image: p.images?.[0],
        })),
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Strona główna",
                item: site,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {featured && <Hero product={featured} />}
            <CategoryGrid products={products} />
            <Suspense fallback={null}>
                <ShopSection products={products} initialVisible={12} />
            </Suspense>
            <BrandMarquee />
            <TrustBar />

            {/* SEO: Crawlowalna treść tekstowa z linkami do kategorii */}
            <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                <h2 className="mb-4 text-lg font-bold text-neutral-300">
                    Sklep z osprzętem elektrycznym — ebe power
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-neutral-500">
                    ebe power to sklep z agregatami prądotwórczymi PRAMAC: inwerterowe P 3000i,
                    P 3500i i PMi 4500, benzynowe E4000, MES 8000, WX i S12000, dieslowski
                    DX8500 PRO+ oraz gazowe GA 10000 / 13000 / 20000. Przy każdym modelu
                    pobierzesz kartę katalogową PDF. Wysyłka z Bełchatowa w 24 h, darmowa
                    dostawa od 500 zł brutto, gwarancja 24 miesiące i faktura VAT.
                </p>
                <nav aria-label="Kategorie produktów">
                    <h3 className="mb-2 text-sm font-semibold text-neutral-400">Przeglądaj kategorie:</h3>
                    <ul className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <li key={cat.slug}>
                                <Link
                                    href={`/kategoria/${cat.slug}`}
                                    className="inline-block rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-400 transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </section>
        </main>
    );
}
