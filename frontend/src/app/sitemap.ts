import type { MetadataRoute } from "next";
import { getProducts } from "@/app/services/productService";
import { allCategories } from "@/app/data/categories";
import { getSiteUrl } from "@/app/lib/site";

export const revalidate = 3600; // rewalidacja co godzinę

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = getSiteUrl();
    const products = await getProducts();
    const categories = allCategories(products);
    const now = new Date();

    // Strony statyczne z odpowiednią priorytetyzacją
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${base}/`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${base}/kategoria`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${base}/serwis`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${base}/wynajem`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${base}/dostawa`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${base}/zwroty`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${base}/regulamin`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${base}/polityka-prywatnosci`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    // Strony kategorii — wysoki priorytet
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${base}/kategoria/${category.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
    }));

    // Strony podkategorii — precyzyjne landing pages dla katalogu
    const subcategoryRoutes: MetadataRoute.Sitemap = categories.flatMap((category) =>
        (category.subcategories ?? []).map((subcategory) => ({
            url: `${base}/kategoria/${category.slug}/${subcategory.slug}`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.8,
        }))
    );

    // Strony produktów — średnio-wysoki priorytet
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${base}/products/${product.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...subcategoryRoutes, ...productRoutes];
}
