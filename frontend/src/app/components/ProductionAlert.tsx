import { Construction } from 'lucide-react';

export default function ProductionAlert() {
    return (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center sm:px-6 lg:px-8 flex items-center justify-center gap-2 z-50 relative">
            <Construction className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-amber-500">
                <strong>Uwaga!</strong> Sklep jest obecnie w fazie budowy i testów. Transakcje mają charakter wyłącznie testowy. Prosimy nie dokonywac zadnych zakupow!
            </p>
        </div>
    );
}