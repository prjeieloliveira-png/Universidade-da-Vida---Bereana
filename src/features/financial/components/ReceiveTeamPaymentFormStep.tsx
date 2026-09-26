import { PAYMENT_METHOD_LABELS, type PaymentMethodKey } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import type { TeamMemberOption } from './ReceiveTeamPaymentModal';

const QUICK_AMOUNTS_CENTS = [5000, 10000];

interface ReceiveTeamPaymentFormStepProps {
  selected: TeamMemberOption;
  amountCents: number;
  onAmountCentsChange: (cents: number) => void;
  method: PaymentMethodKey;
  onMethodChange: (method: PaymentMethodKey) => void;
  payDate: string;
  onPayDateChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onSwapMember: () => void;
}

export function ReceiveTeamPaymentFormStep({
  selected,
  amountCents,
  onAmountCentsChange,
  method,
  onMethodChange,
  payDate,
  onPayDateChange,
  notes,
  onNotesChange,
  onSwapMember,
}: ReceiveTeamPaymentFormStepProps) {
  return (
    <div className="px-5 py-5 space-y-5">
      {/* Selected member info */}
      <div className="bg-violet-50 rounded-2xl px-4 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-200 text-violet-700 flex items-center justify-center font-black text-sm shrink-0">
          {selected.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 truncate">{selected.full_name}</p>
          <p className="text-[10px] text-slate-500">{selected.team_role_name}</p>
          <p className="text-[10px] font-semibold text-amber-600 mt-0.5">
            Pendente: {formatCentsToBRL(selected.outstanding_cents)}
          </p>
        </div>
        <button
          type="button"
          onClick={onSwapMember}
          className="text-[10px] text-violet-600 font-bold hover:underline cursor-pointer"
        >
          Trocar
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Valor a Receber</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
            R$
          </span>
          <input
            type="number"
            min={1}
            max={selected.outstanding_cents / 100}
            step={0.01}
            value={(amountCents / 100).toFixed(2)}
            onChange={(e) => onAmountCentsChange(Math.round(parseFloat(e.target.value || '0') * 100))}
            className="w-full pl-9 pr-4 py-3 text-base font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
          />
        </div>
        {amountCents > selected.outstanding_cents && (
          <p className="text-[10px] text-rose-500 mt-1">
            Valor excede o saldo pendente ({formatCentsToBRL(selected.outstanding_cents)})
          </p>
        )}
      </div>

      {/* Quick amount buttons */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_AMOUNTS_CENTS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onAmountCentsChange(Math.min(v, selected.outstanding_cents))}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              amountCents === Math.min(v, selected.outstanding_cents)
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
            }`}
          >
            {formatCentsToBRL(v)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onAmountCentsChange(selected.outstanding_cents)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
            amountCents === selected.outstanding_cents
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
          }`}
        >
          Total pendente
        </button>
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Forma de Pagamento</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethodKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onMethodChange(k)}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                method === k
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
              }`}
            >
              {PAYMENT_METHOD_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Data do Pagamento</label>
        <input
          type="date"
          value={payDate}
          onChange={(e) => onPayDateChange(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Observação <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <input
          type="text"
          placeholder="Ex.: comprovante enviado por WhatsApp"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
        />
      </div>
    </div>
  );
}
