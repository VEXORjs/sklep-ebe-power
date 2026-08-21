export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
    images: string[];
    videos?: string[];
    /**
     * Parametry techniczne. Backend (Hibernate) zwraca mapę `{ klucz: wartość }`,
     * lokalny katalog może używać zapisu tekstowego `"moc: 40VA; napięcie: 230V"`.
     * Do wyświetlania używaj `parseParameters()` z `@/app/lib/product`.
     */
    parameters: string | Record<string, string>;
    category?: string;
    /** Drugi poziom katalogu, np. "Transformatory toroidalne". */
    subcategory?: string;
    sku?: string;
    oldPrice?: number;
    badge?: string;
    rating?: number;
    reviews?: number;
    /**
     * URL do karty katalogowej (PDF). Domyślnie wyliczany z ID produktu
     * (`supabaseCatalogPdf`); tutaj można podać własny (np. inny bucket).
     */
    catalogPdf?: string;
}
