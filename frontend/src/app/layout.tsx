// app/layout.tsx
import { CartProvider } from '@/app/context/CartContext';
import AuthProvider from "@/app/components/AuthProvider";
import './globals.css';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl">
        <body className="bg-black antialiased">
        <AuthProvider>
            <CartProvider>
                <Navbar/>
                {children}
            </CartProvider>
        </AuthProvider>
        <Footer/>
        </body>
        </html>
    );
}