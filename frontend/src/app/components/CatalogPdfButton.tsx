import { FileDown } from "lucide-react";
interface CatalogPdfButtonProps {
    /** Bezpośredni URL publiczny pliku PDF (Supabase storage). */
    href: string;
    /** Nazwa produktu — trafia do etykiety aria dla czytników. */
    productName: string;
}
/**
 * Przycisk pobierania karty katalogowej (PDF).
 *
 * Linkuje bezpośrednio do pliku w storage Supabase
 * (`product_datasheets/products/{id}.pdf`) i pokazujemy go ZAWSZE.
 *
 * Wcześniej komponent weryfikował istnienie pliku z poziomu przeglądarki
 * (cross-origin HEAD do Supabase), ale Supabase nie odpowiada wiarygodnie na
 * takie żądania (CORS / status inny niż 200), przez co działające PDF-y były
 * uznawane za brakujące i przycisk się chował. Jeśli danego produktu nie ma
 * jeszcze PDF-a, kliknięcie prowadzi do komunikatu Supabase „nie znaleziono”.
 */
export default function CatalogPdfButton({ href, productName }: CatalogPdfButtonProps) {
    return (
        <a
            href={href}
            download
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
