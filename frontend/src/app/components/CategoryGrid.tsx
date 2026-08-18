import Link from "next/link";
import { ArrowRight, Cog, PlugZap, Wrench, Zap } from "lucide-react";

const categories = [
    {
        icon: Zap,
        title: "Transformatory",
        description: "Sieciowe, toroidalne, olejowe i suche — od 50 do 2500 kVA.",
        href: "#produkty",
    },
    {
        icon: Cog,
        title: "Agregaty prądotwórcze",
        description: "Jednostki inwertorowe i przemysłowe z szybką dostawą w całym kraju.",
        href: "#produkty",
    },
    {
        icon: PlugZap,
        title: "Stacje ładowania EV",
        description: "Wallboxy AC i szybkie ładowarki DC do domu oraz firmy.",
        href: "#produkty",
    },
    {
        icon: Wrench,
        title: "Akcesoria i osprzęt",
        description: "Przewody, zabezpieczenia, rozdzielnice i aparatura pomiarowa.",
        href: "#produkty",
    },
];

export default function CategoryGrid() {
    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Kategorie
                    </span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        Kupuj według kategorii
                    </h2>
                </div>
                <Link
                    href="#produkty"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition-colors hover:text-teal-300"
                >
                    Wszystkie produkty
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                    <Link
                        key={category.title}
                        href={category.href}
                        className="group flex flex-col justify-between rounded-lg border border-neutral-800 bg-[#141618] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/60 hover:shadow-lg hover:shadow-teal-950/30"
                    >
                        <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-md bg-teal-500/10 text-teal-400 transition-colors group-hover:bg-teal-500/20">
                            <category.icon className="h-6 w-6 stroke-[1.5]" />
                        </div>
                        <h3 className="text-base font-bold text-white transition-colors group-hover:text-teal-300">
                            {category.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                            {category.description}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
