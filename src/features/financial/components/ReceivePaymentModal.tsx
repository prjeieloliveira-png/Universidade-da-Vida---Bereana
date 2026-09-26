import { X, MessageCircle } from 'lucide-react';
import { useReceivePayment } from '../hooks/useReceivePayment';
import { ReceivePaymentSearchStep } from './ReceivePaymentSearchStep';
import { ReceivePaymentFormStep } from './ReceivePaymentFormStep';
import { ReceivePaymentSuccessStep } from './ReceivePaymentSuccessStep';

export interface PersonOption {
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

export function ReceivePaymentModal({ isOpen, editionId, onClose }: ReceivePaymentModalProps) {
  const {
    step,
    setStep,
    selected,
    searchQuery,
    setSearchQuery,
    searchRef,
    amountInput,
    amountCents,
    amountError,
    method,
    setMethod,
    payDate,
    setPayDate,
    notes,
    setNotes,
    paidAmount,
    outstandingAfter,
    isLoading,
    filtered,
    mutation,
    handleClose,
    handleAmountChange,
    handleSubmit,
    handleSelectPerson,
    handleSendWhatsApp,
    handleReceiveAnother,
  } = useReceivePayment(isOpen, editionId, onClose);

  if (!isOpen) return null;

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

        {step === 'search' && (
          <ReceivePaymentSearchStep
            searchRef={searchRef}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
            filtered={filtered}
            onSelect={handleSelectPerson}
          />
        )}

        {step === 'form' && selected && (
          <ReceivePaymentFormStep
            selected={selected}
            amountInput={amountInput}
            amountCents={amountCents}
            amountError={amountError}
            onAmountChange={handleAmountChange}
            method={method}
            onMethodChange={setMethod}
            payDate={payDate}
            onPayDateChange={setPayDate}
            notes={notes}
            onNotesChange={setNotes}
            isPending={mutation.isPending}
            mutationErrorMessage={mutation.isError ? (mutation.error as Error).message : undefined}
            onBack={() => setStep('search')}
            onSubmit={handleSubmit}
          />
        )}

        {step === 'success' && selected && (
          <ReceivePaymentSuccessStep
            selected={selected}
            paidAmount={paidAmount}
            outstandingAfter={outstandingAfter}
            onSendWhatsApp={handleSendWhatsApp}
            onReceiveAnother={handleReceiveAnother}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
