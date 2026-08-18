import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/app/types/product";

const categoryImages: Record<string, string> = {
    Transformatory:
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    Zasilacze:
        "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800",
    "Rozdzielnice i zabezpieczenia":
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800",
    Kable: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    Bezpieczniki:
        "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800",
    "Liczniki i mierniki":
        "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=800",
};

interface CategoryGridProps {
    products: Product[];
}

export default function CategoryGrid({ products }: CategoryGridProps) {
    const categories = Object.keys(categoryImages);

    const countFor = (category: string) =>
        products.filter((p) => (p.category ?? "") === category).length;

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Kategorie
                    </span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        Kupuj według kategorii
                    </h2>
                </div>
                <Link
                    href="/#produkty"
                    className="text-sm font-semibold text-neutral-400 transition-colors hover:text-emerald-300"
                >
                    Wszystkie produkty →
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Link
                        key={category}
                        href={`/#produkty?kategoria=${encodeURIComponent(category)}`}
                        className="group relative h-44 overflow-hidden rounded-lg border border-neutral-800 transition-all duration-300 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-950/30"
                    >
                        <Image
                            src={categoryImages[category]}
                            alt={category}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                            <div>
                                <h3 className="text-base font-extrabold text-white">
                                    {category}
                                </h3>
                                <p className="text-[11px] text-neutral-400">
                                    {countFor(category)} produktów
                                </p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/50 bg-black/40 text-emerald-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
