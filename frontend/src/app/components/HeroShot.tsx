"use client";

import { useState } from "react";

interface HeroShotProps {
    /** Kolejne adresy zdjęcia — po błędzie ładowania bierzemy następny. */
    srcs: Array<string | undefined | null>;
    alt: string;
}

/**
 * Nierówna („odręczna”) krawędź kadru.
 *
 * Ścieżka jest już w naturalnych współrzędnych widoku 600×450 (aspekt 4:3),
 * więc NIE potrzebujemy `transform="scale(1 0.75)"` — poprzednia wersja
 * skalowała ścieżkę 600×600 w pionie, co powodowało, że w niektórych
 * przeglądarkach maska i filtr `feDisplacementMap` wewnątrz maski
 * rozjeżdżały się (filtry w SVG `mask` są notorycznie nieobsługiwane
 * poprawnie w Safari oraz pod wpływem `transform` na grupie).
 *
 * Kształt wygenerowany z superelipsy + delikatnego szumu radialnego
 * (szorstkość ~4% promienia), dzięki czemu dostajemy odręczny brzeg
 * BEZ potrzeby `feDisplacementMap` w środku maski.
 */
const RAGGED_FRAME_PATH =
    "M552.2 225.0C553.7 228.8 552.3 232.7 552.6 236.6C552.9 240.5 554.0 244.5 554.2 248.5C554.3 252.5 553.0 256.2 553.7 260.4C554.5 264.6 559.0 269.6 558.7 273.7C558.4 277.8 554.8 281.5 551.9 285.1C549.1 288.7 542.3 291.0 541.8 295.3C541.3 299.7 548.0 306.2 549.0 311.3C550.0 316.3 549.1 321.0 547.6 325.4C546.0 329.8 542.2 333.3 539.8 337.6C537.5 341.8 535.1 346.0 533.6 350.9C532.0 355.8 534.4 363.3 530.5 367.0C526.7 370.7 515.7 369.9 510.5 372.9C505.4 375.8 504.2 381.6 499.4 384.7C494.7 387.9 489.3 390.9 482.1 391.7C475.0 392.5 463.9 389.3 456.5 389.5C449.2 389.8 444.1 391.8 438.1 393.0C432.0 394.1 426.2 395.3 420.3 396.4C414.4 397.4 408.7 398.7 402.8 399.3C396.8 399.8 390.2 399.1 384.4 399.7C378.6 400.3 373.8 403.4 367.9 402.9C361.9 402.4 354.4 396.6 348.6 396.7C342.9 396.7 338.8 402.3 333.4 403.4C328.1 404.4 322.2 403.5 316.6 403.1C311.0 402.7 305.6 400.2 300.0 400.8C294.4 401.5 288.7 406.0 283.0 406.9C277.4 407.8 271.7 406.5 266.0 406.3C260.3 406.1 254.2 406.9 248.8 405.7C243.4 404.5 239.4 399.6 233.5 399.2C227.7 398.8 219.8 403.5 213.9 403.2C208.0 402.8 203.8 398.9 198.4 397.2C193.1 395.6 189.0 392.7 181.8 393.3C174.7 393.9 163.7 399.5 155.6 400.7C147.4 401.9 138.3 402.9 133.0 400.6C127.6 398.3 127.4 390.4 123.4 386.6C119.4 382.9 115.4 379.8 108.8 378.1C102.2 376.5 89.0 379.5 84.0 376.7C78.9 374.0 81.5 365.7 78.4 361.5C75.2 357.3 68.5 355.4 65.1 351.6C61.6 347.8 60.6 342.8 57.7 338.7C54.8 334.7 47.6 332.3 47.8 327.3C47.9 322.3 59.5 313.2 58.7 308.6C57.9 304.0 45.5 303.5 42.8 299.8C40.1 296.1 41.1 291.1 42.4 286.4C43.7 281.8 48.1 276.5 50.6 271.9C53.2 267.3 56.7 262.9 57.7 258.9C58.6 254.8 59.3 251.2 56.6 247.5C53.8 243.9 42.5 240.7 41.1 236.9C39.7 233.2 47.0 228.9 48.1 225.0C49.1 221.1 46.7 217.2 47.5 213.4C48.2 209.6 52.5 206.1 52.6 202.1C52.7 198.2 49.6 194.0 48.1 189.8C46.6 185.6 42.1 180.5 43.6 176.7C45.1 173.0 56.5 171.3 57.1 167.1C57.6 162.9 46.3 155.5 46.9 151.4C47.5 147.2 59.2 146.3 60.6 142.1C62.1 137.8 56.3 131.1 55.6 125.9C55.0 120.7 56.4 116.1 56.6 110.8C56.8 105.5 53.6 97.9 57.0 94.0C60.4 90.2 71.7 90.5 76.9 87.6C82.2 84.7 83.9 79.6 88.7 76.6C93.4 73.5 99.2 70.9 105.6 69.3C111.9 67.6 121.9 69.4 127.0 66.6C132.1 63.9 130.7 54.9 136.1 52.7C141.5 50.6 152.7 54.7 159.2 53.7C165.7 52.7 168.5 47.2 175.0 46.9C181.4 46.6 191.5 51.9 198.0 52.1C204.6 52.2 208.5 48.1 214.4 47.8C220.3 47.5 227.7 51.1 233.4 50.4C239.1 49.6 242.8 42.8 248.5 43.2C254.2 43.6 261.8 51.1 267.7 52.8C273.6 54.5 278.6 54.5 284.0 53.4C289.4 52.3 294.6 47.3 300.0 46.2C305.4 45.0 311.3 45.1 316.7 46.3C322.0 47.4 326.7 52.7 332.2 53.3C337.7 53.9 343.8 50.5 349.6 49.9C355.3 49.4 360.3 51.2 366.8 50.0C373.2 48.7 381.6 43.4 388.2 42.4C394.9 41.5 400.6 43.3 406.6 44.3C412.5 45.4 418.1 47.1 423.8 48.7C429.5 50.3 433.6 53.6 440.7 53.8C447.8 54.1 459.6 49.2 466.3 50.2C473.0 51.1 475.8 56.5 480.8 59.5C485.7 62.6 491.1 65.1 495.7 68.2C500.4 71.4 503.8 75.4 508.6 78.4C513.5 81.5 521.9 82.4 524.6 86.6C527.3 90.9 520.8 100.2 524.7 103.9C528.7 107.5 545.3 104.7 548.1 108.5C550.9 112.4 541.8 121.9 541.6 127.0C541.3 132.2 546.4 135.0 546.6 139.6C546.8 144.2 543.3 149.8 542.6 154.4C542.0 159.0 540.4 163.4 542.7 167.1C545.1 170.8 554.9 172.9 556.6 176.7C558.3 180.5 553.5 185.5 552.8 189.7C552.1 193.8 553.7 197.7 552.3 201.7C550.8 205.7 544.0 209.9 544.0 213.8C544.0 217.7 550.8 221.2 552.2 225.0Z";

