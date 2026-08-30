"use client";

import dynamic from "next/dynamic";
import { Move3d } from "lucide-react";
import { customerDeliveriesTotal } from "@/app/data/customerLocations";

// MapLibre wymaga WebGL — ładujemy wyłącznie po stronie klienta
const CustomerMap3D = dynamic(() => import("@/app/components/CustomerMap3D"), {
    ssr: false,
    loading: () => (
        <div className="relative h-full w-full bg-neutral-950">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-neutral-400">Ładowanie mapy…</span>
                </div>
            </div>
        </div>
    ),
});

export default function HeroCustomerMap() {
    return (
        // surface-dark — karta mapy celowo zostaje ciemna także w trybie jasnym
        // (mechanizm z globals.css: ciemne „wyspy” UI). Uwaga: reguły light-mode
        // wymagają, by chronione klasy (bg-neutral-950, border-neutral-800…)
        // były na POTOMKACH .surface-dark, nie na tym samym elemencie — dlatego
        // tło siedzi na wewnętrznym divie.
        <section
            aria-label="Mapa lokalizacji klientów"
            className="customer-map surface-dark relative overflow-hidden rounded-xl border border-emerald-500/30 shadow-xl shadow-black/50"
        >
            <div className="bg-neutral-950">
            {/* Nagłówek karty */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-neutral-800 px-4 py-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Nasi klienci
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-neutral-500">
                        Agregaty PRAMAC dostarczone w całej Polsce
                    </p>
                </div>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                    {customerDeliveriesTotal}+ dostaw
                </span>
            </div>

            {/* Mapa 3D */}
            <div className="relative h-[260px] w-full sm:h-[300px] lg:h-[320px]">
                <CustomerMap3D />

                {/* Legenda */}
                <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                    <span className="flex w-fit items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-neutral-300 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-white ring-2 ring-emerald-300/60" />
                        Siedziba — Bełchatów
                    </span>
                    <span className="flex w-fit items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-neutral-300 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Lokalizacje klientów
                    </span>
                </div>

                {/* Podpowiedź interakcji */}
                <div className="pointer-events-none absolute bottom-1 left-1/2 z-10 -translate-x-1/2">
                    <span className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-black/60 px-2.5 py-1 text-[10px] text-neutral-400 backdrop-blur">
                        <Move3d className="h-3 w-3 text-emerald-400" />
                        Mapa 3D — przeciągnij, aby obrócić
                    </span>
                </div>
            </div>
            </div>
        </section>
    );
}
