import { Quote, Star } from "lucide-react";

const testimonials = [
    {
        name: "Marek W.",
        company: "Zakład produkcyjny, Łódź",
        text: "Transformator 250 kVA dostarczony i podłączony w 18 godzin od zgłoszenia awarii. Profesjonalizm na najwyższym poziomie.",
    },
    {
        name: "Anna K.",
        company: "Spółdzielnia mieszkaniowa, Warszawa",
        text: "Pełny serwis stacji transformatorowej razem z dokumentacją. Wszystko zgodnie z harmonogramem, zero przestojów.",
    },
    {
        name: "Tomasz B.",
        company: "Firma budowlana, Gdańsk",
        text: "Wynajmujemy agregaty na budowy w całej Polsce. Sprzęt zawsze sprawny, a kontakt z doradcą natychmiastowy.",
    },
];

export default function Testimonials() {
    return (
        <section className="w-full border-y border-neutral-800 bg-[#0d0f10]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Opinie klientów
                    </span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        Zaufali nam w całej Polsce
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {testimonials.map((item) => (
                        <figure
                            key={item.name}
                            className="relative flex flex-col justify-between rounded-lg border border-neutral-800 bg-[#141618] p-6"
                        >
                            <Quote className="absolute right-5 top-5 h-8 w-8 text-neutral-800" />

                            <div className="mb-4 flex items-center gap-1 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>

                            <blockquote className="text-sm leading-relaxed text-neutral-300">
                                &bdquo;{item.text}&rdquo;
                            </blockquote>

                            <figcaption className="mt-6 border-t border-neutral-800 pt-4">
                                <p className="text-sm font-bold text-white">{item.name}</p>
                                <p className="text-xs text-neutral-500">{item.company}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
