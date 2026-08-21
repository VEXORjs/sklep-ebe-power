import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { getProducts } from "@/app/services/productService";
import {
    allCategories,
    productsInSubcategory,
    resolveCategory,
    type CategorySubcategory,
} from "@/app/data/categories";
import CategoryCatalog from "../CategoryCatalog";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug: string; subcategory: string }>;
}

function resolveSubcategory(category: ReturnType<typeof resolveCategory>, slug: string): CategorySubcategory | null {
    return category?.subcategories?.find((item) => item.slug === slug) ?? null;
}

export async function generateStaticParams() {
    const products = await getProducts();

    return allCategories(products).flatMap((category) =>
        (category.subcategories ?? []).map((subcategory) => ({
            slug: category.slug,
            subcategory: subcategory.slug,
        }))
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, subcategory: subcategorySlug } = await params;
    const products = await getProducts();
    const category = resolveCategory(slug, products);
    const subcategory = resolveSubcategory(category, subcategorySlug);

    if (!category || !subcategory) {
        return { title: "Nie znaleziono podkategorii | ebe power" };
    }

    return {
        title: `${subcategory.name} — ${subcategory.tagline} | ebe power`,
        description: subcategory.description,
        alternates: { canonical: `/kategoria/${category.slug}/${subcategory.slug}` },
        openGraph: {
            title: `${subcategory.name} | ebe power`,
            description: subcategory.description,
            type: "website",
        },
    };
}

export default async function SubcategoryPage({ params }: PageProps) {
    const { slug, subcategory: subcategorySlug } = await params;
    const products = await getProducts();
    const category = resolveCategory(slug, products);
    const subcategory = resolveSubcategory(category, subcategorySlug);

    if (!category || !subcategory) notFound();

    const items = productsInSubcategory(products, category, subcategory);

    return (
        <main className="min-h-screen bg-black text-white">
            <header className="border-b border-neutral-900 bg-[#0b0d0e]">
                <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <nav aria-label="Okruszki" className="mb-7 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                        <Link href="/" className="transition-colors hover:text-emerald-400">
                            Strona główna
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href="/kategoria" className="transition-colors hover:text-emerald-400">
                            Kategorie
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={`/kategoria/${category.slug}`} className="transition-colors hover:text-emerald-400">
                            {category.name}
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="font-semibold text-neutral-300">{subcategory.name}</span>
                    </nav>

                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Podkategoria · {category.name}
                    </span>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        {subcategory.name}
                    </h1>
                    <p className="mt-2 text-base font-semibold text-neutral-300">{subcategory.tagline}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-400">
                        {subcategory.description}
                    </p>
                    <Link
                        href={`/kategoria/${category.slug}#podkategorie`}
                        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Wszystkie podkategorie
                    </Link>
                </div>
            </header>

            <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <CategoryCatalog products={items} categoryName={subcategory.name} />
            </div>
        </main>
    );
}
