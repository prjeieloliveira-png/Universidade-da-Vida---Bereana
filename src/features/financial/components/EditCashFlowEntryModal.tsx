import { useEffect, useState, type FormEvent } from 'react';
import { X, Pencil } from 'lucide-react';
import { PAYMENT_METHOD_LABELS, type CashCategory, type CashFlowEntry, type EditCashFlowInput } from '../types';

interface EditCashFlowEntryModalProps {
  entry: CashFlowEntry | null;
  categories: CashCategory[];
  onClose: () => void;
  onSave: (entry: CashFlowEntry, input: EditCashFlowInput) => Promise<unknown>;
}

const SOURCE_LABELS: Record<CashFlowEntry['source'], string> = {
  payment: 'Inscrição de aluno',
  team_payment: 'Pagamento de equipe',
  manual: 'Lançamento manual',
};

const inputCls =
  'w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900 transition-all';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5';

function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

function parseAmountToCents(raw: string): number | null {
  const parsed = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

export function EditCashFlowEntryModal({ entry, categories, onClose, onSave }: EditCashFlowEntryModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('pix');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'revenue' | 'expense'>('revenue');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    setAmount(centsToInput(entry.amount_cents));
    setMethod(entry.payment_method);
    setDate(entry.date.slice(0, 10));
    setNotes(entry.notes ?? '');
    setType(entry.flow_type === 'in' ? 'revenue' : 'expense');
    setCategory(entry.category);
    setDescription(entry.description ?? '');
    setReceiptUrl(entry.receipt_url ?? '');
    setErrorMsg(null);
  }, [entry]);

  if (!entry) return null;

  const isManual = entry.source === 'manual';
  const typeCategories = categories.filter((c) => c.type === (type === 'revenue' ? 'in' : 'out'));
  const categoryNames = typeCategories.some((c) => c.name === category)
    ? typeCategories.map((c) => c.name)
    : [category, ...typeCategories.map((c) => c.name)].filter(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cents = parseAmountToCents(amount);
    if (cents === null) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }
    if (isManual && (!category.trim() || !description.trim())) {
      setErrorMsg('Categoria e descrição são obrigatórias.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(entry, {
        amount_cents: cents,
        payment_method: method,
        date,
        notes: isManual ? undefined : notes,
        ...(isManual ? { type, category, description, receipt_url: receiptUrl } : {}),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao salvar a edição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto my-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-600">
              <Pencil className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Editar lançamento</h3>
              <p className="text-xs text-slate-400 truncate">
                {SOURCE_LABELS[entry.source]}
                {entry.person_name ? ` • ${entry.person_name}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          {isManual && (
            <div>
              <span className={labelCls}>Tipo</span>
              <div className="grid grid-cols-2 gap-2">
                {(['revenue', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setCategory('');
                    }}
                    className={`py-2.5 rounded-xl text-sm font-bold cursor-pointer border ${
                      type === t
                        ? t === 'revenue'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {t === 'revenue' ? 'Entrada' : 'Saída'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="edit-amount">Valor (R$)</label>
              <input id="edit-amount" type="text" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="edit-date">Data</label>
              <input id="edit-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="edit-method">Forma de pagamento</label>
            <select id="edit-method" value={method} onChange={(e) => setMethod(e.target.value)} className={`${inputCls} cursor-pointer`}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {isManual ? (
            <>
              <div>
                <label className={labelCls} htmlFor="edit-category">Categoria</label>
                <select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  <option value="" disabled>Selecione...</option>
                  {categoryNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="edit-description">Descrição</label>
                <input id="edit-description" type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="edit-receipt">Comprovante (link)</label>
                <input id="edit-receipt" type="text" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="Opcional" className={inputCls} />
              </div>
            </>
          ) : (
            <div>
              <label className={labelCls} htmlFor="edit-notes">Observação</label>
              <textarea id="edit-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" className={`${inputCls} resize-none`} />
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer bg-[#0d7647] hover:bg-[#095a36] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
