import { Loader2 } from 'lucide-react';
import { PAYMENT_METHOD_LABELS, type PaymentMethodKey } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import type { PersonOption } from './ReceivePaymentModal';

const METHODS: PaymentMethodKey[] = ['pix', 'debit', 'credit', 'cash'];

interface ReceivePaymentFormStepProps {
  selected: PersonOption;
  amountInput: string;
  amountCents: number;
  amountError: string;
  onAmountChange: (value: string) => void;
  method: PaymentMethodKey;
  onMethodChange: (method: PaymentMethodKey) => void;
  payDate: string;
  onPayDateChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isPending: boolean;
  mutationErrorMessage?: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ReceivePaymentFormStep({
  selected,
  amountInput,
  amountCents,
  amountError,
  onAmountChange,
  method,
  onMethodChange,
  payDate,
  onPayDateChange,
  notes,
  onNotesChange,
  isPending,
  mutationErrorMessage,
  onBack,
  onSubmit,
}: ReceivePaymentFormStepProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Summary card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Situação atual
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-slate-400">Total</p>
              <p className="text-sm font-black text-slate-800">
                {formatCentsToBRL(selected.registration_fee_cents)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Pago</p>
              <p className="text-sm font-black text-emerald-600">
                {formatCentsToBRL(selected.total_paid_cents)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Saldo</p>
              <p className="text-sm font-black text-amber-600">
                {formatCentsToBRL(selected.outstanding_cents)}
              </p>
            </div>
          </div>
        </div>

        {/* Valor */}
        <div>
          <label htmlFor="receive-amount" className="text-xs font-semibold text-slate-700 mb-1 block">
            Valor recebido (R$)
          </label>
          <div className="relative">
            <input
              id="receive-amount"
              type="number"
              min="0.01"
              max={selected.outstanding_cents / 100}
              step="0.01"
              value={amountInput}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0,00"
              className={`w-full border rounded-xl px-4 py-3 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 pr-24 ${
                amountError
                  ? 'border-rose-300 focus:ring-rose-300/40'
                  : 'border-slate-200 focus:ring-emerald-400/40'
              }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={() => onAmountChange((selected.outstanding_cents / 2 / 100).toFixed(2))}
                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg cursor-pointer"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => onAmountChange((selected.outstanding_cents / 100).toFixed(2))}
                className="text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2 py-1 rounded-lg cursor-pointer"
              >
                Total
              </button>
            </div>
          </div>
          {amountError && <p className="text-xs text-rose-500 mt-1">{amountError}</p>}
          {amountCents > 0 && amountCents < selected.outstanding_cents && (
            <p className="text-xs text-amber-600 mt-1">
              Pagamento parcial — restará {formatCentsToBRL(selected.outstanding_cents - amountCents)}
            </p>
          )}
          {amountCents > 0 && amountCents >= selected.outstanding_cents && (
            <p className="text-xs text-emerald-600 mt-1 font-semibold">✓ Inscrição será quitada!</p>
          )}
        </div>

        {/* Método */}
        <div>
          <span className="text-xs font-semibold text-slate-700 mb-2 block">Forma de pagamento</span>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                id={`recv-method-${m}`}
                onClick={() => onMethodChange(m)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  method === m
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {PAYMENT_METHOD_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div>
          <label htmlFor="recv-date" className="text-xs font-semibold text-slate-700 mb-1 block">
            Data do recebimento
          </label>
          <input
            id="recv-date"
            type="date"
            value={payDate}
            onChange={(e) => onPayDateChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
        </div>

        {/* Observação */}
        <div>
          <label htmlFor="recv-notes" className="text-xs font-semibold text-slate-700 mb-1 block">
            Observação <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="recv-notes"
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Ex: 1ª parcela, combo inscrição..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
        </div>

        {mutationErrorMessage && (
          <p className="text-xs text-rose-500 font-medium">Erro: {mutationErrorMessage}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-3 border-t border-slate-100 shrink-0 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-2xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Voltar
        </button>
        <button
          id="confirm-receive-payment"
          type="submit"
          disabled={isPending || amountCents <= 0}
          className="flex-[2] py-3 rounded-2xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Registrando...
            </>
          ) : (
            'Confirmar Recebimento'
          )}
        </button>
      </div>
    </form>
  );
}
