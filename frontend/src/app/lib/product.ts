import type { Product } from "@/app/types/product";
import { supabaseCatalogPdf } from "@/app/lib/supabase-assets";

/** Stawka VAT używana do przeliczania cen netto na brutto. */
export const VAT_RATE = 0.23;

/** Próg darmowej dostawy (brutto, zł). */
export const FREE_SHIPPING_THRESHOLD = 500;

/** Koszt kuriera, gdy zamówienie nie osiąga progu darmowej dostawy (brutto, zł). */
export const SHIPPING_COST = 16.99;

/** Dopłata netto za pierwsze uruchomienie sprzętu (zł). */
export const FIRST_STARTUP_FEE = 1000;

export interface SpecEntry {
    label: string;
    value: string;
}

/**
 * Ładne, polskie etykiety dla kluczy parametrów przychodzących z backendu
 * (Hibernate zwraca klucze w formie snake_case bez znaków diakrytycznych).
 */
const PARAM_LABELS: Record<string, string> = {
    moc: "Moc",
    moc_znamionowa: "Moc znamionowa",
    moc_ciagla: "Moc ciągła",
    moc_szczytowa: "Moc szczytowa",
    moc_ladowania: "Moc ładowania",
    napiecie: "Napięcie",
    napiecie_wejsciowe: "Napięcie wejściowe",
    napiecie_wyjsciowe: "Napięcie wyjściowe",
    napiecie_wtorne: "Napięcie wtórne",
    napiecie_sterujace: "Napięcie sterujące",
    prad: "Prąd",
    prad_pracy: "Prąd pracy",
    prad_maksymalny: "Prąd maksymalny",
    prad_wyjsciowy: "Prąd wyjściowy",
    prad_znamionowy: "Prąd znamionowy",
    sprawnosc: "Sprawność",
    przekroj: "Przekrój",
    material: "Materiał",
    klasa_napieciowa: "Klasa napięciowa",
    rodzaj_paliwa: "Rodzaj paliwa",
    rozruch: "Rozruch",
    zlacze: "Złącze",
    stopien_ochrony: "Stopień ochrony",
    kategoria_pomiarowa: "Kategoria pomiarowa",
    pomiar_pradu: "Pomiar prądu",
    pomiar: "Pomiar",
    zakres: "Zakres",
    zakres_regulacji: "Zakres regulacji",
    przebieg_napiecia: "Przebieg napięcia",
    moduly: "Moduły",
    charakterystyka: "Charakterystyka",
    zdolnosc_zwarciowa: "Zdolność zwarciowa",
    sterowanie: "Sterowanie",
    montaz: "Montaż",
    gwarancja: "Gwarancja",
    waga: "Waga",
    wymiary: "Wymiary",
    silnik: "Silnik",
    czestotliwosc: "Częstotliwość",
    regulacja_napiecia: "Regulacja napięcia",
    zbiornik_paliwa: "Zbiornik paliwa",
    wspolczynnik_mocy: "Współczynnik mocy",
    zastosowanie: "Zastosowanie",
    wyposazenie: "Wyposażenie",
    poziom_halasu: "Poziom hałasu",
    pojemnosc_zbiornika: "Pojemność zbiornika",
    czas_pracy: "Czas pracy",
    liczba_faz: "Liczba faz",
    // --- AGREGATY: OGÓLNE ---
    producent: "Producent",
    paliwo: "Paliwo",
    moc_maksymalna: "Moc maksymalna",
    typ_rozruchu: "Typ rozruchu",

    // --- AGREGATY: SILNIK ---
    producent_silnika: "Producent silnika",
    model_silnika: "Model silnika",
    pojemnosc_silnika: "Pojemność",
    obroty_rpm: "Obroty (RPM)",
    liczba_cylindrow: "Liczba cylindrów",
    system_chlodzenia: "System chłodzenia",
    norma_emisji_spalin: "Norma emisji spalin",
    zuzycie_paliwa: "Zużycie paliwa",

    // --- AGREGATY: PRĄDNICA ---
    typ_pradnicy: "Typ prądnicy",
    dokladnosc_regulacji: "Dokładność regulacji napięcia",
    producent_pradnicy: "Producent prądnicy",
};

