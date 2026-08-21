"use client";

import { useEffect, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

interface CatalogPdfButtonProps {
    /** Bezpośredni URL publiczny pliku PDF (Supabase storage). */
    href: string;
    /** Nazwa produktu — trafia do etykiety aria dla czytników. */
    productName: string;
}

type CheckState = "checking" | "available" | "missing";

const BUTTON_CLASS =
    "flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300 transition-colors";

/**
 * Przycisk pobierania karty katalogowej (PDF).
 *
 * Najpierw sprawdzamy (HEAD), czy plik istnieje w storage Supabase — dzięki
 * temu nie pokazujemy niedziałającego przycisku dla produktów, które nie mają
 * jeszcze wgranego PDF-a. Jeśli HEAD nie jest obsługiwany (405) lub wystąpi
 * błąd sieci, zostawiamy przycisk optymistycznie (nie blokujemy pobierania).
 */
export default function CatalogPdfButton({ href, productName }: CatalogPdfButtonProps) {
    const [state, setState] = useState<CheckState>("checking");

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        fetch(href, { method: "HEAD", cache: "no-store", signal: controller.signal })
            .then((res) => {
                if (!active) return;
                // 405 = HEAD nieobsługiwane przez storage → traktuj optymistycznie
                setState(res.status === 405 || res.ok ? "available" : "missing");
            })
            .catch(() => {
                if (!active) return;
                // Błąd sieci / CORS — nie chowamy przycisku
                setState("available");
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [href]);

    if (state === "missing") return null;

    if (state === "checking") {
        return (
            <button type="button" disabled className={`${BUTTON_CLASS} cursor-wait opacity-70`}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sprawdzam kartę katalogową…
            </button>
        );
    }

    return (
        <a
            href={href}
            download
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Pobierz kartę katalogową produktu ${productName} (PDF)`}
            className={`${BUTTON_CLASS} hover:border-emerald-500 hover:bg-emerald-500/20`}
        >
            <FileDown className="h-4 w-4" />
            Pobierz kartę katalogową (PDF)
        </a>
    );
}
