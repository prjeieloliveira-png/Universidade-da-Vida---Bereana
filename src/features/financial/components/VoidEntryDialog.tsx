import { useEffect, useState } from 'react';
import { Trash2, Loader2, X } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';
import type { CashFlowEntry } from '../types';

interface VoidEntryDialogProps {
  entry: CashFlowEntry | null;
  onClose: () => void;
  onConfirm: (entry: CashFlowEntry, reason: string) => Promise<unknown>;
}

const DEFAULT_REASON = 'Estorno manual via painel';

export function VoidEntryDialog({ entry, onClose, onConfirm }: VoidEntryDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setReason('');
      setErrorMsg(null);
    }
  }, [entry]);

  if (!entry) return null;

  const isIn = entry.flow_type === 'in';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(entry, reason.trim() || DEFAULT_REASON);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Não foi possível estornar o lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900">Estornar lançamento</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <p className="text-sm font-bold text-slate-900 truncate">
              {entry.description || entry.person_name || entry.category}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{entry.category}</p>
            <p className={`text-lg font-black mt-1 ${isIn ? 'text-[#0d7647]' : 'text-rose-600'}`}>
              {isIn ? '+' : '−'}
              {formatCentsToBRL(entry.amount_cents)}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            O lançamento sai do extrato e do saldo do caixa (fica registrado como estornado).
          </p>

          <div>
            <label htmlFor="void-reason" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Motivo <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="void-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: lançado em duplicidade"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white text-slate-900"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/70 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSubmitting ? 'Estornando...' : 'Estornar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
