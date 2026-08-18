import React from 'react';
import ExperienceStats from "@/app/components/ExperienceCard";

export default function ServicePage() {
    return (
        <main className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* 🏷️ Nagłówek strony */}
                <div className="border-b border-neutral-800 pb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Oferta techniczna
          </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
                        Serwis i konserwacja transformatorów ⚡
                    </h1>
                    <p className="text-neutral-400 mt-4 max-w-3xl text-sm sm:text-base leading-relaxed">
                        Świadczymy kompleksowe usługi diagnostyki, pomiarów oraz przeglądów technicznych urządzeń elektroenergetycznych i stacji transformatorowych.
                    </p>
                </div>

                {/* 📊 Komponent statystyk i certyfikatów */}
                <ExperienceStats />

            </div>
        </main>
    );
}