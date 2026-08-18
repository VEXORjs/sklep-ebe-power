import {notFound} from "next/navigation";
import ProductGallery from "@/app/components/ProductGallery";
import Link from "next/link";
import { DEMO_PRODUCTS } from "@/app/data/demoProducts";
import { parseParameters } from "@/app/lib/product";
import { categorySlugOf } from "@/app/data/categories";

interface PageProps {
    params: Promise<{id: string}>;
}

const API_URL = process.env.API_URL || "http://localhost:8080";

async function getProduct(id: string) {
    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'GET',
            headers: {"Content-Type": "application/json"},
            cache: "no-store",
            signal: AbortSignal.timeout(3000),
        });

        if (!res.ok) {
            throw new Error(`Backend zwrócił kod: ${res.status}`);
        }
        return res.json();
    } catch (error) {
        console.warn(
            "⚠️ Backend niedostępny — podgląd produktu z danych demonstracyjnych.",
            error
        );
        return DEMO_PRODUCTS.find((p) => p.id === Number(id)) ?? null;
    }
}

export default async function ProductPage({params} : PageProps) {
    const { id } =  await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const specs = parseParameters(product.parameters);
    const categorySlug = categorySlugOf(product);

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-4xl mx-auto bg-neutral-900 border border-neutral-800 rounded-lg p-8">
                <Link
                    href="/"
                    className="absolute top-0.5 left-0.5 z-10 bg-[#0a1128] hover:bg-[#101f42] text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 shadow-md hover:scale-110 transform"
                >
                    <span className="text-xl font-light">🡐</span>
                </Link>
                {/* Okruszki */}
                <nav aria-label="Okruszki" className="mb-4 ml-12 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                    <Link href="/" className="transition-colors hover:text-emerald-400">Strona główna</Link>
                    <span>/</span>
                    <Link href="/kategoria" className="transition-colors hover:text-emerald-400">Kategorie</Link>
                    {product.category && categorySlug && (
                        <>
                            <span>/</span>
                            <Link href={`/kategoria/${categorySlug}`} className="transition-colors hover:text-emerald-400">
                                {product.category}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Nazwa i Cena */}
                <h1 className="text-3xl font-extrabold mb-2">{product.name}</h1>
                <p className="text-2xl font-semibold text-emerald-400 mb-6">{product.price.toFixed(2)} PLN</p>

                {/* Galeria zdjęć */}
               <ProductGallery product={product}
               />

                {/* Opis produktu */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-3">Opis produktu 📜</h2>
                    <p className="text-neutral-300 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>

                {/* Parametry techniczne */}
                {specs.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-3">Parametry techniczne ⚙️</h2>
                        <div className="border border-neutral-800 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-800">
                                <tbody className="divide-y divide-neutral-800 bg-neutral-950">
                                {specs.map((spec) => (
                                    <tr key={`${spec.label}-${spec.value}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-400 border-r border-neutral-800">{spec.label}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-200">{spec.value}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}