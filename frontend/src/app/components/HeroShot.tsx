"use client";

import { useEffect, useRef, useState } from "react";

interface HeroShotProps {
    /** Kolejne adresy zdjęcia — po błędzie ładowania bierzemy następny. */
    srcs: Array<string | undefined | null>;
    alt: string;
}

/** Nierówna („odręczna”) krawędź kadru — maska i border korzystają z tego samego kształtu. */
const RAGGED_EDGE_PATH =
    "M52 66C140 40 258 54 372 46C462 40 546 56 556 116C568 184 542 258 556 336C566 422 544 502 470 532C390 564 272 542 180 552C100 562 48 532 42 452C36 370 56 298 46 218C38 150 36 88 52 66Z";

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
 * Kadr to JEDEN inline `<svg>`: zdjęcie (`<image>`) siedzi w tym samym
 * dokumencie SVG co `<mask>` i jest wycinane atrybutem `mask="url(#…)"`.
 * To jedyny wariant maskowania, który działa we wszystkich przeglądarkach —
 * CSS-owe `mask-image` z data-URI SVG (z filtrami feTurbulence /
 * feDisplacementMap) bywa ignorowane (m.in. Safari), a odwołanie
 * `mask-image: url(#id)` do inline `<mask>` wspiera tylko Firefox.
 *
 * Zdjęcie nie przechodzi przez `next/image` (obrazy i tak są
 * `unoptimized`), więc błędy ładowania — np. 404 na okładce
 * w storage Supabase — obsługujemy listenerem na elemencie.
 */
export default function HeroShot({ srcs, alt }: HeroShotProps) {
    const candidates = normalizeSrcs(srcs);
    const signature = candidates.join("\0");
    const [index, setIndex] = useState(0);
    const [seenSignature, setSeenSignature] = useState(signature);
    const imageRef = useRef<SVGImageElement | null>(null);

    if (signature !== seenSignature) {
        setSeenSignature(signature);
        setIndex(0);
    }

    // 404/błąd dekodowania → próbujemy kolejny adres z listy.
    useEffect(() => {
        const el = imageRef.current;
        if (!el) return;
        const onError = () => setIndex((current) => current + 1);
        el.addEventListener("error", onError);
        return () => el.removeEventListener("error", onError);
    }, [index, signature]);

    const src = candidates[signature === seenSignature ? index : 0];

    return (
        <svg
            viewBox="0 0 600 450"
            className="pointer-events-none absolute inset-0 h-full w-full"
            role="img"
            aria-label={alt}
        >
            <defs>
                {/* Poszarpana krawędź borderu: feTurbulence + feDisplacementMap */}
                <filter
                    id="hero-edge-rough"
                    filterUnits="userSpaceOnUse"
                    x="-150"
                    y="-150"
                    width="900"
                    height="900"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.02"
                        numOctaves="3"
                        seed="7"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="24"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>

                {/* Ta sama poszarpana krawędź + rozmycie = maska wygasza
                    kadr w fade out (zdjęcie wtapia się w tło sekcji). */}
                <filter
                    id="hero-frame-soft"
                    filterUnits="userSpaceOnUse"
                    x="-150"
                    y="-150"
                    width="900"
                    height="900"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.02"
                        numOctaves="3"
                        seed="7"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="24"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                    <feGaussianBlur stdDeviation="13" />
                </filter>

                {/* Jasna „karta” pod zdjęciem — kolory sterowane zmiennymi
                    z globals.css (osobne dla motywu ciemnego i jasnego). */}
                <radialGradient id="hero-card" cx="50%" cy="30%" r="100%">
                    <stop offset="0%" style={{ stopColor: "var(--hero-card-inner)" }} />
                    <stop offset="55%" style={{ stopColor: "var(--hero-card-inner)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--hero-card-outer)" }} />
                </radialGradient>

                {/* Border krawędzi przechodzący w fade out */}
                <linearGradient id="hero-edge-fade" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
                    <stop offset="38%" stopColor="#10b981" stopOpacity="0.55" />
                    <stop offset="68%" stopColor="#10b981" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>

                {/* Maska kadru: kształt ścieżki (600×600) dopasowany do
                    kadru 4:3 (600×450) skalowaniem pionowym. */}
                <mask
                    id="hero-frame"
                    maskUnits="userSpaceOnUse"
                    x="-20"
                    y="-20"
                    width="640"
                    height="490"
                >
                    <g transform="scale(1 0.75)">
                        <path d={RAGGED_EDGE_PATH} fill="#ffffff" filter="url(#hero-frame-soft)" />
                    </g>
                </mask>
            </defs>

            {/* Kadr: karta + zdjęcie wycięte maską o nierównej krawędzi */}
            <g mask="url(#hero-frame)">
                <rect x="0" y="0" width="600" height="450" fill="url(#hero-card)" />
                {src ? (
                    <image
                        ref={imageRef}
                        href={src}
                        x="48"
                        y="36"
                        width="504"
                        height="378"
                        preserveAspectRatio="xMidYMid meet"
                    />
                ) : null}
            </g>

            {/* Nierówny border rysowany po tej samej krawędzi */}
            <g transform="scale(1 0.75)">
                <path
                    d={RAGGED_EDGE_PATH}
                    fill="none"
                    stroke="url(#hero-edge-fade)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#hero-edge-rough)"
                    vectorEffect="non-scaling-stroke"
                />
            </g>
        </svg>
    );
}
