import type { Product } from "@/app/types/product";
import { normalizeText, slugify } from "@/app/lib/product";
import { supabaseProductImage } from "@/app/lib/supabase-assets";

export interface CategoryFaq {
    question: string;
    answer: string;
}

export interface CategoryHighlight {
    title: string;
    text: string;
}

export type SubcategoryIcon = "gas" | "inverter" | "petrol" | "diesel";

export interface CategorySubcategory {
    /** Fragment adresu: /kategoria/{category}/{subcategory} */
    slug: string;
    name: string;
    tagline: string;
    description: string;
    /** Wartości rozpoznawane przy klasyfikacji produktów z backendu. */
    match: string[];
    icon: SubcategoryIcon;
}

export interface CategoryDef {
    /** Fragment adresu: /kategoria/{slug} */
    slug: string;
    /** Nazwa wyświetlana */
    name: string;
    /** Krótkie hasło pod nagłówkiem */
    tagline: string;
    /** Opis SEO / wstęp na stronie kategorii */
    description: string;
    /** Nazwy kategorii z bazy danych, które trafiają do tej sekcji */
    match: string[];
    image: string;
    /** Słowa kluczowe do metadanych */
    keywords: string[];
    /** Wyróżniki (3 kafelki pod hero) */
    highlights: CategoryHighlight[];
    /** Poradnik zakupowy — na co zwrócić uwagę */
    buyingGuide: string[];
    /** Typowe zastosowania — chipy nawigacyjne */
    applications: string[];
    faq: CategoryFaq[];
    /** Opcjonalny drugi poziom katalogu, np. dla agregatów. */
    subcategories?: CategorySubcategory[];
}

