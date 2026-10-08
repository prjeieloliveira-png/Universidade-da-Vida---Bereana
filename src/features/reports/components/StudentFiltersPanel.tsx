import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { RegistrationAdvancedFiltersDrawer } from '@/features/registrations/components/RegistrationAdvancedFiltersDrawer';
import {
  initialRegistrationFilterState,
  type RegistrationFilterState,
  type StudentRecord,
} from '@/features/registrations/types';

interface StudentFiltersPanelProps {
  students: StudentRecord[];
  filters: RegistrationFilterState;
  onChange: <K extends keyof RegistrationFilterState>(key: K, value: RegistrationFilterState[K]) => void;
  onReset: () => void;
}

const AGE_LABELS: Record<string, string> = { under18: '<18', '18-29': '18–29', '30-49': '30–49', '50+': '50+' };

export function describeStudentFilters(filters: RegistrationFilterState): string {
  const parts: string[] = [];
  if (filters.searchQuery.trim()) parts.push(`Busca "${filters.searchQuery.trim()}"`);
  if (filters.status !== 'ALL') parts.push(`Pagamento: ${filters.status === 'Pago' ? 'pagos' : 'pendentes'}`);
  if (filters.paymentMethod !== 'ALL') parts.push(`Forma: ${filters.paymentMethod}`);
  if (filters.gender !== 'ALL') parts.push(`Sexo: ${filters.gender}`);
  if (filters.ageRange !== 'ALL') parts.push(`Idade: ${AGE_LABELS[filters.ageRange] ?? filters.ageRange}`);
  if (filters.maritalStatus !== 'ALL') parts.push(`Estado civil: ${filters.maritalStatus}`);
  if (filters.shirtSize !== 'ALL') parts.push(`Camiseta: ${filters.shirtSize}`);
  if (filters.comorbidity !== 'ALL') {
    parts.push(`Saúde: ${filters.comorbidity === 'SIM' ? 'com restrição' : 'sem restrição'}`);
  }
  if (filters.pastor !== 'ALL') parts.push(`Pastor: ${filters.pastor}`);
  if (filters.g12 !== 'ALL') parts.push(`G12: ${filters.g12}`);
  if (filters.leader !== 'ALL') parts.push(`Líder: ${filters.leader}`);
  return parts.join(' • ');
}

export function StudentFiltersPanel({ students, filters, onChange, onReset }: StudentFiltersPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeChips = useMemo(() => {
    const keys = (Object.keys(initialRegistrationFilterState) as (keyof RegistrationFilterState)[]).filter(
      (k) => k !== 'searchQuery' && filters[k] !== initialRegistrationFilterState[k]
    );
    return keys.map((k) => ({ key: k, text: String(filters[k]) }));
  }, [filters]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange('searchQuery', e.target.value)}
          placeholder="Buscar por nome, telefone, pastor ou líder..."
          className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400">Pagamento:</span>
        {([['ALL', 'Todos'], ['Pago', 'Pagos'], ['Pendente', 'Pendentes']] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange('status', value)}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
              filters.status === value ? 'bg-[#163242] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${
            drawerOpen || activeChips.length > 0
              ? 'bg-[#163242] text-white border-[#163242]'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#58bc75]" />
          Mais filtros{activeChips.length > 0 && ` (${activeChips.length})`}
        </button>
      </div>

      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeChips.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
              {chip.text}
              <button
                type="button"
                onClick={() => onChange(chip.key, initialRegistrationFilterState[chip.key])}
                aria-label={`Remover filtro ${chip.text}`}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={onReset} className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer">
            Limpar tudo
          </button>
        </div>
      )}

      {drawerOpen && (
        <RegistrationAdvancedFiltersDrawer students={students} filters={filters} onChange={onChange} onReset={onReset} />
      )}
    </div>
  );
}
