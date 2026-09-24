import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { registerPayment, fetchRegistrationPaymentStatuses } from '../data/financialData';
import { PAYMENT_METHOD_LABELS, type PaymentMethodKey } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { supabase } from '@/shared/lib/supabase';

const schema = z.object({
  registration_id: z.string().uuid('Selecione um aluno'),
  amount_cents: z.number().int().positive('Valor deve ser maior que zero'),
  payment_method: z.enum(['pix', 'debit', 'credit', 'cash'] as const),
  payment_date: z.string().min(1, 'Data obrigatória'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PersonOption {
  registration_id: string;
  full_name: string;
  outstanding_cents: number;
  status: string;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  editionId: string;
  onClose: () => void;
}

export function AddPaymentModal({ isOpen, editionId, onClose }: AddPaymentModalProps) {
  const queryClient = useQueryClient();
  const [amountInput, setAmountInput] = useState('');

  const { data: statuses } = useQuery({
    queryKey: ['reg-payment-statuses', editionId],
    queryFn: () => fetchRegistrationPaymentStatuses(editionId),
    enabled: isOpen,
    staleTime: 60_000,
  });

  const { data: people } = useQuery({
    queryKey: ['people-for-payment', editionId],
    queryFn: async () => {
      if (!statuses) return [];
      const personIds = statuses.map((s) => s.person_id);
      if (personIds.length === 0) return [];

      const { data } = await supabase
        .from('people')
        .select('id, full_name')
        .in('id', personIds);

      return (data ?? [])
        .map((p) => {
          const st = statuses.find((s) => s.person_id === p.id);
          return {
            registration_id: st?.registration_id ?? '',
            full_name: p.full_name,
            outstanding_cents: st?.outstanding_cents ?? 0,
            status: st?.status ?? 'pending',
          } as PersonOption;
        })
        // Pendentes/parciais primeiro, depois quitados
        .sort((a, b) => b.outstanding_cents - a.outstanding_cents);
    },
    enabled: isOpen && !!statuses,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_method: 'pix',
      payment_date: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedRegId = watch('registration_id');
  const selectedPerson = people?.find((p) => p.registration_id === selectedRegId);

  const mutation = useMutation({
    mutationFn: (vals: FormValues) =>
      registerPayment({
        reg_id: vals.registration_id,
        amt: vals.amount_cents,
        meth: vals.payment_method,
        pay_date: vals.payment_date,
        pay_notes: vals.notes,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payments', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['reg-payment-statuses', editionId] });
      reset();
      setAmountInput('');
      onClose();
    },
  });

  if (!isOpen) return null;

  const onSubmit = (vals: FormValues) => mutation.mutate(vals);

  const methods: PaymentMethodKey[] = ['pix', 'debit', 'credit', 'cash'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-slate-900">Registrar Pagamento</h3>
          <button
            id="add-payment-close"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Aluno */}
          <div>
            <label htmlFor="reg-select" className="text-xs font-semibold text-slate-700 mb-1 block">
              Aluno
            </label>
          <select
              id="reg-select"
              {...register('registration_id')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#58bc75]/40 bg-white"
            >
              <option value="">Selecione...</option>
              {(people ?? []).map((p) => {
                const statusLabel =
                  p.status === 'paid'
                    ? '✓ Quitado'
                    : p.outstanding_cents > 0
                    ? `Saldo: ${formatCentsToBRL(p.outstanding_cents)}`
                    : 'Pendente';
                return (
                  <option
                    key={p.registration_id}
                    value={p.registration_id}
                    disabled={p.status === 'paid'}
                  >
                    {p.full_name} — {statusLabel}
                  </option>
                );
              })}
            </select>
            {errors.registration_id && (
              <p className="text-xs text-rose-500 mt-1">{errors.registration_id.message}</p>
            )}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="amount-input" className="text-xs font-semibold text-slate-700 mb-1 block">
              Valor (R$)
            </label>
            {selectedPerson && (
              <p className="text-xs text-amber-600 mb-1">
                Máximo: {formatCentsToBRL(selectedPerson.outstanding_cents)}
              </p>
            )}
            <input
              id="amount-input"
              type="number"
              min="1"
              max={selectedPerson?.outstanding_cents ? selectedPerson.outstanding_cents / 100 : undefined}
              step="0.01"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                const cents = Math.round(parseFloat(e.target.value) * 100);
                if (!isNaN(cents)) setValue('amount_cents', cents);
              }}
              placeholder="Ex: 200,00"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#58bc75]/40"
            />
            {errors.amount_cents && (
              <p className="text-xs text-rose-500 mt-1">{errors.amount_cents.message}</p>
            )}
          </div>

          {/* Método */}
          <div>
            <span className="text-xs font-semibold text-slate-700 mb-2 block">Forma de Pagamento</span>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => {
                const current = watch('payment_method');
                return (
                  <button
                    key={m}
                    type="button"
                    id={`method-${m}`}
                    onClick={() => setValue('payment_method', m)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      current === m
                        ? 'border-[#58bc75] bg-[#58bc75]/10 text-[#20693a]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {PAYMENT_METHOD_LABELS[m]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data */}
          <div>
            <label htmlFor="pay-date" className="text-xs font-semibold text-slate-700 mb-1 block">
              Data do Pagamento
            </label>
            <input
              id="pay-date"
              type="date"
              {...register('payment_date')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#58bc75]/40"
            />
          </div>

          {/* Observação */}
          <div>
            <label htmlFor="pay-notes" className="text-xs font-semibold text-slate-700 mb-1 block">
              Observação <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="pay-notes"
              type="text"
              {...register('notes')}
              placeholder="Ex: parcela 1 de 2..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#58bc75]/40"
            />
          </div>

          {/* Error server */}
          {mutation.isError && (
            <p className="text-xs text-rose-500 font-medium">
              Erro: {(mutation.error as Error).message}
            </p>
          )}

          {/* Submit */}
          <button
            id="submit-payment"
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 rounded-2xl text-sm font-black bg-[#58bc75] hover:bg-[#4caa68] disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</>
            ) : (
              'Confirmar Pagamento'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
