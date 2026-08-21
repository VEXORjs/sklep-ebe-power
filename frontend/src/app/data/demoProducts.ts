import { Product } from "@/app/types/product";

/**
 * Katalog PRAMAC — dane zapasowe, gdy backend (Spring Boot) jest niedostępny.
 * Zgodne z backend/src/main/resources/data.sql
 */
export const DEMO_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "PRAMAC DX8500 PRO+",
        price: 7200,
        oldPrice: 9000,
        stock: 4,
        description:
            "Wyciszony agregat diesla PRAMAC DX8500 PRO+ z AVR i normą emisji Stage V. Zabudowa canopy, gniazda 400 V i 230 V — budowa, zasilanie awaryjne i wynajem.",
        images: ["/products/dx8500.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: DX8500 PRO+; rodzaj paliwa: Diesel; norma emisji: Stage V; regulacja napięcia: AVR; częstotliwość: 50 Hz; napięcie: 400 / 230 V; liczba faz: 3; moc maksymalna: 8,5 kVA / 6,8 kW; moc ciągła: 7,7 kVA / 6,2 kW; rozruch: Elektryczny; gniazda: 1× CEE 400 V, 1× Schuko 230 V 16 A; poziom hałasu: 97 dB(A) LWA; obudowa: Wyciszona canopy",
        category: "Agregaty diesla",
        sku: "DX8500",
        datasheetUrl: "/datasheets/DX8500.pdf",
        badge: "Promocja",
        rating: 4.8,
        reviews: 19,
    },
    {
        id: 2,
        name: "PRAMAC P 3500i",
        price: 3925,
        oldPrice: 4500,
        stock: 8,
        description:
            "Inwerterowy agregat benzynowy P 3500i z technologią PowerRush. Czyste napięcie 230 V, rozruch elektryczny i ręczny, zbiornik 10 l — bezpieczny dla elektroniki.",
        images: ["/products/p3500i.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: P 3500i; częstotliwość: 50 Hz; napięcie: 230 V; liczba faz: 1; moc maksymalna: 3,3 kW; moc znamionowa: 3,0 kW; regulacja napięcia: Inwerter; rodzaj paliwa: Benzyna; rozruch: Elektryczny + ręczny; pojemność zbiornika: 10 l; zużycie paliwa: 1,5 l/h (75%); czas pracy: 6,3 h (75%); poziom hałasu: 88 dB(A) LWA; wymiary: 601 × 458 × 552 mm; waga: 49,5 kg",
        category: "Agregaty inwerterowe",
        sku: "PF302SXB000",
        datasheetUrl: "/datasheets/P3500i.pdf",
        badge: "Promocja",
        rating: 4.7,
        reviews: 31,
    },
    {
        id: 3,
        name: "PRAMAC P 3000i",
        price: 2590,
        stock: 12,
        description:
            "Kompaktowy inwerter P 3000i (2,5 / 2,3 kW) z PowerRush. 27 kg, 2 gniazda Schuko 230 V, niski poziom hałasu — biuro, kemping i zasilanie awaryjne domu.",
        images: ["/products/p3000i.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: P 3000i; częstotliwość: 50 Hz; napięcie: 230 V; liczba faz: 1; moc maksymalna: 2,5 kW; moc znamionowa: 2,3 kW; regulacja napięcia: Inwerter; rodzaj paliwa: Benzyna; rozruch: Ręczny; pojemność zbiornika: 4 l; zużycie paliwa: 1,14 l/h (75%); czas pracy: 3,5 h (75%); poziom hałasu: 88 / 61 dB(A); wymiary: 565 × 339 × 467 mm; waga: 27 kg; gniazda: 2× Schuko 230 V 16 A",
        category: "Agregaty inwerterowe",
        sku: "PF262SXI000",
        datasheetUrl: "/datasheets/P3000i.pdf",
        badge: "Bestseller",
        rating: 4.9,
        reviews: 44,
    },
    {
        id: 4,
        name: "PRAMAC E4000 230V",
        price: 2430,
        stock: 10,
        description:
            "Ramowy agregat benzynowy E4000 z silnikiem Honda GX200. Moc 3,1 kW ESP, dwa gniazda 230 V, rozruch ręczny — warsztat, budowa i ogród.",
        images: ["/products/e4000.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: E4000 230 V 50 Hz; częstotliwość: 50 Hz; napięcie: 230 V; liczba faz: 1; moc maksymalna: 3,1 kW / 3,4 kVA; moc ciągła: 2,6 kW / 2,9 kVA; silnik: Honda GX200, 196 cm³; rodzaj paliwa: Benzyna; rozruch: Ręczny; pojemność zbiornika: 3,1 l; czas pracy: 2,65 h (75%); poziom hałasu: 96 / 68 dB(A); wymiary: 625 × 455 × 455 mm; waga: 36 kg; gniazda: 2× 230 V 16 A",
        category: "Agregaty benzynowe",
        sku: "PA292SH1000",
        datasheetUrl: "/datasheets/E4000.pdf",
        rating: 4.6,
        reviews: 22,
    },
    {
        id: 5,
        name: "PRAMAC MES 8000 400V",
        price: 5890,
        stock: 6,
        description:
            "Trójfazowy agregat ramowy MES 8000 z silnikiem Honda GX390. 8,3 kVA ESP przy 400 V oraz gniazda 230 V — maszyny, warsztat i plac budowy.",
        images: ["/products/mes8000.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: MES8000 400 V 50 Hz; częstotliwość: 50 Hz; napięcie: 400 / 230 V; liczba faz: 3; moc maksymalna: 8,3 kVA / 6,6 kW (3f); moc ciągła: 7,0 kVA / 5,6 kW (3f); moc znamionowa: 4,0 / 3,7 kVA (1f); silnik: Honda GX390, 389 cm³; rodzaj paliwa: Benzyna; rozruch: Ręczny; pojemność zbiornika: 6,5 l; wymiary: 750 × 543 × 520 mm; waga: 75 kg; gniazda: 230 V 16 A + CEE 400 V 16 A",
        category: "Agregaty benzynowe",
        sku: "MES8000",
        datasheetUrl: "/datasheets/MES8000.pdf",
        rating: 4.5,
        reviews: 14,
    },
    {
        id: 6,
        name: "PRAMAC WX 6250 ES 400V",
        price: 4690,
        stock: 5,
        description:
            "Benzynowy WX 6250 ES 400 V z AVR, rozruchem elektrycznym i kołami. Zbiornik 26 l, gniazdo CEE 400 V i dwa Schuko 230 V.",
        images: ["/products/wx6250.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: WX 6250 ES; częstotliwość: 50 Hz; napięcie: 400 / 230 V; liczba faz: 3; moc maksymalna: 6,0 kVA / 4,8 kW; moc ciągła: 5,0 kVA / 4,0 kW; regulacja napięcia: AVR; silnik: PRAMAC OHV 420 cm³, Stage V; rodzaj paliwa: Benzyna; rozruch: Elektryczny; pojemność zbiornika: 26 l; waga: 90 kg; wymiary: 800 × 698 × 620 mm; gniazda: CEE 400 V 16 A, 2× Schuko 230 V",
        category: "Agregaty benzynowe",
        sku: "PR552TXBZ00",
        datasheetUrl: "/datasheets/WX6250ES.pdf",
        rating: 4.4,
        reviews: 11,
    },
    {
        id: 7,
        name: "PRAMAC WX 7000 230V",
        price: 3890,
        stock: 7,
        description:
            "Jednofazowy WX 7000 AVR z rozruchem elektrycznym, kołami i zbiornikiem 26 l. Moc 6,1 kW, gniazdo CEE 32 A — narzędzia i zasilanie awaryjne.",
        images: ["/products/wx7000.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: WX 7000; częstotliwość: 50 Hz; napięcie: 230 V; liczba faz: 1; moc maksymalna: 6,1 kW; moc ciągła: 5,8 kW; regulacja napięcia: AVR; norma emisji: Stage V; rodzaj paliwa: Benzyna; rozruch: Elektryczny + ręczny; pojemność zbiornika: 26 l; zużycie paliwa: 2,3 l/h (50%); czas pracy: 11,3 h (50%); poziom hałasu: 97 / 69 dB(A); gniazda: 2× Schuko 16 A, 1× CEE 230 V 32 A",
        category: "Agregaty benzynowe",
        sku: "PR582SXBZ00",
        datasheetUrl: "/datasheets/WX7000.pdf",
        badge: "Bestseller",
        rating: 4.6,
        reviews: 27,
    },
    {
        id: 8,
        name: "PRAMAC PMi 4500 3XTRA",
        price: 5490,
        stock: 6,
        description:
            "Inwerter PMi 4500 z pakietem 3XTRA Control: złącze ATS, pilot i rozruch 2-przewodowy. 4,2 kW max, eco mode, koła — automatyka SZR i elektronika.",
        images: ["/products/pmi4500.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: PMi 4500; częstotliwość: 50 Hz; napięcie: 230 V; liczba faz: 1; moc maksymalna: 4,2 kW; moc znamionowa: 3,8 kW; regulacja napięcia: Inwerter; silnik: PRAMAC OHV, Stage V; rodzaj paliwa: Benzyna; rozruch: Elektryczny + ręczny; pojemność zbiornika: 12 l; zużycie paliwa: 1,2 l/h (50%); czas pracy: 9,7 h Eco (50%); poziom hałasu: 93 / 68 dB(A); wymiary: 578 × 422 × 500 mm; waga: 42,5 kg; sterowanie: 3XTRA: ATS, pilot, 2-wire start",
        category: "Agregaty inwerterowe",
        sku: "PMI4500",
        datasheetUrl: "/datasheets/PMi4500.pdf",
        badge: "Nowość",
        rating: 4.8,
        reviews: 9,
    },
    {
        id: 9,
        name: "PRAMAC S12000 400V AVR CONN DPP",
        price: 12990,
        stock: 3,
        description:
            "Profesjonalny S12000 400 V 50 Hz z AVR, gniazdem CONN (AMF) i ochroną różnicową DPP. Silnik Honda GX630, 13,9 kVA ESP — przemysł i wynajem.",
        images: ["/products/s12000.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: S12000 400V 50Hz #AVR #CONN #DPP; częstotliwość: 50 Hz; napięcie: 400 / 230 V; liczba faz: 3; moc maksymalna: 13,9 kVA / 11,1 kW; moc ciągła: 11,8 kVA / 9,5 kW; silnik: Honda GX630, 688 cm³; rodzaj paliwa: Benzyna; rozruch: Elektryczny; regulacja napięcia: AVR (ASR); pojemność zbiornika: 24 l; czas pracy: 5,67 h (75%); wymiary: 960 × 641 × 667 mm; waga: 162 kg; wyposażenie: AVR, CONN (AMF), DPP",
        category: "Agregaty benzynowe",
        sku: "PD123TH200H",
        datasheetUrl: "/datasheets/S12000.pdf",
        rating: 4.7,
        reviews: 8,
    },
    {
        id: 10,
        name: "PRAMAC GA 20000",
        price: 31500,
        stock: 2,
        description:
            "Stacjonarny agregat gazowy GA 20000 (LPG 20 kVA / gaz ziemny 17 kVA), 400 V, 3 fazy. Obudowa weatherproof, silnik Generac G-FORCE — dom i obiekt.",
        images: ["/products/ga20000.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: GA 20000; częstotliwość: 50 Hz; napięcie: 400 V; liczba faz: 3; moc maksymalna: 20 kVA LPG / 17 kVA NG; silnik: Generac G-FORCE 1000, 999 cm³; rodzaj paliwa: LPG lub gaz ziemny; rozruch: Elektryczny; wymiary: 1232 × 648 × 733 mm; waga: 220 kg; prąd maksymalny: 28,87 A LPG / 24,53 A NG",
        category: "Agregaty gazowe",
        sku: "GA20000",
        datasheetUrl: "/datasheets/GA20000.pdf",
        badge: "Nowość",
        rating: 4.9,
        reviews: 6,
    },
    {
        id: 11,
        name: "PRAMAC GA 10000",
        price: 25500,
        stock: 2,
        description:
            "Stacjonarny agregat gazowy GA 10000 — 10 kVA na LPG i gazie ziemnym, 230 V. Cicha obudowa, panel Evolution, automatyczny rozruch przy zaniku sieci.",
        images: ["/products/ga10000.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: GA 10000; częstotliwość: 50 Hz; napięcie: 230 V; liczba faz: 1; moc maksymalna: 10 kVA LPG / 10 kVA NG; silnik: Generac G-FORCE OHV; rodzaj paliwa: LPG lub gaz ziemny; rozruch: Elektryczny; wymiary: 1232 × 648 × 733 mm; waga: 176 kg; prąd maksymalny: 43,48 A",
        category: "Agregaty gazowe",
        sku: "GA10000",
        datasheetUrl: "/datasheets/GA10000.pdf",
        rating: 4.8,
        reviews: 7,
    },
    {
        id: 12,
        name: "PRAMAC GA 13000",
        price: 29500,
        stock: 2,
        description:
            "Stacjonarny agregat gazowy GA 13000 — 13 kVA na LPG i gazie ziemnym, 230 V. Silnik Generac G-FORCE, True Power, gotowość do pracy SZR.",
        images: ["/products/ga13000.jpg"],
        videos: [],
        parameters:
            "producent: PRAMAC; model: GA 13000; częstotliwość: 50 Hz; napięcie: 230 V; liczba faz: 1; moc maksymalna: 13 kVA LPG / 13 kVA NG; silnik: Generac G-FORCE OHV, 999 cm³; rodzaj paliwa: LPG lub gaz ziemny; rozruch: Elektryczny; wymiary: 1232 × 648 × 733 mm; waga: 193 kg; prąd maksymalny: 56,52 A",
        category: "Agregaty gazowe",
        sku: "GA13000",
        datasheetUrl: "/datasheets/GA13000.pdf",
        rating: 4.7,
        reviews: 5,
    },
];
