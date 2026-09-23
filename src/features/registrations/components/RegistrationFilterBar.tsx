import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, FileDown, X } from 'lucide-react';
import { StudentRecord, RegistrationFilterState, initialRegistrationFilterState } from '../types';
import { RegistrationAdvancedFiltersDrawer } from './RegistrationAdvancedFiltersDrawer';

interface RegistrationFilterBarProps {
  students: StudentRecord[];
  filters: RegistrationFilterState;
  onFilterChange: <K extends keyof RegistrationFilterState>(key: K, value: RegistrationFilterState[K]) => void;
  onResetFilters: () => void;
  onOpenReportModal: () => void;
  totalCohortCount: number;
  paidCount: number;
  pendingCount: number;
}

export function RegistrationFilterBar({
  students,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenReportModal,
  totalCohortCount,
  paidCount,
  pendingCount,
}: RegistrationFilterBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculate number of active filters (excluding defaults)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'ALL') count++;
    if (filters.paymentMethod !== 'ALL') count++;
    if (filters.gender !== 'ALL') count++;
    if (filters.ageRange !== 'ALL') count++;
    if (filters.maritalStatus !== 'ALL') count++;
    if (filters.shirtSize !== 'ALL') count++;
    if (filters.comorbidity !== 'ALL') count++;
    if (filters.pastor !== 'ALL') count++;
    if (filters.g12 !== 'ALL') count++;
    if (filters.leader !== 'ALL') count++;
    return count;
  }, [filters]);

  const activeChips = useMemo(() => {
    const list: { key: keyof RegistrationFilterState; label: string; value: string }[] = [];
    if (filters.gender !== 'ALL') list.push({ key: 'gender', label: 'Sexo', value: filters.gender });
    if (filters.ageRange !== 'ALL') {
      const val = filters.ageRange === 'under18' ? '<18' : filters.ageRange;
      list.push({ key: 'ageRange', label: 'Idade', value: val });
    }
    if (filters.maritalStatus !== 'ALL') list.push({ key: 'maritalStatus', label: 'Est. Civil', value: filters.maritalStatus });
    if (filters.paymentMethod !== 'ALL') list.push({ key: 'paymentMethod', label: 'Pagamento', value: filters.paymentMethod });
    if (filters.pastor !== 'ALL') list.push({ key: 'pastor', label: 'Pastor', value: filters.pastor });
    if (filters.g12 !== 'ALL') list.push({ key: 'g12', label: 'G12', value: filters.g12 });
    if (filters.leader !== 'ALL') list.push({ key: 'leader', label: 'Líder', value: filters.leader });
    if (filters.shirtSize !== 'ALL') list.push({ key: 'shirtSize', label: 'Camiseta', value: filters.shirtSize });
    if (filters.comorbidity !== 'ALL') {
      list.push({ key: 'comorbidity', label: 'Comorbidade', value: filters.comorbidity === 'SIM' ? 'Sim' : 'Não' });
    }
    return list;
  }, [filters]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Primary Row: Search + Status Pills + Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            placeholder="Buscar por nome, celular, pastor ou líder..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
        {/* Quick Filter Selects */}
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Sexo */}
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#58bc75]"
          >
            <option value="ALL">Todos os sexos</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
          {/* Idade */}
          <select
            value={filters.ageRange}
            onChange={(e) => onFilterChange('ageRange', e.target.value as RegistrationFilterState['ageRange'])}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#58bc75]"
          >
            <option value="ALL">Todas as idades</option>
            <option value="under18">Menores (&lt; 18)</option>
            <option value="18-29">18-29</option>
            <option value="30-49">30-49</option>
            <option value="50+">50+</option>
          </select>
          {/* Estado Civil */}
          <select
            value={filters.maritalStatus}
            onChange={(e) => onFilterChange('maritalStatus', e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#58bc75]"
          >
            <option value="ALL">Todos os estados civis</option>
            <option value="Solteiro">Solteiro(a)</option>
            <option value="Casado">Casado(a)</option>
            <option value="Divorciado">Divorciado(a)</option>
            <option value="Viúvo">Viúvo(a)</option>
          </select>
          {/* Camiseta */}
          <select
            value={filters.shirtSize}
            onChange={(e) => onFilterChange('shirtSize', e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#58bc75]"
          >
            <option value="ALL">Todas as camisetas</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
          </select>
          {/* Forma de Pagamento */}
          <select
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange('paymentMethod', e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#58bc75]"
          >
            <option value="ALL">Todas as formas</option>
            <option value="PIX">PIX</option>
            <option value="CARTÃO">Cartão</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="—">Outro</option>
          </select>
        </div>

        {/* Status Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 shrink-0">
          <button
            onClick={() => onFilterChange('status', 'ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'ALL'
                ? 'bg-[#163242] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({totalCohortCount})
          </button>
          <button
            onClick={() => onFilterChange('status', 'Pago')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'Pago'
                ? 'bg-[#58bc75] text-white shadow-xs'
                : 'bg-[#e8f8ee] text-[#2c814b] hover:bg-[#d6f4df]'
            }`}
          >
            Pagos ({paidCount})
          </button>
          <button
            onClick={() => onFilterChange('status', 'Pendente')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'Pendente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
        </div>

        {/* Actions: Filter Drawer Toggle + Export PDF */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              isDrawerOpen || activeFiltersCount > 0
                ? 'bg-[#163242] text-white border-[#163242] shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#58bc75]" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#58bc75] text-[#163242] text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#58bc75]/15 hover:bg-[#58bc75]/25 text-[#1a5b32] border border-[#58bc75]/30 transition-all cursor-pointer shadow-2xs"
            title="Exportar lista filtrada para impressão em PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-[#2c814b]" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Filtros ativos:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium"
            >
              <span className="text-slate-400 font-normal">{chip.label}:</span>
              <strong>{chip.value}</strong>
              <button
                onClick={() => onFilterChange(chip.key, initialRegistrationFilterState[chip.key])}
                className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-1"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* Collapsible Advanced Filters Drawer */}
      {isDrawerOpen && (
        <RegistrationAdvancedFiltersDrawer
          students={students}
          filters={filters}
          onChange={onFilterChange}
          onReset={onResetFilters}
        />
      )}
    </div>
  );
}
