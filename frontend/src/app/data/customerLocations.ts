/**
 * Lokalizacje klientów pokazywane na mapie 3D w hero.
 *
 * ⚠️ Dane przykładowe (poglądowe). Docelowo podłącz tutaj realne dane,
 * np. adresy dostaw z zamówień z backendu (grupowane po mieście).
 */
export interface CustomerLocation {
    /** Nazwa miejscowości */
    city: string;
    lat: number;
    lon: number;
    /** Liczba zrealizowanych dostaw (steruje wysokością słupka 3D) */
    deliveries: number;
    /** Siedziba firmy — wyróżniony znacznik */
    hq?: boolean;
}

export const customerLocations: CustomerLocation[] = [
    // Siedziba
    { city: "Bełchatów", lat: 51.3688, lon: 19.3556, deliveries: 40, hq: true },

    // Klienci
    { city: "Warszawa", lat: 52.2297, lon: 21.0122, deliveries: 38 },
    { city: "Łódź", lat: 51.7592, lon: 19.456, deliveries: 27 },
    { city: "Kraków", lat: 50.0647, lon: 19.945, deliveries: 24 },
    { city: "Wrocław", lat: 51.1079, lon: 17.0385, deliveries: 19 },
    { city: "Poznań", lat: 52.4064, lon: 16.9252, deliveries: 16 },
    { city: "Katowice", lat: 50.2649, lon: 19.0238, deliveries: 14 },
    { city: "Gdańsk", lat: 54.352, lon: 18.6466, deliveries: 12 },
    { city: "Lublin", lat: 51.2465, lon: 22.5684, deliveries: 11 },
    { city: "Szczecin", lat: 53.4285, lon: 14.5528, deliveries: 9 },
    { city: "Bydgoszcz", lat: 53.1235, lon: 18.0084, deliveries: 8 },
    { city: "Białystok", lat: 53.1325, lon: 23.1688, deliveries: 8 },
    { city: "Radom", lat: 51.4027, lon: 21.1471, deliveries: 7 },
    { city: "Częstochowa", lat: 50.8118, lon: 19.1203, deliveries: 7 },
    { city: "Kielce", lat: 50.8661, lon: 20.6286, deliveries: 6 },
    { city: "Rzeszów", lat: 50.0412, lon: 21.999, deliveries: 6 },
    { city: "Gdynia", lat: 54.5189, lon: 18.5305, deliveries: 6 },
    { city: "Piotrków Trybunalski", lat: 51.4053, lon: 19.7043, deliveries: 5 },
    { city: "Olsztyn", lat: 53.7784, lon: 20.4801, deliveries: 5 },
    { city: "Opole", lat: 50.6751, lon: 17.9213, deliveries: 5 },
    { city: "Płock", lat: 52.5473, lon: 19.7006, deliveries: 4 },
    { city: "Zielona Góra", lat: 51.9356, lon: 15.5062, deliveries: 4 },
    { city: "Koszalin", lat: 54.1943, lon: 16.1728, deliveries: 3 },
];

/** Łączna liczba dostaw (bez siedziby) — badge na karcie mapy */
export const customerDeliveriesTotal = customerLocations.reduce(
    (sum, location) => sum + (location.hq ? 0 : location.deliveries),
    0,
);
