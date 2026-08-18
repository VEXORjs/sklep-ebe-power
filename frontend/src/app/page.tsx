import { Product } from "./types/product";
import AddToCartButton from "@/app/components/AddToCart";
import Link from "next/link";
import PromoBanner from "@/app/components/PromoBanner";
import ServicesBanner from "@/app/components/ServicesBanner";
import TrustBar from "@/app/components/FeatureBar";
import {getProducts} from "@/app/services/productService";
import BuyNowButton from "@/app/components/BuyNowButton";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sklep EBE power | Transformatory i Osprzęt Elektryczny",
    description: "Kup profesjonalne transformatory i podzespoły z szybką dostawą. Sprawdź naszą ofertę!",
};

export const dynamic = 'force-dynamic';

const API_URL = process.env.API_URL || 'http://localhost:3001' || 'http://localhost:3000';

export default async function HomePage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-10">
                <h1 className="text-4xl font-extrabold tracking-tight mb-8 border-b border-neutral-800 pb-4">
                    Nasz Sklep ⚡
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="bg-[#1a1c1e] border border-neutral-800 rounded-lg flex flex-col overflow-hidden group hover:border-neutral-700 transition-all duration-300 shadow-lg"
                        >

                                <div className="relative aspect-[3/2] w-full bg-white flex items-center justify-center p-4 overflow-hidden">
                                    <Link href={`/products/${product.id}`}>
                                    {product.images && product.images.length > 0 && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            priority={index === 0 || index === 1}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover"
                                        />
                                    )}
                                    </Link>

                                    <Link
                                        href={`/products/${product.id}`}
                                        className="absolute top-4 right-4 z-10 bg-[#0a1128] hover:bg-[#101f42] text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 shadow-md group-hover:scale-110 transform"
                                    >
                                        <span className="text-xl font-light">➜</span>
                                    </Link>
                                </div>

                            <div className="p-6 flex flex-col flex-grow bg-[#1a1c1e]">

                                <Link href={`/products/${product.id}`} className="block mb-6 flex-grow">
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider leading-tight hover:text-emerald-400 transition-colors">
                                        {product.name}
                                    </h2>
                                </Link>

                                <div className="border-t border-neutral-800 pt-5 mt-auto">
                                    <div className="flex flex-col mb-4">
                                        <span className="text-3xl font-extrabold text-white">
            {(product.price * 1.23).toFixed(2).replace('.', ',')} zł
            <span className="text-xs font-normal text-neutral-400 ml-2">zawiera podatek VAT</span>
          </span>

                                        <span className="text-sm font-medium text-neutral-500 mt-1">
            {product.price.toFixed(2).replace('.', ',')} zł + VAT
          </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
          <span className={`text-sm font-bold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
            {product.stock > 0 ? "Dostępny" : "Niedostępny"}
          </span>
                                        <div className="flex items-center gap-2">
                                        <div className="transform hover:scale-110 transition-transform duration-300">
                                            <AddToCartButton
                                                product={product}
                                            />
                                        </div>
                                        <div className="transform hover:scale-110 transition-transform duration-300">
                                        <BuyNowButton
                                                product={product}
                                            />
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <PromoBanner />
                <TrustBar />
                <ServicesBanner />
            </div>
        </main>
    );
}