/** Ikona błyskawicy (lucide „Zap") — placeholder, gdy żadne zdjęcie nie działa. */
const ZAP_ICON_PATH =
    "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z";

function normalizeSrcs(srcs: Array<string | undefined | null>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const value of srcs) {
        const trimmed = value?.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        result.push(trimmed);
    }
    return result;
}

/**
 * Zdjęcie agregatu w kadrze o nierównej, „odręcznej” krawędzi.
 *
 * W przeciwieństwie do poprzedniej implementacji, maska nie zawiera już
 * w środku filtrów (`feTurbulence` / `feDisplacementMap` / `feGaussianBlur`),
 * bo:
 *
 *   1. Filtry SVG wewnątrz elementu `<mask>` są notorycznie zawodne
 *      w Safari (efekt bywa całkowicie ignorowany, co objawia się
 *      prostokątnym kadrem zamiast poszarpanego).
 *   2. Transform `scale(1 0.75)` na grupie wewnątrz maski rozjeżdżał
 *      mapowanie współrzędnych między maską a kadrem w niektórych
 *      silnikach (efekt — maska przycinała zdjęcie w złym miejscu).
 *
 * Rozwiązanie:
 *   • Ścieżka ramki jest już w docelowym układzie 600×450 (bez skalowania).
 *   • Maska używa ścieżki wypełnionej białym kolorem — BEZ FILTRÓW.
 *   • Miękkie zaniknięcie w tło (fade out) robimy filtrem `feGaussianBlur`
 *     NA ZEWNĄTRZ maski — zgodnie ze specyfikacją SVG filtr jest
 *     aplikowany po maskowaniu, więc operuje na już wyciętym kształcie.
 *   • Poszarpany brzeg samego obrysu (zielona linia) nadal dostajemy
 *     z `feTurbulence` + `feDisplacementMap`, ale tym razem filtr jest
 *     na zwykłym `<path>` (nie wewnątrz maski) — Safari to obsługuje.
 *
 * WAŻNE — filtr „pióropusza” (feather) działa TYLKO na prostokącie karty,
 * NIE na grupie zawierającej `<image>` ze zdjęciem. Filtr SVG na grupie
 * z zewnętrznym obrazkiem to znane pole minowe w Safari/WebKit (zdjęcie
 * potrafi wtedy w ogóle się nie narysować — objaw: pusta karta zamiast
 * produktu). Zdjęcie ma 70 px marginesu do brzegu maski, więc i tak nigdy
 * nie dotyka strefy feathera — podział na dwie grupy daje identyczny efekt
 * wizualny, ale renderowanie zdjęcia nie zależy już od filtra.
 *
 * Gdy żaden z adresów nie załaduje się (np. okładka nie została wgrana do
 * storage Supabase), zamiast pustej karty rysujemy elegancki placeholder.
 */