export const CATEGORIES: CategoryDef[] = [
    {
        slug: "agregaty",
        name: "Agregaty prądotwórcze",
        tagline: "Inwerterowe, benzynowe, diesla i gazowe",
        description:
            "Agregaty prądotwórcze PRAMAC do zasilania awaryjnego domu, warsztatu i placu budowy. Katalog obejmuje ciche modele inwerterowe z czystym napięciem, jednostki benzynowe i diesla z AVR oraz automatyczne agregaty gazowe do pracy rezerwowej.",
        match: ["Agregaty", "Agregat", "Agregaty prądotwórcze"],
        subcategories: [
            {
                slug: "gazowe",
                name: "Agregaty gazowe",
                tagline: "Automatyczne zasilanie awaryjne domu i obiektu",
                description:
                    "Stacjonarne agregaty na gaz ziemny lub LPG do automatycznego zasilania awaryjnego. Wyposażone w obudowę wyciszającą, AVR i możliwość współpracy z układem SZR.",
                match: ["Agregaty gazowe", "Agregat gazowy", "Gazowe", "Gazowy"],
                icon: "gas",
            },
            {
                slug: "inwerterowe",
                name: "Agregaty inwerterowe",
                tagline: "Czyste napięcie dla elektroniki i domu",
                description:
                    "Kompaktowe i ciche modele z technologią inverter, trybem Economy oraz stabilnym napięciem bezpiecznym dla komputerów, kotłów i elektroniki.",
                match: ["Agregaty inwerterowe", "Agregat inwerterowy", "Inwerterowe", "Inwerterowy", "Inverter"],
                icon: "inverter",
            },
            {
                slug: "benzynowe",
                name: "Agregaty benzynowe",
                tagline: "Przenośne źródło energii do pracy i rekreacji",
                description:
                    "Jednofazowe i trójfazowe agregaty benzynowe z rozruchem ręcznym lub elektrycznym, AVR i zestawem transportowym do pracy w terenie.",
                match: ["Agregaty benzynowe", "Agregat benzynowy", "Benzynowe", "Benzynowy", "Petrol"],
                icon: "petrol",
            },
            {
                slug: "diesla",
                name: "Agregaty diesla",
                tagline: "Wysoka trwałość do ciężkiej pracy",
                description:
                    "Wysokoprężne agregaty do zastosowań budowlanych, warsztatowych i przemysłowych. Elektryczny rozruch, AVR i silnik Stage V zapewniają gotowość do intensywnej pracy.",
                match: ["Agregaty diesla", "Agregat diesla", "Diesla", "Diesel"],
                icon: "diesel",
            },
        ],
        image: supabaseProductImage(1),
        keywords: [
            "agregat prądotwórczy",
            "agregat inwertorowy",
            "generator prądu",
            "zasilanie awaryjne",
        ],
        highlights: [
            {
                title: "Czysta sinusoida",
                text: "THD poniżej 3 % — bezpieczne zasilanie komputerów, pieców i sprzętu pomiarowego.",
            },
            {
                title: "Cicha praca",
                text: "Modele inwertorowe od 58 dB(A) z 7 m — dopuszczone także na kempingach.",
            },
            {
                title: "Serwis w 48 h",
                text: "Własny warsztat, oryginalne części i przeglądy gwarancyjne bez wysyłki do producenta.",
            },
        ],
        buyingGuide: [
            "Zsumuj moce odbiorników i dodaj zapas na rozruch silników — dla pomp i sprężarek nawet 3×.",
            "Do zasilania pieca CO i elektroniki wybierz wyłącznie agregat inwertorowy z czystą sinusoidą.",
            "Rozruch elektryczny i automatyka SZR mają sens tam, gdzie zaniki zasilania zdarzają się często.",
            "Sprawdź pojemność zbiornika i zużycie paliwa — decydują o czasie pracy bez tankowania.",
            "Do zasilania budynku niezbędne jest przełącznik sieć/agregat uniemożliwiający pracę równoległą z siecią.",
        ],
        applications: [
            "Zasilanie awaryjne domu",
            "Place budowy",
            "Imprezy plenerowe",
            "Kempingi i food trucki",
        ],
        faq: [
            {
                question: "Jaki agregat do zasilania domu z piecem gazowym?",
                answer:
                    "Minimum 2–3 kW w wersji inwertorowej. Piec z automatyką wymaga stabilnego napięcia i poprawnego rozdziału przewodu neutralnego — pomożemy dobrać zestaw z przełącznikiem faz.",
            },
            {
                question: "Czy agregat może pracować w garażu?",
                answer:
                    "Nie. Silniki spalinowe emitują tlenek węgla, dlatego agregat pracuje wyłącznie na zewnątrz, minimum kilka metrów od okien i czerpni powietrza.",
            },
            {
                question: "Jak często wymieniać olej?",
                answer:
                    "Pierwsza wymiana po 20 godzinach pracy (docieranie), kolejne co 100 godzin lub raz w sezonie — zależnie od tego, co nastąpi wcześniej.",
            },
        ],
    },
    {
        slug: "akcesoria",
        name: "Akcesoria",
        tagline: "Osprzęt montażowy, złączki i narzędzia instalatora",
        description:
            "Wszystko, czego brakuje w koszyku tuż przed wyjazdem na budowę: złączki szybkozłączne, listwy zaciskowe, koryta i peszle, opaski, końcówki tulejkowe, oznaczniki oraz drobne narzędzia instalatorskie.",
        match: ["Akcesoria", "Osprzęt", "Akcesoria montażowe"],
        image: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=70&w=800",
        keywords: ["złączki elektryczne", "końcówki tulejkowe", "peszel", "osprzęt instalacyjny"],
        highlights: [
            {
                title: "Sprawdzone marki",
                text: "Osprzęt renomowanych producentów z pełną dokumentacją i atestami.",
            },
            {
                title: "Opakowania zbiorcze",
                text: "Zestawy warsztatowe i opakowania hurtowe w wyraźnie niższej cenie jednostkowej.",
            },
            {
                title: "Kompletacja zamówień",
                text: "Zbierz drobnicę w jednej przesyłce razem z transformatorem lub rozdzielnicą.",
            },
        ],
        buyingGuide: [
            "Do połączeń w puszkach używaj złączek szybkozłącznych — są szybsze i pewniejsze niż skręcanie żył.",
            "Linki zawsze zarabiaj końcówką tulejkową, inaczej zacisk poluzuje się po kilku cyklach termicznych.",
            "Peszel karbowany dobierz o średnicy zapewniającej 40 % wolnej przestrzeni na przyszłe przewody.",
            "Opisane oznaczniki żył skracają czas późniejszego serwisu nawet o połowę.",
            "Trzymaj w aucie zestaw najpopularniejszych rozmiarów — brak jednej złączki potrafi zatrzymać całą robotę.",
        ],
        applications: [
            "Prace instalacyjne",
            "Montaż rozdzielnic",
            "Serwis awaryjny",
            "Wyposażenie warsztatu",
        ],
        faq: [
            {
                question: "Czy wysyłacie drobnicę razem z dużym zamówieniem?",
                answer:
                    "Tak, kompletujemy całe zamówienie w jednej przesyłce. Jeśli część produktów ma dłuższy termin, możemy podzielić wysyłkę bez dodatkowych kosztów.",
            },
            {
                question: "Czy złączki są dopuszczone do instalacji stałych?",
                answer:
                    "Oferowane przez nas złączki spełniają normę PN-EN 60998 i są dopuszczone do połączeń w puszkach instalacyjnych oraz rozdzielnicach.",
            },
            {
                question: "Czy dostępne są opakowania zbiorcze?",
                answer:
                    "Większość drobnicy oferujemy zarówno w opakowaniach detalicznych, jak i w kartonach zbiorczych z rabatem ilościowym.",
            },
        ],
    },
];

