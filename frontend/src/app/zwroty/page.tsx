import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
    title: "Zwroty i reklamacje | ebe power",
    description:
        "Zwroty i reklamacje w sklepie TRAFO ENERGIA — 14 dni na odstąpienie od umowy, 24 miesiące gwarancji, własny serwis.",
};

export default function ZwrotyPage() {
    return (
        <LegalPageShell
            eyebrow="Informacje"
            title="Zwroty i reklamacje"
            updated="19 sierpnia 2026"
        >
            <LegalSection title="1. Zwrot towaru — 14 dni">
                <p>
                    Jako konsument masz prawo odstąpić od umowy w terminie 14 dni
                    od dnia otrzymania towaru, bez podawania przyczyny. Wystarczy,
                    że poinformujesz nas o odstąpieniu (np. mailowo na adres{" "}
                    <span className="text-white">kontakt@ebe-power.pl</span>), a
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

            <LegalSection title="3. Gwarancja 24 miesiące">
                <p>
                    Wszystkie urządzenia objęte są 24-miesięczną gwarancją
                    producenta. Gwarancja obejmuje wady fabryczne i nie wyłącza
                    uprawnień wynikających z rękojmi. Posiadamy własny serwis, co
                    pozwala skrócić czas napraw do minimum.
                </p>
            </LegalSection>

            <LegalSection title="4. Jak zgłosić zwrot lub reklamację">
                <ol className="list-decimal pl-6 space-y-2">
                    <li>
                        Napisz do nas na{" "}
                        <span className="text-white">kontakt@ebe-power.pl</span> —
                        podaj numer zamówienia i powód zgłoszenia.
                    </li>
                    <li>
                        Otrzymasz instrukcję zwrotu oraz adres magazynu w
                        Bełchatowie.
                    </li>
                    <li>
                        Po otrzymaniu przesyłki zweryfikujemy towar i
                        poinformujemy Cię o wyniku rozpatrzenia.
                    </li>
                </ol>
            </LegalSection>
        </LegalPageShell>
    );
}
