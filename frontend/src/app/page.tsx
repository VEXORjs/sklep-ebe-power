import PromoBanner from "@/app/components/PromoBanner";
import ServicesBanner from "@/app/components/ServicesBanner";
import TrustBar from "@/app/components/FeatureBar";
import { getProducts } from "@/app/services/productService";
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";
import FeaturedProducts from "@/app/components/FeaturedProducts";
import Testimonials from "@/app/components/Testimonials";
import Newsletter from "@/app/components/Newsletter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sklep EBE power | Transformatory i Osprzęt Elektryczny",
    description:
        "Kup profesjonalne transformatory, agregaty prądotwórcze, stacje ładowania EV i osprzęt z szybką dostawą. Sprawdź naszą ofertę!",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-black text-white">
            <Hero />
            <TrustBar />
            <CategoryGrid />
            <FeaturedProducts products={products} />
            <PromoBanner />
            <Testimonials />
            <ServicesBanner />
            <Newsletter />
        </main>
    );
}
