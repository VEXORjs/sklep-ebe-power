import type { Product } from "@/app/types/product";
import { normalizeText, parseParameters, slugify } from "@/app/lib/product";
import { supabaseProductImage } from "@/app/lib/supabase-assets";

export interface CategoryFaq {
    question: string;
    answer: string;
}

export interface CategoryHighlight {
    title: string;
    text: string;
}

export type SubcategoryIcon =
    | "gas"
    | "inverter"
    | "petrol"
    | "diesel"
    | "single"
    | "three"
    | "dual";

/**
 * Klasyfikacja fazowa podkategorii agregatów:
 *  • `single` — wyłącznie gniazda jednofazowe 230 V,
 *  • `three`  — wyłącznie gniazda siłowe 400 V,
 *  • `dual`   — jednocześnie 400 V i 230 V (wersje dwunapięciowe).
 */
export type SubcategoryPhase = "single" | "three" | "dual";

export interface CategorySubcategory {
    /** Fragment adresu: /kategoria/{category}/{subcategory} */
    slug: string;
    /** Pełna nazwa — strona podkategorii, karty, SEO */
    name: string;
    /** Skrócona etykieta do menu i chipów nawigacyjnych */
    shortName?: string;
    tagline: string;
    description: string;
    /** Wartości rozpoznawane przy klasyfikacji produktów z backendu. */
    match: string[];
    icon: SubcategoryIcon;
    /**
     * Filtr parametryczny dla podkategorii fazowych — produkt trafia do
     * podkategorii na podstawie parametru „liczba faz" (fallback: napięcie).
     */
    phase?: SubcategoryPhase;
}

export interface CategoryDef {
    /** Fragment adresu: /kategoria/{slug} */
    slug: string;
    /** Nazwa wyświetlana */
    name: string;
    /** Etykieta grupy w menu nawigacji (np. „Agregaty prądotwórcze") */
    group?: string;
    /** Krótkie hasło pod nagłówkiem */
    tagline: string;
    /** Opis SEO / wstęp na stronie kategorii */
    description: string;
    /** Nazwy kategorii z bazy danych, które trafiają do tej sekcji */
    match: string[];
    /**
     * Kategorie-nadrzędne z bazy danych (np. „Agregaty"), których produkty
     * trafiają do tej sekcji, gdy ich `subcategory` pasuje do `match`.
     */
    parentMatch?: string[];
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
    /** Opcjonalny drugi poziom katalogu, np. podział fazowy agregatów. */
    subcategories?: CategorySubcategory[];
}

/** Etykieta grupy agregatów w menu nawigacji. */
export const AGGREGATE_GROUP = "Agregaty prądotwórcze";

/** Nazwy kategorii-nadrzędnej w bazie danych (stara taksonomia agregatów). */
export const AGGREGATE_PARENT_MATCH = ["Agregaty", "Agregat", "Agregaty prądotwórcze"];

/* ----------------------------------------------------------------------------
 * Podkategorie fazowe — wspólny podział dla agregatów gazowych, benzynowych
 * i wysokoprężnych. Produkty klasyfikowane są parametrycznie (liczba faz,
 * napięcie 230/400 V), a pola `match` służą jako fallback dla danych z bazy.
 * -------------------------------------------------------------------------- */

function jednofazowe(): CategorySubcategory {
    return {
        slug: "jednofazowe",
        name: "Agregaty jednofazowe 230 V",
        shortName: "Jednofazowe 230 V",
        tagline: "Gniazda 230 V do domu, warsztatu i terenu",
        description:
            "Modele wyłącznie jednofazowe z gniazdami 230 V (Schuko / CEE). Najczęstszy wybór do zasilania awaryjnego domu, elektronarzędzi i sprzętu ogrodowego.",
        match: [
            "Jednofazowe",
            "Jednofazowy",
            "Jednofazowa",
            "Monofazowe",
            "Monofazowy",
            "1-fazowe",
            "1-fazowy",
        ],
        icon: "single",
        phase: "single",
    };
}

