'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const { theme, toggleTheme, mounted } = useTheme();

    // Unikamy migotania hydratacji — do czasu mounted pokazujemy placeholder
    if (!mounted) {
        return (
            <button
                aria-label="Przełącz motyw"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 ${className}`}
            >
                <Sun className="h-4 w-4" />
            </button>
        );
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
            title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors ${isDark ? 'border-neutral-800 bg-neutral-900 text-amber-400 hover:bg-neutral-800 hover:text-amber-300' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm'} ${className}`}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
