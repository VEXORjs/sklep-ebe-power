import Link from "next/link";
import { Cpu, Fuel, Gauge, ShieldCheck, type LucideIcon } from "lucide-react";

import {
    productsInSubcategory,
    type CategoryDef,
    type CategorySubcategory,
    type SubcategoryIcon,
} from "@/app/data/categories";
import type { Product } from "@/app/types/product";
import { productsLabel } from "@/app/lib/product";

interface CategorySubcategoryGridProps {
    category: CategoryDef;
    products: Product[];
}

const ICONS: Record<SubcategoryIcon, LucideIcon> = {
    gas: Fuel,
    inverter: Cpu,
    petrol: Gauge,
    diesel: ShieldCheck,
};

function SubcategoryCard({
    category,
    subcategory,
    products,
}: {
    category: CategoryDef;
    subcategory: CategorySubcategory;
    products: Product[];
}) {
    const Icon = ICONS[subcategory.icon];
    const count = productsInSubcategory(products, category, subcategory).length;

    return (
        <Link
            href={`/kategoria/${category.slug}/${subcategory.slug}`}
            className="group flex min-h-44 flex-col rounded-xl border border-neutral-800 bg-[#141618] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/60 hover:bg-[#181b1d] hover:shadow-lg hover:shadow-emerald-950/20"
        >
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="text-base font-extrabold text-white">{subcategory.name}</h3>
            <p className="mt-1 text-xs font-semibold text-emerald-400">{subcategory.tagline}</p>
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-neutral-400">
                {subcategory.description}
            </p>
            <span className="mt-auto pt-4 text-[11px] font-bold text-neutral-500 transition-colors group-hover:text-emerald-300">
                {count > 0 ? `${count} ${productsLabel(count)}` : "Sprawdź ofertę →"}
            </span>
        </Link>
    );
}

export default function CategorySubcategoryGrid({
    category,
    products,
}: CategorySubcategoryGridProps) {
    if (!category.subcategories?.length) return null;

    return (
        <section id="podkategorie" className="border-b border-neutral-900 bg-[#0b0d0e]">
            <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-7 max-w-2xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Podkategorie
                    </span>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                        Wybierz typ agregatu
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                        Zawęź katalog według rodzaju paliwa i technologii pracy, aby szybciej znaleźć model dopasowany do zastosowania.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {category.subcategories.map((subcategory) => (
                        <SubcategoryCard
                            key={subcategory.slug}
                            category={category}
                            subcategory={subcategory}
                            products={products}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
