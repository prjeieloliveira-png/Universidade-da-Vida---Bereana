import { CheckCircle2, MessageCircle } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { buildPaymentSuccessMessage, buildWhatsAppUrl } from './paymentReceiptShared';
import type { TeamMemberOption } from './ReceiveTeamPaymentModal';

interface ReceiveTeamPaymentSuccessStepProps {
  selected: TeamMemberOption;
  successAmount: number;
  successOutstanding: number;
  onRegisterAnother: () => void;
}

export function ReceiveTeamPaymentSuccessStep({
  selected,
  successAmount,
  successOutstanding,
  onRegisterAnother,
}: ReceiveTeamPaymentSuccessStepProps) {
  return (
    <div className="px-5 py-8 flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900">Pagamento Registrado!</h3>
        <p className="text-sm text-slate-500 mt-1">
          {formatCentsToBRL(successAmount)} recebido de <strong>{selected.full_name}</strong>
        </p>
        {successOutstanding > 0 && (
          <p className="text-xs text-amber-600 font-semibold mt-1">
            Saldo restante: {formatCentsToBRL(successOutstanding)}
          </p>
        )}
        {successOutstanding <= 0 && (
          <p className="text-xs text-emerald-600 font-semibold mt-1">✅ Contribuição quitada!</p>
        )}
      </div>

      {selected.phone && (
        <a
          href={buildWhatsAppUrl(
            selected.phone,
            buildPaymentSuccessMessage(selected.full_name, successAmount, successOutstanding, 'Contribuição quitada')
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
        onClick={onRegisterAnother}
        className="w-full py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        Registrar outro pagamento
      </button>
    </div>
  );
}
