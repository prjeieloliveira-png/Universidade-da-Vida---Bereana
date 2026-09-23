import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, FileDown, Printer, X } from 'lucide-react';
import { StudentRecord, RegistrationFilterState, initialRegistrationFilterState } from '../types';
import { RegistrationAdvancedFiltersDrawer } from './RegistrationAdvancedFiltersDrawer';

interface RegistrationFilterBarProps {
  students: StudentRecord[];
  filters: RegistrationFilterState;
  onFilterChange: <K extends keyof RegistrationFilterState>(key: K, value: RegistrationFilterState[K]) => void;
  onResetFilters: () => void;
  onOpenReportModal: () => void;
  onPrintAll: () => void;
  totalCohortCount: number;
  paidCount: number;
  pendingCount: number;
}

const selectCls =
  'h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all cursor-pointer shrink-0 appearance-none pr-6 bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")] bg-no-repeat bg-[right_8px_center]';

export function RegistrationFilterBar({
  students,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenReportModal,
  onPrintAll,
  totalCohortCount,
  paidCount,
  pendingCount,
}: RegistrationFilterBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
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
    if (filters.shirtSize !== 'ALL') list.push({ key: 'shirtSize', label: 'Camiseta', value: filters.shirtSize });
    if (filters.pastor !== 'ALL') list.push({ key: 'pastor', label: 'Pastor', value: filters.pastor });
    if (filters.g12 !== 'ALL') list.push({ key: 'g12', label: 'G12', value: filters.g12 });
    if (filters.leader !== 'ALL') list.push({ key: 'leader', label: 'Líder', value: filters.leader });
    if (filters.comorbidity !== 'ALL') {
      list.push({ key: 'comorbidity', label: 'Saúde', value: filters.comorbidity === 'SIM' ? 'Com restrição' : 'Sem restrição' });
    }
    return list;
  }, [filters]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-[20px] px-4 py-3 shadow-xs space-y-2.5">

      {/* ── Linha 1: Busca | Pills de status | Ações ── */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            placeholder="Buscar por nome, celular ou líder..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Divisor */}
        <div className="w-px h-5 bg-slate-200 shrink-0 hidden sm:block" />

        {/* Pills de status */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onFilterChange('status', 'ALL')}
            className={`h-8 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'ALL'
                ? 'bg-[#163242] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos&nbsp;<span className="opacity-70">({totalCohortCount})</span>
          </button>
          <button
            onClick={() => onFilterChange('status', 'Pago')}
            className={`h-8 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'Pago'
                ? 'bg-[#58bc75] text-white'
                : 'bg-[#e8f8ee] text-[#2c814b] hover:bg-[#d6f4df]'
            }`}
          >
            Pagos&nbsp;<span className="opacity-70">({paidCount})</span>
          </button>
          <button
            onClick={() => onFilterChange('status', 'Pendente')}
            className={`h-8 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'Pendente'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pendentes&nbsp;<span className="opacity-60">({pendingCount})</span>
          </button>
        </div>

        {/* Divisor */}
        <div className="w-px h-5 bg-slate-200 shrink-0 hidden sm:block" />

        {/* Botões de ação */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isDrawerOpen || activeFiltersCount > 0
                ? 'bg-[#163242] text-white border-[#163242]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#58bc75]" />
            <span className="hidden sm:inline">Mais filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#58bc75] text-[#163242] text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-[#58bc75]/15 hover:bg-[#58bc75]/25 text-[#1a5b32] border border-[#58bc75]/30 transition-all cursor-pointer"
            title="Exportar lista filtrada para PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-[#2c814b]" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>

          <button
            onClick={onPrintAll}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-[#163242]/10 hover:bg-[#163242]/20 text-[#163242] border border-[#163242]/20 transition-all cursor-pointer"
            title="Imprimir fichas individuais de todos os alunos filtrados"
          >
            <Printer className="w-3.5 h-3.5 text-[#163242]" />
            <span className="hidden sm:inline">Imprimir Fichas</span>
          </button>
        </div>
      </div>

      {/* ── Linha 2: Filtros rápidos em linha horizontal rolável ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-hide">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Filtrar por:</span>

        {/* Sexo */}
        <select
          value={filters.gender}
          onChange={(e) => onFilterChange('gender', e.target.value)}
          className={selectCls}
        >
          <option value="ALL">Sexo</option>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
        </select>

        {/* Faixa etária */}
        <select
          value={filters.ageRange}
          onChange={(e) => onFilterChange('ageRange', e.target.value as RegistrationFilterState['ageRange'])}
          className={selectCls}
        >
          <option value="ALL">Idade</option>
          <option value="under18">{'< 18 anos'}</option>
          <option value="18-29">18 – 29</option>
          <option value="30-49">30 – 49</option>
          <option value="50+">50+</option>
        </select>

        {/* Estado Civil */}
        <select
          value={filters.maritalStatus}
          onChange={(e) => onFilterChange('maritalStatus', e.target.value)}
          className={selectCls}
        >
          <option value="ALL">Estado civil</option>
          <option value="Solteiro">Solteiro(a)</option>
          <option value="Casado">Casado(a)</option>
          <option value="Divorciado">Divorciado(a)</option>
          <option value="Viúvo">Viúvo(a)</option>
        </select>

        {/* Camiseta */}
        <select
          value={filters.shirtSize}
          onChange={(e) => onFilterChange('shirtSize', e.target.value)}
          className={selectCls}
        >
          <option value="ALL">Camiseta</option>
          <option value="P">P</option>
          <option value="M">M</option>
          <option value="G">G</option>
          <option value="GG">GG</option>
          <option value="XG">XG</option>
        </select>

        {/* Forma de pagamento */}
        <select
          value={filters.paymentMethod}
          onChange={(e) => onFilterChange('paymentMethod', e.target.value)}
          className={selectCls}
        >
          <option value="ALL">Pagamento</option>
          <option value="PIX">PIX</option>
          <option value="CARTÃO">Cartão</option>
          <option value="DINHEIRO">Dinheiro</option>
          <option value="—">Outro</option>
        </select>

        {/* Limpar filtros rápidos — só aparece quando há algo ativo */}
        {(filters.gender !== 'ALL' ||
          filters.ageRange !== 'ALL' ||
          filters.maritalStatus !== 'ALL' ||
          filters.shirtSize !== 'ALL' ||
          filters.paymentMethod !== 'ALL') && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 shrink-0 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* ── Chips de filtros ativos (dos filtros avançados) ── */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400">Ativos:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#163242]/8 text-[#163242] text-[11px] font-medium"
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
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer ml-1"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* ── Drawer de filtros avançados ── */}
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
