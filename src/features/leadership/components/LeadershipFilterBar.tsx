import { Search, UserCheck, ArrowDownAZ } from 'lucide-react';
import type { PastorRecord } from '../types';

interface LeadershipFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: 'ALL' | 'PASTOR' | 'G12' | 'LEADER';
  onTabChange: (tab: 'ALL' | 'PASTOR' | 'G12' | 'LEADER') => void;
  cohortFilter: 'ALL' | 'COHORT_ONLY';
  onCohortFilterChange: (scope: 'ALL' | 'COHORT_ONLY') => void;
  selectedPastorFilter: string;
  onPastorFilterChange: (p: string) => void;
  pastors: PastorRecord[];
  activeCohortName: string;
  sortAlphabetically: boolean;
  onToggleSortAlphabetically: () => void;
  counts: {
    total: number;
    pastors: number;
    g12s: number;
    leaders: number;
    cohortActive: number;
  };
}

export function LeadershipFilterBar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  cohortFilter,
  onCohortFilterChange,
  selectedPastorFilter,
  onPastorFilterChange,
  pastors,
  activeCohortName,
  sortAlphabetically,
  onToggleSortAlphabetically,
  counts,
}: LeadershipFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome do líder, pastor ou G12..."
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={onToggleSortAlphabetically}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 h-9 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
            sortAlphabetically
              ? 'bg-[#163242] text-white border-[#163242]'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title={sortAlphabetically ? 'Ordenação alfabética ativada' : 'Ordenar em ordem alfabética'}
          aria-pressed={sortAlphabetically}
        >
          <ArrowDownAZ className={`w-3.5 h-3.5 ${sortAlphabetically ? 'text-[#58bc75]' : 'text-slate-500'}`} />
          <span>A-Z</span>
        </button>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { key: 'ALL', label: `Todos (${counts.total})` },
              { key: 'PASTOR', label: `Pastores (${counts.pastors})` },
              { key: 'G12', label: `G12 (${counts.g12s})` },
              { key: 'LEADER', label: `Líder (${counts.leaders})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#163242] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scope Filter: Na Turma vs Catálogo Geral */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            Escopo:
          </span>
          <button
            type="button"
            onClick={() => onCohortFilterChange('ALL')}
            className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
              cohortFilter === 'ALL'
                ? 'bg-[#163242] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Catálogo Geral ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => onCohortFilterChange('COHORT_ONLY')}
            className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
              cohortFilter === 'COHORT_ONLY'
                ? 'bg-[#58bc75] text-white'
                : 'bg-[#e8f8ee] text-[#20693a] hover:bg-[#d6f4df]'
            }`}
          >
            Ativos na {activeCohortName} ({counts.cohortActive})
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 uppercase text-[10px]">
            <UserCheck className="w-3.5 h-3.5" /> Pastor:
          </span>
          <button
            type="button"
            onClick={() => onPastorFilterChange('ALL')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
              selectedPastorFilter === 'ALL' ? 'bg-[#58bc75] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Todos
          </button>
          {pastors.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPastorFilterChange(p.name)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                selectedPastorFilter === p.name ? 'bg-[#58bc75] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
