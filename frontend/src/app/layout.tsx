// app/layout.tsx
import { CartProvider } from '@/app/context/CartContext';
import AuthProvider from "@/app/components/AuthProvider";
import './globals.css';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TopBar from "@/app/components/TopBar";
import CartDrawer from "@/app/components/CartDrawer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl">
        <body className="bg-black antialiased">
        <AuthProvider>
            <CartProvider>
                <TopBar/>
                <Navbar/>
                {children}
                <CartDrawer/>
            </CartProvider>
        </AuthProvider>
        <Footer/>
        </body>
        </html>
    );
}