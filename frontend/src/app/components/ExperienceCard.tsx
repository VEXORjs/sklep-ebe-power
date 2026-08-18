import React from 'react';
import StatsGrid from "@/app/components/StatsGrid";

// Interfejs opisujący pojedynczy kafelek
interface StatItem {
    value: string;       // Główna wartość (np. "15+", "110 kV")
    label: string;       // Tytuł kafelka
    description: string; // Krótkie rozwinięcie
}

// Przykładowe dane branżowe
const statsData: StatItem[] = [
    {
        value: "15+ lat",
        label: "Doświadczenia w branży",
        description: "Ciągła praktyka przy serwisie i modernizacji urządzeń elektroenergetycznych.",
    },
    {
        value: "do 110 kV",
        label: "Uprawnienia SEP (G1, E+D)",
        description: "Kwalifikacje do prac eksploatacyjnych i dozorowych na stacjach WN i SN.",
    },
    {
        value: "100%",
        label: "Prób szczelności i zgodności",
        description: "Badania aparatury, oleju transformatorowego oraz rozdzielnic gazowych.",
    },
    {
        value: "24/7",
        label: "Gotowość serwisowa",
        description: "Szybka reakcja na awarie i przestoje w zakładach przemysłowych.",
    },
];

export default function ExperienceStats() {
    return (
        <main className="min-h-screen bg-black text-white py-12">
            <StatsGrid
                badge="Kwalifikacje i liczby"
                heading="Standardy potwierdzone uprawnieniami"
                items={statsData}
            />
        </main>
    );
}