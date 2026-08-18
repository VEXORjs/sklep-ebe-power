import React from 'react';
import StatsGrid from "@/app/components/StatsGrid";

interface StatItem {
    value: string;
    label: string;
    description: string;
}

const rentalStatsData: StatItem[] = [
    {
        value: "50–2500 kVA",
        label: "Dostępne moce jednostek",
        description: "Szeroki wybór transformatorów olejowych i suchych gotowych do natychmiastowej pracy.",
    },
    {
        value: "do 24h",
        label: "Czas dostawy i podłączenia",
        description: "Szybka reakcja w sytuacjach awaryjnych z transportem HDS na terenie całego kraju.",
    },
    {
        value: "100%",
        label: "Sprawdzony stan techniczny",
        description: "Każda jednostka przechodzi pełne badania laboratoryjne i próby napięciowe przed wydaniem.",
    },
    {
        value: "Plug & Play",
        label: "Kompletne wyposażenie",
        description: "Możliwość wynajmu wraz z okablowaniem SN/nN, zabezpieczeniami i rozdzielnicami.",
    },
];

export default function RentalStats() {
    return (
        <main className="min-h-screen bg-black text-white py-12">
            <StatsGrid
                badge="Kwalifikacje i liczby"
                heading="Standardy potwierdzone uprawnieniami"
                items={rentalStatsData}
            />
        </main>
    );
}