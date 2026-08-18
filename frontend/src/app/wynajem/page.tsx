import React from 'react';
import RentalStats from "@/app/components/RentalStats";

export default function RentalPage() {
    return (
        <main className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* 🏷️ Nagłówek strony */}
                <div className="border-b border-neutral-800 pb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Zasilanie tymczasowe i awaryjne
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
                        Wynajem transformatorów i stacji ⚡
                    </h1>
                    <p className="text-neutral-400 mt-4 max-w-3xl text-sm sm:text-base leading-relaxed">
                        Oferujemy elastyczny wynajem transformatorów olejowych i suchych oraz kompletnych stacji kontenerowych. Zapewniamy natychmiastową dostępność, transport HDS, profesjonalny montaż oraz pełne wsparcie techniczne 24/7.
                    </p>
                </div>

                {/* 📊 Komponent statystyk wynajmu */}
                <RentalStats />

            </div>
        </main>
    );
}