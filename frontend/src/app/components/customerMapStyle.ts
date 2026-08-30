import type { StyleSpecification, LayerSpecification } from "maplibre-gl";
import type { FeatureCollection, Feature, Point, Polygon } from "geojson";
import type { CustomerLocation } from "@/app/data/customerLocations";

/**
 * Ciemny, minimalistyczny styl mapy (OpenMapTiles / OpenFreeMap)
 * dopasowany do motywu sklepu (czarne tło + emerald).
 * Kafelki wektorowe i fonty pochodzą z darmowego serwera OpenFreeMap (bez API key).
 */
const OFM_PLANET_TILES = "https://tiles.openfreemap.org/planet";
const OFM_GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

/** Promień podstawy słupka 3D w metrach */
const PILLAR_RADIUS_M = 9000;
/** Wysokość słupka siedziby w metrach */
const HQ_PILLAR_HEIGHT_M = 150000;

interface CustomerProperties {
    name: string;
    deliveries: number;
    hq: number;
    height: number;
}

function customerProperties(location: CustomerLocation): CustomerProperties {
    return {
        name: location.city,
        deliveries: location.deliveries,
        hq: location.hq ? 1 : 0,
        // Wysokość słupka 3D skalowana pierwiastkiem liczby dostaw
        height: location.hq
            ? HQ_PILLAR_HEIGHT_M
            : 16_000 + Math.round(Math.sqrt(location.deliveries) * 14_000),
    };
}

function toPointFeatures(locations: CustomerLocation[]): FeatureCollection<Point, CustomerProperties> {
    return {
        type: "FeatureCollection",
        features: locations.map<Feature<Point, CustomerProperties>>((location) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [location.lon, location.lat] },
            properties: customerProperties(location),
        })),
    };
}

/**
 * Słupki 3D rysujemy jako fill-extrusion — więc dla każdego klienta
 * generujemy okrągły poligon (podstawę słupka) o zadanym promieniu w metrach.
 */
function toPillarFeatures(locations: CustomerLocation[]): FeatureCollection<Polygon, CustomerProperties> {
    return {
        type: "FeatureCollection",
        features: locations.map<Feature<Polygon, CustomerProperties>>((location) => {
            const segments = 20;
            const coords: [number, number][] = [];
            const latRad = (location.lat * Math.PI) / 180;
            const dx = PILLAR_RADIUS_M / (111_320 * Math.cos(latRad));
            const dy = PILLAR_RADIUS_M / 110_540;

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * 2 * Math.PI;
                coords.push([
                    location.lon + dx * Math.cos(angle),
                    location.lat + dy * Math.sin(angle),
                ]);
            }

            return {
                type: "Feature",
                geometry: { type: "Polygon", coordinates: [coords] },
                properties: customerProperties(location),
            };
        }),
    };
}

