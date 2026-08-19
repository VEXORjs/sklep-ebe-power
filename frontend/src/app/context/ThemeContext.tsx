'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('theme') as Theme | null;
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
            // Szanujemy zapisany wybór, inaczej systemową preferencję
            setThemeState(initial);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(initial);
            (document.documentElement as HTMLElement).style.colorScheme = initial;
        } catch {
            // ignore
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        try {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
            (document.documentElement as HTMLElement).style.colorScheme = theme;
            localStorage.setItem('theme', theme);
        } catch {
            // ignore
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setTheme = (t: Theme) => setThemeState(t);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
