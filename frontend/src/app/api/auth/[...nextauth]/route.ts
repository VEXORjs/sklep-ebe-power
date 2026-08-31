import NextAuth, { NextAuthOptions } from "next-auth";
import { NextRequest } from "next/server";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { safeCallbackUrl } from "@/app/lib/auth-redirect";
import { getServerApiUrl } from "@/app/lib/api";

/**
 * Adres backendu po stronie serwera.
 * Na Cloud Run zmienna `API_URL` zwykle NIE jest ustawiona — dlatego
 * korzystamy z `getServerApiUrl()`, który sięga też po NEXT_PUBLIC_API_URL
 * (wypaloną w obrazie podczas builda). Dzięki temu Google OAuth może
 * synchronizować użytkownika ze Spring Bootem również w produkcji.
 */
const API_URL = getServerApiUrl();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Logowanie",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Hasło", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Strona logowania administratora (/admin/login) ustawia adminLogin=true —
                // wtedy używamy endpointu /api/auth/admin-login, który oprócz hasła
                // WYMAGA roli ADMIN na koncie (klient sklepu nie wejdzie do panelu).
                const isAdminLogin =
                    (credentials as Record<string, string | undefined>).adminLogin === "true";
                const endpoint = isAdminLogin ? "/api/auth/admin-login" : "/api/auth/login";

                try {
                    const res = await fetch(`${API_URL}${endpoint}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    if (!res.ok) {
                        return null;
                    }

                    const data = await res.json();

                    if (!data?.email) {
                        return null;
                    }

                    return {
                        id: String(data.id),
                        email: data.email,
                        name: data.name,
                        // Backend może zwracać token jako `mockToken` lub `token`
                        token: data.mockToken ?? data.token,
                        role: data.role ?? "USER",
                    };
                } catch (error) {
                    console.error("Błąd podczas logowania", error);
                    return null;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt", // Używamy tokenów JWT, które potem przekażemy do Spring Boota
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.springToken = user.token;
                // Rola z backendu ("USER"/"ADMIN") — warunek dostępu do /admin
                token.role = (user as { role?: string }).role ?? "USER";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                return {
                    ...session,
                    user: {
                        ...session.user,
                        id: token.id as string,
                        role: token.role ?? "USER",
                    },
                    accessToken: token.springToken,
                };
            }
            return session;
        },
        async signIn({ user, account }) {
            // Jeśli loguje się przez tradycyjny formularz, pozwól mu przejść (bo Java już go zweryfikowała)
            if (account?.provider === "credentials") {
                return true;
            }

            // Jeśli loguje się przez Google — synchronizujemy konto ze Spring Bootiem.
            // Google już zweryfikowało tożsamość, więc problem z backendem NIE może
            // blokować logowania (kiedyś kończyło się to błędem AccessDenied).
            if (account?.provider === "google") {
                try {
                    const response = await fetch(`${API_URL}/api/auth/oauth-success`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            provider: account.provider,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.id != null) {
                            user.id = String(data.id);
                        }
                        // Backend zwraca `mockToken` (nie `token`) — akceptujemy oba
                        const backendToken = data.mockToken ?? data.token;
                        if (backendToken) {
                            user.token = backendToken;
                        }
                    } else {
                        console.warn(
                            `OAuth sync odpowiedział kodem ${response.status} — logowanie kontynuowane bez tokenu backendu.`
                        );
                    }
                } catch (error) {
                    console.error(
                        "Błąd synchronizacji OAuth ze Spring Bootem (logowanie kontynuowane):",
                        error
                    );
                }
                return true;
            }

            return true;
        },
        async redirect({ url, baseUrl }) {
            // Zawsze sklejamy bazę z samą ścieżką — nigdy nie puszczamy
            // pełnego URL-a jako ścieżki względnej ("/https://...").
            const path = safeCallbackUrl(url, "/");
            return `${baseUrl.replace(/\/$/, "")}${path}`;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signin",
        // Błędy (np. AccessDenied) trafiają na naszą stronę logowania zamiast
        // na domyślną, brzydką stronę 403 NextAuth.
        error: "/auth/signin",
    },
};

const handler = NextAuth(authOptions);

/**
 * NextAuth v4, gdy dostaje GET /api/auth/signin BEZ callbackUrl, ustawia
 * jako callbackUrl pełny origin strony (np. https://frontend-xyz.run.app)
 * i wstawia go do adresu strony logowania oraz do ciasteczka
 * `__Secure-next-auth.callback-url`. Dodatkowo NextAuth przepuszcza wartość
 * przez callback `redirect`, więc nawet zwykła ścieżka wraca jako pełny URL
 * (`/auth/signin?callbackUrl=https%3A%2F%2F...`).
 *
 * Naprawiamy to na dwóch poziomach:
 *  1. Na wejściu (żądanie): brak callbackUrl -> "/", absolutny URL z naszej
 *     własnej domeny -> sama ścieżka, cokolwiek innego -> "/".
 *  2. Na wyjściu (odpowiedź): Location prowadząca na /auth/signin dostaje
 *     z powrotem samą ścieżkę zamiast pełnego adresu.
 */
function normalizeSigninCallbackUrl(req: NextRequest): NextRequest {
    const url = new URL(req.url);

    // Dotyczy tylko samej strony signin (bez providera, bez callbacka)
    if (url.pathname !== "/api/auth/signin") {
        return req;
    }

    const raw = url.searchParams.get("callbackUrl");
    let callbackUrl = raw;

    if (!callbackUrl) {
        callbackUrl = "/";
    } else {
        try {
            const parsed = new URL(callbackUrl);
            // Pełny adres z naszej własnej domeny zamieniamy na ścieżkę
            if (parsed.origin === url.origin) {
                callbackUrl = `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
            }
        } catch {
            // To nie jest absolutny URL — traktujemy jak ścieżkę i zostawiamy
        }

        if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
            callbackUrl = "/";
        }
    }

    if (callbackUrl !== raw) {
        url.searchParams.set("callbackUrl", callbackUrl);
        // UWAGA: nie klonujemy przez `new NextRequest(url, req)` — w Next 16
        // taki klon ignoruje nowy URL i kopiuje stary. Tworzymy żądanie od
        // zera (dla GET body nie jest potrzebne).
        return new NextRequest(url.toString(), {
            method: req.method,
            headers: req.headers,
        });
    }

    return req;
}

/** Zamienia pełny adres w Location na samą ścieżkę (np. ?callbackUrl=/checkout). */
function sanitizeSigninRedirectLocation(response: Response): Response {
    const location = response.headers.get("Location");
    if (!location) return response;

    let parsed: URL;
    try {
        parsed = new URL(location, "http://localhost");
    } catch {
        return response;
    }

    if (parsed.pathname !== "/auth/signin") return response;

    const raw = parsed.searchParams.get("callbackUrl");
    if (!raw) return response;

    const clean = safeCallbackUrl(raw, "/");
    if (clean === raw) return response;

    parsed.searchParams.set("callbackUrl", clean);
    response.headers.set("Location", `${parsed.pathname}${parsed.search}${parsed.hash}`);
    return response;
}

export async function GET(
    req: NextRequest,
    ctx: { params: Promise<{ nextauth: string[] }> }
) {
    const response = await handler(normalizeSigninCallbackUrl(req), ctx);
    return sanitizeSigninRedirectLocation(response);
}

export const POST = handler;
