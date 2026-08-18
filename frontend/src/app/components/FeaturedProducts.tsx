import { Product } from "@/app/types/product";
import AddToCartButton from "@/app/components/AddToCart";
import BuyNowButton from "@/app/components/BuyNowButton";
import Link from "next/link";
import Image from "next/image";

interface FeaturedProductsProps {
    products: Product[];
    isFallback?: boolean;
}

export default function FeaturedProducts({ products, isFallback = false }: FeaturedProductsProps) {
    return (
        <section id="produkty" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Nasz sklep
                </span>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                    Bestsellery ⚡
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                    Najczęściej wybierane transformatory, agregaty i osprzęt elektryczny — gotowe do
                    wysyłki w 24 h.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1c1e] shadow-lg transition-all duration-300 group hover:border-neutral-700"
                    >
                        <div className="relative aspect-[3/2] w-full overflow-hidden bg-white p-4">
                            <Link href={`/products/${product.id}`}>
                                {product.images && product.images.length > 0 && (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        priority={index === 0 || index === 1}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                )}
                            </Link>

                            <Link
                                href={`/products/${product.id}`}
                                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#0a1128] text-white shadow-md transition-all duration-300 hover:bg-[#101f42] group-hover:scale-110"
                            >
                                <span className="text-xl font-light">➜</span>
                            </Link>
                        </div>

                        <div className="flex flex-grow flex-col p-6">
                            <Link href={`/products/${product.id}`} className="mb-6 block flex-grow">
                                <h3 className="text-sm font-bold uppercase leading-tight tracking-wider text-white transition-colors hover:text-emerald-400">
                                    {product.name}
                                </h3>
                            </Link>

                            <div className="mt-auto border-t border-neutral-800 pt-5">
                                <div className="mb-4 flex flex-col">
                                    <span className="text-3xl font-extrabold text-white">
                                        {(product.price * 1.23).toFixed(2).replace(".", ",")} zł
                                        <span className="ml-2 text-xs font-normal text-neutral-400">
                                            zawiera podatek VAT
                                        </span>
                                    </span>

                                    <span className="mt-1 text-sm font-medium text-neutral-500">
                                        {product.price.toFixed(2).replace(".", ",")} zł + VAT
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span
                                        className={`text-sm font-bold ${
                                            product.stock > 0 ? "text-emerald-400" : "text-red-500"
                                        }`}
                                    >
                                        {product.stock > 0 ? "Dostępny" : "Niedostępny"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="transform transition-transform duration-300 hover:scale-110">
                                            <AddToCartButton product={product} />
                                        </div>
                                        <div className="transform transition-transform duration-300 hover:scale-110">
                                            <BuyNowButton product={product} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
