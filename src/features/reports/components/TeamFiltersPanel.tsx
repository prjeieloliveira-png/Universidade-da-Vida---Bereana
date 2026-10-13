import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { TeamRoleRow } from '@/features/teams/types/teams';
import {
  initialTeamReportFilterState,
  type TeamReportFilterState,
} from '../utils/teamReport';

interface TeamFiltersPanelProps {
  roles: TeamRoleRow[];
  filters: TeamReportFilterState;
  onChange: <K extends keyof TeamReportFilterState>(key: K, value: TeamReportFilterState[K]) => void;
  onReset: () => void;
}

export function describeTeamFilters(
  filters: TeamReportFilterState,
  roles: TeamRoleRow[]
): string {
  const parts: string[] = [];
  if (filters.searchQuery.trim()) {
    parts.push(`Busca "${filters.searchQuery.trim()}"`);
  }
  if (filters.roleId !== 'ALL') {
    const role = roles.find((r) => r.id === filters.roleId);
    parts.push(`Equipe: ${role ? role.name : 'Selecionada'}`);
  }
  if (filters.activeStatus === 'active') {
    parts.push('Situação: Apenas ativos');
  } else if (filters.activeStatus === 'inactive') {
    parts.push('Situação: Apenas inativos');
  }
  if (filters.paymentStatus !== 'ALL') {
    const labels: Record<string, string> = {
      paid: 'Pagos',
      pending: 'Pendentes',
      courtesy: 'Cortesias',
    };
    parts.push(`Pagamento: ${labels[filters.paymentStatus] ?? filters.paymentStatus}`);
  }
  if (filters.courtesy === 'yes') {
    parts.push('Cortesia: Sim');
  } else if (filters.courtesy === 'no') {
    parts.push('Cortesia: Não');
  }
  return parts.join(' • ');
}

export function TeamFiltersPanel({
  roles,
  filters,
  onChange,
  onReset,
}: TeamFiltersPanelProps) {
  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.sort_order - b.sort_order),
    [roles]
  );

  const activeChips = useMemo(() => {
    const chips: { key: keyof TeamReportFilterState; text: string }[] = [];
    if (filters.roleId !== 'ALL') {
      const role = sortedRoles.find((r) => r.id === filters.roleId);
      chips.push({ key: 'roleId', text: `Equipe: ${role ? role.name : 'Selecionada'}` });
    }
    if (filters.activeStatus === 'active') {
      chips.push({ key: 'activeStatus', text: 'Ativos' });
    } else if (filters.activeStatus === 'inactive') {
      chips.push({ key: 'activeStatus', text: 'Inativos' });
    }
    if (filters.paymentStatus === 'paid') {
      chips.push({ key: 'paymentStatus', text: 'Pagos' });
    } else if (filters.paymentStatus === 'pending') {
      chips.push({ key: 'paymentStatus', text: 'Pendentes' });
    } else if (filters.paymentStatus === 'courtesy') {
      chips.push({ key: 'paymentStatus', text: 'Cortesias' });
    }
    if (filters.courtesy === 'yes') {
      chips.push({ key: 'courtesy', text: 'Cortesia' });
    } else if (filters.courtesy === 'no') {
      chips.push({ key: 'courtesy', text: 'Sem cortesia' });
    }
    return chips;
  }, [filters, sortedRoles]);

  const hasActiveFilters =
    Boolean(filters.searchQuery.trim()) ||
    filters.roleId !== 'ALL' ||
    filters.activeStatus !== 'ALL' ||
    filters.paymentStatus !== 'ALL' ||
    filters.courtesy !== 'ALL';

  return (
    <div className="space-y-3">
      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange('searchQuery', e.target.value)}
          placeholder="Buscar por voluntário, telefone ou observação..."
          className="w-full pl-10 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onChange('searchQuery', '')}
            aria-label="Limpar busca"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filtro por Equipe */}
      <div>
        <label
          htmlFor="filter-team-role"
          className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
        >
          Equipe
        </label>
        <select
          id="filter-team-role"
          value={filters.roleId}
          onChange={(e) => onChange('roleId', e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d7647] cursor-pointer"
        >
          <option value="ALL">Todas as equipes</option>
          {sortedRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.sort_order}. {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Situação */}
      <div>
        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Situação
        </span>
        <div className="grid grid-cols-3 gap-1">
          {(
            [
              ['ALL', 'Todos'],
              ['active', 'Ativos'],
              ['inactive', 'Inativos'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange('activeStatus', val)}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold cursor-pointer border text-center transition-all ${
                filters.activeStatus === val
                  ? 'bg-[#163242] text-white border-[#163242]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pagamento */}
      <div>
        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Pagamento
        </span>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {(
            [
              ['ALL', 'Todos'],
              ['paid', 'Pagos'],
              ['pending', 'Pendentes'],
              ['courtesy', 'Cortesias'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange('paymentStatus', val)}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold cursor-pointer border text-center transition-all ${
                filters.paymentStatus === val
                  ? 'bg-[#163242] text-white border-[#163242]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chips de filtros ativos */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#e8f5ec] text-[#0d7647] border border-[#a3e2bb]"
            >
              {chip.text}
              <button
                type="button"
                onClick={() =>
                  onChange(
                    chip.key,
                    initialTeamReportFilterState[chip.key]
                  )
                }
                aria-label={`Remover filtro ${chip.text}`}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Botão limpar todos */}
      {hasActiveFilters && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
}
