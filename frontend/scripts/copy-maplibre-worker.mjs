/**
 * Kopiuje web worker MapLibre GL JS v6 do katalogu public/.
 *
 * MapLibre v6 jest ESM-only i ładuje workera z osobnego pliku
 * (dist/maplibre-gl-worker.mjs), który importuje sibling
 * (dist/maplibre-gl-shared.mjs) ścieżką względną. Turbopack nie potrafi
 * wyemitować obu plików obok siebie jako assety — dlatego zgodnie z
 * dokumentacją MapLibre serwujemy oba pliki z public/ i wskazujemy je
 * przez setWorkerUrl('/maplibre/maplibre-gl-worker.mjs').
 *
 * Uruchamiany automatycznie przez hooki predev/prebuild (npm).
 */
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(frontendRoot, "node_modules", "maplibre-gl", "dist");
const targetDir = join(frontendRoot, "public", "maplibre");

const FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

if (!existsSync(sourceDir)) {
    console.error("[copy-maplibre-worker] Brak katalogu node_modules/maplibre-gl/dist — uruchom `npm install`.");
    process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

for (const file of FILES) {
    copyFileSync(join(sourceDir, file), join(targetDir, file));
    console.log(`[copy-maplibre-worker] ${file} → public/maplibre/${file}`);
}
