import { Suspense } from "react";
import { getProducts } from "@/app/services/productService";
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";
import ShopSection from "@/app/components/ShopSection";
import BrandMarquee from "@/app/components/BrandMarquee";
import TrustBar from "@/app/components/FeatureBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "TRAFO ENERGIA | Transformatory, rozdzielnice i osprzęt elektryczny",
    description:
        "Sklep z transformatorami, zasilaczami, rozdzielnicami, kablami i osprzętem elektrycznym. Darmowa dostawa od 500 zł, wysyłka w 24 h.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const products = await getProducts();

    // Produkt promocyjny trafia do sekcji „Oferta tygodnia"
    const featured =
        products.find((p) => p.badge === "Promocja") ??
        products.find((p) => p.oldPrice != null) ??
        products[0] ??
        null;

    return (
        <main className="min-h-screen bg-black text-white">
            {featured && <Hero product={featured} />}
            <CategoryGrid products={products} />
            <Suspense fallback={null}>
                <ShopSection products={products} />
            </Suspense>
            <BrandMarquee />
            <TrustBar />
        </main>
    );
}
