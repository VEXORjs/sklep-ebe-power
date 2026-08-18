import Link from 'next/link';

export default function ServicesBanner() {
    return (
        <section className="w-full max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ⚡ Karta 1: Wynajem */}
                <div className="bg-[#141618] border border-neutral-800 rounded-lg p-6 md:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Usługi wynajmu
            </span>
                        <h3 className="text-xl font-bold text-white leading-snug">
                            Rozwiązania w zakresie <span className="text-emerald-400">wynajmu</span> agregatów i osprzętu
                        </h3>
                        <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                            Oferujemy wynajem agregatów prądotwórczych, masztów oświetleniowych oraz zbiorników paliwa z szybką dostawą na terenie całego kraju.
                        </p>
                    </div>

                    <Link
                        href="/wynajem"
                        className="inline-block text-center px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                    >
                        Dowiedz się więcej o wynajmie
                    </Link>
                </div>

                {/* 🛠️ Karta 2: Serwis i konserwacja */}
                <div className="bg-[#141618] border border-neutral-800 rounded-lg p-6 md:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Konserwacja i serwis
            </span>
                        <h3 className="text-xl font-bold text-white leading-snug">
                            Nasze <span className="text-emerald-400">doświadczenie</span> do Twojej dyspozycji
                        </h3>
                        <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                            Dzięki doświadczeniu i uprawnieniom technicznym gwarantujemy pełny serwis urządzeń, stacji transformatorowych oraz próby szczelności.
                        </p>
                    </div>

                    <Link
                        href="/serwis"
                        className="inline-block text-center px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                    >
                        Dowiedz się więcej o serwisie
                    </Link>
                </div>

                {/* ⏱️ Karta 3: Wycena (Wyróżniona) */}
                <div className="relative bg-[#141618] border border-emerald-500 rounded-lg p-6 md:p-8 flex flex-col justify-between space-y-6 overflow-hidden shadow-lg shadow-emerald-950/30">

                    {/* 🏷️ Wstążka w prawym górnym rogu */}
                    <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none">
                        <div className="absolute transform rotate-45 bg-emerald-400 text-slate-950 text-[9px] font-extrabold py-1 right-[-35px] top-[24px] w-[140px] text-center shadow-md flex items-center justify-center gap-1">
                            <span>🎧 KONTAKT</span>
                        </div>
                    </div>

                    <div className="space-y-3 pr-8">
                        <h3 className="text-xl font-bold text-white leading-snug">
                            Wycena w 24 godziny
                        </h3>
                        <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                            Pomożemy Ci dobrać optymalne rozwiązanie do zasilania Twojego obiektu. Skontaktuj się z naszym specjalistą.
                        </p>
                    </div>

                    <a
                        href="mailto:kontakt@ebe-power.pl?subject=Zapytanie%20o%20wycen%C4%99"
                        target="_blank"
                        className="inline-block text-center px-4 py-2.5 text-xs font-semibold text-emerald-400 border border-emerald-500/60 hover:bg-emerald-500/10 rounded transition-colors"
                        rel="noopener noreferrer"
                    >
                        Skontaktuj się po wycenę
                    </a>
                </div>

            </div>
        </section>
    );
}