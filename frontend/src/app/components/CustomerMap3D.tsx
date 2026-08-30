"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Popup, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { customerLocations } from "@/app/data/customerLocations";
import { buildCustomerMapStyle } from "@/app/components/customerMapStyle";

// MapLibre v6 ładuje web worker z osobnego pliku — pod Turbopackiem trzeba
// wskazać go jawnie. Pliki kopiuje skrypt scripts/copy-maplibre-worker.mjs
// (hooki predev/prebuild) do public/maplibre/.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

/** Polska odmiana: „1 zrealizowana dostawa”, „3 zrealizowane dostawy”, „12 zrealizowanych dostaw” */
function deliveriesLabel(count: number): string {
    if (count === 1) return "zrealizowana dostawa";
    const lastDigit = count % 10;
    const lastTwo = count % 100;
    if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
        return "zrealizowane dostawy";
    }
    return "zrealizowanych dostaw";
}

interface CustomerFeatureProperties {
    name: string;
    deliveries: number;
    hq: number;
}

export default function CustomerMap3D() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let map: MapLibreMap | null = null;
        let popup: Popup | null = null;
        let rafId = 0;
        let resizeObserver: ResizeObserver | null = null;
        let resumeTimer: ReturnType<typeof setTimeout> | null = null;
        let disposed = false;
        let styleReady = false;
        let paused = false;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const width = container.clientWidth || 640;
        const baseZoom = width < 420 ? 4.55 : width < 680 ? 4.95 : 5.4;
        const target = {
            center: [19.45, 52.25] as [number, number],
            zoom: baseZoom,
            pitch: 46,
            bearing: -14,
        };
        const introDuration = 2600;

        try {
            map = new MapLibreMap({
                container,
                style: buildCustomerMapStyle(customerLocations),
                // Kamera startowa — intro przelatuje do docelowej po załadowaniu
                center: [19.45, 52.0],
                zoom: Math.max(baseZoom - 0.55, 3.8),
                pitch: prefersReducedMotion ? target.pitch : 14,
                bearing: prefersReducedMotion ? target.bearing : 6,
                maxBounds: [
                    [6, 45],
                    [33, 58.5],
                ],
                maxPitch: 75,
                // Plain scroll przewija stronę; zoom dopiero z Ctrl — mapa nie „kradnie” scrolla
                cooperativeGestures: true,
                attributionControl: {
                    compact: true,
                    customAttribution: "© OpenStreetMap contributors",
                },
                canvasContextAttributes: { antialias: true },
            });
        } catch (error) {
            console.warn("[CustomerMap3D] Nie udało się zainicjować mapy:", error);
            // WebGL niedostępny — odkładamy update stanu poza efekt (reguła react-hooks)
            const failTimer = setTimeout(() => setFailed(true), 0);
            return () => clearTimeout(failTimer);
        }

        const currentMap = map;

        // Błędy sieciowe (kafelki/fonty) są niekrytyczne — mapa i tak rysuje punkty
        currentMap.on("error", (event) => {
            if (!disposed) console.debug("[CustomerMap3D] map error:", event?.error?.message);
        });

        // Atmosfera: emeraldowa poświata przy horyzoncie (efekt 3D)
        const applyAtmosphere = () => {
            try {
                currentMap.setSky({
                    "sky-color": "#0a1018",
                    "horizon-color": "#0e2a22",
                    "fog-color": "#05070a",
                    "sky-horizon-blend": 0.6,
                    "horizon-fog-blend": 0.6,
                    "fog-ground-blend": 0.8,
                    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 6, 0.6, 12, 0],
                });
                currentMap.setLight({
                    anchor: "viewport",
                    position: [1.2, 210, 30],
                    intensity: 0.35,
                    color: "#bfe8d8",
                });
            } catch {
                // Nie wszystkie przeglądarki muszą wspierać sky/light — ignorujemy
            }
        };

        // Intro: przelot kamery do docelowego ujęcia.
        // Odpalamy po załadowaniu stylu, ale z fallbackiem czasowym —
        // gdy kafelki się nie pobiorą (np. słaby internet), mapa i tak
        // rysuje punkty klientów i skeleton znika.
        let introStarted = false;
        const startIntro = () => {
            if (introStarted || disposed) return;
            introStarted = true;
            setReady(true);
            applyAtmosphere();

            if (prefersReducedMotion) {
                currentMap.jumpTo(target);
                introEndAt = Date.now() + 250;
            } else {
                currentMap.easeTo({
                    ...target,
                    duration: introDuration,
                    easing: (t) => 1 - Math.pow(1 - t, 3),
                });
                // auto-obrót startuje dopiero PO zakończeniu intro (inaczej przerwałby easeTo)
                introEndAt = Date.now() + introDuration + 300;
            }
        };

        currentMap.on("load", () => {
            if (disposed) return;
            styleReady = true;
            applyAtmosphere();
            startIntro();
        });
        const loadFallbackTimer = setTimeout(startIntro, 3500);

        // --- Popup z liczbą dostaw po najechaniu na punkt ---
        popup = new Popup({
            closeButton: false,
            closeOnClick: false,
            className: "customer-map-popup",
            offset: 12,
            maxWidth: "240px",
        });

        const showPopup = (event: { features?: Array<{ properties: unknown }>; lngLat: { lng: number; lat: number } }) => {
            const feature = event.features?.[0];
            if (!feature) return;
            const props = feature.properties as CustomerFeatureProperties;
            const heading = props.hq ? "ebe power — Bełchatów" : props.name;
            const sub = props.hq ? "Siedziba i magazyn główny" : `${props.deliveries} ${deliveriesLabel(props.deliveries)}`;
            popup?.setLngLat(event.lngLat).setHTML(
                `<div class="customer-map-popup-heading">${heading}</div><div class="customer-map-popup-sub">${sub}</div>`,
            ).addTo(currentMap);
            currentMap.getCanvas().style.cursor = "pointer";
        };

        const hidePopup = () => {
            popup?.remove();
            currentMap.getCanvas().style.cursor = "";
        };

        currentMap.on("mousemove", "customers-dot", showPopup);
        currentMap.on("mousemove", "customers-glow", showPopup);
        currentMap.on("mouseleave", "customers-dot", hidePopup);
        currentMap.on("mouseleave", "customers-glow", hidePopup);

        let introEndAt = Number.POSITIVE_INFINITY;
        let lastPaintUpdate = 0;

        const frame = (time: number) => {
            rafId = requestAnimationFrame(frame);
            if (disposed || !currentMap) return;

            if (!prefersReducedMotion && !paused && Date.now() > introEndAt) {
                currentMap.setBearing(currentMap.getBearing() - 0.014);
            }

            if (styleReady && time - lastPaintUpdate > 70) {
                lastPaintUpdate = time;
                const pulse = 0.2 + 0.13 * Math.sin(time / 850);
                try {
                    currentMap.setPaintProperty("customers-glow", "circle-opacity", pulse);
                } catch {
                    // warstwa może jeszcze nie istnieć — pomijamy
                }
            }
        };
        rafId = requestAnimationFrame(frame);

        // Interakcja użytkownika wstrzymuje auto-obrót (wznawia po 5 s bezczynności)
        const pauseRotation = () => {
            paused = true;
            if (resumeTimer) clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                paused = false;
            }, 5000);
        };
        container.addEventListener("mousedown", pauseRotation);
        container.addEventListener("touchstart", pauseRotation, { passive: true });
        container.addEventListener("wheel", pauseRotation, { passive: true });

        // Zmiana rozmiaru karty (np. responsywność hero)
        resizeObserver = new ResizeObserver(() => currentMap.resize());
        resizeObserver.observe(container);

        return () => {
            disposed = true;
            cancelAnimationFrame(rafId);
            if (resumeTimer) clearTimeout(resumeTimer);
            clearTimeout(loadFallbackTimer);
            resizeObserver?.disconnect();
            container.removeEventListener("mousedown", pauseRotation);
            container.removeEventListener("touchstart", pauseRotation);
            container.removeEventListener("wheel", pauseRotation);
            popup?.remove();
            currentMap.remove();
        };
    }, []);

    return (
        <div className="relative h-full w-full">
            {/* Uwaga: nie pozycjonuj tego diva przez Tailwinda (`.absolute`) —
                CSS MapLibre ustawia .maplibregl-map { position: relative }
                i (przy tej samej specyficzności) nadpisuje klasę, przez co
                kontener traci wysokość i przycina canvas. */}
            <div ref={containerRef} className="h-full w-full" aria-label="Interaktywna mapa 3D z lokalizacjami klientów" />

            {!ready && !failed && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
                    <div className="flex items-center gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                        <span className="text-xs font-medium text-neutral-400">Ładowanie mapy…</span>
                    </div>
                </div>
            )}

            {failed && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 px-6 text-center">
                    <p className="text-xs leading-relaxed text-neutral-500">
                        Mapa klientów jest niedostępna w tej przeglądarce.
                        <br />
                        Dostarczamy na terenie całej Polski.
                    </p>
                </div>
            )}
        </div>
    );
}
