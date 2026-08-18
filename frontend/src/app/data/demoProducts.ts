import { Product } from "@/app/types/product";

/**
 * Produkty zapasowe używane w podglądzie/rozwoju,
 * gdy backend (Spring Boot) jest niedostępny.
 * Dane zgodne z backend/src/main/resources/data.sql
 */
export const DEMO_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Transformator sieciowy TS40",
        price: 89.99,
        oldPrice: 109.99,
        stock: 15,
        description:
            "Klasyczny transformator sieciowy do układów zasilania niskonapięciowego. Uzwojenia miedziane, rdzeń EI z blachy transformatorowej, izolacja w klasie F.",
        images: [
            "https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783722183263.png",
            "https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783719987438.jpg",
        ],
        videos: [],
        parameters:
            "moc: 40VA; napięcie wejściowe: 230V AC; napięcie wyjściowe: 12V / 24V; klasa izolacji: F (155°C); montaż: śrubowy / szyna DIN; waga: 0,9 kg",
        category: "Transformatory",
        sku: "TRA-0001",
        badge: "Promocja",
        rating: 4.8,
        reviews: 23,
    },
    {
        id: 2,
        name: "Zasilacz impulsowy 12V 5A",
        price: 45.5,
        stock: 30,
        description:
            "Stabilizowany zasilacz impulsowy w obudowie modułowej na szynę DIN. Chłodzenie pasywne, komplet zabezpieczeń i regulacja napięcia wyjściowego.",
        images: [
            "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "napięcie wyjściowe: 12V DC; prąd maksymalny: 5A; sprawność: 88%; zabezpieczenia: zwarciowe, przeciążeniowe, termiczne; montaż: szyna TH-35; gwarancja: 24 miesiące",
        category: "Zasilacze",
        sku: "TRA-0002",
        badge: "Bestseller",
        rating: 4.6,
        reviews: 41,
    },
    {
        id: 6,
        name: "Transformator toroidalny 150VA 230V/24V",
        price: 139.0,
        stock: 12,
        description:
            "Wysokosprawny transformator toroidalny o niskim poziomie hałasu i strat własnych. Idealny do torów audio, oświetlenia i układów pomiarowych.",
        images: [
            "https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783719987438.jpg",
        ],
        videos: [],
        parameters:
            "moc: 150VA; napięcie wejściowe: 230V AC; napięcie wtórne: 24V AC; poziom hałasu: < 20 dB; waga: 1,8 kg; gwarancja: 24 miesiące",
        category: "Transformatory",
        sku: "TRA-0006",
        rating: 4.9,
        reviews: 17,
    },
    {
        id: 10,
        name: "Autotransformator regulowany 0-250V 2kVA",
        price: 899.0,
        stock: 4,
        description:
            "Laboratoryjny autotransformator ze wskaźnikiem analogowym i płynną regulacją napięcia. Wyposażony w bezpiecznik, gniazdo wyjściowe i wyłącznik sieciowy.",
        images: [
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "zakres regulacji: 0-250V AC; moc: 2kVA; prąd wyjściowy: 8A; wskaźnik: analogowy woltomierz; waga: 8,4 kg",
        category: "Transformatory",
        sku: "TRA-0010",
        rating: 4.4,
        reviews: 9,
    },
    {
        id: 7,
        name: "Przetwornica napięcia 12V/230V 1000W/2000W",
        price: 389.9,
        stock: 18,
        description:
            "Przetwornica z czystym sinusem przeznaczona do zasilania urządzeń indukcyjnych: pomp, lodówek i elektronarzędzi. Sygnalizacja stanu akumulatora.",
        images: [
            "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "moc ciągła: 1000W; moc szczytowa: 2000W; przebieg napięcia: czysta sinusoida; napięcie wejściowe: 12V DC; sprawność: 90%",
        category: "Zasilacze",
        sku: "TRA-0007",
        badge: "Bestseller",
        rating: 4.5,
        reviews: 34,
    },
    {
        id: 4,
        name: "Agregat prądotwórczy inwertorowy 3.5 kW",
        price: 2499.0,
        oldPrice: 2799.0,
        stock: 8,
        description:
            "Cichy agregat prądotwórczy z pełną sinusoidą, bezpieczny dla elektroniki. Rozruch elektryczny, wyjścia 230V i 12V DC oraz licznik motogodzin.",
        images: [
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "moc znamionowa: 3500W; moc szczytowa: 3800W; rodzaj paliwa: benzyna bezołowiowa 95; rozruch: elektryczny / ręczny; pojemność zbiornika: 7,5 l; czas pracy: do 9 h; poziom hałasu: 62 dB(A)",
        category: "Agregaty",
        sku: "TRA-0004",
        badge: "Promocja",
        rating: 4.7,
        reviews: 31,
    },
    {
        id: 14,
        name: "Agregat budowlany 6 kW AVR 400V",
        price: 4290.0,
        stock: 3,
        description:
            "Trójfazowy agregat budowlany z układem AVR stabilizującym napięcie. Rama ochronna, koła transportowe i gniazda 230V oraz 400V.",
        images: [
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "moc znamionowa: 6000W; liczba faz: 3; napięcie wyjściowe: 230V / 400V; rodzaj paliwa: benzyna; rozruch: elektryczny; pojemność zbiornika: 25 l; poziom hałasu: 72 dB(A)",
        category: "Agregaty",
        sku: "TRA-0014",
        rating: 4.5,
        reviews: 11,
    },
    {
        id: 5,
        name: "Stacja ładowania EV Wallbox 22 kW",
        price: 3199.0,
        stock: 5,
        description:
            "Trójfazowa naścienna stacja ładowania samochodów elektrycznych z gniazdem Typu 2, aplikacją mobilną i dynamicznym zarządzaniem mocą.",
        images: [
            "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "moc ładowania: 22kW; złącze: Typ 2 (Mennekes); liczba faz: 3; stopień ochrony: IP54; zabezpieczenie: RCD typu A + DC 6 mA; sterowanie: Wi-Fi / aplikacja",
        category: "Stacje ładowania EV",
        sku: "TRA-0005",
        badge: "Nowość",
        rating: 4.8,
        reviews: 19,
    },
    {
        id: 15,
        name: "Wallbox 7,4 kW z kablem Typ 2 (5 m)",
        price: 1899.0,
        oldPrice: 2149.0,
        stock: 9,
        description:
            "Jednofazowa ładowarka do garażu domowego z fabrycznie zamontowanym kablem 5 m. Tryb ładowania nadwyżkami z fotowoltaiki.",
        images: [
            "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "moc ładowania: 7,4kW; złącze: kabel Typ 2, 5 m; liczba faz: 1; stopień ochrony: IP55; funkcje: tryb eco PV, harmonogram; gwarancja: 36 miesięcy",
        category: "Stacje ładowania EV",
        sku: "TRA-0015",
        badge: "Promocja",
        rating: 4.6,
        reviews: 24,
    },
    {
        id: 9,
        name: "Przekaźnik półprzewodnikowy SSR 40A",
        price: 64.5,
        stock: 45,
        description:
            "Bezstykowe sterowanie obciążeniami przemysłowymi o wysokiej częstotliwości łączeń. Optoizolacja wejścia i przełączanie w zerze napięcia.",
        images: [
            "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "prąd pracy: 40A; napięcie sterujące: 3-32V DC; napięcie obciążenia: 24-380V AC; izolacja: optoelektroniczna 2,5 kV; montaż: śrubowy na radiatorze",
        category: "Rozdzielnice i zabezpieczenia",
        sku: "TRA-0009",
        rating: 4.3,
        reviews: 12,
    },
    {
        id: 11,
        name: "Rozdzielnica modułowa 12M natynkowa",
        price: 79.0,
        stock: 22,
        description:
            "Rozdzielnica natynkowa 12 modułów z przezroczystymi drzwiczkami, szyną DIN oraz listwami N i PE. Tworzywo samogasnące 960 °C.",
        images: [
            "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "moduły: 12; stopień ochrony: IP40; materiał: ABS samogasnący; wyposażenie: listwa N + PE; kolor: biały RAL 9003",
        category: "Rozdzielnice i zabezpieczenia",
        sku: "TRA-0011",
        badge: "Nowość",
        rating: 4.7,
        reviews: 6,
    },
    {
        id: 16,
        name: "Rozdzielnica hermetyczna 24M IP65",
        price: 189.0,
        stock: 7,
        description:
            "Obudowa hermetyczna do zastosowań zewnętrznych i warsztatowych. Uszczelka obwodowa, zamek na klucz i przepusty membranowe.",
        images: [
            "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "moduły: 24; stopień ochrony: IP65; odporność udarowa: IK08; materiał: poliwęglan; zamek: na klucz",
        category: "Rozdzielnice i zabezpieczenia",
        sku: "TRA-0016",
        rating: 4.6,
        reviews: 8,
    },
    {
        id: 3,
        name: "Przewód instalacyjny miedziany 3x2.5mm² (1m)",
        price: 5.2,
        stock: 250,
        description:
            "Jednożyłowy przewód miedziany do instalacji elektroenergetycznych. Cięcie na metry, pełny przekrój znamionowy, izolacja PVC 70 °C.",
        images: [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "przekrój: 3x2.5 mm²; materiał: miedź (Cu); klasa napięciowa: 450/750V; izolacja: PVC 70°C; typ: YDY sztywny",
        category: "Kable",
        sku: "TRA-0003",
        badge: "Bestseller",
        rating: 4.6,
        reviews: 58,
    },
    {
        id: 17,
        name: "Kabel solarny 6mm² czarny, odporny na UV (1m)",
        price: 4.9,
        stock: 400,
        description:
            "Dedykowany przewód do instalacji fotowoltaicznych. Podwójna izolacja bezhalogenowa odporna na UV, ozon i temperaturę do 120 °C.",
        images: [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "przekrój: 6 mm²; materiał: miedź cynowana; klasa napięciowa: 1,5 kV DC; temperatura pracy: -40°C do 120°C; odporność: UV, ozon",
        category: "Kable",
        sku: "TRA-0017",
        badge: "Nowość",
        rating: 4.7,
        reviews: 15,
    },
    {
        id: 12,
        name: "Wyłącznik nadprądowy B16 1P",
        price: 32.9,
        stock: 60,
        description:
            "Wyłącznik nadprądowy (bezpiecznik automatyczny) B16, charakterystyka B, zdolność zwarciowa 6 kA. Zgodny z PN-EN 60898-1.",
        images: [
            "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "charakterystyka: B; prąd znamionowy: 16A; zdolność zwarciowa: 6kA; liczba biegunów: 1P; moduły: 1; norma: PN-EN 60898-1",
        category: "Bezpieczniki",
        sku: "TRA-0012",
        badge: "Nowość",
        rating: 4.8,
        reviews: 14,
    },
    {
        id: 18,
        name: "Wyłącznik różnicowoprądowy 2P 40A 30mA typ A",
        price: 129.0,
        stock: 26,
        description:
            "Różnicówka typu A wykrywająca prądy przemienne i pulsujące stałe — wymagana w obwodach z elektroniką i falownikami PV.",
        images: [
            "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "prąd znamionowy: 40A; prąd różnicowy: 30mA; typ: A; liczba biegunów: 2P; moduły: 2; norma: PN-EN 61008",
        category: "Bezpieczniki",
        sku: "TRA-0018",
        rating: 4.9,
        reviews: 21,
    },
    {
        id: 8,
        name: "Miernik cyfrowy True RMS z cęgami",
        price: 215.0,
        stock: 20,
        description:
            "Profesjonalny multimetr cęgowy do pomiaru prądu przemiennego i stałego. Podświetlany wyświetlacz, funkcja NCV i test ciągłości.",
        images: [
            "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "pomiar: AC/DC True RMS; pomiar prądu: do 400A AC/DC; kategoria pomiarowa: CAT III 600V; funkcje: NCV, ciągłość, pojemność; zasilanie: 2× AAA",
        category: "Liczniki i mierniki",
        sku: "TRA-0008",
        rating: 4.5,
        reviews: 27,
    },
    {
        id: 19,
        name: "Licznik energii 1-fazowy na szynę DIN, MID",
        price: 179.0,
        stock: 14,
        description:
            "Licznik zużycia energii z legalizacją MID i wyjściem impulsowym S0. Idealny do podliczników najemców i monitoringu zużycia.",
        images: [
            "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "liczba faz: 1; prąd maksymalny: 63A; klasa dokładności: 1 (MID); wyjście: impulsowe S0; moduły: 4; montaż: szyna TH-35",
        category: "Liczniki i mierniki",
        sku: "TRA-0019",
        rating: 4.4,
        reviews: 10,
    },
    {
        id: 20,
        name: "Zestaw końcówek tulejkowych 1200 szt. z zaciskarką",
        price: 149.0,
        oldPrice: 189.0,
        stock: 35,
        description:
            "Kompletny zestaw warsztatowy: końcówki tulejkowe 0,25–10 mm² w organizerze wraz z zaciskarką samonastawną.",
        images: [
            "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "zawartość: 1200 szt.; zakres: 0,25-10 mm²; narzędzie: zaciskarka samonastawna; organizer: walizka z przegrodami",
        category: "Akcesoria",
        sku: "TRA-0020",
        badge: "Promocja",
        rating: 4.7,
        reviews: 38,
    },
    {
        id: 21,
        name: "Złączki szybkozłączne 2/3/5-torowe — zestaw 100 szt.",
        price: 69.0,
        stock: 80,
        description:
            "Uniwersalne złączki dźwigienkowe do połączeń drutu i linki bez lutowania. Przezroczysta obudowa ułatwia kontrolę montażu.",
        images: [
            "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters:
            "zawartość: 100 szt.; przekrój: 0,2-4 mm²; prąd znamionowy: 32A; napięcie: 450V; norma: PN-EN 60998",
        category: "Akcesoria",
        sku: "TRA-0021",
        badge: "Bestseller",
        rating: 4.8,
        reviews: 52,
    },
];