/** Kategoria „awaryjna" tworzona dla wartości spoza taksonomii (np. nowa kategoria z backendu). */
export function buildFallbackCategory(name: string): CategoryDef {
    return {
        slug: slugify(name),
        name,
        tagline: "Sprawdź pełną ofertę w tej kategorii",
        description: `Produkty z kategorii ${name} dostępne w sklepie TRAFO ENERGIA. Wysyłka w 24 h, faktura VAT i wsparcie techniczne przed zakupem.`,
        match: [name],
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=70&w=800",
        keywords: [name.toLowerCase()],
        highlights: [
            {
                title: "Wysyłka w 24 h",
                text: "Zamówienia złożone do godziny 14:00 pakujemy tego samego dnia roboczego.",
            },
            {
                title: "Doradztwo techniczne",
                text: "Pomożemy dobrać właściwy produkt do Twojej instalacji.",
            },
            {
                title: "Gwarancja 24 miesiące",
                text: "Pełna obsługa gwarancyjna i pogwarancyjna po naszej stronie.",
            },
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

/** Zwraca podkategorię produktu, jeżeli backend przekazał jej nazwę lub slug. */
export function subcategoryOf(
    product: Product,
    category?: CategoryDef
): CategorySubcategory | undefined {
    const parent = category ?? categoryOf(product);
    const raw = product.subcategory?.trim();
    if (!parent?.subcategories || !raw) return undefined;

    const normalized = normalizeText(raw);
    return parent.subcategories.find(
        (subcategory) =>
            normalizeText(subcategory.slug) === normalized ||
            normalizeText(subcategory.name) === normalized ||
            subcategory.match.some((value) => normalizeText(value) === normalized)
    );
}

/** Produkty pasujące do wybranej podkategorii (po polu subcategory, nazwie lub SKU). */
export function productsInSubcategory(
    products: Product[],
    category: CategoryDef,
    subcategory: CategorySubcategory
): Product[] {
    const categoryItems = productsInCategory(products, category);
    const matches = subcategory.match.map(normalizeText);
    const slug = normalizeText(subcategory.slug);

    return categoryItems.filter((product) => {
        const values = [product.subcategory, product.name, product.sku]
            .filter((value): value is string => Boolean(value))
            .map(normalizeText);

        return values.some((value) =>
            value === slug ||
            matches.some((match) => value === match || value.includes(match))
        );
    });
}

/** Dopasowuje kategorię produktu do definicji z taksonomii. */
export function categoryOf(product: Product): CategoryDef | undefined {
    const raw = product.category?.trim();
    if (!raw) return undefined;
    const normalized = normalizeText(raw);
    return CATEGORIES.find((c) =>
        c.match.some((m) => normalizeText(m) === normalized)
    );
}

/** Slug kategorii dla danego produktu (z fallbackiem na slug z nazwy). */
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

/**
 * Zwraca definicję kategorii dla sluga — z taksonomii albo zbudowaną
 * na podstawie kategorii występujących w danych produktowych.
 */
export function resolveCategory(slug: string, products: Product[]): CategoryDef | null {
    const known = getCategoryBySlug(slug);
    if (known) return known;

    const fromData = products
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c))
        .find((c) => slugify(c) === slug.toLowerCase());

    return fromData ? buildFallbackCategory(fromData) : null;
}

/** Wszystkie kategorie: z taksonomii + te wykryte w danych produktowych. */
export function allCategories(products: Product[]): CategoryDef[] {
    const extra = Array.from(
        new Set(
            products
                .map((p) => p.category?.trim())
                .filter((c): c is string => Boolean(c))
                .filter((c) => !CATEGORIES.some((def) => def.match.some((m) => normalizeText(m) === normalizeText(c))))
        )
    ).map(buildFallbackCategory);

    return [...CATEGORIES, ...extra];
}
