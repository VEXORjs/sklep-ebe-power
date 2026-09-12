/**
 * Zasoby marki (logo) trzymane w storage Supabase.
 *
 * Logo jest renderowane przez `next/image`, więc do przeglądarki i tak leci
 * wariant przeskalowany do rozmiaru wyświetlania (nawigacja: 156×67 px,
 * czyli ~320 px przy DPR 2) i w AVIF/WebP — kilkanaście KiB zamiast 791 KiB.
 *
 * ⚠ TODO (po stronie storage, nie kodu): plik źródłowy
 * `product_images/EBE_Power_1_upscaled.jpeg` ma 8000×3572 px i ~791 KiB.
 * Optimizer musi go najpierw pobrać z Supabase i zdekodować (28 megapikseli
 * JPEG-a = ~100–300 ms CPU na sharp/libvips), zanim wytnie z niego miniaturę
 * — płacimy za to przy każdym chybieniu cache (raz na 30 dni na instancję,
 * ale też przy każdym zimnym starcie Cloud Run). Warto wgrać do bucketu wersję
 * o szerokości ~1200 px, a duży plik zostawić wyłącznie jako obraz OG —
 * wtedy pierwsze żądanie logo jest ~25× tańsze.
 */
export const BRAND_LOGO_URL =
    "https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/EBE_Power_1_upscaled.jpeg";

/**
 * Favicon/ikony NIE korzystają z `BRAND_LOGO_URL`.
 *
 * Wcześniej `metadata.icons` wskazywało na ten sam plik JPEG 8000×3572, więc
 * przeglądarka pobierała 791 KiB jako ikonę karty (i jako apple-touch-icon).
 * Ikony serwujemy z konwencji plikowej App Routera: `src/app/favicon.ico`.
 */
