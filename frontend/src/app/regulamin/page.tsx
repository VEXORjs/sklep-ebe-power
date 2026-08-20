import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
    title: "Regulamin sklepu | ebe power",
    description:
        "Regulamin sklepu internetowego TRAFO ENERGIA — zasady składania zamówień, płatności, dostawy oraz prawa konsumenta.",
};

export default function RegulaminPage() {
    return (
        <LegalPageShell
            eyebrow="Informacje"
            title="Regulamin sklepu"
            updated="19 sierpnia 2026"
        >
            <LegalSection title="1. Postanowienia ogólne">
                <p>
                    Sklep internetowy TRAFO ENERGIA, dostępny pod adresem strony
                    głównej serwisu, prowadzony jest przez TRAFO ENERGIA z siedzibą
                    w Bełchatowie. Regulamin określa zasady zawierania umów
                    sprzedaży za pośrednictwem sklepu, zasady świadczenia usług
                    drogą elektroniczną oraz prawa i obowiązki Kupujących i
                    Sprzedawcy.
                </p>
                <p>
                    Korzystanie ze sklepu oznacza akceptację niniejszego
                    Regulaminu. W sprawach nieuregulowanych zastosowanie mają
                    przepisy prawa polskiego, w szczególności Kodeksu cywilnego
                    oraz ustawy o prawach konsumenta.
                </p>
            </LegalSection>

            <LegalSection title="2. Składanie zamówień">
                <p>
                    Zamówienia można składać przez całą dobę, siedem dni w
                    tygodniu. Warunkiem złożenia zamówienia jest podanie
                    prawdziwych danych adresowych oraz kontaktowych (adres e-mail,
                    numer telefonu), umożliwiających realizację dostawy i
                    potwierdzenie zamówienia.
                </p>
                <p>
                    Po złożeniu zamówienia Kupujący otrzymuje potwierdzenie na
                    podany adres e-mail. Umowa sprzedaży zostaje zawarta z chwilą
                    potwierdzenia przyjęcia zamówienia do realizacji.
                </p>
            </LegalSection>

            <LegalSection title="3. Ceny i płatności">
                <p>
                    Wszystkie ceny podane w sklepie są cenami brutto i zawierają
                    podatek VAT. Do każdego zamówienia wystawiana jest faktura VAT
                    23%. Dostępne formy płatności opisane są na stronie{" "}
                    <span className="text-white">Dostawa i płatności</span> — w tym
                    płatności online obsługiwane przez Stripe.
                </p>
            </LegalSection>

            <LegalSection title="4. Dostawa">
                <p>
                    Zamówienia wysyłamy z magazynu w Bełchatowie. Standardowy czas
                    realizacji to 24 godziny od zaksięgowania płatności. Szczegóły
                    dotyczące kosztów i sposobów dostawy znajdują się na stronie{" "}
                    <span className="text-white">Dostawa i płatności</span>.
                </p>
            </LegalSection>

            <LegalSection title="5. Odstąpienie od umowy i reklamacje">
                <p>
                    Konsumentowi przysługuje prawo odstąpienia od umowy w terminie
                    14 dni od otrzymania towaru, bez podania przyczyny. Zasady
                    zwrotów oraz tryb składania reklamacji opisane są na stronie{" "}
                    <span className="text-white">Zwroty i reklamacje</span>.
                </p>
            </LegalSection>

            <LegalSection title="6. Gwarancja i serwis">
                <p>
                    Sprzedawane urządzenia objęte są 24-miesięczną gwarancją.
                    Świadczymy również własny serwis oraz usługi konserwacji
                    transformatorów i stacji transformatorowych.
                </p>
            </LegalSection>

            <LegalSection title="7. Dane kontaktowe">
                <p>
                    W sprawach dotyczących zamówień i realizacji umów prosimy o
                    kontakt telefoniczny pod numerem{" "}
                    <span className="text-white">+48 88888 32 32</span> lub
                    mailowy:{" "}
                    <span className="text-white">kontakt@ebe-power.pl</span>, w
                    dni robocze w godzinach 8:00–16:00.
                </p>
            </LegalSection>
        </LegalPageShell>
    );
}