function trzyfazowe(): CategorySubcategory {
    return {
        slug: "trzyfazowe",
        name: "Agregaty trójfazowe 400 V",
        shortName: "Trójfazowe 400 V",
        tagline: "Gniazda siłowe 400 V dla maszyn i obiektów",
        description:
            "Agregaty trójfazowe z gniazdami CEE 400 V do maszyn budowlanych, pomp głębinowych i instalacji siłowych. Regulacja AVR i podział obciążenia na trzy fazy.",
        match: [
            "Trójfazowe",
            "Trójfazowy",
            "Trójfazowa",
            "Trojfazowe",
            "Trojfazowy",
            "3-fazowe",
            "3-fazowy",
            "Siłowe",
        ],
        icon: "three",
        phase: "three",
    };
}

function dual(): CategorySubcategory {
    return {
        slug: "dual",
        name: "Agregaty dual 400/230 V",
        shortName: "Dual 400/230 V",
        tagline: "Gniazda siłowe 400 V i jednofazowe 230 V w jednym",
        description:
            "Wersje dwunapięciowe łączące gniazda trójfazowe 400 V i jednofazowe 230 V. Jeden agregat zasila maszyny siłowe i standardowe elektronarzędzia — idealny na budowę i do warsztatu.",
        match: ["Dual", "Dwunapięciowe", "Dwunapięciowy", "400/230 V", "230/400 V"],
        icon: "dual",
        phase: "dual",
    };
}