function prettifyKey(key: string): string {
    const normalized = key.trim().toLowerCase().replace(/\s+/g, "_");
    const mapped = PARAM_LABELS[normalized];
    if (mapped) return mapped;

    const spaced = key.trim().replace(/[_-]+/g, " ").toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Parametry produktu przychodzą w dwóch formatach:
 *  • z backendu (Spring/Hibernate) jako mapa `{ "moc": "40VA" }`,
 *  • z lokalnego katalogu jako tekst `"moc: 40VA; napięcie: 230V"`.
 * Ta funkcja normalizuje oba przypadki do jednej listy.
 */
export function parseParameters(raw: unknown): SpecEntry[] {
    if (!raw) return [];

    if (typeof raw === "object" && !Array.isArray(raw)) {
        return Object.entries(raw as Record<string, unknown>)
            .filter(([, value]) => value != null && String(value).trim() !== "")
            .map(([key, value]) => ({
                label: prettifyKey(key),
                value: String(value).trim(),
            }));
    }

    if (Array.isArray(raw)) {
        return raw
            .map((item) => String(item).trim())
            .filter(Boolean)
            .map((item) => {
                const idx = item.indexOf(":");
                return idx === -1
                    ? { label: "Specyfikacja", value: item }
                    : {
                          label: prettifyKey(item.slice(0, idx)),
                          value: item.slice(idx + 1).trim(),
                      };
            });
    }

    if (typeof raw === "string") {
        return raw
            .split(/[;\n]+/)
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => {
                const idx = part.indexOf(":");
                return idx === -1
                    ? { label: "Specyfikacja", value: part }
                    : {
                          label: prettifyKey(part.slice(0, idx)),
                          value: part.slice(idx + 1).trim(),
                      };
            });
    }

    return [];
}

/** Formatowanie kwoty w złotych — deterministyczne (bez Intl), bezpieczne dla SSR. */
export function formatPLN(value: number): string {
    const safe = Number.isFinite(value) ? value : 0;
    const [int, dec] = Math.abs(safe).toFixed(2).split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
    return `${safe < 0 ? "-" : ""}${grouped},${dec} zł`;
}

export function grossPrice(net: number): number {
    return net * (1 + VAT_RATE);
}

export function ratingOf(product: Product): number {
    return product.rating ?? Math.round((4 + ((product.id * 37) % 10) / 10) * 10) / 10;
}

export function reviewsOf(product: Product): number {
    return product.reviews ?? 5 + ((product.id * 13) % 46);
}

export function badgeOf(product: Product): string | null {
    if (product.badge) return product.badge;
    if (product.oldPrice != null) return "Promocja";
    return null;
}

export function skuOf(product: Product): string {
    return product.sku ?? `TRA-${String(product.id).padStart(4, "0")}`;
}

/**
 * URL karty katalogowej (PDF) produktu. Jeśli produkt ma własne `catalogPdf`,
 * używamy go; w przeciwnym razie wyliczamy adres po ID z bucketu Supabase
 * (`product_datasheets/products/{id}.pdf`).
 */
export function catalogPdfOf(product: Product): string {
    return product.catalogPdf?.trim() || supabaseCatalogPdf(product.id);
}

