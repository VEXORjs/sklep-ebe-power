import type { Product } from "@/app/types/product";

/** Stawka VAT używana do przeliczania cen netto na brutto. */
export const VAT_RATE = 0.23;

/** Próg darmowej dostawy (brutto, zł). */
export const FREE_SHIPPING_THRESHOLD = 500;

/** Liczba rat w kalkulatorze „raty od…". */
export const INSTALLMENT_MONTHS = 12;

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
    poziom_halasu: "Poziom hałasu",
    pojemnosc_zbiornika: "Pojemność zbiornika",
    czas_pracy: "Czas pracy",
    liczba_faz: "Liczba faz",
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
 *  • z danych demonstracyjnych jako tekst `"moc: 40VA; napięcie: 230V"`.
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

/** Orientacyjna rata 0% — wyłącznie do celów prezentacyjnych na karcie. */
export function installmentOf(product: Product): number {
    return grossPrice(product.price) / INSTALLMENT_MONTHS;
}

/** Deterministyczny „licznik sprzedaży" — stały dla danego produktu (brak rozjazdu SSR/CSR). */
export function soldCountOf(product: Product): number {
    return 12 + ((product.id * 29) % 180);
}

/** Czy produkt kwalifikuje się do darmowej dostawy przy zakupie 1 szt. */
export function hasFreeShipping(product: Product): boolean {
    return grossPrice(product.price) >= FREE_SHIPPING_THRESHOLD;
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
