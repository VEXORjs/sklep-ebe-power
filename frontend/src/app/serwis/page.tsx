import React from 'react';
import type { Metadata } from "next";
import ExperienceStats from "@/app/components/ExperienceCard";

export const metadata: Metadata = {
    title: "Serwis i konserwacja transformatorów — diagnostyka, pomiary, przeglądy",
    description:
        "Profesjonalny serwis transformatorów i stacji transformatorowych. Diagnostyka, pomiary elektryczne, przeglądy okresowe, naprawy i konserwacja. ebe power — Bełchatów.",
    alternates: { canonical: "/serwis" },
    keywords: [
        "serwis transformatorów",
        "konserwacja transformatorów",
        "przegląd stacji transformatorowej",
        "pomiary elektryczne",
        "diagnostyka transformatorów",
    ],
    openGraph: {
        title: "Serwis i konserwacja transformatorów | ebe power",
        description:
            "Kompleksowe usługi diagnostyki, pomiarów i przeglądów technicznych urządzeń elektroenergetycznych i stacji transformatorowych.",
        url: "/serwis",
        type: "website",
    },
};

export default function ServicePage() {
    const serviceJsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Serwis i konserwacja transformatorów",
        description:
            "Kompleksowe usługi diagnostyki, pomiarów oraz przeglądów technicznych urządzeń elektroenergetycznych i stacji transformatorowych.",
        provider: {
            "@type": "Organization",
            name: "ebe power",
            url: "https://sklep.ebe-power.pl",
        },
        areaServed: {
            "@type": "Country",
            name: "Polska",
        },
        serviceType: "Serwis transformatorów",
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://sklep.ebe-power.pl" },
            { "@type": "ListItem", position: 2, name: "Serwis", item: "https://sklep.ebe-power.pl/serwis" },
        ],
    };

    return (
        <main className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Nagłówek strony */}
                <div className="border-b border-neutral-800 pb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Oferta techniczna
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
                        Serwis i konserwacja transformatorów
                    </h1>
                    <p className="text-neutral-400 mt-4 max-w-3xl text-sm sm:text-base leading-relaxed">
                        Świadczymy kompleksowe usługi diagnostyki, pomiarów oraz przeglądów technicznych urządzeń elektroenergetycznych i stacji transformatorowych. Zapewniamy profesjonalną obsługę i szybki czas reakcji na terenie całej Polski.
                    </p>
                </div>

                {/* Komponent statystyk i certyfikatów */}
                <ExperienceStats />

            </div>
        </main>
    );
}