export const CATEGORIES: CategoryDef[] = [
    {
        slug: "inwerterowe",
        name: "Agregaty inwerterowe",
        group: AGGREGATE_GROUP,
        tagline: "Czyste napięcie dla elektroniki i domu",
        description:
            "Ciche i lekkie agregaty inwerterowe z technologią falownika — czysta sinusoida bezpieczna dla komputerów, kotłów CO, ładowarek i sprzętu pomiarowego. Tryb Economy dopasowuje obroty silnika do obciążenia, ograniczając zużycie paliwa i hałas, a kompaktowe obudowy z opcją pracy równoległej sprawdzają się w domu, kamperze i w terenie.",
        match: [
            "Agregaty inwerterowe",
            "Agregat inwerterowy",
            "Agregaty inwertorowe",
            "Agregat inwertorowy",
            "Inwerterowe",
            "Inwerterowy",
            "Inwertorowe",
            "Inwertorowy",
            "Inverter",
        ],
        parentMatch: AGGREGATE_PARENT_MATCH,
        image: supabaseProductImage(4),
        keywords: [
            "agregat inwerterowy",
            "agregat inwertorowy",
            "czysta sinusoida",
            "cichy generator prądu",
        ],
        highlights: [
            {
                title: "Czysta sinusoida",
                text: "THD poniżej 3 % — bezpieczne zasilanie komputerów, kotłów i sprzętu pomiarowego.",
            },
            {
                title: "Cicha praca",
                text: "Modele od 61 dB(A) z 7 m i tryb Economy — dopuszczone także na kempingach.",
            },
            {
                title: "Lekkie i mobilne",
                text: "Waga już od 27 kg, uchwyty i koła — jeden operator przeniesie agregat bez wysiłku.",
            },
        ],
        buyingGuide: [
            "Zsumuj moce odbiorników i dodaj zapas na rozruch — pompy i chłodziarki potrzebują przy starcie nawet 3× więcej.",
            "Do elektroniki wybieraj wyłącznie modele z czystą sinusoidą — THD poniżej 3–5 %.",
            "Sprawdź poziom hałasu w dB(A) z 7 m — im niższy, tym większa swoboda użycia na kempingu i przy domu.",
            "Tryb Economy i pojemność zbiornika decydują o czasie pracy bez tankowania — porównuj godziny przy 50–75 % obciążenia.",
            "Planujesz większą moc? Wybierz model ze złączem pracy równoległej i połącz dwie jednostki jednym kablem.",
        ],
        applications: [
            "Zasilanie awaryjne domu",
            "Kempingi i kampery",
            "Imprezy plenerowe",
            "Prace w terenie",
        ],
        faq: [
            {
                question: "Czym różni się agregat inwerterowy od klasycznego?",
                answer:
                    "Agregat inwerterowy przetwarza napięcie na prąd stały i dopiero potem generuje idealną sinusoidę 230 V. Dzięki temu zniekształcenia (THD) spadają poniżej 3 %, a obroty silnika dopasowują się do obciążenia — urządzenie jest wyraźnie cichsze i spala mniej paliwa.",
            },
            {
                question: "Czy agregat inwerterowy zasili piec gazowy i kocioł CO?",
                answer:
                    "Tak — model o mocy 2,5–3,5 kW spokojnie utrzyma piec gazowy, pompy obiegowe i sterowniki. Dla kotłów z automatyką kluczowa jest czysta sinusoida oraz poprawny rozdział przewodu neutralnego.",
            },
            {
                question: "Czy mogę połączyć dwa agregaty inwerterowe?",
                answer:
                    "Wybrane modele mają złącze pracy równoległej — łączysz dwie jednostki specjalnym kablem i podwajasz dostępną moc. Obecność portu Parallel zawsze podajemy w specyfikacji produktu.",
            },
        ],
    },
    {
        slug: "gazowe",
        name: "Agregaty gazowe",
        group: AGGREGATE_GROUP,
        tagline: "Automatyczne zasilanie awaryjne domu i obiektu",
        description:
            "Stacjonarne agregaty na gaz ziemny lub LPG do automatycznego zasilania awaryjnego domu, firmy i obiektów gospodarczych. Obudowa wyciszająca, regulator AVR i sterownik z łącznością Wi‑Fi pozwalają uruchomić zasilanie bez obsługi — nawet gdy nikogo nie ma na miejscu. W ofercie wersje jednofazowe 230 V oraz trójfazowe 400 V gotowe do współpracy z układem SZR.",
        match: [
            "Agregaty gazowe",
            "Agregat gazowy",
            "Gazowe",
            "Gazowy",
            "Agregaty LPG",
            "Agregat LPG",
            "Generator gazowy",
        ],
        parentMatch: AGGREGATE_PARENT_MATCH,
        subcategories: [jednofazowe(), trzyfazowe()],
        image: supabaseProductImage(1),
        keywords: [
            "agregat gazowy",
            "generator gazowy",
            "zasilanie awaryjne domu",
            "agregat LPG",
        ],
        highlights: [
            {
                title: "Praca w pełni automatyczna",
                text: "Sterownik i przełącznik LTS uruchamiają agregat samodzielnie w kilkanaście sekund od zaniku zasilania.",
            },
            {
                title: "Tanie paliwo z instalacji",
                text: "Zasilanie gazem ziemnym lub LPG — bez tankowania i wożenia kanistrów.",
            },
            {
                title: "Cicha obudowa",
                text: "Poziom hałasu od 54 dB(A) w trybie Quiet-Test — komfortowy również dla sąsiadów.",
            },
        ],
        buyingGuide: [
            "Policz obwody awaryjne — piec, oświetlenie, lodówka, brama. Dla typowego domu wystarcza jednostka 10–13 kVA.",
            "Sprawdź dostępne paliwo: gaz ziemny z sieci lub zbiornik LPG — na gazie ziemnym moc katalogowa bywa nieco niższa.",
            "Do instalacji trójfazowej (kuchenka, pompa głębinowa) wybierz wersję 400 V z równym podziałem obciążenia na fazy.",
            "Zaplanuj miejsce montażu: obudowa wymaga stabilnej płyty oraz kilku metrów odstępu od okien i czerpni powietrza.",
            "Do współpracy z instalacją budynku niezbędny jest przełącznik sieć/agregat (LTS lub SZR) — uwzględnij go w projekcie.",
        ],
        applications: [
            "Zasilanie awaryjne domu",
            "Obiekty handlowe i usługowe",
            "Gospodarstwa i fermy",
            "Systemy SZR",
        ],
        faq: [
            {
                question: "Czy agregat gazowy uruchomi się sam po zaniku prądu?",
                answer:
                    "Tak. Sterownik monitoruje sieć, uruchamia silnik w chwili zaniku zasilania, a przełącznik LTS przełącza obwody na agregat. Po powrocie sieci obciążenie wraca do dostawcy, a agregat przechodzi w tryb czuwania.",
            },
            {
                question: "Lepiej gaz ziemny czy LPG?",
                answer:
                    "Oba paliwa są obsługiwane — do LPG wystarczy zestaw dysz. Na LPG agregat osiąga pełną moc katalogową, natomiast gaz ziemny jest tańszy i nie wymaga wymiany butli. Dla stałej rezerwy domu najlepszy jest gaz z sieci.",
            },
            {
                question: "Czy agregat gazowy może pracować w garażu?",
                answer:
                    "Nie. Jednostki gazowe montuje się wyłącznie na zewnątrz, na płycie fundamentowej, z zachowaniem odstępów od okien, drzwi i czerpni powietrza zgodnie z instrukcją producenta.",
            },
        ],
    },
    {
        slug: "benzynowe",
        name: "Agregaty benzynowe",
        group: AGGREGATE_GROUP,
        tagline: "Przenośna energia od 2,5 do 14 kVA",
        description:
            "Jednofazowe i trójfazowe agregaty benzynowe z rozruchem ręcznym lub elektrycznym, regulacją AVR i zestawem transportowym. Zasilą dom w czasie awarii, warsztat, plac budowy i imprezę plenerową. Wersje dual 400/230 V łączą gniazda siłowe i jednofazowe w jednym urządzeniu.",
        match: [
            "Agregaty benzynowe",
            "Agregat benzynowy",
            "Benzynowe",
            "Benzynowy",
            "Petrol",
            "Agregaty spalinowe",
        ],
        parentMatch: AGGREGATE_PARENT_MATCH,
        subcategories: [jednofazowe(), trzyfazowe(), dual()],
        image: supabaseProductImage(8),
        keywords: [
            "agregat benzynowy",
            "generator benzynowy",
            "agregat 400V",
            "przenośny agregat prądotwórczy",
        ],
        highlights: [
            {
                title: "Szeroki zakres mocy",
                text: "Modele od 2,5 do 14 kVA — od zasilania elektronarzędzi po dom jednorodzinny.",
            },
            {
                title: "Stabilne napięcie AVR",
                text: "Automatyczna regulacja napięcia chroni elektronikę i narzędzia podczas pracy pod obciążeniem.",
            },
            {
                title: "Mobilność",
                text: "Zestawy jezdne, składane uchwyty i rozruch elektryczny ułatwiają transport i start w terenie.",
            },
        ],
        buyingGuide: [
            "Zsumuj moce odbiorników i dodaj zapas na rozruch silników — dla pomp i sprężarek nawet 3×.",
            "Do instalacji jednofazowej wybierz model 230 V, do odbiorników siłowych 400 V — wersja dual obsłuży oba.",
            "Regulacja AVR (lub inwerter) jest obowiązkowa, jeśli podłączysz elektronikę, ładowarki i sprzęt pomiarowy.",
            "Sprawdź pojemność zbiornika i czas pracy przy 50–75 % obciążenia — to decyduje o przerwach na tankowanie.",
            "Zabezpieczenie różnicowe (DPP) i przygotowanie AMF/RSS przydają się przy stałej współpracy z rozdzielnicą.",
        ],
        applications: [
            "Place budowy",
            "Warsztat i serwis",
            "Zasilanie awaryjne domu",
            "Imprezy i targi",
        ],
        faq: [
            {
                question: "Jaki agregat benzynowy do zasilania domu?",
                answer:
                    "Do podstawowych obwodów wystarczy 5–7 kW jednofazowy z AVR i rozruchem elektrycznym. Przy odbiorach trójfazowych wybierz wersję 400 V lub dual 400/230 V. Pamiętaj o przełączniku sieć/agregat — praca równoległa z siecią jest zabroniona.",
            },
            {
                question: "Czym jest wersja dual 400/230 V?",
                answer:
                    "To agregat z dwoma rodzajami gniazd: siłowym CEE 400 V i jednofazowymi 230 V. Zasilisz nim jednocześnie maszyny trójfazowe i zwykłą elektronarzędzia — najwygodniejsze rozwiązanie na budowę.",
            },
            {
                question: "Jak długo agregat pracuje na jednym baku?",
                answer:
                    "Zależy od zbiornika i obciążenia: kompaktowe jednostki pracują 3–4 h, a modele budowlane ze zbiornikiem 25–26 l nawet 12 h przy 50 % obciążenia. Dokładne wartości podajemy w karcie każdego produktu.",
            },
        ],
    },
    {
        slug: "diesla",
        name: "Agregaty diesla",
        group: AGGREGATE_GROUP,
        tagline: "Wysoka trwałość do ciężkiej pracy",
        description:
            "Wysokoprężne agregaty do zastosowań budowlanych, warsztatowych i przemysłowych. Elektryczny rozruch, regulator AVR i silniki zgodne z normą Stage V zapewniają gotowość do intensywnej, wielogodzinnej pracy przy niższym zużyciu paliwa niż jednostki benzynowe. Wersje dual 400/230 V zasilą jednocześnie maszyny siłowe i zwykłe odbiorniki.",
        match: [
            "Agregaty diesla",
            "Agregat diesla",
            "Diesla",
            "Diesel",
            "Agregaty wysokoprężne",
            "Wysokoprężne",
        ],
        parentMatch: AGGREGATE_PARENT_MATCH,
        subcategories: [jednofazowe(), trzyfazowe(), dual()],
        image: supabaseProductImage(3),
        keywords: [
            "agregat diesla",
            "agregat wysokoprężny",
            "generator diesel",
            "agregat na budowę",
        ],
        highlights: [
            {
                title: "Silniki Stage V",
                text: "Jednostki wysokoprężne zgodne z normą emisji — dopuszczone do pracy na budowach w całej UE.",
            },
            {
                title: "Niskie zużycie paliwa",
                text: "Diesel przy pracy ciągłej spala wyraźnie mniej niż benzynowy o tej samej mocy.",
            },
            {
                title: "Konstrukcja na lata",
                text: "Wzmocnione ramy, przemysłowe tłumiki i elektryczny rozruch do codziennej eksploatacji.",
            },
        ],
        buyingGuide: [
            "Dobierz moc do pracy ciągłej — diesel pracuje najekonomiczniej przy 60–80 % obciążenia.",
            "Na budowę z maszynami 400 V wybierz wersję trójfazową albo dual 400/230 V z gniazdami obu rodzajów.",
            "Zwróć uwagę na pojemność zbiornika — im dłuższy czas pracy, tym mniej przestojów na tankowanie.",
            "Zaplanuj serwis: pierwsza wymiana oleju po docieraniu, kolejne co 100–200 godzin pracy.",
            "Do pracy w miejscu chronionym sprawdź poziom hałasu — wersje w obudowie wyciszającej są wyraźnie cichsze.",
        ],
        applications: [
            "Place budowy",
            "Warsztaty i przemysł",
            "Zasilanie rezerwowe obiektów",
            "Praca ciągła w terenie",
        ],
        faq: [
            {
                question: "Czy agregat diesla nadaje się do zasilania domu?",
                answer:
                    "Tak, ale zwróć uwagę na wersję wykonania i hałas. Do stałej rezerwy domu częściej polecamy jednostkę w obudowie wyciszającej albo agregat gazowy — diesel bez obudowy bywa zbyt głośny przy budynku.",
            },
            {
                question: "Co daje wersja 400/230 V (dual)?",
                answer:
                    "Jednoczesny dostęp do gniazd siłowych 400 V i jednofazowych 230 V. Na budowie zasilisz betoniarkę trójfazową i półkę elektronarzędzi 230 V z jednego urządzenia.",
            },
            {
                question: "Jak często serwisować agregat wysokoprężny?",
                answer:
                    "Pierwszą wymianę oleju wykonaj po ok. 20 godzinach docierania, kolejne co 100–200 godzin pracy lub raz w sezonie. W naszym warsztacie realizujemy przeglądy gwarancyjne w 48 h.",
            },
        ],
    },
    {
        slug: "akcesoria",
        name: "Akcesoria",
        group: "Inne kategorie",
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
        description: `Produkty z kategorii ${name} dostępne w sklepie ebe power. Wysyłka w 24 h, faktura VAT i wsparcie techniczne przed zakupem.`,
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

/* ----------------------------------------------------------------------------
 * Klasyfikacja fazowa produktów (jednofazowe / trójfazowe / dual 400+230 V)
 * -------------------------------------------------------------------------- */

/** Wyciąga wartość parametru po etykiecie (porównanie na znormalizowanych tekstach). */
function parameterValue(product: Product, labels: string[]): string {
    const wanted = labels.map(normalizeText);
    const entry = parseParameters(product.parameters).find((param) =>
        wanted.includes(normalizeText(param.label))
    );
    return entry?.value?.trim() ?? "";
}

/**
 * Klasyfikuje produkt pod względem liczby faz na podstawie parametrów
 * (`liczba faz`, fallback: napięcie 230/400 V) oraz nazwy/description.
 * Zwraca `null`, gdy nie da się jednoznacznie określić.
 */
export function phaseOfProduct(product: Product): SubcategoryPhase | null {
    const voltageValue = () =>
        normalizeText(
            parameterValue(product, ["napiecie", "napiecie wyjsciowe", "napiecie znamionowe"])
        ).replace(/\s+/g, "");

    // 1) Jawna liczba faz, np. „1", „3", „3 / 1", „trójfazowy"
    const phases = normalizeText(parameterValue(product, ["liczba faz", "fazy", "liczba_faz"]))
        .replace(/\s+/g, "");
    if (phases) {
        const hasSingle = /(^|[^0-9])1([^0-9]|$)/.test(phases) || phases.includes("jednofaz");
        const hasThree = phases.includes("3") || phases.includes("trojfaz");
        if (hasSingle && hasThree) return "dual";
        if (hasSingle) return "single";
        if (hasThree) {
            // Samo „3" — sprawdź, czy to wersja dwunapięciowa 400/230 V (dual)
            const voltage = voltageValue();
            if (voltage.includes("400") && voltage.includes("230")) return "dual";
            return "three";
        }
    }

    // 2) Napięcie — jednocześnie 400 V i 230 V oznacza wersję dual
    const voltage = voltageValue();
    if (voltage) {
        const has400 = voltage.includes("400");
        const has230 = voltage.includes("230");
        if (has400 && has230) return "dual";
        if (has400) return "three";
        if (has230) return "single";
    }

    // 3) Fallback tekstowy — nazwa i opis produktu
    const text = normalizeText(`${product.name} ${product.description ?? ""}`);
    const saysSingle = text.includes("jednofazow") || text.includes("monofazow") || text.includes("1-fazow");
    const saysThree = text.includes("trojfazow") || text.includes("3-fazow");
    if (saysSingle && saysThree) return "dual";
    if (saysThree) return "three";
    if (saysSingle) return "single";
    if (text.includes("400/230") || text.includes("230/400")) return "dual";

    return null;
}

/** Czy produkt spełnia kryteria podkategorii fazowej (parametry lub słowa kluczowe). */
function matchesPhaseSubcategory(product: Product, subcategory: CategorySubcategory): boolean {
    if (!subcategory.phase) return false;
    const detected = phaseOfProduct(product);
    if (detected) return detected === subcategory.phase;
    return matchesSubcategoryText(product, subcategory);
}

/** Tekstowe dopasowanie produktu do podkategorii (pole subcategory, nazwa, SKU). */
function matchesSubcategoryText(product: Product, subcategory: CategorySubcategory): boolean {
    const matches = subcategory.match.map(normalizeText);
    const slug = normalizeText(subcategory.slug);
    const values = [product.subcategory, product.name, product.sku]
        .filter((value): value is string => Boolean(value))
        .map(normalizeText);

    return values.some(
        (value) =>
            value === slug ||
            matches.some((match) => value === match || value.includes(match))
    );
}

/** Zwraca podkategorię produktu, jeżeli backend przekazał jej nazwę lub slug. */
export function subcategoryOf(
    product: Product,
    category?: CategoryDef
): CategorySubcategory | undefined {
    const parent = category ?? categoryOf(product);
    if (!parent?.subcategories?.length) return undefined;

    // Podkategorie fazowe rozstrzygamy parametrami produktu
    const phase = phaseOfProduct(product);
    const byPhase = parent.subcategories.find((s) => s.phase && s.phase === phase);
    if (byPhase) return byPhase;

    const raw = product.subcategory?.trim();
    if (!raw) return undefined;

    const normalized = normalizeText(raw);
    return parent.subcategories.find(
        (subcategory) =>
            normalizeText(subcategory.slug) === normalized ||
            normalizeText(subcategory.name) === normalized ||
            subcategory.match.some((value) => normalizeText(value) === normalized)
    );
}

/** Produkty pasujące do wybranej podkategorii. */
export function productsInSubcategory(
    products: Product[],
    category: CategoryDef,
    subcategory: CategorySubcategory
): Product[] {
    const categoryItems = productsInCategory(products, category);

    return categoryItems.filter((product) => {
        if (subcategory.phase) return matchesPhaseSubcategory(product, subcategory);
        return matchesSubcategoryText(product, subcategory);
    });
}

/** Czy produkt należy do kategorii — bezpośrednio albo przez podkategorię. */
function productMatchesCategory(product: Product, category: CategoryDef): boolean {
    const rawCategory = product.category?.trim();
    const rawSubcategory = product.subcategory?.trim();

    // Bezpośrednie dopasowanie kategorii z bazy (np. „Agregaty gazowe")
    if (rawCategory) {
        const normalized = normalizeText(rawCategory);
        if (
            category.match.some((m) => normalizeText(m) === normalized) ||
            slugify(rawCategory) === category.slug
        ) {
            return true;
        }
    }

    // Produkty kategorii-nadrzędnej (np. „Agregaty") trafiają do sekcji,
    // gdy ich podkategoria z bazy pasuje (np. „gazowe" → Agregaty gazowe)
    if (category.parentMatch?.length && rawCategory && rawSubcategory) {
        const normalizedCategory = normalizeText(rawCategory);
        const parentMatched = category.parentMatch.some(
            (m) => normalizeText(m) === normalizedCategory || slugify(m) === slugify(rawCategory)
        );
        if (parentMatched) {
            const normalizedSub = normalizeText(rawSubcategory);
            return (
                category.match.some((m) => normalizeText(m) === normalizedSub) ||
                slugify(rawSubcategory) === category.slug
            );
        }
    }

    return false;
}

/** Dopasowuje kategorię produktu do definicji z taksonomii. */
export function categoryOf(product: Product): CategoryDef | undefined {
    if (!product.category?.trim() && !product.subcategory?.trim()) return undefined;
    return CATEGORIES.find((c) => productMatchesCategory(product, c));
}

/** Slug kategorii dla danego produktu (z fallbackiem na slug z nazwy). */
export function categorySlugOf(product: Product): string | null {
    const def = categoryOf(product);
    if (def) return def.slug;
    return product.category ? slugify(product.category) : null;
}

export function productsInCategory(products: Product[], category: CategoryDef): Product[] {
    return products.filter((p) => productMatchesCategory(p, category));
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
    const isKnownCategoryName = (value: string) => {
        const normalized = normalizeText(value);
        return CATEGORIES.some(
            (def) =>
                def.match.some((m) => normalizeText(m) === normalized) ||
                def.parentMatch?.some((m) => normalizeText(m) === normalized)
        );
    };

    const extra = Array.from(
        new Set(
            products
                .map((p) => p.category?.trim())
                .filter((c): c is string => Boolean(c))
                .filter((c) => !isKnownCategoryName(c))
        )
    ).map(buildFallbackCategory);

    return [...CATEGORIES, ...extra];
}
