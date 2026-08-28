import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
    title: "Polityka prywatności — RODO",
    description:
        "Polityka prywatności sklepu ebe power — jakie dane zbieramy, w jakim celu i jakie masz prawa na podstawie RODO.",
    alternates: { canonical: "/polityka-prywatnosci" },
    openGraph: {
        title: "Polityka prywatności | ebe power",
        description: "Informacje o przetwarzaniu danych osobowych, cookies i Twoich prawach (RODO).",
        url: "/polityka-prywatnosci",
        type: "website",
    },
};

export default function PolitykaPrywatnosciPage() {
    return (
        <LegalPageShell
            eyebrow="Informacje"
            title="Polityka prywatności"
            updated="28 sierpnia 2026"
        >
            <LegalSection title="1. Administrator danych">
                <p>
                    Administratorem danych osobowych jest EBE POWER z siedzibą
                    w Bełchatowie. W sprawach dotyczących danych osobowych możesz
                    się z nami skontaktować mailowo:{" "}
                    <a href="mailto:kontakt@ebe-power.pl" className="text-emerald-400 hover:text-emerald-300 transition-colors">kontakt@ebe-power.pl</a>.
                </p>
            </LegalSection>

            <LegalSection title="2. Jakie dane zbieramy">
                <p>Przetwarzamy wyłącznie dane niezbędne do obsługi zamówień:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>imię i nazwisko (lub nazwę firmy),</li>
                    <li>adres e-mail,</li>
                    <li>adres dostawy oraz dane do faktury (w tym NIP),</li>
                    <li>historię zamówień i płatności.</li>
                </ul>
                <p>
                    Płatności online obsługiwane są przez Stripe — dane karty
                    płatniczej nigdy nie trafiają na nasze serwery.
                </p>
            </LegalSection>

            <LegalSection title="3. Cele i podstawy przetwarzania">
                <p>
                    Dane przetwarzamy w celu realizacji umowy sprzedaży (art. 6
                    ust. 1 lit. b RODO), wystawiania i przechowywania faktur
                    (obowiązek prawny), a za Twoją zgodą — również w celach
                    marketingowych (newsletter, informacje o promocjach).
                </p>
            </LegalSection>

            <LegalSection title="4. Okres przechowywania">
                <p>
                    Dane związane z zamówieniami przechowujemy przez okres
                    wymagany przepisami prawa (w tym przepisami podatkowymi), a
                    dane marketingowe — do czasu wycofania zgody.
                </p>
            </LegalSection>

            <LegalSection title="5. Odbiorcy danych">
                <p>
                    Dane mogą być przekazywane podmiotom, które wspierają nas w
                    realizacji zamówień: firmom kurierskim, operatorom płatności
                    (Stripe), dostawcom usług IT i księgowych. Każdy z tych
                    podmiotów przetwarza dane wyłącznie na nasze zlecenie.
                </p>
            </LegalSection>

            <LegalSection title="6. Twoje prawa">
                <p>Masz prawo do:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>dostępu do swoich danych i ich kopii,</li>
                    <li>sprostowania, usunięcia lub ograniczenia przetwarzania,</li>
                    <li>przenoszenia danych,</li>
                    <li>sprzeciwu wobec przetwarzania,</li>
                    <li>wycofania zgody w dowolnym momencie,</li>
                    <li>
                        wniesienia skargi do Prezesa Urzędu Ochrony Danych
                        Osobowych.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="7. Pliki cookies">
                <p>
                    Strona korzysta z plików cookies niezbędnych do jej działania
                    (koszyk, sesja logowania) oraz — za zgodą — plików
                    analitycznych pomagających nam lepiej dopasować ofertę.
                    Ustawieniami cookies możesz zarządzać w swojej przeglądarce.
                </p>
            </LegalSection>
        </LegalPageShell>
    );
}
