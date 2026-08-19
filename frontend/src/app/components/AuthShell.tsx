import { BadgeCheck, ShieldCheck, Truck, Zap } from "lucide-react";

const PERKS = [
    { icon: Truck, text: "Wysyłka w 24 h z magazynu w Bełchatowie" },
    { icon: ShieldCheck, text: "24 miesiące gwarancji i serwis własny" },
    { icon: BadgeCheck, text: "Faktura VAT 23% do każdego zamówienia" },
];

interface AuthShellProps {
    eyebrow: string;
    headline: string;
    description: string;
    children: React.ReactNode;
}

export default function AuthShell({
    eyebrow,
    headline,
    description,
    children,
}: AuthShellProps) {
    return (
        <main className="relative overflow-hidden bg-black text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-40 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-emerald-600/10 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="relative mx-auto grid min-h-[calc(100vh-220px)] w-full max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
                <div className="space-y-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        <Zap className="h-3.5 w-3.5" />
                        {eyebrow}
                    </span>
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                        {headline}
                    </h1>
                    <p className="max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
                        {description}
                    </p>
                    <ul className="space-y-3 pt-2">
                        {PERKS.map((perk) => (
                            <li
                                key={perk.text}
                                className="flex items-start gap-3 text-sm text-neutral-300"
                            >
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                                    <perk.icon className="h-4 w-4 text-emerald-400" />
                                </span>
                                {perk.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-transparent to-emerald-400/10 blur-lg" />
                    <div className="relative rounded-2xl border border-neutral-800 bg-[#101214]/95 p-6 shadow-2xl shadow-black/60 backdrop-blur sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
