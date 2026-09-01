import {
    ArrowLeftRight,
    Cpu,
    Fuel,
    Gauge,
    Plug,
    PlugZap,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react";
import ProducerParamLink from "./ProducerParamLink";

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
    single: Plug,
    three: PlugZap,
    dual: ArrowLeftRight,
};

/** „A, B albo C” — zdanie o fazach układane z tego, co kategoria naprawdę ma,
 *  żeby nie obiecywać napięcia, którego w jej podkategoriach nie ma. */
function joinAlternatives(parts: string[]) {
    const values = parts.filter(Boolean);
    if (values.length <= 1) return values[0] ?? "";
    return `${values.slice(0, -1).join(", ")} albo ${values[values.length - 1]}`;
}

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
        <ProducerParamLink
            href={`/kategoria/${category.slug}/${subcategory.slug}`}
            className="group flex flex-col rounded-xl border border-neutral-800 bg-[#141618] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/90 hover:shadow-lg hover:shadow-emerald-950/20 sm:min-h-44 sm:p-5"
        >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20 sm:mb-5 sm:h-11 sm:w-11">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <h3 className="text-[13px] leading-snug font-extrabold text-white sm:text-base">
                {subcategory.name}
            </h3>
            <p className="mt-1 text-[10px] font-semibold text-emerald-400 sm:text-xs">
                {subcategory.tagline}
            </p>
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-neutral-400 sm:mt-3 sm:line-clamp-3 sm:text-xs">
                {subcategory.description}
            </p>
            <span className="mt-auto pt-3 text-[10px] font-bold text-neutral-500 transition-colors group-hover:text-emerald-300 sm:pt-4 sm:text-[11px]">
                {count > 0 ? `${count} ${productsLabel(count)}` : "Sprawdź ofertę →"}
            </span>
        </ProducerParamLink>
    );
}

export default function CategorySubcategoryGrid({
    category,
    products,
}: CategorySubcategoryGridProps) {
    const subcategories = category.subcategories ?? [];
    if (subcategories.length === 0) return null;

    // Podział fazowy (230 V / 400 V / dual) to inny wybór niż podział według
    // paliwa — nagłówek i opis muszą opisywać to, co faktycznie jest w
    // podkategoriach danej kategorii, a nie sztywny tekst z jednego szablonu.
    const isPhaseSplit = subcategories.every((subcategory) => Boolean(subcategory.phase));
    const has = (phase: CategorySubcategory["phase"]) =>
        subcategories.some((subcategory) => subcategory.phase === phase);

    const heading = isPhaseSplit ? "Wybierz liczbę faz" : "Wybierz podkategorię";
    const intro = isPhaseSplit
        ? `Zawęź katalog w kategorii „${category.name.toLowerCase()}” według liczby faz — ${joinAlternatives([
              has("single") ? "gniazda 230\u00a0V" : "",
              has("three") ? "siłowe 400\u00a0V" : "",
              has("dual") ? "wersje dual, które łączą oba rodzaje wyjść" : "",
          ])}.`
        : "Każda podkategoria ma własną stronę z opisem, filtrami i poradnikiem doboru.";

    return (
        <section id="podkategorie" className="border-b border-neutral-900 bg-[#0b0d0e]">
            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <div className="mb-5 max-w-2xl sm:mb-7">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Podkategorie · {category.name}
                    </span>
                    <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                        {heading}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">{intro}</p>
                </div>
                {/* Dwie kolumny już na telefonie — jedna kolumna wysokich kart
                    wypychała filtry i produkty poza pierwszy ekran. */}
                <div
                    className={`grid grid-cols-2 gap-3 sm:gap-4 ${
                        subcategories.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
                    }`}
                >
                    {subcategories.map((subcategory) => (
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
