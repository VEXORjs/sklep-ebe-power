import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Clock, ShieldCheck, Zap } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-black">
            {/* Dekoracyjne tło */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-teal-600/10 blur-3xl" />
                <div className="absolute top-1/2 -left-40 h-[380px] w-[380px] rounded-full bg-emerald-600/10 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {/* Lewa kolumna — treść */}
                    <div className="space-y-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
                            <BadgeCheck className="h-4 w-4" />
                            Autoryzowany dystrybutor
                        </span>

                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl xl:text-6xl">
                            Energia dla Twojego{" "}
                            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                                biznesu
                            </span>
                        </h1>

                        <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                            Transformatory, agregaty prądotwórcze, stacje ładowania EV i osprzęt
                            elektryczny od sprawdzonych producentów. Wysyłka w 24 h, wsparcie
                            techniczne i pełny serwis na terenie całej Polski.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="#produkty"
                                className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-950/40 transition-all hover:bg-teal-400 hover:shadow-teal-900/40"
                            >
                                <Zap className="h-4 w-4" />
                                Zobacz ofertę
                            </Link>
                            <Link
                                href="/wynajem"
                                className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-teal-500/60 hover:text-teal-300"
                            >
                                Wynajem agregatów
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Pasek mini-statystyk */}
                        <div className="grid grid-cols-3 gap-4 border-t border-neutral-800 pt-6">
                            {[
                                { icon: Clock, value: "24 h", label: "Czas wysyłki" },
                                { icon: ShieldCheck, value: "12 mies.", label: "Gwarancji" },
                                { icon: BadgeCheck, value: "ISO 9001", label: "Certyfikat" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-start gap-2">
                                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                                    <div>
                                        <p className="text-sm font-bold text-white sm:text-base">
                                            {item.value}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wide text-neutral-500 sm:text-xs">
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prawa kolumna — kolaż zdjęć */}
                    <div className="relative mx-auto w-full max-w-lg">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-800 shadow-2xl shadow-black/60">
                            <Image
                                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200"
                                alt="Serwis i montaż urządzeń elektrycznych"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>

                        {/* Mniejsze zdjęcie — nakładka */}
                        <div className="absolute -bottom-8 -left-4 hidden w-44 overflow-hidden rounded-lg border border-neutral-800 shadow-xl shadow-black/60 sm:block md:w-52">
                            <div className="relative aspect-[4/3]">
                                <Image
                                    src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600"
                                    alt="Stacja ładowania EV"
                                    fill
                                    sizes="(max-width: 768px) 0px, 200px"
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Pływająca plakietka */}
                        <div className="absolute -top-5 -right-3 rounded-lg border border-teal-500/40 bg-neutral-950/90 px-4 py-3 shadow-xl shadow-black/60 backdrop-blur">
                            <p className="text-lg font-extrabold text-teal-400">10+ lat</p>
                            <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                                na rynku energetyki
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
