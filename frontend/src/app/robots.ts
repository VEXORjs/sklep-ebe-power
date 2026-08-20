import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/app/lib/site";

export default function robots(): MetadataRoute.Robots {
    const base = getSiteUrl();

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/",
                    "/api/",
                    "/checkout",
                    "/checkout/",
                    "/cart",
                    "/cart/",
                    "/auth/",
                    "/completion",
                    "/completion/",
                    "/register",
                    "/register/",
                    "/profile/",
                    "/_next/",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/",
                    "/api/",
                    "/checkout",
                    "/checkout/",
                    "/cart",
                    "/cart/",
                    "/auth/",
                    "/completion",
                    "/completion/",
                    "/register",
                    "/register/",
                    "/profile/",
                ],
            },
            {
                userAgent: "Googlebot-Image",
                allow: "/",
                disallow: ["/admin", "/api/"],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
        host: base,
    };
}
