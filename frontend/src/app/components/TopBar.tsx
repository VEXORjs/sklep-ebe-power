import { Clock, Mail, Phone, Truck } from "lucide-react";

export default function TopBar() {
    return (
        <div className="border-b border-neutral-800 bg-[#0d0e10] text-[11px] text-neutral-400">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <a
                        href="tel:+48123456789"
                        className="flex items-center gap-1.5 transition-colors hover:text-emerald-400"
                    >
                        <Phone className="h-3 w-3 text-emerald-500" />
                        +48 123 456 789
                    </a>
                    <a
                        href="mailto:kontakt@trafo-energia.pl"
                        className="flex items-center gap-1.5 transition-colors hover:text-emerald-400"
                    >
                        <Mail className="h-3 w-3 text-emerald-500" />
                        kontakt@trafo-energia.pl
                    </a>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
                        <Truck className="h-3.5 w-3.5" />
                        Darmowa dostawa od 500 zł
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-neutral-500" />
                        Pn–Pt: 8:00–16:00
                    </span>
                </div>
            </div>
        </div>
    );
}
