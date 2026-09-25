import { ArrowUpRight, Wifi } from 'lucide-react';
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
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header (Quixotic style) */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Meta Financeira
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Total arrecadado na turma
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCashflow}
          className="w-8 h-8 rounded-full border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Ver detalhes financeiros"
          aria-label="Ver financeiro"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* The Signature Quixotic Green Card */}
      <div className="rounded-[22px] p-5 text-white bg-gradient-to-br from-[#0d7647] via-[#0b6a3f] to-[#074b2b] shadow-md shadow-[#0d7647]/20 relative overflow-hidden my-1">
        {/* Subtle decorative curves */}
        <div className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute -right-4 -top-8 w-28 h-28 rounded-full bg-white/[0.05] pointer-events-none" />

        {/* Top of Card: Brand + Contactless */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-wider uppercase text-white">
              UV CARD
            </span>
          </div>
          <Wifi className="w-5 h-5 rotate-90 text-white/80" />
        </div>

        {/* Card Middle: Balance */}
        <div className="relative z-10 mb-5">
          <span className="text-[11px] text-white/80 font-medium block">
            Saldo Arrecadado
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCentsToBRL(totalCollectedCents)}
          </span>
        </div>

        {/* Card Bottom: Masked number & Expiration */}
        <div className="flex items-center justify-between text-xs text-white/80 font-mono relative z-10 pt-1 border-t border-white/10">
          <span>•••• 2026</span>
          <span className="text-[11px]">EXP 12/26</span>
        </div>
      </div>

      {/* Card Footer: Weekly / Pending Revenue */}
      <div className="pt-4 mt-3 border-t border-slate-100/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">
            A Receber na Turma
          </span>
          <span className="text-sm font-extrabold text-slate-800">
            {formatCentsToBRL(totalPendingCents)}
          </span>
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f7ee] text-[#0d7647]">
          +{paymentRatePercentage}% Quitado
        </span>
      </div>
    </div>
  );
}
