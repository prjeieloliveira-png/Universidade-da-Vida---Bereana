import { CheckCircle2, MessageCircle } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';
import type { PersonOption } from './ReceivePaymentModal';

interface ReceivePaymentSuccessStepProps {
  selected: PersonOption;
  paidAmount: number;
  outstandingAfter: number;
  onSendWhatsApp: () => void;
  onReceiveAnother: () => void;
  onClose: () => void;
}

export function ReceivePaymentSuccessStep({
  selected,
  paidAmount,
  outstandingAfter,
  onSendWhatsApp,
  onReceiveAnother,
  onClose,
}: ReceivePaymentSuccessStepProps) {
  return (
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
      <p className="text-2xl font-black text-emerald-600 mb-1">{formatCentsToBRL(paidAmount)}</p>
      {outstandingAfter > 0 && (
        <p className="text-sm text-amber-600 font-semibold mb-1">
          Saldo restante: {formatCentsToBRL(outstandingAfter)}
        </p>
      )}

      <span
        className={`text-xs font-bold px-3 py-1 rounded-full mt-2 mb-6 ${
          outstandingAfter <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}
      >
        {outstandingAfter <= 0 ? '✓ Pago' : '◑ Parcial'}
      </span>

      <div className="w-full space-y-3">
        {selected.phone && (
          <button
            id="send-whatsapp-receipt"
            type="button"
            onClick={onSendWhatsApp}
            className="w-full py-3 rounded-2xl text-sm font-black bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar Comprovante via WhatsApp
          </button>
        )}

        <button
          id="receive-another-payment"
          type="button"
          onClick={onReceiveAnother}
          className="w-full py-3 rounded-2xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Receber outro pagamento
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
