import { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Search, Loader2, CheckCircle2, MessageCircle, ChevronRight, Users } from 'lucide-react';
import {
  fetchTeamMemberPaymentStatuses,
  registerTeamMemberPayment,
} from '../data/financialData';
import { PAYMENT_METHOD_LABELS, type PaymentMethodKey } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { supabase } from '@/shared/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMemberOption {
  team_member_id: string;
  person_id: string;
  full_name: string;
  phone: string;
  team_role_name: string;
  outstanding_cents: number;
  total_paid_cents: number;
  status: string;
}

interface ReceiveTeamPaymentModalProps {
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

function buildSuccessMessage(name: string, amountCents: number, outstandingAfter: number): string {
  const valor = formatCentsToBRL(amountCents);
  if (outstandingAfter <= 0) {
    return (
      `Olá, ${name}! 🎉\n\n` +
      `Seu pagamento de *${valor}* foi recebido com sucesso.\n` +
      `✅ *Contribuição quitada!* Obrigado por servir!\n\n` +
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
  const colorClass = colorMap[status] ?? colorMap['pending']!;
  const label = labelMap[status] ?? 'Pendente';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ReceiveTeamPaymentModal({ isOpen, editionId, onClose }: ReceiveTeamPaymentModalProps) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<TeamMemberOption | null>(null);
  const [amountCents, setAmountCents] = useState(10000);
  const [method, setMethod] = useState<PaymentMethodKey>('pix');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [successAmount, setSuccessAmount] = useState(0);
  const [successOutstanding, setSuccessOutstanding] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('search');
        setSearchQuery('');
        setSelected(null);
        setAmountCents(10000);
        setMethod('pix');
        setPayDate(new Date().toISOString().slice(0, 10));
        setNotes('');
      }, 300);
    }
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [isOpen]);

  // Query de status de pagamento dos membros
  const { data: statuses = [], isLoading: isLoadingStatuses } = useQuery({
    queryKey: ['team-member-payment-statuses', editionId],
    queryFn: () => fetchTeamMemberPaymentStatuses(editionId),
    enabled: isOpen,
    staleTime: 15_000,
  });

  // Busca nomes e telefones dos membros ativos via join
  const { data: membersRaw = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members-with-people', editionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, person_id, active, team_role_id, team_roles(name), people(full_name, phone)')
        .eq('edition_id', editionId)
        .eq('active', true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: isOpen,
    staleTime: 60_000,
  });

  const isLoading = isLoadingStatuses || isLoadingMembers;

  // Merge: status + dados de pessoa
  const members = useMemo<TeamMemberOption[]>(() => {
    return membersRaw.map((m) => {
      const st = statuses.find((s) => s.team_member_id === m.id);
      const role = m.team_roles as { name: string } | null;
      const person = m.people as { full_name: string; phone: string } | null;
      return {
        team_member_id: m.id,
        person_id: m.person_id,
        full_name: person?.full_name ?? '—',
        phone: person?.phone ?? '',
        team_role_name: role?.name ?? '—',
        outstanding_cents: st?.outstanding_cents ?? 10000,
        total_paid_cents: st?.total_paid_cents ?? 0,
        status: st?.status ?? 'pending',
      };
    });
  }, [membersRaw, statuses]);

  // Filtro por nome / equipe
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.team_role_name.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Mutation de pagamento
  const payMutation = useMutation({
    mutationFn: () =>
      registerTeamMemberPayment({
        team_member_id: selected!.team_member_id,
        edition_id: editionId,
        amount_cents: amountCents,
        method,
        pay_date: payDate,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      const outAfter = Math.max(0, (selected?.outstanding_cents ?? 0) - amountCents);
      setSuccessAmount(amountCents);
      setSuccessOutstanding(outAfter);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['team-member-payment-statuses', editionId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
    },
    onError: (err: Error) => {
      alert(`Erro ao registrar pagamento: ${err.message}`);
    },
  });

  if (!isOpen) return null;

  const canSubmit =
    step === 'form' &&
    selected !== null &&
    amountCents > 0 &&
    amountCents <= (selected?.outstanding_cents ?? 10000);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Receber pagamento de membro de equipe"
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Receber Pag. Equipe</h2>
              <p className="text-[10px] text-slate-400">Contribuição dos voluntários — R$ 100,00</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* STEP: SEARCH */}
          {step === 'search' && (
            <div className="flex flex-col h-full">
              {/* Search input */}
              <div className="px-4 pt-4 pb-3 sticky top-0 bg-white z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Buscar por nome ou equipe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
                  />
                </div>
              </div>

              {/* Member list */}
              <div className="px-4 pb-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs">Carregando membros...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Nenhum membro encontrado.
                  </div>
                ) : (
                  filtered.map((m) => (
                    <button
                      key={m.team_member_id}
                      type="button"
                      onClick={() => {
                        setSelected(m);
                        setAmountCents(Math.min(m.outstanding_cents, 10000));
                        setStep('form');
                      }}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/40 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {m.full_name}
                          </span>
                          <StatusBadge status={m.status} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {m.team_role_name}
                        </p>
                        {m.outstanding_cents > 0 && (
                          <p className="text-[10px] font-semibold text-amber-600 mt-0.5">
                            Pendente: {formatCentsToBRL(m.outstanding_cents)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP: FORM */}
          {step === 'form' && selected && (
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
                  onClick={() => setStep('search')}
                  className="text-[10px] text-violet-600 font-bold hover:underline cursor-pointer"
                >
                  Trocar
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Valor a Receber
                </label>
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
                    onChange={(e) => setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="w-full pl-9 pr-4 py-3 text-base font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
                  />
                </div>
                {amountCents > (selected.outstanding_cents) && (
                  <p className="text-[10px] text-rose-500 mt-1">
                    Valor excede o saldo pendente ({formatCentsToBRL(selected.outstanding_cents)})
                  </p>
                )}
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2 flex-wrap">
                {[5000, 10000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmountCents(Math.min(v, selected.outstanding_cents))}
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
                  onClick={() => setAmountCents(selected.outstanding_cents)}
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethodKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setMethod(k)}
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Data do Pagamento
                </label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
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
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
                />
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && selected && (
            <div className="px-5 py-8 flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Pagamento Registrado!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {formatCentsToBRL(successAmount)} recebido de{' '}
                  <strong>{selected.full_name}</strong>
                </p>
                {successOutstanding > 0 && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    Saldo restante: {formatCentsToBRL(successOutstanding)}
                  </p>
                )}
                {successOutstanding <= 0 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    ✅ Contribuição quitada!
                  </p>
                )}
              </div>

              {selected.phone && (
                <a
                  href={buildWhatsAppUrl(
                    selected.phone,
                    buildSuccessMessage(selected.full_name, successAmount, successOutstanding)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1da84f] text-white text-sm font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar confirmação no WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep('search');
                  setSelected(null);
                  setAmountCents(10000);
                  setSearchQuery('');
                }}
                className="w-full py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Registrar outro pagamento
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex gap-3">
            <button
              type="button"
              onClick={() => setStep('search')}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="button"
              id="btn-confirm-team-payment"
              onClick={() => payMutation.mutate()}
              disabled={!canSubmit || payMutation.isPending}
              className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {payMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-5 py-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