/** Procent rabatu względem ceny sprzed promocji (lub null, gdy brak promocji). */
export function discountPercent(product: Product): number | null {
    if (!product.oldPrice || product.oldPrice <= product.price) return null;
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

/** Oszczędność brutto w złotych. */
export function savingsGross(product: Product): number | null {
    if (!product.oldPrice || product.oldPrice <= product.price) return null;
    return grossPrice(product.oldPrice - product.price);
}

export type StockTone = "in" | "low" | "out";

export interface StockInfo {
    tone: StockTone;
    label: string;
    detail: string;
    /** Wypełnienie paska dostępności w procentach (0–100). */
    barPercent: number;
}

export function stockInfo(stock: number): StockInfo {
    if (!stock || stock <= 0) {
        return {
            tone: "out",
            label: "Chwilowo niedostępny",
            detail: "Powiadomimy Cię o dostawie",
            barPercent: 0,
        };
    }
    if (stock <= 5) {
        return {
            tone: "low",
            label: "Ostatnie sztuki",
            detail: `Zostało ${stock} szt. w magazynie`,
            barPercent: Math.max(12, Math.round((stock / 20) * 100)),
        };
    }
    return {
        tone: "in",
        label: "Dostępny od ręki",
        detail: `${stock >= 100 ? "100+" : stock} szt. w magazynie`,
        barPercent: Math.min(100, Math.round((stock / 40) * 100) + 25),
    };
}

/** Deterministyczny „licznik sprzedaży" — stały dla danego produktu (brak rozjazdu SSR/CSR). */
export function soldCountOf(product: Product): number {
    return 12 + ((product.id * 29) % 180);
}

/** Czy produkt kwalifikuje się do darmowej dostawy przy zakupie 1 szt. */
export function hasFreeShipping(product: Product): boolean {
    return grossPrice(product.price) >= FREE_SHIPPING_THRESHOLD;
}

/** Koszt dostawy dla podanej kwoty brutto (0 zł od progu darmowej wysyłki). */
export function shippingCostFor(grossTotal: number): number {
    return grossTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/** Kwota VAT od podanej wartości netto. */
export function vatOf(net: number): number {
    return net * VAT_RATE;
}

export interface ReviewEntry {
    author: string;
    rating: number;
    date: string;
    text: string;
    verified: boolean;
}

const REVIEW_AUTHORS = [
    "Marek K.",
    "Anna W.",
    "Piotr S.",
    "Joanna L.",
    "Tomasz B.",
    "Ewa N.",
    "Krzysztof P.",
    "Magdalena R.",
];

const REVIEW_TEXTS = [
    "Sprzęt zgodny z opisem, solidne wykonanie. Wysyłka wyszła tego samego dnia.",
    "Dobrze dobrane parametry, bez niespodzianek przy montażu. Polecam dział techniczny.",
    "Faktura VAT przyszła mailem, opakowanie solidne. Będę zamawiać osprzęt w komplecie.",
    "Cichy, trzyma deklarowane napięcie pod obciążeniem. Dokładnie to, czego potrzebowałem.",
    "Szybki kontakt przed zakupem pomógł dobrać właściwy model. Same plusy.",
    "Montaż bez problemów, dokumentacja kompletna. Taka współpraca jak trzeba.",
];

/**
 * Deterministyczna lista opinii do karty produktu — stała dla danego ID,
 * żeby nie rozjeżdżał się SSR i klient.
 */
export function reviewEntriesOf(product: Product): ReviewEntry[] {
    const count = Math.min(4, Math.max(2, (reviewsOf(product) % 4) + 2));
    return Array.from({ length: count }, (_, i) => {
        const month = 1 + ((product.id + i) % 7);
        const day = 10 + ((product.id * 5 + i * 7) % 18);
        return {
            author: REVIEW_AUTHORS[(product.id + i * 3) % REVIEW_AUTHORS.length],
            rating: 4 + ((product.id + i) % 2),
            date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            text: REVIEW_TEXTS[(product.id + i * 2) % REVIEW_TEXTS.length],
            verified: (product.id + i) % 3 !== 0,
        };
    });
}

/** Usuwa polskie znaki diakrytyczne i normalizuje tekst do porównań. */
export function normalizeText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ł/g, "l")
        .replace(/Ł/g, "L")
        .toLowerCase()
        .trim();
}

/** Zamienia nazwę kategorii na slug URL-owy, np. „Stacje ładowania EV" → „stacje-ladowania-ev". */
export function slugify(value: string): string {
    return normalizeText(value)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Poprawna polska odmiana rzeczownika po liczbie, np. 1 produkt / 3 produkty / 7 produktów. */
export function pluralPL(
    count: number,
    one: string,
    few: string,
    many: string
): string {
    const abs = Math.abs(count);
    const lastDigit = abs % 10;
    const lastTwo = abs % 100;

    if (abs === 1) return one;
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
    return many;
}

/** Skrót dla najczęstszego przypadku: „produkt / produkty / produktów". */
export function productsLabel(count: number): string {
    return pluralPL(count, "produkt", "produkty", "produktów");
}
