import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface FinancialSummaryCardProps {
  totalCollectedCents?: number;
  totalPendingCents?: number;
  paymentRatePercentage?: number;
  paidCount?: number;
  partialCount?: number;
  pendingCount?: number;
  totalRegistrations?: number;
  onOpenCashflow?: () => void;
}

export function FinancialSummaryCard({
  totalCollectedCents = 420000,
  totalPendingCents = 40000,
  paymentRatePercentage = 91,
  paidCount = 28,
  partialCount = 10,
  pendingCount = 15,
  totalRegistrations = 53,
  onOpenCashflow,
}: FinancialSummaryCardProps) {
  const totalGoalCents = totalCollectedCents + totalPendingCents;
  const clampedPercentage = Math.min(100, Math.max(0, paymentRatePercentage));

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Meta de Inscrições
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Arrecadação e quitação da turma
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCashflow}
          className="w-8 h-8 rounded-full border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Ver financeiro completo"
          aria-label="Ver financeiro"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Executive Highlight Panel */}
      <div className="rounded-[22px] p-5 text-white bg-gradient-to-br from-[#0d7647] via-[#0b6a3f] to-[#074b2b] shadow-md shadow-[#0d7647]/15 relative overflow-hidden my-1">
        {/* Subtle decorative curves */}
        <div className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute -right-4 -top-8 w-28 h-28 rounded-full bg-white/[0.05] pointer-events-none" />

        {/* Top Label & Badge */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <TrendingUp className="w-4 h-4 text-[#8ee0b3]" />
            <span>Total Arrecadado</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-xs text-white">
            +{paymentRatePercentage}% da Meta
          </span>
        </div>

        {/* Amount */}
        <div className="relative z-10 mb-3">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCentsToBRL(totalCollectedCents)}
          </span>
        </div>

        {/* Progress Bar towards Target Goal */}
        <div className="relative z-10">
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5 mb-2">
            <div
              style={{ width: `${clampedPercentage}%` }}
              className="bg-white h-full rounded-full transition-all duration-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/80 font-medium">
            <span>Meta: {formatCentsToBRL(totalGoalCents)}</span>
            <span>A receber: {formatCentsToBRL(totalPendingCents)}</span>
          </div>
        </div>
      </div>

      {/* Breakdown: Status dos Alunos (Quitados, Parciais, Pendentes) */}
      <div className="pt-3 mt-2 border-t border-slate-100/90">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Situação dos Alunos ({totalRegistrations})
          </span>

          <button
            type="button"
            onClick={onOpenCashflow}
            className="text-[11px] font-bold text-[#0d7647] hover:underline cursor-pointer"
          >
            Ver extrato
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Quitados */}
          <div className="bg-[#e8f7ee]/70 border border-[#b6e3c9]/60 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-[#0d7647] uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d7647]" />
              <span>Quitados</span>
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 block">
              {paidCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              100% pago
            </span>
          </div>

          {/* Parciais */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-amber-700 uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Parciais</span>
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 block">
              {partialCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              em andamento
            </span>
          </div>

          {/* Pendentes */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-slate-600 uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Pendentes</span>
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 block">
              {pendingCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              aguardando
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
