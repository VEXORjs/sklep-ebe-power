import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Ochrona panelu administratora (/admin/**) oraz stron konta (/profile/**).
 *
 * /admin:
 *  - brak sesji          → /admin/login?callbackUrl=...
 *  - sesja bez roli ADMIN → /admin/login?error=forbidden (z możliwością
 *    wylogowania i zalogowania się na konto administratora)
 *
 * /profile:
 *  - brak sesji → /auth/signin?callbackUrl=... (zwykłe logowanie klienta)
 *
 * Sama strona /admin/login jest celowo poza ochroną, żeby nie utworzyć pętli
 * przekierowań.
 */
export default async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // Strona logowania do panelu — zawsze dostępna
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
    const isProfileArea = pathname.startsWith("/profile");

    if (!isAdminArea && !isProfileArea) {
        return NextResponse.next();
    }

    let token = null;
    try {
        token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    } catch (error) {
        console.error("[middleware] Nie udało się zweryfikować sesji:", error);
    }

    const callbackUrl = `${pathname}${search || ""}`;

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = isAdminArea ? "/admin/login" : "/auth/signin";
        url.search = `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        return NextResponse.redirect(url);
    }

    if (isAdminArea && token.role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        url.search = `?error=forbidden&callbackUrl=${encodeURIComponent(callbackUrl)}`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin", "/admin/:path*", "/profile/:path*"],
};
