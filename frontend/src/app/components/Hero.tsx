import { Product } from "@/app/types/product";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import HeroAddToCart from "@/app/components/HeroAddToCart";
import HeroShot from "@/app/components/HeroShot";

interface HeroProps {
    product: Product;
}

export default function Hero({ product }: HeroProps) {
    const discount =
        product.oldPrice && product.oldPrice > product.price
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : null;

    return (
        <section className="relative overflow-hidden bg-black">
            {/* Dekoracyjne tło */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute -left-40 top-1/2 h-[380px] w-[380px] rounded-full bg-emerald-600/5 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* ── Lewa kolumna — zdjęcie agregatu ──
                        Zdjęcie jest pierwsze w DOM: na mobile wyświetla się
                        nad treścią, na desktopie ląduje w lewej kolumnie.
                        `relative z-0`: warstwy dekoracyjne (siatka, poświata,
                        maskowany kadr) nie mogą przykryć przycisków i przechwycić
                        kliknięć — elementy pozycjonowane rysują się nad statycznymi. */}
                    <div className="hero-shot relative z-0 mx-auto w-full max-w-lg xl:max-w-xl">
                        {/* Kadr: maska (nierówna krawędź + fade out) + border — inline SVG,
                            zdjęcie w środku SVG, żeby maska działała we wszystkich przeglądarkach. */}
                        <div className="relative aspect-[4/3]">
                            {/* Poświata pod kadrem */}
                            <div
                                className="hero-shot__glow pointer-events-none absolute -inset-8"
                                aria-hidden
                            />

                            <HeroShot srcs={product.images ?? []} alt={product.name} />
                        </div>

                        <div className="relative mx-auto mt-4 w-fit max-w-full whitespace-nowrap rounded-lg border border-emerald-500/40 bg-neutral-950/95 px-5 py-3 shadow-xl shadow-black/60 backdrop-blur">
                            <p className="text-center text-xs font-bold text-emerald-400">
                                Oryginalny produkt PRAMAC
                            </p>
                            <p className="text-center text-[10px] uppercase tracking-wide text-neutral-500">
                                kategoria: {product.category ?? "Brak"}
                            </p>
                        </div>
                    </div>

                    {/* ── Prawa kolumna — treść ──
                        `relative z-10`: patrz komentarz przy zdjęciu. */}
                    <div className="relative z-10 space-y-7">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-400">
                                Oferta tygodnia
                            </span>
                            {discount !== null && (
                                <span className="rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-extrabold text-white">
                                    -{discount}%
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl 2xl:text-6xl">
                            {product.name}
                        </h1>

                        <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                            {product.description}
                        </p>

                        {/* Cena */}
                        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                            <span className="text-4xl font-extrabold text-emerald-400 sm:text-5xl xl:text-6xl">
                                {(product.price * 1.23).toFixed(2).replace(".", ",")} zł
                            </span>
                            {product.oldPrice ? (
                                <span className="pb-1 text-lg font-medium text-neutral-500 line-through">
                                    {(product.oldPrice * 1.23).toFixed(2).replace(".", ",")} zł
                                </span>
                            ) : null}
                            <span className="pb-1 text-xs text-neutral-500">
                                {product.price.toFixed(2).replace(".", ",")} zł netto + VAT
                            </span>
                        </div>

                        {/* Akcje */}
                        <div className="flex flex-wrap items-start gap-4">
                            <HeroAddToCart product={product}/>
                            <Link
                                href={`/products/${product.id}`}
                                className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900/60 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
                            >
                                Zobacz szczegóły
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Mini-perki */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-800 pt-5">
                            {[
                                { icon: Clock, text: "Wysyłka w 24 h" },
                                { icon: ShieldCheck, text: "Gwarancja 12 mies." },
                                { icon: BadgeCheck, text: "Faktura VAT 23%" },
                            ].map((perk) => (
                                <span
                                    key={perk.text}
                                    className="flex items-center gap-1.5 text-xs text-neutral-400"
                                >
                                    <perk.icon className="h-3.5 w-3.5 text-emerald-500" />
                                    {perk.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
