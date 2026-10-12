import { X } from 'lucide-react';
import type { RegistrationFilterState } from '../types';

interface FilterChipItem {
  key: keyof RegistrationFilterState;
  label: string;
  value: string;
}

interface RegistrationFilterChipsProps {
  chips: FilterChipItem[];
  onRemoveChip: (key: keyof RegistrationFilterState) => void;
  onResetAll: () => void;
}

export function RegistrationFilterChips({
  chips,
  onRemoveChip,
  onResetAll,
}: RegistrationFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
      <span className="text-[11px] font-semibold text-slate-400">Ativos:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#163242]/8 text-[#163242] text-[11px] font-medium"
        >
          <span className="text-slate-400 font-normal">{chip.label}:</span>
          <strong>{chip.value}</strong>
          <button
            onClick={() => onRemoveChip(chip.key)}
            className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
            aria-label={`Remover filtro ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onResetAll}
        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer ml-1"
      >
        Limpar tudo
      </button>
    </div>
  );
}
