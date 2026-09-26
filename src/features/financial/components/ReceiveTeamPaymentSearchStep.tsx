import type { RefObject } from 'react';
import { Search, Loader2, ChevronRight } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { PaymentStatusBadge } from './paymentReceiptShared';
import type { TeamMemberOption } from './ReceiveTeamPaymentModal';

interface ReceiveTeamPaymentSearchStepProps {
  searchRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  filtered: TeamMemberOption[];
  onSelect: (member: TeamMemberOption) => void;
}

export function ReceiveTeamPaymentSearchStep({
  searchRef,
  searchQuery,
  onSearchChange,
  isLoading,
  filtered,
  onSelect,
}: ReceiveTeamPaymentSearchStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 sticky top-0 bg-white z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por nome ou equipe..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
          />
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Carregando membros...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">Nenhum membro encontrado.</div>
        ) : (
          filtered.map((m) => (
            <button
              key={m.team_member_id}
              type="button"
              onClick={() => onSelect(m)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/40 transition-colors text-left cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-800 truncate">{m.full_name}</span>
                  <PaymentStatusBadge status={m.status} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.team_role_name}</p>
                {m.outstanding_cents > 0 && (
                  <p className="text-[10px] font-semibold text-amber-600 mt-0.5">
                    Pendente: {formatCentsToBRL(m.outstanding_cents)}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
