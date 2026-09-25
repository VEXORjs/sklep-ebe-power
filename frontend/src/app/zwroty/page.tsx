import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "@/app/components/LegalPageShell";
import { Download } from "lucide-react";

export const metadata: Metadata = {
    title: "Zwroty i reklamacje — 30 dni na zwrot, gwarancja 24 miesiące",
    description:
        "Zwroty i reklamacje w sklepie ebe power — 14 dni na odstąpienie od umowy, 24 miesiące gwarancji, własny serwis, szybkie rozpatrzenie reklamacji.",
    alternates: { canonical: "/zwroty" },
    openGraph: {
        title: "Zwroty i reklamacje | ebe power",
        description: "14 dni na odstąpienie od umowy, 24 miesiące gwarancji, własny serwis.",
        url: "/zwroty",
        type: "website",
    },
};

export default function ZwrotyPage() {
    return (
        <LegalPageShell
            eyebrow="Informacje"
            title="Zwroty i reklamacje"
            updated="28 sierpnia 2026"
        >
            <LegalSection title="1. Zwrot towaru — 14 dni">
                <p>
                    Jako konsument masz prawo odstąpić od umowy w terminie 14 dni
                    od dnia otrzymania towaru. Wystarczy,
                    że złożysz nam oświadczenie o odstąpieniu (np. mailowo na adres{" "}
                    <a href="mailto:kontakt@ebe-power.pl" className="text-emerald-400 hover:text-emerald-300 transition-colors">kontakt@ebe-power.pl</a>), a
                    następnie odeślesz towar w terminie 14 dni.
                </p>
                <p>
                    Zwracany towar nie może nosić śladów użytkowania wykraczającego
                    poza zwykłe sprawdzenie jego cech. Zwrot środków realizujemy w
                    terminie 14 dni, tym samym kanałem płatności, którym opłacono
                    zamówienie.
                </p>
            </LegalSection>

            <LegalSection title="2. Reklamacje z tytułu rękojmi">
                <p>
                    Jeśli towar jest niezgodny z umową, przysługuje Ci reklamacja z
                    tytułu rękojmi. Reklamację możesz zgłosić mailowo lub
                    telefonicznie. Rozpatrujemy ją w terminie 14 dni od otrzymania
                    zgłoszenia.
                </p>
            </LegalSection>

            <LegalSection title="3. Gwarancja">
                <p>
                    Wszystkie urządzenia objęte są gwarancją
                    producenta. Dokładny okres trwania gwarancji podany jest w karcie produktu.
                    Gwarancja obejmuje wady fabryczne i nie wyłącza
                    uprawnień wynikających z rękojmi. Posiadamy własny serwis, co
                    pozwala skrócić czas napraw do minimum.
                </p>
            </LegalSection>

            <LegalSection title="4. Jak zgłosić zwrot lub reklamację">
                <ol className="list-decimal pl-6 space-y-2">
                    <li>
                        Pobierz i wypełnij formularz zwrotu/reklamacji.
                    </li>
                    <li>
                        Napisz do nas na{" "}
                        <a href="mailto:kontakt@ebe-power.pl" className="text-emerald-400 hover:text-emerald-300 transition-colors">kontakt@ebe-power.pl</a> —
                        podaj numer zamówienia, powód zgłoszenia oraz załącz formularz, który wypełniłeś.
                    </li>
                    <li>
                        Otrzymasz od nas instrukcję zwrotu oraz adres magazynu.
                    </li>
                    <li>
                        Po otrzymaniu przesyłki zweryfikujemy towar i
                        poinformujemy Cię o wyniku rozpatrzenia.
                    </li>
                </ol>

                <div className="mt-8">
                    <a
                        href="/formularz_zwrotu_ebe_power.pdf"
                        download
                        className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#101214]"
                    >
                        <Download className="h-5 w-5" />
                        Pobierz formularz zwrotu (PDF)
                    </a>
                </div>
            </LegalSection>
        </LegalPageShell>
    );
}