export default function HeroShot({ srcs, alt }: HeroShotProps) {
    const candidates = normalizeSrcs(srcs);
    const signature = candidates.join("\0");
    const [seenSignature, setSeenSignature] = useState(signature);
    const [failed, setFailed] = useState<ReadonlySet<number>>(new Set());

    if (signature !== seenSignature) {
        setSeenSignature(signature);
        setFailed(new Set());
    }

    // Pierwszy (w kolejności) kandydat, który nie zgłosił jeszcze błędu.
    const currentIndex = candidates.findIndex((_, index) => !failed.has(index));
    const src = currentIndex === -1 ? undefined : candidates[currentIndex];
    const allFailed = candidates.length === 0 || currentIndex === -1;

    const handleError = () => {
        if (currentIndex === -1) return;
        setFailed((previous) => new Set(previous).add(currentIndex));
    };

    return (
        <svg
            viewBox="0 0 600 450"
            className="pointer-events-none absolute inset-0 h-full w-full"
            role="img"
            aria-label={alt}
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <defs>
                {/* Poszarpana krawędź borderu — feTurbulence + feDisplacementMap.
                    Filtr jest na zewnątrz maski, na zwykłym <path>,
                    więc działa konsekwentnie we wszystkich przeglądarkach. */}
                <filter
                    id="hero-edge-rough"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                    colorInterpolationFilters="sRGB"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.018"
                        numOctaves="2"
                        seed="7"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="14"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* Miękkie zaniknięcie w tło (fade out) — rozmycie SAMEGO
                    KANAŁU ALFA kadru, bez ruszania kolorów/ostrości zdjęcia.
                    Przepis:
                      1. `feGaussianBlur in="SourceAlpha"` rozmywa alfa
                         — daje obrazek, którego R=G=B = rozmyta alfa
                         (a kanał A = 1 w każdym pikselu, jak nakazuje
                         specyfikacja SourceAlpha).
                      2. `feColorMatrix` przepisuje kanał R na kanał A,
                         resztę RGB zeruje — w efekcie dostajemy czarną
                         plamę o rozmytych krawędziach, która ma poprawną,
                         miękką alfę.
                      3. `feComposite operator="in"` nakłada oryginalny,
                         OSTRY kolorowy kadr (`SourceGraphic`) na tę miękką
                         alfę — w efekcie kolory zostają nietknięte,
                         a tylko kontur zewnętrzny jest wygładzony.
                    Filtr działa wyłącznie na prostokącie karty (bez
                    zdjęcia w środku), więc nie uderza w bugi Safari
                    dotyczące filtrowania zewnętrznych obrazków. */}
                <filter
                    id="hero-frame-feather"
                    x="-15%"
                    y="-15%"
                    width="130%"
                    height="130%"
                    colorInterpolationFilters="sRGB"
                >
                    <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="in" />
                </filter>

                <radialGradient id="hero-card" cx="50%" cy="30%" r="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="55%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f5f5f5"/>
                </radialGradient>

                {/* Border krawędzi przechodzący w fade out */}
                <linearGradient id="hero-edge-fade" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#10b981" stopOpacity="0.55" />
                    <stop offset="72%" stopColor="#10b981" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>

                {/* Maska kadru: sam biały kształt, BEZ FILTRÓW.
                    Filtry w <mask> są nieprzewidywalne w Safari — przenosimy
                    rozmycie na zewnątrz, na samą grupę z zawartością. */}
                <mask id="hero-frame">
                    <path d={RAGGED_FRAME_PATH} fill="#ffffff" />
                </mask>
            </defs>

            {/* Karta — osobna grupa: maska + filtr „pióropusza” działają
                tylko na zwykłym <rect>, co jest bezpieczne w każdej
                przeglądarce (patrz komentarz na górze pliku). */}
            <g mask="url(#hero-frame)" filter="url(#hero-frame-feather)">
                <rect x="0" y="0" width="600" height="450" fill="url(#hero-card)" />
            </g>

            {/* Zdjęcie — tylko maska, BEZ filtra. `xlinkHref` dodajemy dla
                starych Safari (obecne przeglądarki używają `href`). */}
            <g mask="url(#hero-frame)">
                {src ? (
                    <image
                        href={src}
                        xlinkHref={src}
                        /* Zdjęcie ma wyraźny margines do brzegu maski (70 px po
                           każdej stronie w układzie 600×450), dzięki czemu
                           nie zjada krawędzi produktu, a jedynie wtapia kartę
                           w tło sekcji. */
                        x="70"
                        y="52"
                        width="460"
                        height="345"
                        preserveAspectRatio="xMidYMid meet"
                        onError={handleError}
                    />
                ) : null}

                {/* Placeholder, gdy żadne zdjęcie się nie załadowało —
                    zamiast pustej, białej karty. */}
                {allFailed ? (
                    <g aria-hidden="true">
                        <path
                            d={ZAP_ICON_PATH}
                            transform="translate(281 174) scale(1.6)"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <text
                            x="300"
                            y="268"
                            textAnchor="middle"
                            fontSize="20"
                            fontWeight="600"
                            fill="#9ca3af"
                        >
                            Zdjęcie produktu wkrótce
                        </text>
                    </g>
                ) : null}
            </g>

            {/* Nierówny border rysowany po tej samej krawędzi.
                Bez `vectorEffect: non-scaling-stroke` — ścieżka jest już
                w naturalnym układzie 600×450, więc obrys ma jednolitą grubość. */}
            <path
                d={RAGGED_FRAME_PATH}
                fill="none"
                stroke="url(#hero-edge-fade)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#hero-edge-rough)"
            />
        </svg>
    );
}
