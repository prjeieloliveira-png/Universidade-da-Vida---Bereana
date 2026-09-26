import { X, Loader2, Users } from 'lucide-react';
import { useReceiveTeamPayment } from '../hooks/useReceiveTeamPayment';
import { ReceiveTeamPaymentSearchStep } from './ReceiveTeamPaymentSearchStep';
import { ReceiveTeamPaymentFormStep } from './ReceiveTeamPaymentFormStep';
import { ReceiveTeamPaymentSuccessStep } from './ReceiveTeamPaymentSuccessStep';

export interface TeamMemberOption {
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

export function ReceiveTeamPaymentModal({ isOpen, editionId, onClose }: ReceiveTeamPaymentModalProps) {
  const {
    step,
    setStep,
    searchQuery,
    setSearchQuery,
    searchRef,
    selected,
    amountCents,
    setAmountCents,
    method,
    setMethod,
    payDate,
    setPayDate,
    notes,
    setNotes,
    successAmount,
    successOutstanding,
    isLoading,
    filtered,
    payMutation,
    canSubmit,
    handleSelectMember,
    handleRegisterAnother,
  } = useReceiveTeamPayment(isOpen, editionId);

  if (!isOpen) return null;

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
          {step === 'search' && (
            <ReceiveTeamPaymentSearchStep
              searchRef={searchRef}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={isLoading}
              filtered={filtered}
              onSelect={handleSelectMember}
            />
          )}

          {step === 'form' && selected && (
            <ReceiveTeamPaymentFormStep
              selected={selected}
              amountCents={amountCents}
              onAmountCentsChange={setAmountCents}
              method={method}
              onMethodChange={setMethod}
              payDate={payDate}
              onPayDateChange={setPayDate}
              notes={notes}
              onNotesChange={setNotes}
              onSwapMember={() => setStep('search')}
            />
          )}

          {step === 'success' && selected && (
            <ReceiveTeamPaymentSuccessStep
              selected={selected}
              successAmount={successAmount}
              successOutstanding={successOutstanding}
              onRegisterAnother={handleRegisterAnother}
            />
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
