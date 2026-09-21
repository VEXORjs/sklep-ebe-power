import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Next 16 bezwarunkowo importuje zestaw polyfilli ES2019–ES2022 do głównego
 * chunka klienta, ignorując browserslist aplikacji. Nasz minimalny target to
 * Safari 16.4 / Chrome, Edge i Firefox 111, które natywnie obsługują wszystkie
 * funkcje z tego pliku poza URL.canParse. Zostawiamy więc tylko mały fallback
 * URL.canParse wymagany przez Safari 16.4.
 *
 * Skrypt działa przed każdym buildem, ponieważ node_modules powstaje od nowa
 * w Dockerze. Sprawdzenie zawartości jest celowe: po aktualizacji Nexta build
 * ma się zatrzymać zamiast po cichu zmodyfikować nieznany plik frameworka.
 */
const expectedMarkers = [
    "String.prototype.trimStart",
    "Array.prototype.flat",
    "Object.fromEntries",
    "Array.prototype.at",
    "Object.hasOwn",
    "URL.canParse",
];

const modernPolyfill =
    '"canParse"in URL||(URL.canParse=function(value,base){try{return!!new URL(value,base)}catch(error){return!1}});\n';

const files = [
    // Pakiet Next dystrybuuje ten polyfill tylko raz; zarówno wejście CJS, jak
    // i ESM rozwiązują alias @next/polyfill-module do poniższego pliku.
    "node_modules/next/dist/build/polyfills/polyfill-module.js",
];

for (const relativePath of files) {
    const path = resolve(relativePath);
    const source = await readFile(path, "utf8");

    if (source === modernPolyfill) continue;

    const missing = expectedMarkers.filter((marker) => !source.includes(marker));
    if (missing.length > 0) {
        throw new Error(
            `Nieznana wersja polyfilli Next.js (${relativePath}); brak: ${missing.join(", ")}. ` +
            "Sprawdź target przeglądarek przed aktualizacją skryptu."
        );
    }

    await writeFile(path, modernPolyfill);
    console.log(`Ograniczono polyfille Next.js do URL.canParse: ${relativePath}`);
}
