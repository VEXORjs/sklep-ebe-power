import type { Metadata } from "next";
import LegalPageShell, { LegalSection } from "@/app/components/LegalPageShell";

export const metadata: Metadata = {
    title: "Dostawa i płatności — wysyłka w 24 h, transport HDS",
    description:
        "Dostawa i płatności w sklepie ebe power — wysyłka w 24 h z magazynu w Bełchatowie, kurier od 19 zł, darmowa dostawa od 1 000 zł, transport HDS, płatności online Stripe, BLIK, przelew.",
    alternates: { canonical: "/dostawa" },
    openGraph: {
        title: "Dostawa i płatności | ebe power",
        description: "Wysyłka w 24 h z magazynu w Bełchatowie. Kurier, paleta, transport HDS. Płatności Stripe, BLIK, przelew.",
        url: "/dostawa",
        type: "website",
    },
};

const PAYMENT_METHODS = [
    {
        name: "Płatność online (Stripe)",
        description:
            "Karty kredytowe i debetowe, BLIK oraz inne metody obsługiwane przez Stripe. Płatność księguje się natychmiast — zamówienie od razu trafia do nas.",
    },
    {
        name: "Przelew tradycyjny",
        description:
            "Po złożeniu zamówienia otrzymasz dane do przelewu. Realizację zaczynamy po zaksięgowaniu wpłaty.",
    },
];

export default function DostawaPage() {
    return (
        <LegalPageShell
            eyebrow="Informacje"
            title="Dostawa i płatności"
            updated="28 sierpnia 2026"
        >
            <LegalSection title="1. Czas realizacji">
                <p>
                    Standardowy czas dostawy to 1–3 dni
                    robocze w zależności od wybranej
                    lokalizacji.
                </p>
                <p>
                    Duże urządzenia
                    dostarczamy transportem własnym — termin montażu i
                    uruchomienia ustalamy indywidualnie.
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

        </LegalPageShell>
    );
}
