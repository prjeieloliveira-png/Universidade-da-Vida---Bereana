import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPayments, voidPayment } from '../data/financialData';
import { PAYMENT_METHOD_LABELS } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { Loader2, Trash2, Search } from 'lucide-react';

interface PaymentsTabProps {
  editionId: string;
}

export function PaymentsTab({ editionId }: PaymentsTabProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ['payments', editionId],
    queryFn: () => fetchPayments(editionId),
    staleTime: 30_000,
  });

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => voidPayment(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payments', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['reg-payment-statuses', editionId] });
      setVoidingId(null);
    },
    onError: (err: Error) => {
      alert(`Erro ao estornar pagamento: ${err.message}`);
      setVoidingId(null);
    },
  });

  const filtered = (payments ?? []).filter((p) =>
    p.person_name.toLowerCase().includes(search.toLowerCase())
  );

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
        Falha ao carregar pagamentos. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="payments-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#58bc75]/40 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          {search ? 'Nenhum pagamento encontrado.' : 'Nenhum pagamento registrado ainda.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((payment) => {
            const methodLabel = PAYMENT_METHOD_LABELS[payment.payment_method] ?? payment.payment_method;
            const dateFormatted = new Intl.DateTimeFormat('pt-BR').format(
              new Date(payment.payment_date + 'T00:00:00')
            );

            return (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{payment.person_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{dateFormatted}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {methodLabel}
                    </span>
                  </div>
                  {payment.notes && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{payment.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-black text-emerald-600">
                    {formatCentsToBRL(payment.amount_cents)}
                  </span>

                  {voidingId === payment.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        id={`void-confirm-${payment.id}`}
                        onClick={() => voidMutation.mutate({ id: payment.id, reason: 'Estorno solicitado' })}
                        disabled={voidMutation.isPending}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        {voidMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmar'}
                      </button>
                      <button
                        id={`void-cancel-${payment.id}`}
                        onClick={() => setVoidingId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`void-btn-${payment.id}`}
                      onClick={() => setVoidingId(payment.id)}
                      title="Estornar pagamento"
                      className="w-7 h-7 rounded-full hover:bg-rose-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-right text-xs text-slate-400 font-medium">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
