import type { MetadataRoute } from "next";
import { getProducts } from "@/app/services/productService";
import { allCategories } from "@/app/data/categories";
import { getSiteUrl } from "@/app/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = getSiteUrl();
    const products = await getProducts();
    const categories = allCategories(products);
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        "",
        "/kategoria",
        "/dostawa",
        "/polityka-prywatnosci",
        "/regulamin",
        "/serwis",
        "/wynajem",
        "/zwroty",
    ].map((path) => ({
        url: `${base}${path || "/"}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.6,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${base}/kategoria/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${base}/products/${product.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
