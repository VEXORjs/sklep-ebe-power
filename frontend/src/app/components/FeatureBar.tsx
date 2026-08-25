import React from "react";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const features = [
    {
        icon: Truck,
        title: "Dostawa w 24 h",
        subtitle: "Wysyłka tego samego dnia",
    },
    {
        icon: RotateCcw,
        title: "Zwroty do 14 dni",
        subtitle: "Bez podawania przyczyny",
    },
    {
        icon: Headphones,
        title: "Wsparcie techniczne",
        subtitle: "Inżynierowie na infolinii",
    },
    {
        icon: ShieldCheck,
        title: "Oryginalne produkty",
        subtitle: "Gwarancja producenta",
    },
];

export default function TrustBar() {
    return (
        <section className="w-full border-b border-neutral-800 bg-[#0d0f10] py-6">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:gap-8 lg:px-8 xl:gap-12">
                {features.map((item) => (
                    <div
                        key={item.title}
                        className="flex items-center gap-3 justify-start md:justify-center"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                            <item.icon className="h-5 w-5 stroke-[1.5]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-wide text-white sm:text-sm xl:text-base">
                                {item.title}
                            </p>
                            <p className="text-[10px] text-neutral-500 sm:text-xs xl:text-sm">{item.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
