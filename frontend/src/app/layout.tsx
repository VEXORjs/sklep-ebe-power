// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from 'next/script';
import { CartProvider } from '@/app/context/CartContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import AuthProvider from "@/app/components/AuthProvider";
import './globals.css';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TopBar from "@/app/components/TopBar";
import CartDrawer from "@/app/components/CartDrawer";


const BRAND_LOGO_URL = "https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/EBE_Power_1_upscaled.jpeg";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
        { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL("https://ebe-power.pl"),
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
        "TRAFO ENERGIA",
        "ebe power",
        "agregaty prądotwórcze",
        "stacje ładowania EV",
    ],
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    alternates: {
        canonical: "https://ebe-power.pl",
        languages: { "pl-PL": "https://ebe-power.pl" },
    },
    openGraph: {
        type: "website",
        locale: "pl_PL",
        siteName: "ebe power",
        title: "ebe power — Agregaty prądotwórcze PRAMAC",
        description:
            "Sklep internetowy z agregatami prądotwórczymi PRAMAC do domu, warsztatu i na budowę. Faktura VAT i wsparcie techniczne.",
        url: "https://ebe-power.pl",
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
    icons: {
        icon: [{ url: BRAND_LOGO_URL, type: "image/png" }],
        apple: [{ url: BRAND_LOGO_URL, type: "image/png" }],
        shortcut: [BRAND_LOGO_URL],
    },
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
        alternateName: "TRAFO ENERGIA",
        url: "https://ebe-power.pl",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: "https://ebe-power.pl/?kategoria={search_term_string}",
            },
            "query-input": "required name=search_term_string",
        },
    };

    const localBusinessJsonLd = {
        "@context": "https://schema.org",
        "@type": "ElectricalStore",
        "@id": "https://ebe-power.pl/#organization",
        name: "ebe power — TRAFO ENERGIA",
        alternateName: "TRAFO ENERGIA",
        url: "https://ebe-power.pl",
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
            <Script
                id="theme-script"
                strategy="beforeInteractive"
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
