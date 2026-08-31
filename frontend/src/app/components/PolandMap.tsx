'use client';

import { useEffect, useRef, useState } from 'react';

// Współrzędne środków wybranych miast w Polsce (longitude, latitude).
// Lista obejmują główne ośrodki, do których fizycznie dostarczamy agregaty.
const ALL_CITIES: Array<{
    name: string;
    lng: number;
    lat: number;
}> = [
    { name: 'Warszawa', lng: 21.0122, lat: 52.2297 },
    { name: 'Kraków', lng: 19.9450, lat: 50.0647 },
    { name: 'Gdańsk', lng: 18.6466, lat: 54.3520 },
    { name: 'Wrocław', lng: 17.0380, lat: 51.1079 },
    { name: 'Poznań', lng: 16.9560, lat: 52.4063 },
    { name: 'Łódź', lng: 19.4577, lat: 51.7579 },
    { name: 'Katowice', lng: 19.0200, lat: 50.2673 },
    { name: 'Szczecin', lng: 14.5530, lat: 53.4285 },
    { name: 'Bydgoszcz', lng: 18.0010, lat: 53.1323 },
    { name: 'Lublin', lng: 22.5680, lat: 51.2465 },
    { name: 'Białystok', lng: 23.1300, lat: 53.1333 },
    { name: 'Olsztyn', lng: 20.4900, lat: 53.7783 },
    { name: 'Zielona Góra', lng: 15.7660, lat: 51.9350 },
    { name: 'Rzeszów', lng: 21.9980, lat: 50.0700 },
    { name: 'Opole', lng: 17.9340, lat: 50.7010 },
];

// Bounding box Polski — używany do projekcji geo → SVG.
const BBOX = { minLng: 14.03, maxLng: 24.09, minLat: 49.00, maxLat: 54.83 };

interface PolandMapProps {
    className?: string;
}

/**
 * Komponent renderujący statyczną mapę Polski z losowo wybranymi miastami,
 * w których firma już dostarczyła agregaty.
 *
 * Każde wywołanie (przeładowanie hero / nowa sesja) wybiera inny podzbiór,
 * dzięki czemu mapa wygląda żywo i nie jest statycznym zdjęciem.
 */
