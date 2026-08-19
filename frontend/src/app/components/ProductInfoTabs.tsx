'use client';

import { useState } from "react";
import { Check, Star } from "lucide-react";

import type { ReviewEntry, SpecEntry } from "@/app/lib/product";
import { formatPLN, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/app/lib/product";

type TabId = "opis" | "spec" | "dostawa" | "opinie";

interface ProductInfoTabsProps {
    description: string;
    specs: SpecEntry[];
    reviews: ReviewEntry[];
    reviewCount: number;
    rating: number;
}

const TABS: { id: TabId; label: string }[] = [
    { id: "opis", label: "Opis" },
    { id: "spec", label: "Specyfikacja" },
    { id: "dostawa", label: "Dostawa i płatność" },
    { id: "opinie", label: "Opinie" },
];

export default function ProductInfoTabs({
    description,
    specs,
    reviews,
    reviewCount,
    rating,
}: ProductInfoTabsProps) {
    const [tab, setTab] = useState<TabId>("opis");

    return (
        <section className="overflow-hidden rounded-xl border border-neutral-800 bg-[#141618]">
            <div className="flex flex-wrap gap-1 border-b border-neutral-800 p-2" role="tablist">
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.id}
                        onClick={() => setTab(item.id)}
                        className={`rounded-md px-4 py-2.5 text-sm font-bold transition-colors ${
                            tab === item.id
                                ? "bg-emerald-500 text-slate-950"
                                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                        }`}
                    >
                        {item.label}
                        {item.id === "opinie" ? ` (${reviewCount})` : ""}
                    </button>
                ))}
            </div>

            <div className="p-6 sm:p-8">
                {tab === "opis" && (
                    <div className="max-w-3xl space-y-4">
                        <h2 className="text-lg font-extrabold text-white">Opis produktu</h2>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-300">
                            {description || "Szczegółowy opis pojawi się wkrótce."}
                        </p>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {[
                                "Karta katalogowa i deklaracja zgodności w paczce",
                                "Wsparcie techniczne przed i po zakupie",
                                "Faktura VAT 23% wystawiana automatycznie",
                                "Gwarancja 24 miesiące, serwis we własnym warsztacie",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-sm text-neutral-300">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {tab === "spec" && (
                    <div>
                        <h2 className="mb-4 text-lg font-extrabold text-white">Parametry techniczne</h2>
                        {specs.length === 0 ? (
                            <p className="text-sm text-neutral-400">
                                Specyfikacja tego modelu jest dostępna na zapytanie u doradcy.
                            </p>
                        ) : (
                            <div className="overflow-hidden rounded-lg border border-neutral-800">
                                <table className="min-w-full divide-y divide-neutral-800">
                                    <tbody className="divide-y divide-neutral-800">
                                        {specs.map((spec, index) => (
                                            <tr
                                                key={`${spec.label}-${spec.value}`}
                                                className={index % 2 === 0 ? "bg-[#101214]" : "bg-[#16181a]"}
                                            >
                                                <th className="w-1/3 px-5 py-3 text-left text-sm font-medium text-neutral-400">
                                                    {spec.label}
                                                </th>
                                                <td className="px-5 py-3 text-sm font-semibold text-neutral-100">
                                                    {spec.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {tab === "dostawa" && (
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-3 text-lg font-extrabold text-white">Dostawa</h2>
                            <ul className="space-y-3 text-sm text-neutral-300">
                                <li className="rounded-lg border border-neutral-800 bg-[#101214] p-4">
                                    <p className="font-bold text-white">Kurier DPD / InPost</p>
                                    <p className="mt-1 text-neutral-400">
                                        {formatPLN(SHIPPING_COST)} — darmowa od {formatPLN(FREE_SHIPPING_THRESHOLD)} brutto.
                                        Zamówienia do 14:00 wysyłamy tego samego dnia roboczego.
                                    </p>
                                </li>
                                <li className="rounded-lg border border-neutral-800 bg-[#101214] p-4">
                                    <p className="font-bold text-white">Odbiór osobisty</p>
                                    <p className="mt-1 text-neutral-400">
                                        Borki 10, 97-400 Bełchatów · Pn–Pt 8:00–16:00. Zamówienie odłożymy na magazynie.
                                    </p>
                                </li>
                                <li className="rounded-lg border border-neutral-800 bg-[#101214] p-4">
                                    <p className="font-bold text-white">30 dni na zwrot</p>
                                    <p className="mt-1 text-neutral-400">
                                        Nieuruchomiony towar zwracasz bez podawania przyczyny. Reklamacje serwisujemy u nas.
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-3 text-lg font-extrabold text-white">Płatność</h2>
                            <ul className="space-y-3 text-sm text-neutral-300">
                                <li className="rounded-lg border border-neutral-800 bg-[#101214] p-4">
                                    <p className="font-bold text-white">Stripe — karta, BLIK, Apple Pay</p>
                                    <p className="mt-1 text-neutral-400">
                                        Płatność szyfrowana, 3-D Secure. Kwota pobierana jest brutto, z VAT 23%.
                                    </p>
                                </li>
                                <li className="rounded-lg border border-neutral-800 bg-[#101214] p-4">
                                    <p className="font-bold text-white">Faktura VAT</p>
                                    <p className="mt-1 text-neutral-400">
                                        Wystawiamy automatycznie po zaksięgowaniu płatności. Dane firmy podajesz w kasie.
                                    </p>
                                </li>
                                <li className="rounded-lg border border-neutral-800 bg-[#101214] p-4">
                                    <p className="font-bold text-white">Raty 0%</p>
                                    <p className="mt-1 text-neutral-400">
                                        Przy zakupie przez kasę możesz rozłożyć płatność na 12 rat 0% (oferta informacyjna).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {tab === "opinie" && (
                    <div>
                        <div className="mb-6 flex flex-wrap items-end gap-4">
                            <div>
                                <p className="text-3xl font-extrabold text-white">{rating.toFixed(1)}</p>
                                <div className="mt-1 flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                                i < Math.round(rating)
                                                    ? "fill-emerald-400 text-emerald-400"
                                                    : "text-neutral-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400">
                                Średnia z {reviewCount} opinii zweryfikowanych kupujących.
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {reviews.map((review) => (
                                <li
                                    key={`${review.author}-${review.date}`}
                                    className="rounded-lg border border-neutral-800 bg-[#101214] p-4"
                                >
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{review.author}</span>
                                            {review.verified && (
                                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                                                    Zakup potwierdzony
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-neutral-500">{review.date}</span>
                                    </div>
                                    <div className="mb-2 flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3.5 w-3.5 ${
                                                    i < review.rating
                                                        ? "fill-emerald-400 text-emerald-400"
                                                        : "text-neutral-700"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm leading-relaxed text-neutral-300">{review.text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
