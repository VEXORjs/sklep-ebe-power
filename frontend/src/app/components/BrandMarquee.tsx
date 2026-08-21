const brands = [
    "PRAMAC",
    "Honda",
    "Generac",
    "Yanmar",
    "Mecc Alte",
];

export default function BrandMarquee() {
    return (
        <section className="w-full overflow-hidden border-y border-neutral-800 bg-[#0d0f10] py-8">
            <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400">
                Oryginalne produkty wiodących producentów
            </p>

            <div className="relative">
                {/* Wygaszenia po bokach */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0d0f10] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0d0f10] to-transparent" />

                <div className="flex w-max animate-marquee">
                    {[0, 1].map((half) => (
                        <div key={half} className="flex items-center gap-16 pr-16">
                            {brands.map((brand) => (
                                <span
                                    key={`${half}-${brand}`}
                                    className="whitespace-nowrap text-xl font-extrabold uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-emerald-400"
                                >
                                    {brand}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