export default function PolandMap({ className = '' }: PolandMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selected, setSelected] = useState<typeof ALL_CITIES>([]);
    const [animating, setAnimating] = useState<Set<number>>(new Set());

    // Skalowanie współrzędnych geo na viewBox 0..1 SVG (bez jednostek).
    const project = (lng: number, lat: number) => {
        const x = (lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng);
        const y = (lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat);
        // Lekka korekta czebio-odległości: wyższe szerokości geograficzne
        // są „szersze" na mapie, więc ucięcie bocznych krawędzi wygląda naturalnie.
        return { x: Math.max(0.01, Math.min(0.99, x)), y: Math.max(0.01, Math.min(0.99, y)) };
    };

    // Wybierz losowy podzbiór miast przy pierwszej renderacji w mountowaniu klienta.
    useEffect(() => {
        const pool = [...ALL_CITIES];
        // Fisher-Yates shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        // Losowo 8–12 miast — wystarczająco wiele, by mapa wyglądała na „pełną".
        const count = 8 + Math.floor(Math.random() * 5); // 8–12
        setSelected(pool.slice(0, count));
    }, []);

    // Każdy marker animuje wyjście z lekkim opóźnieniem.
    useEffect(() => {
        if (selected.length === 0) return;
        const timers: Array<ReturnType<typeof setTimeout>> = [];
        const next = new Set<number>();
        selected.forEach((city, idx) => {
            const delay = 60 + idx * 45;
            timers.push(
                setTimeout(() => {
                    next.add(idx);
                    setAnimating(next);
                }, delay)
            );
        });
        return () => timers.forEach(clearTimeout);
    }, [selected]);

    return (
        <div className={`relative flex flex-col overflow-hidden rounded-xl border border-neutral-800/70 bg-[#10141a] p-4 ${className}`}>
            {/* Nagłówek sekcji */}
            <div className="mb-3 flex items-center gap-2">
                <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4 shrink-0 text-emerald-400"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M8 1.5l1.75 3.1 3.4.3-2.45 2.3.65 3.35L8 11.15 4.9 9.6l.65-3.35-2.45-2.3L6.3 4.6 8 1.5z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Gdzie już dostarczyliśmy
                </span>
                <div className="ml-auto flex h-5 items-center gap-1 rounded-md border border-neutral-800 bg-black/40 px-2 text-[10px] text-neutral-500">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span id="cityCount">{selected.length} miast</span>
                </div>
            </div>

            {/* Mapa */}
            <div className="relative flex-1 min-h-0">
                <svg
                    ref={svgRef}
                    viewBox="0 0 1 1"
                    className="h-full w-full drop-shadow-inner"
                    role="img"
                    aria-label="Mapa Polski z zaznaczonymi miastami dostaw"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* === Kontur Polski (uproszczony wielokąt) === */}
                    <path
                        d="M0.604 0.079
                           L0.663 0.020 L0.720 0.000 L0.749 0.002 L0.835 0.109
                           L0.863 0.177 L0.869 0.154 L0.864 0.146 L0.990 0.237
                           L0.958 0.383 L0.898 0.480 L0.835 0.567 L0.774 0.606
                           L0.777 0.656 L0.720 0.714 L0.618 0.735 L0.640 0.743
                           L0.556 0.751 L0.545 0.763 L0.515 0.799 L0.498 0.862
                           L0.460 0.876 L0.431 0.875 L0.440 0.851 L0.410 0.832
                           L0.380 0.774 L0.333 0.744 L0.334 0.689 L0.344 0.637
                           L0.324 0.594 L0.298 0.571 L0.247 0.557 L0.215 0.565
                           L0.207 0.520 L0.179 0.504 L0.169 0.487 L0.147 0.452
                           L0.121 0.419 L0.107 0.371 L0.112 0.337 L0.100 0.316
                           L0.082 0.300 L0.064 0.270 L0.066 0.269 L0.045 0.263
                           L0.034 0.236 L0.031 0.222 L0.020 0.224 L0.006 0.185
                           L0.011 0.128 L0.035 0.123 L0.058 0.107 L0.079 0.095
                           L0.122 0.073 L0.162 0.056 L0.193 0.056 L0.224 0.064
                           L0.250 0.064 L0.275 0.063 L0.302 0.067 L0.325 0.075
                           L0.359 0.079 L0.389 0.079 L0.418 0.079 L0.448 0.076
                           L0.481 0.076 L0.519 0.078 L0.556 0.079 L0.578 0.079
                           Z"
                        fill="rgba(16,187,90,0.09)"
                        stroke="rgba(52,211,153,0.40)"
                        strokeWidth="0.006"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Delikatna siatka koordynatowa jako kontekst */}
                    <g opacity="0.12" vectorEffect="non-scaling-stroke">
                        <line x1={0.2} y1={0} x2={0.2} y2={1} stroke="rgba(148,163,184,0.5)" strokeWidth={0.002} />
                        <line x1={0.4} y1={0} x2={0.4} y2={1} stroke="rgba(148,163,184,0.5)" strokeWidth={0.002} />
                        <line x1={0.6} y1={0} x2={0.6} y2={1} stroke="rgba(148,163,184,0.5)" strokeWidth={0.002} />
                        <line x1={0.8} y1={0} x2={0.8} y2={1} stroke="rgba(148,163,184,0.5)" strokeWidth={0.002} />
                        <line x1={0} y1={0.25} x2={1} y2={0.25} stroke="rgba(148,163,184,0.5)" strokeWidth={0.002} />
                        <line x1={0} y1={0.5} x2={1} y2={0.5} stroke="rgba(148,163,184,0.5)" strokeWidth={0.002} />
                        <line x1={0} y1={0.75} x2={1} y2={0.75} stroke="rgba(148,163,184,0.5)" strokeWidth={0.002} />
                    </g>

                    {/* === Markery miast === */}
                    {selected.map((city, idx) => {
                        const { x, y } = project(city.lng, city.lat);
                        const visible = animating.has(idx);

                        return (
                            <g
                                key={city.name}
                                className="pointer-events-none"
                                opacity={visible ? 1 : 0}
                                style={{ transition: 'opacity 0.5s ease' }}
                            >
                                {/* Piórkowy marker */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={0.018}
                                    fill="rgba(16,187,90,0.25)"
                                    stroke="rgba(52,211,153,0.9)"
                                    strokeWidth={0.002}
                                />
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={0.009}
                                    fill="rgba(16,187,90,0.9)"
                                />

                                {/* Łączenie z etykietą — przycispek */}
                                <line
                                    x1={x}
                                    y1={y - 0.017}
                                    x2={x}
                                    y2={y - 0.034}
                                    stroke="rgba(52,211,153,0.7)"
                                    strokeWidth={0.002}
                                    strokeDasharray="0.003 0.003"
                                />

                                {/* Etykieta miasta */}
                                <text
                                    x={x}
                                    y={y - 0.038}
                                    textAnchor="middle"
                                    dominantBaseline="auto"
                                    className="pointer-events-none"
                                    style={{
                                        fontSize: '0.038px',
                                        fontWeight: 600,
                                        fill: 'rgba(48,52,62,0.95)',
                                        letterSpacing: '0.001em',
                                        transition: 'opacity 0.5s ease',
                                    }}
                                >
                                    {city.name}
                                </text>
                            </g>
                        );
                    })}

                    {/* Skalownica — wieża pomnika na prawo od mapy */}
                    <g transform="translate(0.935,0.06)" opacity="0.6">
                        <circle cx={0} cy={0} r={0.012} fill="rgba(16,187,90,0.9)" />
                        <circle cx={0} cy={0} r={0.028} fill="none" stroke="rgba(52,211,153,0.6)" strokeWidth={0.002} />
                        <text
                            x={0.038}
                            y={0.003}
                            fontSize="0.028"
                            fill="rgba(148,163,184,0.8)"
                            fontWeight={500}
                        >
                            100 km
                        </text>
                    </g>
                </svg>

                {/* Noga informacyjna pod mapą */}
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-0.5 pb-0.5">
                    <span className="text-[10px] text-neutral-600">
                        Dostawa lądowa — cała Polska
                    </span>
                    <span className="text-[10px] text-neutral-600">
                        📌 losowe miasta · odśwież stronę
                    </span>
                </div>
            </div>
        </div>
    );
}
