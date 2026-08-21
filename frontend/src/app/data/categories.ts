import type { Product } from "@/app/types/product";
import { normalizeText, slugify } from "@/app/lib/product";

export interface CategoryFaq {
    question: string;
    answer: string;
}

export interface CategoryHighlight {
    title: string;
    text: string;
}

export interface CategoryDef {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    match: string[];
    image: string;
    keywords: string[];
    highlights: CategoryHighlight[];
    buyingGuide: string[];
    applications: string[];
    faq: CategoryFaq[];
}

export const CATEGORIES: CategoryDef[] = [
    {
        slug: "agregaty-inwerterowe",
        name: "Agregaty inwerterowe",
        tagline: "Czysta sinusoida — PRAMAC P 3000i, P 3500i, PMi 4500",
        description:
            "Przenośne agregaty inwerterowe PRAMAC z przebiegiem sinusoidalnym bezpiecznym dla elektroniki, pieców i narzędzi. Serie P i PMi: PowerRush, eco mode i — w PMi 4500 — pakiet 3XTRA Control (ATS, pilot, 2-wire start).",
        match: ["Agregaty inwerterowe", "Inwerterowe"],
        image: "/products/p3500i.jpg",
        keywords: ["agregat inwerterowy", "PRAMAC P3000i", "PRAMAC P3500i", "PRAMAC PMi 4500"],
        highlights: [
            { title: "Czysta sinusoida", text: "Stabilne 230 V do komputerów, pieców CO i sprzętu pomiarowego." },
            { title: "PowerRush / Eco", text: "Wsparcie rozruchu silników i niższe spalanie przy częściowym obciążeniu." },
            { title: "Karta PDF", text: "Każdy model z kartą katalogową do pobrania na stronie produktu." },
        ],
        buyingGuide: [
            "Do elektroniki i pieca CO wybierz wyłącznie inwerter.",
            "Moc szczytowa powinna pokryć rozruch pomp i sprężarek (nawet 2–3×).",
            "PMi 4500 z 3XTRA podłączysz do automatyki SZR (ATS).",
            "Sprawdź czas pracy przy 50–75 % — decyduje o tankowaniu.",
        ],
        applications: ["Zasilanie awaryjne domu", "Elektronika", "Kemping", "SZR / ATS"],
        faq: [
            {
                question: "Czym inwerter różni się od klasycznego agregatu?",
                answer:
                    "Inwerter utrzymuje stabilną częstotliwość i czysty przebieg. Klasyczna prądnica z kondensatorem nie nadaje się do wrażliwej elektroniki.",
            },
            {
                question: "Czy PMi 4500 uruchomi się sam po zaniku sieci?",
                answer:
                    "Tak, przy automatyce SZR — model ma złącze ATS i rozruch 2-przewodowy w pakiecie 3XTRA Control.",
            },
        ],
    },
    {
        slug: "agregaty-benzynowe",
        name: "Agregaty benzynowe",
        tagline: "Rama otwarta i koła — E4000, MES 8000, WX, S12000",
        description:
            "Benzynowe agregaty PRAMAC do warsztatu i budowy: ramowy E4000 (Honda GX200), trójfazowy MES 8000 (Honda GX390), kołowe WX 6250 ES / WX 7000 z AVR oraz profesjonalny S12000 400 V z AVR, CONN i DPP.",
        match: ["Agregaty benzynowe", "Benzynowe"],
        image: "/products/s12000.jpg",
        keywords: ["agregat benzynowy", "PRAMAC E4000", "MES 8000", "WX 7000", "S12000"],
        highlights: [
            { title: "Silniki Honda / OHV", text: "GX200, GX390, GX630 i PRAMAC OHV Stage V." },
            { title: "AVR w serii WX i S", text: "Stabilne napięcie do narzędzi i maszyn." },
            { title: "1- i 3-fazowe", text: "Od 230 V (E4000, WX 7000) do 400 V (MES 8000, WX 6250, S12000)." },
        ],
        buyingGuide: [
            "Do maszyn 400 V wybierz MES 8000, WX 6250 ES lub S12000.",
            "Rozruch elektryczny (WX, S12000) ułatwia codzienną eksploatację.",
            "S12000 z CONN współpracuje z panelem AMF (SZR).",
            "Dolicz zapas mocy na rozruch silników indukcyjnych.",
        ],
        applications: ["Place budowy", "Warsztat", "Wynajem", "Zasilanie maszyn 400 V"],
        faq: [
            {
                question: "WX 7000 czy WX 6250 ES?",
                answer:
                    "WX 7000 jest jednofazowy 230 V (6,1 kW, gniazdo 32 A). WX 6250 ES daje 400 V / 230 V i rozruch elektryczny — do odbiorników trójfazowych.",
            },
            {
                question: "Co oznacza #AVR #CONN #DPP w S12000?",
                answer:
                    "AVR — automatyczna regulacja napięcia, CONN — złącze pod panel AMF, DPP — ochrona różnicowoprądowa.",
            },
        ],
    },
    {
        slug: "agregaty-diesla",
        name: "Agregaty diesla",
        tagline: "Wyciszony DX8500 PRO+ z AVR i Stage V",
        description:
            "Dieslowski PRAMAC DX8500 PRO+ w zabudowie canopy. AVR, Stage V, gniazda 400 V i 230 V — dłuższa praca, niższe spalanie i cichsza obudowa niż w agregatach ramowych.",
        match: ["Agregaty diesla", "Diesel"],
        image: "/products/dx8500.jpg",
        keywords: ["agregat diesel", "PRAMAC DX8500", "agregat wyciszony"],
        highlights: [
            { title: "Canopy", text: "Obudowa wyciszona, LWA 97 dB(A)." },
            { title: "AVR + Stage V", text: "Stabilne napięcie i aktualna norma emisji." },
            { title: "400 V i 230 V", text: "Jedna maszyna do narzędzi jedno- i trójfazowych." },
        ],
        buyingGuide: [
            "Diesel opłaca się przy dłuższej pracy — niższe spalanie niż benzyna.",
            "Canopy ogranicza hałas na budowie i przy domu.",
            "Sprawdź zapas mocy na rozruch 400 V.",
        ],
        applications: ["Budowa", "Zasilanie awaryjne", "Wynajem"],
        faq: [
            {
                question: "Czy DX8500 może stać przy domu?",
                answer:
                    "Canopy tłumi hałas, ale spalinowy agregat zawsze pracuje na zewnątrz, z dala od czerpni powietrza.",
            },
        ],
    },
    {
        slug: "agregaty-gazowe",
        name: "Agregaty gazowe",
        tagline: "Standby GA 10000 / 13000 / 20000 — LPG i gaz ziemny",
        description:
            "Stacjonarne agregaty gazowe PRAMAC serii GA. LPG lub gaz ziemny, obudowa weatherproof, silnik Generac G-FORCE i gotowość do automatyki SZR przy zaniku sieci.",
        match: ["Agregaty gazowe", "Gazowe"],
        image: "/products/ga20000.jpg",
        keywords: ["agregat gazowy", "PRAMAC GA10000", "GA13000", "GA20000", "LPG"],
        highlights: [
            { title: "LPG i gaz ziemny", text: "Jeden zespół, dwa paliwa — bez benzyny na magazynie." },
            { title: "Standby", text: "Cicha obudowa przy budynku, rozruch elektryczny." },
            { title: "1- i 3-fazowe", text: "GA 10000/13000 — 230 V; GA 20000 — 400 V." },
        ],
        buyingGuide: [
            "GA 10000 i 13000: 230 V do domu. GA 20000: 400 V do obiektu.",
            "Do automatyki SZR zaplanuj panel przełączania sieć/agregat.",
            "Montaż na zewnątrz, na fundamencie, z elastycznym łącznikiem gazu.",
        ],
        applications: ["Dom jednorodzinny", "Obiekt usługowy", "SZR", "Zasilanie awaryjne"],
        faq: [
            {
                question: "LPG czy gaz ziemny?",
                answer:
                    "Oba paliwa są obsługiwane. Na gazie ziemnym moc GA 20000 spada (17 kVA vs 20 kVA na LPG). GA 10000 i 13000 trzymają tę samą moc na obu paliwach.",
            },
        ],
    },
];

