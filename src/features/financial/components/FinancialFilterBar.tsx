import { Search, Filter, Calendar } from 'lucide-react';
import type { CashCategory } from '../types';

export type FlowTypeFilter = 'all' | 'in' | 'out';

interface FinancialFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  flowType: FlowTypeFilter;
  onFlowTypeChange: (type: FlowTypeFilter) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  categories: CashCategory[];
}

export function FinancialFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  flowType,
  onFlowTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  categories,
}: FinancialFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[24px] p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      {/* Esquerda: Busca e Categoria */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
        {/* Campo de Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar transação..."
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Dropdown de Categorias */}
        <div className="relative min-w-[170px]">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-700 font-medium cursor-pointer appearance-none"
          >
            <option value="ALL">Todas as Categorias</option>
            <optgroup label="Entradas (Receitas)">
              {categories
                .filter((c) => c.type === 'in')
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Saídas (Despesas)">
              {categories
                .filter((c) => c.type === 'out')
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Direita: Intervalo de Datas e Pílulas de Tipo */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
        {/* Filtro de Datas */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
            title="Data inicial"
          />
          <span className="text-slate-400 text-[11px]">até</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer"
            title="Data final"
          />
        </div>

        {/* Pílulas de Tipo: Todos | Receitas | Despesas */}
        <div className="bg-[#f4f6f8] border border-slate-200/70 p-1 rounded-xl flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onFlowTypeChange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              flowType === 'all'
                ? 'bg-[#0d7647] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFlowTypeChange('in')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              flowType === 'in'
                ? 'bg-[#0d7647] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Receitas
          </button>
          <button
            type="button"
            onClick={() => onFlowTypeChange('out')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              flowType === 'out'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Despesas
          </button>
        </div>
      </div>
    </div>
  );
}
