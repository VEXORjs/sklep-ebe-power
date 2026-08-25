import Link from 'next/link';
import {Mail, Phone} from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-[#111315] text-neutral-300 border-t border-neutral-800" role="contentinfo">
            {/* Główna siatka 4 kolumn */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* 1. O firmie */}
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-bold tracking-wider">
                            EBE POWER
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            Dostarczamy profesjonalne agregaty prądotwórcze oraz nowoczesne rozwiązania z zakresu energii. Sklep internetowy z osprzętem elektrycznym.
                        </p>
                        <div className="text-xs text-neutral-400 space-y-1">
                            <p>NIP: 769 183 05 28</p>
                            <p>REGON: 384398249</p>
                        </div>
                    </div>

                    {/* 2. Oferta */}
                    <nav aria-label="Oferta produktowa">
                        <div className="space-y-4">
                            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">
                                Oferta
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link href="/kategoria/agregaty" className="hover:text-emerald-400 transition-colors">
                                        Agregaty prądotwórcze
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kategoria/akcesoria" className="hover:text-emerald-400 transition-colors">
                                        Akcesoria i osprzęt
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kategoria" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                        Wszystkie kategorie →
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* 3. Usługi i informacje */}
                    <nav aria-label="Informacje i usługi">
                        <div className="space-y-4">
                            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">
                                Informacje
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link href="/dostawa" className="hover:text-emerald-400 transition-colors">
                                        Dostawa i płatności
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/zwroty" className="hover:text-emerald-400 transition-colors">
                                        Zwroty i reklamacje
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/regulamin" className="hover:text-emerald-400 transition-colors">
                                        Regulamin sklepu
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/polityka-prywatnosci" className="hover:text-emerald-400 transition-colors">
                                        Polityka prywatności
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* 4. Kontakt */}
                    <div className="space-y-4">
                        <h4 className="text-white text-sm font-semibold uppercase tracking-wider">
                            Kontakt
                        </h4>
                        <address className="not-italic">
                            <ul className="space-y-2 text-xs text-neutral-400">
                                <li>
                                    <span className="text-neutral-200">Adres:</span> Borki 10, 97-400 Bełchatów
                                </li>
                                <li>
                                    <Link
                                        href="mailto:kontakt@ebe-power.pl"
                                        className="flex items-center gap-1.5 transition-colors hover:text-emerald-400"
                                    >
                                        <Mail className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                                        kontakt@ebe-power.pl
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="tel:+488888832332"
                                        className="flex items-center gap-1.5 transition-colors hover:text-emerald-400"
                                    >
                                        <Phone className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                                        +48 888 883 232
                                    </Link>
                                </li>
                                <li>
                                    <span className="text-neutral-200">Godziny:</span> Pn–Pt: 8:00 – 16:00
                                </li>
                            </ul>
                        </address>
                    </div>

                </div>
            </div>

            {/* Dolny pasek */}
            <div className="border-t border-neutral-800 bg-[#0d0e10] py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
                    <p>© {new Date().getFullYear()} EBE POWER (ebe-power.pl). Wszelkie prawa zastrzeżone.</p>
                    <p>Agregaty prądotwórcze — sklep online</p>
                </div>
            </div>
        </footer>
    );
}
