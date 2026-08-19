import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { safeCallbackUrl } from "@/app/lib/auth-redirect";

const API_URL = process.env.API_URL || "http://localhost:8080";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Logowanie",
            credentials: {
                email: { label: "Email", type: "email"},
                password: { label: "Hasło", type: "password" }
            },
            async authorize(credentials) {
               if (!credentials?.email || !credentials?.password){
                   return null;
               }

               try {
                   const res = await fetch(`${API_URL}/api/auth/login`, {
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

                   const user = await res.json();

                   if (user) {
                       return user;
                   }

                   return null;
               }
               catch (error) {
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
        async jwt({ token, user}) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.springToken = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token){
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
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

            // Jeśli loguje się przez Google lub cos innego
            if (account?.provider === "google") {
                try {
                    // Strzał do Twojego kontrolera rejestracji/OAuth w Spring Boocie
                    const response = await fetch(`${API_URL}/api/auth/oauth-success`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            provider: account.provider,
                            providerId: user.id
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        user.id = data.id;
                        user.token = data.token; // Zakładam, że Twój endpoint ze Springa zwraca też wygenerowany token JWT dla tego użytkownika
                        return true;
                    }

                    return false; // Jeśli backend Javy zwróci błąd, odrzuć logowanie
                } catch (error) {
                    console.error("Błąd synchronizacji OAuth ze Spring Bootem:", error);
                    return false;
                }
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
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };