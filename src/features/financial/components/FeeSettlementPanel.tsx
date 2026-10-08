import { useState } from 'react';
import { Loader2, CheckCircle2, Undo2 } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';
import {
  setPaymentFee,
  settlePaymentObligation,
  unsettlePaymentObligation,
} from '../data/financialData';
import type { PaymentObligationKind } from '../types';

interface FeeSettlementPanelProps {
  kind: PaymentObligationKind;
  id: string;
  personName: string;
  feeCents: number;
  paidCents: number;
  waivedCents: number;
  settledAt: string | null;
  /** Chamado após qualquer alteração bem-sucedida (para recarregar os dados). */
  onChanged: () => void;
}

const inputCls =
  'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900';

function parseToCents(raw: string): number | null {
  const parsed = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(parsed) || parsed <= 0 ? null : Math.round(parsed * 100);
}

export function FeeSettlementPanel({
  kind,
  id,
  personName,
  feeCents,
  paidCents,
  waivedCents,
  settledAt,
  onChanged,
}: FeeSettlementPanelProps) {
  const [feeInput, setFeeInput] = useState((feeCents / 100).toFixed(2).replace('.', ','));
  const [busy, setBusy] = useState<'fee' | 'settle' | 'unsettle' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSettled = settledAt !== null;
  const canSettle = !isSettled && paidCents > 0 && paidCents < feeCents;
  const newFee = parseToCents(feeInput);
  const feeChanged = newFee !== null && newFee !== feeCents;

  const run = async (action: 'fee' | 'settle' | 'unsettle', fn: () => Promise<void>) => {
    setBusy(action);
    setError(null);
    try {
      await fn();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a operação.');
    } finally {
      setBusy(null);
    }
  };

  const handleSettle = () => {
    const waived = formatCentsToBRL(feeCents - paidCents);
    const ok = window.confirm(
      `Concluir a quitação de ${personName}?\n\nPago: ${formatCentsToBRL(paidCents)} de ${formatCentsToBRL(feeCents)}.\nO restante (${waived}) será abatido e a pessoa ficará como Paga. Você pode desfazer depois.`
    );
    if (ok) void run('settle', () => settlePaymentObligation(kind, id));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
        Valor da inscrição e quitação
      </p>

      {error && (
        <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor={`fee-${id}`} className="block text-[11px] font-bold text-slate-600 mb-1">
            Valor da inscrição (R$)
          </label>
          <input
            id={`fee-${id}`}
            type="text"
            inputMode="decimal"
            value={feeInput}
            onChange={(e) => setFeeInput(e.target.value)}
            disabled={isSettled}
            className={`${inputCls} disabled:opacity-60`}
          />
        </div>
        <button
          type="button"
          disabled={!feeChanged || isSettled || busy !== null}
          onClick={() => newFee !== null && void run('fee', () => setPaymentFee(kind, id, newFee))}
          className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
        >
          {busy === 'fee' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Salvar valor
        </button>
      </div>
      {isSettled && (
        <p className="text-[11px] text-slate-400">Desfaça a quitação para alterar o valor da inscrição.</p>
      )}

      {isSettled ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-2">
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Quitação concluída — abatimento de {formatCentsToBRL(waivedCents)}
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void run('unsettle', () => unsettlePaymentObligation(kind, id))}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            {busy === 'unsettle' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Undo2 className="w-3 h-3" />}
            Desfazer quitação
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canSettle || busy !== null}
          onClick={handleSettle}
          title={
            canSettle
              ? 'Marcar como pago mesmo sem o valor completo'
              : 'Disponível quando há pagamento parcial (pagou algo, mas não o total)'
          }
          className="w-full py-2.5 rounded-xl text-xs font-black border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
        >
          {busy === 'settle' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Quitação concluída
        </button>
      )}
    </div>
  );
}
