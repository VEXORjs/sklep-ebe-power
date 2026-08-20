import { Suspense } from "react";
import { getProducts } from "@/app/services/productService";
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";
import ShopSection from "@/app/components/ShopSection";
import BrandMarquee from "@/app/components/BrandMarquee";
import TrustBar from "@/app/components/FeatureBar";
import type { Metadata } from "next";
import { getSiteUrl } from "@/app/lib/site";

export const metadata: Metadata = {
    title: {
        absolute: "ebe power | Transformatory, rozdzielnice i osprzęt elektryczny",
    },
    description:
        "Sklep z transformatorami, zasilaczami, rozdzielnicami, kablami i osprzętem elektrycznym. Darmowa dostawa od 500 zł, wysyłka w 24 h.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "ebe power | Transformatory i osprzęt elektryczny",
        description:
            "Transformatory, zasilacze, rozdzielnice, kable i osprzęt. Darmowa dostawa od 500 zł, wysyłka w 24 h.",
        url: "/",
        siteName: "ebe power",
        locale: "pl_PL",
        type: "website",
    },
};

export const revalidate = 60;

export default async function HomePage() {
    const products = await getProducts();

    // Produkt promocyjny trafia do sekcji „Oferta tygodnia”
    const featured =
        products.find((p) => p.badge === "Promocja") ??
        products.find((p) => p.oldPrice != null) ??
        products[0] ??
        null;

    const site = getSiteUrl();
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ebe power",
        url: site,
        email: "kontakt@ebe-power.pl",
        telephone: "+48 88888 32 32",
        address: {
            "@type": "PostalAddress",
            streetAddress: "Borki 10",
            postalCode: "97-400",
            addressLocality: "Bełchatów",
            addressCountry: "PL",
        },
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {featured && <Hero product={featured} />}
            <CategoryGrid products={products} />
            <Suspense fallback={null}>
                <ShopSection products={products} initialVisible={9} />
            </Suspense>
            <BrandMarquee />
            <TrustBar />
        </main>
    );
}
