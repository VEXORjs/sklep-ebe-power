/**
 * Publiczne zasoby produktu w storage Supabase.
 *
 * Projekt storage: `iyugrhskjjyegxppeqoj.supabase.co`.
 * Zdjęcia oraz karty katalogowe (PDF) trzymane są w osobnych bucketach
 * i adresowane po ID produktu, dzięki czemu wystarczy wgrać plik
 * `products/{id}.jpg` / `products/{id}.pdf`, by pojawił się w sklepie.
 *
 * Host jest na stałe dopuszczony w `next.config.ts` (remotePatterns),
 * więc zdjęcia można serwować przez `next/image`.
 */
export const SUPABASE_STORAGE_BASE =
    "https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public";

/** Bucket ze zdjęciami produktów. */
export const PRODUCT_IMAGES_BUCKET = "product_images";
/** Bucket z kartami katalogowymi (PDF). */
export const PRODUCT_DATASHEETS_BUCKET = "product_datasheets";

/**
 * Publiczne zdjęcie produktu wg jego ID:
 * `…/product_images/products/{id}.jpg`.
 */
export function supabaseProductImage(id: number): string {
    return `${SUPABASE_STORAGE_BASE}/${PRODUCT_IMAGES_BUCKET}/products/${id}.jpg`;
}

/**
 * Publiczna karta katalogowa (PDF) produktu wg jego ID:
 * `…/product_datasheets/products/{id}.pdf`.
 *
 * Aby przycisk pobierania się pojawił, wgraj do bucketu `product_datasheets`
 * plik `products/{id}.pdf`.
 */
export function supabaseCatalogPdf(id: number): string {
    return `${SUPABASE_STORAGE_BASE}/${PRODUCT_DATASHEETS_BUCKET}/products/${id}.pdf`;
}
