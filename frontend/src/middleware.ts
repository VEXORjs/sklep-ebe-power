import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Tutaj możesz dodać własną logikę, jeśli zajdzie potrzeba
        return NextResponse.next();
    },
    {
        callbacks: {
            // Middleware zadziała tylko wtedy, gdy ten warunek zwróci true (czyli gdy istnieje token sesji)
            authorized: ({ token }) => !!token,
        },
        pages: {
            // Jeśli użytkownik jest niezalogowany, przekieruj go tutaj:
            signIn: "/auth/signin",
        },
    }
);

// Definiujemy, które ścieżki mają być chronione przez to middleware
export const config = {
    matcher: ["/profile/:path*"],
};