import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
    title: "Dostawa i płatności | ebe power",
    description:
        "Dostawa i płatności w sklepie TRAFO ENERGIA — wysyłka w 24 h z magazynu w Bełchatowie, transport HDS, płatności online Stripe.",
};

const PAYMENT_METHODS = [
    {
        name: "Płatność online (Stripe)",
        description:
            "Karty kredytowe i debetowe, BLIK oraz inne metody obsługiwane przez Stripe. Płatność księguje się natychmiast — zamówienie od razu trafia do kompletacji.",
    },
    {
        name: "Przelew tradycyjny",
        description:
            "Po złożeniu zamówienia otrzymasz dane do przelewu. Realizację zaczynamy po zaksięgowaniu wpłaty.",
    },
    {
        name: "Faktura z odroczonym terminem",
        description:
            "Dla firm — po weryfikacji klienta istnieje możliwość płatności przelewem w terminie 14 dni od wystawienia faktury.",
    },
];

export default function DostawaPage() {
    return (
        <LegalPageShell
            eyebrow="Informacje"
            title="Dostawa i płatności"
            updated="19 sierpnia 2026"
        >
            <LegalSection title="1. Czas realizacji">
                <p>
                    Zamówienia składane do godziny 14:00 wysyłamy tego samego dnia
                    z magazynu w Bełchatowie. Standardowy czas dostawy to 1–3 dni
                    robocze w zależności od wybranej firmy kurierskiej i
                    lokalizacji.
                </p>
                <p>
                    Duże urządzenia (transformatory, stacje kontenerowe)
                    dostarczamy transportem własnym lub HDS — termin montażu i
                    uruchomienia ustalamy indywidualnie.
                </p>
            </LegalSection>

            <LegalSection title="2. Koszty dostawy">
                <ul className="list-disc pl-6 space-y-2">
                    <li>Kurier — od 19 zł brutto,</li>
                    <li>Paleta kurierska — od 49 zł brutto,</li>
                    <li>Transport HDS / własny — wycena indywidualna,</li>
                    <li>
                        Darmowa dostawa przy zamówieniach powyżej 1 000 zł brutto.
                    </li>
                </ul>
                <p>
                    Dokładny koszt dostawy zobaczysz w podsumowaniu zamówienia
                    przed dokonaniem płatności.
                </p>
            </LegalSection>

            <LegalSection title="3. Płatności">
                <div className="space-y-4">
                    {PAYMENT_METHODS.map((method) => (
                        <div
                            key={method.name}
                            className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                        >
                            <p className="font-semibold text-white">{method.name}</p>
                            <p className="mt-1 text-neutral-400">
                                {method.description}
                            </p>
                        </div>
                    ))}
                </div>
            </LegalSection>

            <LegalSection title="4. Pierwsze uruchomienie">
                <p>
                    Do każdego zamówienia możesz dodać usługę pierwszego
                    uruchomienia urządzenia (1 000 zł netto). Nasi technicy
                    sprawdzą poprawność montażu, wykonają pomiary i przekażą
                    urządzenie do eksploatacji.
                </p>
            </LegalSection>

            <LegalSection title="5. Odbiór osobisty">
                <p>
                    Towar możesz odebrać osobiście w naszym magazynie w
                    Bełchatowie po wcześniejszym umówieniu terminu — bez kosztów
                    dostawy.
                </p>
            </LegalSection>
        </LegalPageShell>
    );
}
