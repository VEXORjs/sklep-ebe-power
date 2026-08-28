'use client';

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ebe_power_wishlist";
const SYNC_EVENT = "ebe_power:wishlist-change";
const EMPTY: number[] = [];

let snapshot: number[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function readStorage(): number[] {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : EMPTY;
    } catch (error) {
        console.warn("Nie udało się odczytać listy życzeń:", error);
        return EMPTY;
    }
}

function emit() {
    listeners.forEach((listener) => listener());
}

function refresh() {
    snapshot = readStorage();
    hydrated = true;
    emit();
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    const onSync = () => refresh();
    const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) refresh();
    };

    window.addEventListener(SYNC_EVENT, onSync);
    window.addEventListener("storage", onStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener(SYNC_EVENT, onSync);
        window.removeEventListener("storage", onStorage);
    };
}

/** Snapshot musi zwracać stabilną referencję — inaczej React wpadnie w pętlę renderów. */
function getSnapshot(): number[] {
    if (!hydrated) {
        snapshot = readStorage();
        hydrated = true;
    }
    return snapshot;
}

function getServerSnapshot(): number[] {
    return EMPTY;
}

/**
 * Lista życzeń trzymana w localStorage i synchronizowana pomiędzy wszystkimi
 * kartami produktu na stronie (oraz między zakładkami przeglądarki).
 */
export function useWishlist() {
    const wishlist = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const toggle = useCallback((id: number) => {
        const current = readStorage();
        const next = current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id];

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
            console.warn("Nie udało się zapisać listy życzeń:", error);
        }

        snapshot = next;
        hydrated = true;
        emit();
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    }, []);

    const isWishlisted = useCallback((id: number) => wishlist.includes(id), [wishlist]);

    return { wishlist, toggle, isWishlisted };
}
