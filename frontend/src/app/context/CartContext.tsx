// context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartDto } from "@/app/types/cart";
import { useSession } from "next-auth/react";
import { Product } from "@/app/types/product";

import { getPublicApiUrl } from "@/app/lib/api";

const API_URL = getPublicApiUrl();
const API_BASE_URL = `${API_URL}/api/cart`;

interface CartContextType {
    cart: CartDto | null;
    loading: boolean;
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    setFirstStartup: (enabled: boolean) => void;
    refreshCart: () => Promise<void>;
    clearCart: (id: string) => Promise<void>;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const {data: session, status} = useSession();
    const [cart, setCart] = useState<CartDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

    const userId = session?.user ? (session.user).id : null;
    const token = session?.accessToken;

    // Pobieranie koszyka z backend
    const refreshCart = async () => {
        if (!userId) {
           const guestCart = localStorage.getItem("guest_cart");

           if (guestCart) {
               const parsedCart = JSON.parse(guestCart);
               setCart(parsedCart);
           }
           else {
               setCart(null);
           }
           setLoading(false);
           return;
        }
        else {
            try {
                const res = await fetch(`${API_BASE_URL}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error(`Backend zwrócił kod błędu: ${res.status} ${res.statusText}`);
                const data: CartDto = await res.json();
                const stored = localStorage.getItem(`first_startup_${userId}`);
                setCart({ ...data, firstStartup: stored === "1" || data.firstStartup });
            } catch (error) {
                console.error("Szczegółowy błąd pobierania koszyka z sieci:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const clearCart = async (id: string) => {
        if (!id || id === "guest") {
            try {
                localStorage.removeItem("guest_cart");
            } catch (error) {
                console.warn("Nie udało się wyczyścić koszyka gościa:", error);
            }
            setCart(null);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/${id}/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token ?? id}`
                }
            });
            if (!res.ok) {
                throw new Error('Błąd podczas czyszczenia koszyka');
            }
            const updatedCart: CartDto = await res.json();
            setCart(updatedCart);
        }
        catch (error) {
            console.error("Nie udało się wyczyścić koszyka:", error);
        }
    };

    useEffect(() => {
        if(status === 'loading') {
            return;
        }
        if (userId) {
            let isMounted = true;

            const fetchCart = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error(`Błąd: ${res.status}`);
                    const data: CartDto = await res.json();
                    const stored = localStorage.getItem(`first_startup_${userId}`);
                    if (isMounted) setCart({ ...data, firstStartup: stored === "1" || data.firstStartup });
                } catch (error) {
                    console.error("Błąd pobierania koszyka:", error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            };

            void fetchCart();

            return () => {
                isMounted = false;
            };
        }
        else {
            const loadGuestCart = async () => {
                const guestCart = localStorage.getItem("guest_cart");
                if (guestCart) {
                    try {
                        const parsedCart: CartDto = JSON.parse(guestCart);
                        setCart(parsedCart);
                    } catch (error) {
                        console.error("Błąd parsowania koszyka gościa:", error);
                        localStorage.removeItem("guest_cart");
                        setCart(null);
                    }
                } else {
                    setCart(null);
                }
                setLoading(false);
            }
        void loadGuestCart();
        }
    }, [userId, status, token]);

    // Dodawanie produktu do koszyka (POST)
    const addToCart = async (product: Product, quantity: number = 1) => {
        if (!userId) {
            const currentItems = cart?.items ? [...cart?.items] : [];

            const existingIndex = currentItems.findIndex((i) => i.productId === product.id);

            if (existingIndex > -1) {
                currentItems[existingIndex].quantity += quantity;
                currentItems[existingIndex].totalPrice = currentItems[existingIndex].quantity * currentItems[existingIndex].productPrice;
            }
            else {
                currentItems.push({
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price,
                    quantity: quantity,
                    totalPrice: product.price * quantity,
                });
            }
            const newTotal = currentItems.reduce((total, item) => total + item.totalPrice, 0);

            const updatedCart: CartDto = {
                userId: 'guest',
                items: currentItems,
                cartTotal: newTotal,
                firstStartup: cart?.firstStartup ?? false,
            };

            setCart(updatedCart);

            localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
        }
        else {
            try {
                const res = await fetch(`${API_BASE_URL}/${userId}/add?productId=${product.id}&quantity=${quantity}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Błąd podczas dodawania do koszyka');
                const updatedCart: CartDto = await res.json();
                setCart({ ...updatedCart, firstStartup: cart?.firstStartup ?? false });
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Usuwanie produktu z koszyka (DELETE)
    const removeFromCart = async (productId: number) => {
        if (!userId) {
            const currentItems = cart?.items ? [...cart?.items] : [];

            const updatedItems = currentItems.filter((i) => i.productId !== productId);

            const newTotal = updatedItems.reduce((total, item) => total + item.totalPrice, 0);


            const updatedCart: CartDto = {
                userId: 'guest',
                items: updatedItems,
                cartTotal: newTotal,
                firstStartup: cart?.firstStartup ?? false,
            };

            setCart(updatedCart);

            localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
            return;
        }
        else {
            try {
                const res = await fetch(`${API_BASE_URL}/${userId}/remove/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Błąd podczas usuwania z koszyka');
                const updatedCart: CartDto = await res.json();
                setCart({ ...updatedCart, firstStartup: cart?.firstStartup ?? false });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const persistGuest = (next: CartDto) => {
        setCart(next);
        localStorage.setItem("guest_cart", JSON.stringify(next));
    };

    const updateQuantity = async (productId: number, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }
        if (!userId) {
            const currentItems = cart?.items ? [...cart.items] : [];
            const existingIndex = currentItems.findIndex((i) => i.productId === productId);
            if (existingIndex === -1) return;
            currentItems[existingIndex] = {
                ...currentItems[existingIndex],
                quantity,
                totalPrice: quantity * currentItems[existingIndex].productPrice,
            };
            persistGuest({
                userId: 'guest',
                items: currentItems,
                cartTotal: currentItems.reduce((total, item) => total + item.totalPrice, 0),
                firstStartup: cart?.firstStartup ?? false,
            });
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/${userId}/item/${productId}?quantity=${quantity}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Błąd podczas aktualizacji ilości');
            const updatedCart: CartDto = await res.json();
            setCart({ ...updatedCart, firstStartup: cart?.firstStartup ?? false });
        } catch (error) {
            console.error(error);
        }
    };

    const setFirstStartup = (enabled: boolean) => {
        const base: CartDto = cart ?? { userId: userId ?? 'guest', items: [], cartTotal: 0 };
        const next = { ...base, firstStartup: enabled };
        setCart(next);
        if (!userId) {
            localStorage.setItem("guest_cart", JSON.stringify(next));
        } else {
            try {
                localStorage.setItem(`first_startup_${userId}`, enabled ? "1" : "0");
            } catch {
                /* ignore */
            }
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading: loading || status === 'loading', addToCart, removeFromCart, updateQuantity, setFirstStartup, refreshCart, clearCart, isCartOpen, openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false) }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}