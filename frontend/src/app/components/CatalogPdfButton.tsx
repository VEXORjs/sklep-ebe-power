import { FileDown } from "lucide-react";

interface CatalogPdfButtonProps {
    /** ID produktu — domyślny href to same-origin `/api/datasheet/{id}`. */
    productId: number;
    /** Nazwa produktu — trafia do etykiety aria dla czytników. */
    productName: string;
    /**
     * Opcjonalny bezpośredni URL (np. własne `catalogPdf` z backendu).
     * Gdy brak, przycisk idzie przez proxy `/api/datasheet/{id}` — atrybut
     * `download` działa tylko same-origin, a cross-origin HEAD do Supabase
     * wcześniej chował działające przyciski (CORS).
     */
    href?: string;
}

/**
 * Przycisk pobierania karty katalogowej (PDF).
 *
 * Pokazujemy go ZAWSZE — weryfikacja istnienia pliku z przeglądarki
 * (cross-origin HEAD) była niewiarygodna i zostawiała UI na
 * „Sprawdzam kartę katalogową…”. Brak pliku kończy się 404 z naszego
 * proxy albo komunikatem Supabase, a nie znikającym przyciskiem.
 */
export default function CatalogPdfButton({ productId, productName, href }: CatalogPdfButtonProps) {
    const url = href?.trim() || `/api/datasheet/${productId}`;

    return (
        <a
            href={url}
            download={`karta-katalogowa-${productId}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Pobierz kartę katalogową produktu ${productName} (PDF)`}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300 transition-colors hover:border-emerald-500 hover:bg-emerald-500/20"
        >
            <FileDown className="h-4 w-4" />
            Pobierz kartę katalogową (PDF)
        </a>
    );
}
