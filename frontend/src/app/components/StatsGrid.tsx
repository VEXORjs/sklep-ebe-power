import React from 'react';

// Typ pojedynczego kafelka
export interface StatItem {
    value: string;
    label: string;
    description: string;
}

// Właściwości całego komponentu
interface StatsGridProps {
    badge: string;
    heading: string;
    items: StatItem[];
}

export default function StatsGrid({ badge, heading, items }: StatsGridProps) {
    return (
        <section className="py-12 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 🏷️ Nagłówek sekcji */}
                <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
            {badge}
          </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {heading}
                    </h2>
                </div>

                {/* 📊 Dynamiczna siatka kafelków */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-[#141618] border border-neutral-800 rounded-lg p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 shadow-md"
                        >
                            <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 block mb-3">
                  {item.value}
                </span>
                                <h3 className="text-base font-bold text-white mb-2">
                                    {item.label}
                                </h3>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}