'use client';

import { useState } from 'react';

// 1. DOKŁADNE TYPY DLA STANÓW FILTRÓW (Zamiast 'any')
export interface FilterState {
    producers: string[];
    phases: string[];
    fuels: string[];
    starters: string[];
    power: {
        min: string;
        max: string;
    };
}

interface FiltersSidebarProps {
    onFilterChange: (filters: FilterState) => void;
}

interface FilterSectionProps {
    title: string;
    options: string[];
    state: string[];
    onChange: (option: string) => void;
}

// 2. KOMPONENT SEKCJI FILTRÓW
function FilterSection({ title, options, state, onChange }: FilterSectionProps) {
    return (
        <div className="border-b border-neutral-800 py-4">
            <h3 className="mb-3 text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            <div className="space-y-2.5">
                {options.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="peer appearance-none h-4 w-4 rounded border border-neutral-600 bg-neutral-900 checked:border-emerald-500 checked:bg-emerald-500 transition-all cursor-pointer"
                                checked={state.includes(option)}
                                onChange={() => onChange(option)}
                            />
                            <svg className="absolute w-3 h-3 text-neutral-950 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

// 3. GŁÓWNY KOMPONENT
export default function FiltersSidebar({ onFilterChange }: FiltersSidebarProps) {
    // Stan filtrów typu Checkbox
    const [selectedProducers, setSelectedProducers] = useState<string[]>([]);
    const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
    const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
    const [selectedStarters, setSelectedStarters] = useState<string[]>([]);

    // Stan filtrów mocy
    const [minPower, setMinPower] = useState('');
    const [maxPower, setMaxPower] = useState('');

    // Dostępne opcje
    const filterOptions = {
        producers: ["Pramac", "CGM"],
        phases: ["Jednofazowy", "Trójfazowy", "DUAL"],
        fuels: ["Benzyna", "Diesel (Olej napędowy)", "LPG (gaz płynny)", "NG (gaz ziemny)"],
        starters: ["Ręczny", "Elektryczny", "Ręczny i Elektryczny"]
    };

    // Używamy Partial<FilterState>, aby móc aktualizować tylko jeden klucz naraz
    const triggerFilterUpdate = (newFilters: Partial<FilterState>) => {
        onFilterChange({
            producers: selectedProducers,
            phases: selectedPhases,
            fuels: selectedFuels,
            starters: selectedStarters,
            power: { min: minPower, max: maxPower },
            ...newFilters
        });
    };

    const handleCheckboxChange = (
        value: string,
        currentState: string[],
        setState: React.Dispatch<React.SetStateAction<string[]>>,
        filterKey: keyof FilterState
    ) => {
        const updated = currentState.includes(value)
            ? currentState.filter((item) => item !== value)
            : [...currentState, value];

        setState(updated);
        triggerFilterUpdate({ [filterKey]: updated });
    };

    const applyPowerFilter = () => {
        triggerFilterUpdate({ power: { min: minPower, max: maxPower } });
    };

    const clearFilters = () => {
        setSelectedProducers([]);
        setSelectedPhases([]);
        setSelectedFuels([]);
        setSelectedStarters([]);
        setMinPower('');
        setMaxPower('');

        onFilterChange({
            producers: [],
            phases: [],
            fuels: [],
            starters: [],
            power: { min: '', max: '' }
        });
    };

    return (
        <aside className="w-full lg:w-64 shrink-0 bg-[#151719] border border-neutral-800 rounded-xl p-5 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-extrabold text-white">Filtruj wyniki</h2>
                <button
                    onClick={clearFilters}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-emerald-400 transition-colors uppercase tracking-wider"
                >
                    Wyczyść
                </button>
            </div>

            <FilterSection
                title="Producent"
                options={filterOptions.producers}
                state={selectedProducers}
                onChange={(val) => handleCheckboxChange(val, selectedProducers, setSelectedProducers, 'producers')}
            />
            <FilterSection
                title="Liczba faz"
                options={filterOptions.phases}
                state={selectedPhases}
                onChange={(val) => handleCheckboxChange(val, selectedPhases, setSelectedPhases, 'phases')}
            />
            <FilterSection
                title="Paliwo"
                options={filterOptions.fuels}
                state={selectedFuels}
                onChange={(val) => handleCheckboxChange(val, selectedFuels, setSelectedFuels, 'fuels')}
            />
            <FilterSection
                title="Typ rozruchu"
                options={filterOptions.starters}
                state={selectedStarters}
                onChange={(val) => handleCheckboxChange(val, selectedStarters, setSelectedStarters, 'starters')}
            />

            {/* ZAKRES MOCY Z INPUTAMI */}
            <div className="pt-4">
                <h3 className="mb-3 text-sm font-bold text-white uppercase tracking-wider">Zakres mocy</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Od"
                        value={minPower}
                        onChange={(e) => setMinPower(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="text-neutral-500">-</span>
                    <input
                        type="number"
                        placeholder="Do"
                        value={maxPower}
                        onChange={(e) => setMaxPower(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
                <button
                    onClick={applyPowerFilter}
                    className="w-full mt-3 bg-neutral-800 hover:bg-emerald-600 text-white border border-neutral-700 hover:border-emerald-500 text-xs font-bold uppercase tracking-wider py-2 rounded-md transition-all"
                >
                    Zastosuj moc
                </button>
            </div>
        </aside>
    );
}