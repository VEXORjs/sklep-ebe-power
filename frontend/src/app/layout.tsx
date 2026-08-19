// app/layout.tsx
import { CartProvider } from '@/app/context/CartContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import AuthProvider from "@/app/components/AuthProvider";
import './globals.css';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TopBar from "@/app/components/TopBar";
import CartDrawer from "@/app/components/CartDrawer";

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
        <body className="bg-black antialiased transition-colors">
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