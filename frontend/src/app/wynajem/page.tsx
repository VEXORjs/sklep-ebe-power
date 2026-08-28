import React from 'react';
import type { Metadata } from "next";
import RentalStats from "@/app/components/RentalStats";

export const metadata: Metadata = {
    title: "Wynajem transformatorów i stacji kontenerowych — zasilanie tymczasowe",
    description:
        "Wynajem transformatorów olejowych, suchych oraz kompletnych stacji kontenerowych. Zasilanie tymczasowe i awaryjne z dostawą HDS, montażem i wsparciem 24/7. ebe power — Bełchatów.",
    alternates: { canonical: "/wynajem" },
    keywords: [
        "wynajem transformatorów",
        "wynajem stacji kontenerowej",
        "zasilanie tymczasowe",
        "zasilanie awaryjne",
        "transformator na wynajem",
    ],
    openGraph: {
        title: "Wynajem transformatorów i stacji kontenerowych | ebe power",
        description:
            "Elastyczny wynajem transformatorów i stacji kontenerowych z transportem HDS, montażem i wsparciem technicznym 24/7.",
        url: "/wynajem",
        type: "website",
    },
};

export default function RentalPage() {
    const rentalJsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Wynajem transformatorów i stacji kontenerowych",
        description:
            "Elastyczny wynajem transformatorów olejowych i suchych oraz kompletnych stacji kontenerowych. Natychmiastowa dostępność, transport HDS, profesjonalny montaż i pełne wsparcie techniczne 24/7.",
        provider: {
            "@type": "Organization",
            name: "ebe power",
            url: "https://sklep.ebe-power.pl",
        },
        areaServed: {
            "@type": "Country",
            name: "Polska",
        },
        serviceType: "Wynajem transformatorów",
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://sklep.ebe-power.pl" },
            { "@type": "ListItem", position: 2, name: "Wynajem", item: "https://sklep.ebe-power.pl/wynajem" },
        ],
    };

    return (
        <main className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(rentalJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Nagłówek strony */}
                <div className="border-b border-neutral-800 pb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Zasilanie tymczasowe i awaryjne
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
                        Wynajem transformatorów i stacji kontenerowych
                    </h1>
                    <p className="text-neutral-400 mt-4 max-w-3xl text-sm sm:text-base leading-relaxed">
                        Oferujemy elastyczny wynajem transformatorów olejowych i suchych oraz kompletnych stacji kontenerowych. Zapewniamy natychmiastową dostępność, transport HDS, profesjonalny montaż oraz pełne wsparcie techniczne 24/7.
                    </p>
                </div>

                {/* Komponent statystyk wynajmu */}
                <RentalStats />

            </div>
        </main>
    );
}
