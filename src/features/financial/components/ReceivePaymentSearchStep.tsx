import type { RefObject } from 'react';
import { Search, Loader2, ChevronRight } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { PaymentStatusBadge } from './paymentReceiptShared';
import type { PersonOption } from './ReceivePaymentModal';

interface ReceivePaymentSearchStepProps {
  searchRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  filtered: PersonOption[];
  onSelect: (person: PersonOption) => void;
}

export function ReceivePaymentSearchStep({
  searchRef,
  searchQuery,
  onSearchChange,
  isLoading,
  filtered,
  onSelect,
}: ReceivePaymentSearchStepProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 py-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchRef}
            id="receive-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar aluno pelo nome..."
            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 bg-slate-50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-sm text-slate-400 ml-2">Carregando inscritos...</span>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">
            {searchQuery ? 'Nenhum inscrito encontrado.' : 'Nenhuma inscrição com saldo devedor.'}
          </p>
        )}

        {filtered.map((p) => (
          <button
            key={p.registration_id}
            type="button"
            id={`person-${p.registration_id}`}
            disabled={p.status === 'paid'}
            onClick={() => onSelect(p)}
            className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all text-left ${
              p.status === 'paid'
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100'
                : 'hover:border-emerald-300 hover:bg-emerald-50/40 border-slate-200 bg-white cursor-pointer'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{p.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <PaymentStatusBadge status={p.status} />
                {p.outstanding_cents > 0 && (
                  <span className="text-xs text-amber-600 font-semibold">
                    Saldo: {formatCentsToBRL(p.outstanding_cents)}
                  </span>
                )}
              </div>
            </div>
            {p.status !== 'paid' && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
