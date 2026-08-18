import Image from 'next/image';
import ContactForm from './ContactForm';

export default function ContactBanner() {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* ✉️ Sekcja Bezpośredniego Kontaktu (2/3 szerokości) */}
            <div className="lg:col-span-2 rounded-lg bg-gradient-to-r from-amber-700 via-amber-950 to-slate-950 p-6 md:p-8 flex flex-col justify-between gap-6 shadow-lg">
                <div className="space-y-2 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Kontakt bezpośredni 💬
                    </span>
                    <h2 className="text-xl md:text-2xl font-semibold">
                        Masz pytania? Napisz do nas
                    </h2>
                    <p className="text-xs md:text-sm text-neutral-300">
                        Skontaktuj się bezpośrednio z naszym zespołem technicznym. Odpowiemy na Twoje pytania dotyczące oferty i zamówień.
                    </p>
                </div>

                {/* 🍃 Komponent kliencki zminimalizowany do samego formularza */}
                <ContactForm />
            </div>

            {/* ⚡ Karta Promocyjna: Agregaty (1/3 szerokości) */}
            <div className="relative rounded-lg overflow-hidden min-h-[160px] shadow-lg flex items-end justify-between p-6 group">
                <Image
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"
                    alt="Agregaty prądotwórcze"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <h3 className="relative z-10 text-white font-semibold text-base md:text-lg leading-snug max-w-[140px]">
                    Agregaty prądotwórcze
                </h3>
            </div>
        </div>
    );
}