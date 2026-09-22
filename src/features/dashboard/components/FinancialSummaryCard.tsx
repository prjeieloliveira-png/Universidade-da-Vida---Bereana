import { FileText, DollarSign } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface FinancialSummaryCardProps {
  totalCollectedCents?: number;
  totalPendingCents?: number;
  paymentRatePercentage?: number;
  onOpenCashflow?: () => void;
}

export function FinancialSummaryCard({
  totalCollectedCents = 420000,
  totalPendingCents = 40000,
  paymentRatePercentage = 91,
  onOpenCashflow,
}: FinancialSummaryCardProps) {
  return (
    <div className="bg-[#163242] text-white border border-[#102734] rounded-[28px] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Mint Highlight Capsule */}
        <div className="bg-[#58bc75] text-[#0f2430] rounded-2xl p-3 flex items-center justify-between font-semibold text-xs mb-4 shadow-xs">
          <span>Arrecadação Confirmada</span>
          <span className="font-extrabold text-sm">
            {formatCentsToBRL(totalCollectedCents)}
          </span>
        </div>

        {/* Sub-metrics Pills */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-300 block">A Receber</span>
            <span className="text-sm font-bold text-white">
              {formatCentsToBRL(totalPendingCents)}
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-300 block">Quitação</span>
            <span className="text-sm font-bold text-[#58bc75]">
              {paymentRatePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Main Amount */}
      <div className="pt-2 border-t border-white/10 flex items-end justify-between">
        <div>
          <span className="text-[11px] text-slate-300 font-medium block">
            Saldo Total no Caixa
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCentsToBRL(totalCollectedCents)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCashflow}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center transition-colors text-white cursor-pointer"
            title="Extrato do Caixa"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCashflow}
            className="w-10 h-10 rounded-full bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#439b5d] text-[#163242] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Lançar Pagamento"
          >
            <DollarSign className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
