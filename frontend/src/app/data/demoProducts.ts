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
        stock: 15,
        description: "Klasyczny transformator sieciowy do układów zasilania niskonapięciowego.",
        images: [
            "https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783722183263.png",
        ],
        videos: [],
        parameters: "moc: 40VA; napięcie wejściowe: 230V; napięcie wyjściowe: 12V / 24V",
    },
    {
        id: 2,
        name: "Zasilacz impulsowy 12V 5A",
        price: 45.50,
        stock: 30,
        description: "Stabilizowany zasilacz impulsowy w obudowie modułowej na szynę DIN.",
        images: [
            "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters: "napięcie wyjściowe: 12V DC; prąd maksymalny: 5A; sprawność: 88%",
    },
    {
        id: 4,
        name: "Agregat prądotwórczy inwertorowy 3.5 kW",
        price: 2499.00,
        stock: 8,
        description: "Cichy agregat prądotwórczy z pełną sinusoidą, bezpieczny dla elektroniki.",
        images: [
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters: "moc znamionowa: 3500W",
    },
    {
        id: 5,
        name: "Stacja ładowania EV Wallbox 22 kW",
        price: 3199.00,
        stock: 5,
        description: "Trójfazowa naścienna stacja ładowania samochodów elektrycznych z gniazdem Typu 2.",
        images: [
            "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters: "moc: 22 kW; gniazdo: Typ 2",
    },
    {
        id: 7,
        name: "Przetwornica napięcia 12V/230V 1000W/2000W",
        price: 389.90,
        stock: 18,
        description: "Przetwornica z czystym sinusem przeznaczona do zasilania urządzeń indukcyjnych.",
        images: [
            "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters: "moc ciągła: 1000W; moc szczytowa: 2000W",
    },
    {
        id: 8,
        name: "Miernik cyfrowy True RMS z cęgami",
        price: 215.00,
        stock: 20,
        description: "Profesjonalny multimetr cęgowy do pomiaru prądu przemiennego i stałego.",
        images: [
            "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800",
        ],
        videos: [],
        parameters: "pomiar: AC/DC True RMS",
    },
];