export function buildCustomerMapStyle(locations: CustomerLocation[]): StyleSpecification {
    const layers: LayerSpecification[] = [
        // --- Podkład ---
        {
            id: "background",
            type: "background",
            paint: { "background-color": "#090d12" },
        },
        {
            id: "landcover-wood",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "landcover",
            filter: ["==", ["get", "class"], "wood"],
            paint: { "fill-color": "#0d1512", "fill-opacity": 0.55 },
        } as LayerSpecification,
        {
            id: "water",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "water",
            filter: ["!=", ["get", "brunnel"], "tunnel"],
            paint: { "fill-color": "#101b28" },
        } as LayerSpecification,
        {
            id: "waterway",
            type: "line",
            source: "openmaptiles",
            "source-layer": "waterway",
            minzoom: 5.5,
            paint: {
                "line-color": "#14202e",
                "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.4, 12, 2],
            },
        } as LayerSpecification,
        {
            id: "boundary-voivodeship",
            type: "line",
            source: "openmaptiles",
            "source-layer": "boundary",
            filter: [
                "all",
                [">=", ["get", "admin_level"], 3],
                ["<=", ["get", "admin_level"], 4],
                ["!=", ["get", "maritime"], 1],
            ],
            paint: {
                "line-color": "#1a2430",
                "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.6, 10, 1.2],
            },
        } as LayerSpecification,
        {
            id: "boundary-country",
            type: "line",
            source: "openmaptiles",
            "source-layer": "boundary",
            filter: ["all", ["<=", ["get", "admin_level"], 2], ["!=", ["get", "maritime"], 1]],
            paint: {
                "line-color": "#36475a",
                "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.7, 8, 1.5, 12, 2.4],
            },
        } as LayerSpecification,
        {
            id: "road-major",
            type: "line",
            source: "openmaptiles",
            "source-layer": "transportation",
            minzoom: 4.5,
            filter: [
                "all",
                ["match", ["get", "class"], ["motorway", "trunk", "primary"], true, false],
                ["!=", ["get", "ramp"], 1],
            ],
            paint: {
                "line-color": "#1d2833",
                "line-opacity": 0.9,
                "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 5, 0.4, 8, 0.9, 11, 1.8, 14, 3],
            },
        } as LayerSpecification,

        // --- Klienci: słupki 3D ---
        {
            id: "customers-pillars",
            type: "fill-extrusion",
            source: "customers-pillars",
            paint: {
                "fill-extrusion-color": [
                    "case",
                    ["==", ["get", "hq"], 1],
                    "#6ee7b7",
                    [
                        "interpolate",
                        ["linear"],
                        ["get", "deliveries"],
                        3,
                        "#0f766e",
                        12,
                        "#10b981",
                        30,
                        "#34d399",
                    ],
                ],
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": 0,
                "fill-extrusion-opacity": 0.55,
                "fill-extrusion-vertical-gradient": true,
            },
        } as LayerSpecification,

        // --- Etykiety bazowe ---
        {
            id: "label-country",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "place",
            minzoom: 2,
            maxzoom: 7,
            filter: ["all", ["==", ["get", "class"], "country"], ["<=", ["get", "rank"], 1]],
            layout: {
                "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
                "text-font": ["Noto Sans Bold"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 3, 10, 6, 12],
                "text-transform": "uppercase",
                "text-letter-spacing": 0.2,
            },
            paint: {
                "text-color": "#4b5b6b",
                "text-halo-color": "#05070a",
                "text-halo-width": 1.2,
            },
        } as LayerSpecification,
        {
            id: "label-city",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "place",
            minzoom: 4,
            filter: [
                "all",
                ["==", ["get", "class"], "city"],
                ["<=", ["get", "rank"], 6],
                ["!=", ["get", "capital"], 2],
            ],
            layout: {
                "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
                "text-font": ["Noto Sans Regular"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 7, 12, 10, 15],
                "text-letter-spacing": 0.03,
                "text-max-width": 7,
            },
            paint: {
                "text-color": "#94a3b3",
                "text-halo-color": "#05070a",
                "text-halo-width": 1.4,
                "text-halo-blur": 0.5,
            },
        } as LayerSpecification,
        {
            id: "label-city-capital",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "place",
            minzoom: 4,
            filter: ["all", ["==", ["get", "class"], "city"], ["==", ["get", "capital"], 2]],
            layout: {
                "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
                "text-font": ["Noto Sans Bold"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 7, 13, 10, 16],
                "text-letter-spacing": 0.03,
                "text-max-width": 7,
            },
            paint: {
                "text-color": "#cbd5e1",
                "text-halo-color": "#05070a",
                "text-halo-width": 1.4,
                "text-halo-blur": 0.5,
            },
        } as LayerSpecification,
        {
            id: "label-town",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "place",
            minzoom: 7,
            filter: ["==", ["get", "class"], "town"],
            layout: {
                "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
                "text-font": ["Noto Sans Regular"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 7, 10, 10, 13],
                "text-letter-spacing": 0.02,
                "text-max-width": 7,
            },
            paint: {
                "text-color": "#64748b",
                "text-halo-color": "#05070a",
                "text-halo-width": 1.3,
                "text-halo-blur": 0.5,
            },
        } as LayerSpecification,

        // --- Klienci: punkty (na wierzchu) ---
        {
            id: "customers-glow",
            type: "circle",
            source: "customers-points",
            paint: {
                "circle-radius": [
                    "interpolate",
                    ["linear"],
                    ["get", "deliveries"],
                    3,
                    7,
                    38,
                    16,
                ],
                "circle-color": ["case", ["==", ["get", "hq"], 1], "#a7f3d0", "#10b981"],
                "circle-blur": 1,
                "circle-opacity": 0.28,
            },
        } as LayerSpecification,
        {
            id: "customers-dot",
            type: "circle",
            source: "customers-points",
            paint: {
                "circle-radius": [
                    "case",
                    ["==", ["get", "hq"], 1],
                    5,
                    ["interpolate", ["linear"], ["get", "deliveries"], 3, 3, 38, 5],
                ],
                "circle-color": ["case", ["==", ["get", "hq"], 1], "#ffffff", "#34d399"],
                "circle-stroke-color": "rgba(4, 18, 12, 0.75)",
                "circle-stroke-width": 1.5,
            },
        } as LayerSpecification,
    ];

    return {
        version: 8,
        name: "ebe-power-customers-dark",
        glyphs: OFM_GLYPHS,
        sources: {
            openmaptiles: {
                type: "vector",
                url: OFM_PLANET_TILES,
            },
            "customers-points": {
                type: "geojson",
                data: toPointFeatures(locations),
            },
            "customers-pillars": {
                type: "geojson",
                data: toPillarFeatures(locations),
            },
        },
        layers,
    };
}