export function buildFallbackCategory(name: string): CategoryDef {
    return {
        slug: slugify(name),
        name,
        tagline: "Sprawdź pełną ofertę w tej kategorii",
        description: `Agregaty PRAMAC z kategorii ${name}. Wysyłka w 24 h, faktura VAT i karta katalogowa PDF.`,
        match: [name],
        image: "/products/p3500i.jpg",
        keywords: [name.toLowerCase()],
        highlights: [
            { title: "Wysyłka w 24 h", text: "Zamówienia do 14:00 pakujemy tego samego dnia roboczego." },
            { title: "Doradztwo", text: "Pomożemy dobrać moc i liczbę faz." },
            { title: "Gwarancja 24 miesiące", text: "Serwis we własnym warsztacie." },
        ],
        buyingGuide: [],
        applications: [],
        faq: [],
    };
}

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
    const wanted = slug.toLowerCase();
    return CATEGORIES.find((c) => c.slug === wanted);
}

export function categoryOf(product: Product): CategoryDef | undefined {
    const raw = product.category?.trim();
    if (!raw) return undefined;
    const normalized = normalizeText(raw);
    return CATEGORIES.find((c) =>
        c.match.some((m) => normalizeText(m) === normalized)
    );
}

export function categorySlugOf(product: Product): string | null {
    const def = categoryOf(product);
    if (def) return def.slug;
    return product.category ? slugify(product.category) : null;
}

export function productsInCategory(products: Product[], category: CategoryDef): Product[] {
    const matches = category.match.map(normalizeText);
    return products.filter((p) => {
        const raw = p.category?.trim();
        if (!raw) return false;
        const normalized = normalizeText(raw);
        return matches.includes(normalized) || slugify(raw) === category.slug;
    });
}

export function resolveCategory(slug: string, products: Product[]): CategoryDef | null {
    const known = getCategoryBySlug(slug);
    if (known) return known;

    const fromData = products
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c))
        .find((c) => slugify(c) === slug.toLowerCase());

    return fromData ? buildFallbackCategory(fromData) : null;
}

export function allCategories(products: Product[]): CategoryDef[] {
    const extra = Array.from(
        new Set(
            products
                .map((p) => p.category?.trim())
                .filter((c): c is string => Boolean(c))
                .filter((c) => !CATEGORIES.some((def) => def.match.some((m) => normalizeText(m) === normalizeText(c))))
        )
    ).map(buildFallbackCategory);

    return [...CATEGORIES, ...extra].filter(
        (category) => productsInCategory(products, category).length > 0
    );
}
