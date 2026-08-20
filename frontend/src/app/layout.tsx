// app/layout.tsx
import type { Metadata } from "next";
import { CartProvider } from '@/app/context/CartContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import AuthProvider from "@/app/components/AuthProvider";
import './globals.css';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TopBar from "@/app/components/TopBar";
import CartDrawer from "@/app/components/CartDrawer";

export const metadata: Metadata = {
    metadataBase: new URL("https://ebe-power.pl"),
    title: {
        default: "TRAFO ENERGIA | Transformatory, rozdzielnice i osprzęt elektryczny",
        template: "%s",
    },
    description:
        "Sklep z transformatorami, zasilaczami, rozdzielnicami, kablami i osprzętem elektrycznym. Darmowa dostawa od 500 zł, wysyłka w 24 h.",
    robots: { index: true, follow: true },
    openGraph: {
        type: "website",
        locale: "pl_PL",
        siteName: "TRAFO ENERGIA",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl" suppressHydrationWarning>
        <head>
            <script
                dangerouslySetInnerHTML={{
                    __html: `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s|| (m?'dark':'light');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`,
                }}
            />
        </head>
        <body className="bg-black antialiased">
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <TopBar/>
                    <Navbar/>
                    {children}
                    <CartDrawer/>
                </CartProvider>
            </AuthProvider>
            <Footer/>
        </ThemeProvider>
        </body>
        </html>
    );
}