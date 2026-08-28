import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    compress: true,
    poweredByHeader: false,
    // Trailing slashes — consistent URLs for SEO (no duplicates)
    trailingSlash: false,
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ["lucide-react"],
    },
    images: {
        unoptimized: true,  
        formats: ["image/avif", "image/webp"],
        deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        qualities: [70, 75],
        minimumCacheTTL: 60 * 60 * 24 * 30,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "iyugrhskjjyegxppeqoj.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "unsplash.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    async headers() {
        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://m.stripe.network;
            style-src 'self' 'unsafe-inline';
            img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://unsplash.com;
            font-src 'self' data:;
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
            connect-src 'self' https://api.stripe.com https://m.stripe.network https://*.supabase.co;
        `.replace(/\s{2,}/g, ' ').trim();

        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: cspHeader,
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                ],
            },
            {
                // Cache static assets aggressively
                source: "/_next/static/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                // Cache images
                source: "/_next/image(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=86400, stale-while-revalidate=604800",
                    },
                ],
            },
        ];
    },
    async redirects() {
        return [
            // Redirect trailing slash to non-trailing slash for canonical URLs
            {
                source: "/kategoria/:slug/",
                destination: "/kategoria/:slug",
                permanent: true,
            },
            {
                source: "/products/:id/",
                destination: "/products/:id",
                permanent: true,
            },
            // Stara taksonomia agregatów (jedna kategoria + podkategorie)
            // → nowy podział na 4 kategorie po rodzaju napędu
            {
                source: "/kategoria/agregaty",
                destination: "/kategoria",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/inwerterowe",
                destination: "/kategoria/inwerterowe",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/gazowe",
                destination: "/kategoria/gazowe",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/benzynowe",
                destination: "/kategoria/benzynowe",
                permanent: true,
            },
            {
                source: "/kategoria/agregaty/diesla",
                destination: "/kategoria/diesla",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
