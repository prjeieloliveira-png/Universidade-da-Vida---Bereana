import { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Search, Loader2, CheckCircle2, MessageCircle, ChevronRight } from 'lucide-react';
import { registerPayment, fetchRegistrationPaymentStatuses } from '../data/financialData';
import { PAYMENT_METHOD_LABELS, type PaymentMethodKey } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { supabase } from '@/shared/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonOption {
  registration_id: string;
  person_id: string;
  full_name: string;
  phone: string;
  outstanding_cents: number;
  registration_fee_cents: number;
  total_paid_cents: number;
  status: string;
}

interface ReceivePaymentModalProps {
  isOpen: boolean;
  editionId: string;
  onClose: () => void;
}

type Step = 'search' | 'form' | 'success';

// ─── WhatsApp helpers ─────────────────────────────────────────────────────────

function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

function buildSuccessMessage(
  name: string,
  amountCents: number,
  outstandingAfter: number
): string {
  const valor = formatCentsToBRL(amountCents);
  if (outstandingAfter <= 0) {
    return (
      `Olá, ${name}! 🎉\n\n` +
      `Seu pagamento de *${valor}* foi recebido com sucesso.\n` +
      `✅ *Inscrição quitada!* Obrigado!\n\n` +
      `_Universidade da Vida – Bereana_`
    );
  }
  const restante = formatCentsToBRL(outstandingAfter);
  return (
    `Olá, ${name}! ✅\n\n` +
    `Recebemos seu pagamento parcial de *${valor}*.\n` +
    `💰 Saldo restante: *${restante}*\n\n` +
    `Qualquer dúvida, fale conosco.\n` +
    `_Universidade da Vida – Bereana_`
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    pending: 'bg-slate-100 text-slate-600',
  };
  const labelMap: Record<string, string> = {
    paid: 'Pago',
    partial: 'Parcial',
    pending: 'Pendente',
  };
  const colorClass = colorMap[status] ?? colorMap['pending'];
  const label = labelMap[status] ?? 'Pendente';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReceivePaymentModal({ isOpen, editionId, onClose }: ReceivePaymentModalProps) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('search');
  const [selected, setSelected] = useState<PersonOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const [amountInput, setAmountInput] = useState('');
  const [amountCents, setAmountCents] = useState(0);
  const [method, setMethod] = useState<PaymentMethodKey>('pix');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState('');

  const [paidAmount, setPaidAmount] = useState(0);
  const [outstandingAfter, setOutstandingAfter] = useState(0);

  useEffect(() => {
    if (isOpen && step === 'search') {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  function handleClose() {
    setStep('search');
    setSelected(null);
    setSearchQuery('');
    setAmountInput('');
    setAmountCents(0);
    setMethod('pix');
    setPayDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setAmountError('');
    onClose();
  }

  const { data: statuses, isLoading: loadingStatuses } = useQuery({
    queryKey: ['reg-payment-statuses', editionId],
    queryFn: () => fetchRegistrationPaymentStatuses(editionId),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const { data: people, isLoading: loadingPeople } = useQuery({
    queryKey: ['people-for-receive-payment', editionId],
    queryFn: async () => {
      if (!statuses || statuses.length === 0) return [];
      const personIds = statuses.map((s) => s.person_id);

      const { data } = await supabase
        .from('people')
        .select('id, full_name, phone')
        .in('id', personIds);

      return (data ?? []).map((p) => {
        const st = statuses.find((s) => s.person_id === p.id);
        const row = p as { id: string; full_name: string; phone?: string | null };
        return {
          registration_id: st?.registration_id ?? '',
          person_id: p.id,
          full_name: p.full_name ?? '',
          phone: row.phone ?? '',
          outstanding_cents: st?.outstanding_cents ?? 0,
          registration_fee_cents: st?.registration_fee_cents ?? 0,
          total_paid_cents: st?.total_paid_cents ?? 0,
          status: st?.status ?? 'pending',
        } as PersonOption;
      });
    },
    enabled: isOpen && !!statuses && statuses.length > 0,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!people) return [];
    const q = searchQuery.toLowerCase().trim();
    return people
      .filter((p) => !q || p.full_name.toLowerCase().includes(q))
      .sort((a, b) => b.outstanding_cents - a.outstanding_cents);
  }, [people, searchQuery]);

  const mutation = useMutation({
    mutationFn: () =>
      registerPayment({
        reg_id: selected!.registration_id,
        amt: amountCents,
        meth: method,
        pay_date: payDate,
        pay_notes: notes || undefined,
      }),
    onSuccess: () => {
      const after = Math.max(0, (selected?.outstanding_cents ?? 0) - amountCents);
      setPaidAmount(amountCents);
      setOutstandingAfter(after);
      setStep('success');

      void queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['reg-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['people-for-receive-payment', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['registrations'] });
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  function handleAmountChange(val: string) {
    setAmountInput(val);
    setAmountError('');
    const cents = Math.round(parseFloat(val) * 100);
    if (!isNaN(cents) && cents > 0) setAmountCents(cents);
    else setAmountCents(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (amountCents <= 0) {
      setAmountError('Informe um valor válido.');
      return;
    }
    if (amountCents > selected.outstanding_cents) {
      setAmountError(
        `Valor excede o saldo devedor (${formatCentsToBRL(selected.outstanding_cents)}).`
      );
      return;
    }
    mutation.mutate();
  }

  function handleSendWhatsApp() {
    if (!selected) return;
    const message = buildSuccessMessage(selected.full_name, paidAmount, outstandingAfter);
    const url = buildWhatsAppUrl(selected.phone, message);
    window.open(url, '_blank');
  }

  if (!isOpen) return null;

  const methods: PaymentMethodKey[] = ['pix', 'debit', 'credit', 'cash'];
  const isLoading = loadingStatuses || loadingPeople;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Receber Pagamento</h2>
              <p className="text-[11px] text-slate-400">
                {step === 'search'
                  ? 'Selecione o inscrito'
                  : step === 'form'
                  ? selected?.full_name
                  : 'Pagamento registrado'}
              </p>
            </div>
          </div>
          <button
            id="receive-payment-close"
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* STEP: search */}
        {step === 'search' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchRef}
                  id="receive-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  {searchQuery
                    ? 'Nenhum inscrito encontrado.'
                    : 'Nenhuma inscrição com saldo devedor.'}
                </p>
              )}

              {filtered.map((p) => (
                <button
                  key={p.registration_id}
                  type="button"
                  id={`person-${p.registration_id}`}
                  disabled={p.status === 'paid'}
                  onClick={() => {
                    setSelected(p);
                    setAmountInput('');
                    setAmountCents(0);
                    setStep('form');
                  }}
                  className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                    p.status === 'paid'
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100'
                      : 'hover:border-emerald-300 hover:bg-emerald-50/40 border-slate-200 bg-white cursor-pointer'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{p.full_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={p.status} />
                      {p.outstanding_cents > 0 && (
                        <span className="text-xs text-amber-600 font-semibold">
                          Saldo: {formatCentsToBRL(p.outstanding_cents)}
                        </span>
                      )}
                    </div>
                  </div>
                  {p.status !== 'paid' && (
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: form */}
        {step === 'form' && selected && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
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
                    onChange={(e) => handleAmountChange(e.target.value)}
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
                      onClick={() => {
                        const halfStr = (selected.outstanding_cents / 2 / 100).toFixed(2);
                        setAmountInput(halfStr);
                        handleAmountChange(halfStr);
                      }}
                      className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fullStr = (selected.outstanding_cents / 100).toFixed(2);
                        setAmountInput(fullStr);
                        handleAmountChange(fullStr);
                      }}
                      className="text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      Total
                    </button>
                  </div>
                </div>
                {amountError && (
                  <p className="text-xs text-rose-500 mt-1">{amountError}</p>
                )}
                {amountCents > 0 && amountCents < selected.outstanding_cents && (
                  <p className="text-xs text-amber-600 mt-1">
                    Pagamento parcial — restará {formatCentsToBRL(selected.outstanding_cents - amountCents)}
                  </p>
                )}
                {amountCents > 0 && amountCents >= selected.outstanding_cents && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">
                    ✓ Inscrição será quitada!
                  </p>
                )}
              </div>

              {/* Método */}
              <div>
                <span className="text-xs font-semibold text-slate-700 mb-2 block">Forma de pagamento</span>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      id={`recv-method-${m}`}
                      onClick={() => setMethod(m)}
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
                  onChange={(e) => setPayDate(e.target.value)}
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
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: 1ª parcela, combo inscrição..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
              </div>

              {mutation.isError && (
                <p className="text-xs text-rose-500 font-medium">
                  Erro: {(mutation.error as Error).message}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-3 border-t border-slate-100 shrink-0 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('search')}
                className="flex-1 py-3 rounded-2xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                id="confirm-receive-payment"
                type="submit"
                disabled={mutation.isPending || amountCents <= 0}
                className="flex-[2] py-3 rounded-2xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</>
                ) : (
                  'Confirmar Recebimento'
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP: success */}
        {step === 'success' && selected && (
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              {outstandingAfter <= 0 ? 'Inscrição Quitada! 🎉' : 'Pagamento Registrado!'}
            </h3>
            <p className="text-sm text-slate-500 mb-1">
              <span className="font-bold text-slate-800">{selected.full_name}</span>
            </p>
            <p className="text-2xl font-black text-emerald-600 mb-1">
              {formatCentsToBRL(paidAmount)}
            </p>
            {outstandingAfter > 0 && (
              <p className="text-sm text-amber-600 font-semibold mb-1">
                Saldo restante: {formatCentsToBRL(outstandingAfter)}
              </p>
            )}

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full mt-2 mb-6 ${
                outstandingAfter <= 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {outstandingAfter <= 0 ? '✓ Pago' : '◑ Parcial'}
            </span>

            <div className="w-full space-y-3">
              {selected.phone && (
                <button
                  id="send-whatsapp-receipt"
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-3 rounded-2xl text-sm font-black bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar Comprovante via WhatsApp
                </button>
              )}

              <button
                id="receive-another-payment"
                type="button"
                onClick={() => {
                  setStep('search');
                  setSelected(null);
                  setSearchQuery('');
                  setAmountInput('');
                  setAmountCents(0);
                }}
                className="w-full py-3 rounded-2xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Receber outro pagamento
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
