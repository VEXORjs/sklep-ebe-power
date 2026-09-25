// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { CartProvider } from '@/app/context/CartContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import AuthProvider from "@/app/components/AuthProvider";
import './globals.css';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TopBar from "@/app/components/TopBar";
import CartDrawer from "@/app/components/CartDrawer";
import ProductionAlert from "@/app/components/ProductionAlert";
import { BRAND_LOGO_URL } from "@/app/lib/brand";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
        { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL("https://sklep.ebe-power.pl"),
    title: {
        default: "ebe power — Agregaty prądotwórcze PRAMAC | Sklep online",
        template: "%s | ebe power",
    },
    description:
        "Sklep internetowy z agregatami prądotwórczymi PRAMAC: inwerterowymi, benzynowymi, diesla i gazowymi. Faktura VAT i wsparcie techniczne.",
    keywords: [
        "transformatory",
        "zasilacze",
        "rozdzielnice",
        "kable elektryczne",
        "osprzęt elektryczny",
        "sklep elektryczny",
        "EBE POWER",
        "ebe power",
        "agregaty prądotwórcze",
        "stacje ładowania EV",
        "maszty oświetleniowe",
    ],
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    alternates: {
        canonical: "https://sklep.ebe-power.pl",
        languages: { "pl-PL": "https://sklep.ebe-power.pl" },
    },
    openGraph: {
        type: "website",
        locale: "pl_PL",
        siteName: "ebe power",
        title: "ebe power — Agregaty prądotwórcze PRAMAC",
        description:
            "Sklep internetowy z agregatami prądotwórczymi PRAMAC do domu, warsztatu i na budowę. Faktura VAT i wsparcie techniczne.",
        url: "https://sklep.ebe-power.pl",
        images: [
            {
                url: BRAND_LOGO_URL,
                width: 1200,
                height: 630,
                alt: "ebe power — sklep z osprzętem elektrycznym",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ebe power — Agregaty prądotwórcze PRAMAC",
        description:
            "Agregaty prądotwórcze PRAMAC: modele inwerterowe, benzynowe, diesla i gazowe.",
        images: [BRAND_LOGO_URL],
    },
    // `icons` celowo NIE jest ustawione.
    //
    // Wcześniej wskazywało na `BRAND_LOGO_URL`, czyli JPEG 8000×3572 (791 KiB),
    // więc przeglądarka pobierała go jako favicon, apple-touch-icon i shortcut
    // na każdej podstronie. Bez tego wpisu ikony serwuje konwencja plikowa App
    // Routera: `src/app/favicon.ico` → `/favicon.ico` (16/32/48 px, ~15 KiB).
    // Gdy pojawi się zestaw ikon marki (`src/app/icon.png`, `src/app/apple-icon.png`),
    // Next doda je automatycznie — nadal bez wpisu w `metadata.icons`.
    verification: {
        // Dodaj swoje kody weryfikacji Google Search Console i Bing Webmaster Tools:
        // google: "TWÓJ_KOD_GOOGLE",
        // other: { "msvalidate.01": "TWÓJ_KOD_BING" },
    },
    category: "electronics",
    creator: "EBE POWER",
    publisher: "ebe power",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const webSiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ebe power",
        alternateName: "EBE POWER",
        url: "https://sklep.ebe-power.pl",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: "https://sklep.ebe-power.pl/?kategoria={search_term_string}",
            },
            "query-input": "required name=search_term_string",
        },
    };

    const localBusinessJsonLd = {
        "@context": "https://schema.org",
        "@type": "ElectricalStore",
        "@id": "https://sklep.ebe-power.pl/#organization",
        name: "ebe power",
        alternateName: "EBE POWER",
        url: "https://sklep.ebe-power.pl",
        logo: BRAND_LOGO_URL,
        image: BRAND_LOGO_URL,
        email: "kontakt@ebe-power.pl",
        telephone: "+48 88888 32 32",
        address: {
            "@type": "PostalAddress",
            streetAddress: "Borki 10",
            postalCode: "97-400",
            addressLocality: "Bełchatów",
            addressRegion: "łódzkie",
            addressCountry: "PL",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: 51.3614,
            longitude: 19.3567,
        },
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "16:00",
        },
        priceRange: "$$",
        sameAs: [],
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Osprzęt elektryczny",
            itemListElement: [
                { "@type": "OfferCatalog", name: "Transformatory" },
                { "@type": "OfferCatalog", name: "Zasilacze" },
                { "@type": "OfferCatalog", name: "Rozdzielnice i zabezpieczenia" },
                { "@type": "OfferCatalog", name: "Agregaty prądotwórcze" },
                { "@type": "OfferCatalog", name: "Stacje ładowania EV" },
                { "@type": "OfferCatalog", name: "Kable i przewody" },
                { "@type": "OfferCatalog", name: "Akcesoria" },
            ],
        },
    };

    return (
        <html lang="pl" dir="ltr" suppressHydrationWarning>
        <head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
            />
            {/* Bootstrap motywu przed pierwszym renderem (bez błysku białego tła).
                Zwykły inline <script> zamiast `next/script` z `strategy="beforeInteractive"`:
                efekt w HTML-u jest identyczny (skrypt i tak lądował inline w <head>),
                a nie ciągniemy na każdą podstronę runtime'u `next/script`
                (~24 KB niekompilowanego JS-u / ~7 KB po gzipie, osobny chunk).
                CSP w next.config.ts dopuszcza 'unsafe-inline' dla script-src. */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s|| (m?'dark':'light');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`,
                }}
            />
        </head>
        <body className="bg-black antialiased">
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black"
                    >
                        Przejdź do treści
                    </a>
                    <TopBar/>
                    <ProductionAlert/>
                    <Navbar/>
                    <div id="main-content">
                        {children}
                    </div>
                    <CartDrawer/>
                </CartProvider>
            </AuthProvider>
            <Footer/>
        </ThemeProvider>
        </body>
        </html>
    );
}
