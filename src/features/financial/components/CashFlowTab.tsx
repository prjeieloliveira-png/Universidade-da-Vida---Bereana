import { useQuery } from '@tanstack/react-query';
import { fetchCashFlow } from '../data/financialData';
import { PAYMENT_METHOD_LABELS } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface CashFlowTabProps {
  editionId: string;
}

export function CashFlowTab({ editionId }: CashFlowTabProps) {
  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['cash-flow', editionId],
    queryFn: () => fetchCashFlow(editionId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-[#58bc75]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-rose-500 text-sm font-medium">
        Falha ao carregar fluxo de caixa. Tente novamente.
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Nenhuma movimentação registrada ainda.
      </div>
    );
  }

  // Agrupar por data
  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const dateKey = entry.date.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([dateKey, dayEntries]) => {
        const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        }).format(new Date(dateKey + 'T00:00:00'));

        const dayNet = dayEntries.reduce((sum, e) => {
          return e.flow_type === 'in' ? sum + e.amount_cents : sum - e.amount_cents;
        }, 0);

        return (
          <div key={dateKey}>
            {/* Date header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold text-slate-500 capitalize">{dateFormatted}</span>
              <span
                className={`text-xs font-bold ${dayNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                {dayNet >= 0 ? '+' : ''}{formatCentsToBRL(dayNet)}
              </span>
            </div>

            <div className="space-y-2">
              {dayEntries.map((entry) => {
                const isIn = entry.flow_type === 'in';
                const methodLabel = PAYMENT_METHOD_LABELS[entry.payment_method] ?? entry.payment_method;
                const Icon = isIn ? ArrowDownLeft : ArrowUpRight;

                return (
                  <div
                    key={entry.transaction_id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3"
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isIn ? 'bg-emerald-50' : 'bg-rose-50'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {entry.person_name ?? entry.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{entry.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-xs text-slate-400">{methodLabel}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <span
                      className={`text-sm font-black flex-shrink-0 ${
                        isIn ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIn ? '+' : '-'}{formatCentsToBRL(entry.amount_cents)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
