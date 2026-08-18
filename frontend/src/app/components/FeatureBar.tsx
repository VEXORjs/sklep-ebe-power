import React from 'react';
import { Award, Globe, Headphones, ShieldCheck } from 'lucide-react';

const features = [
    {
        icon: Award,
        title: 'Certyfikat jakości ISO',
    },
    {
        icon: Globe,
        title: 'Szybka wysyłka w Polsce',
    },
    {
        icon: Headphones,
        title: 'Wsparcie i serwis techniczny',
    },
    {
        icon: ShieldCheck,
        title: 'Autoryzowany dystrybutor',
    },
];

export default function TrustBar() {
    return (
        <section className="w-full bg-gradient-to-r from-teal-600 via-teal-800 to-slate-950 py-5 px-4 text-white border-y border-neutral-800">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between">
                {features.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-3 justify-start md:justify-center"
                        >
                            <div className="text-teal-200 shrink-0">
                                <Icon className="w-7 h-7 stroke-[1.5]" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold tracking-wide leading-tight">
                {item.title}
              </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}