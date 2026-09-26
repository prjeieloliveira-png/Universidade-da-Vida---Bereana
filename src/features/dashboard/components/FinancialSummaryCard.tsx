import { ArrowUpRight, TrendingUp, Users } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface FinancialSummaryCardProps {
  // Inscritos
  totalCollectedCents?: number;
  totalPendingCents?: number;
  paymentRatePercentage?: number;
  paidCount?: number;
  partialCount?: number;
  pendingCount?: number;
  totalRegistrations?: number;
  totalRegistrationGoalCents?: number;
  // Equipes
  totalTeamMembers?: number;
  teamPaidCount?: number;
  teamPartialCount?: number;
  teamPendingCount?: number;
  totalTeamGoalCents?: number;
  totalTeamPaidCents?: number;
  totalTeamReceivableCents?: number;
  onOpenCashflow?: () => void;
}

export function FinancialSummaryCard({
  totalCollectedCents = 0,
  totalPendingCents = 0,
  paymentRatePercentage = 0,
  paidCount = 0,
  partialCount = 0,
  pendingCount = 0,
  totalRegistrations = 0,
  totalRegistrationGoalCents,
  totalTeamMembers = 0,
  teamPaidCount = 0,
  teamPartialCount = 0,
  teamPendingCount = 0,
  totalTeamGoalCents = 0,
  totalTeamPaidCents = 0,
  totalTeamReceivableCents = 0,
  onOpenCashflow,
}: FinancialSummaryCardProps) {
  // Meta de inscritos (usa totalRegistrationGoalCents se disponível, senão soma com pendentes)
  const registrationGoal = totalRegistrationGoalCents ?? (totalCollectedCents + totalPendingCents);
  const registrationRate = registrationGoal > 0
    ? Math.min(100, Math.round((totalCollectedCents / registrationGoal) * 100))
    : paymentRatePercentage;

  // Meta de equipes
  const teamRate = totalTeamGoalCents > 0
    ? Math.min(100, Math.round((totalTeamPaidCents / totalTeamGoalCents) * 100))
    : 0;

  // Meta consolidada = inscritos + equipes
  const totalGoalCents = registrationGoal + totalTeamGoalCents;
  const totalPaidCents = totalCollectedCents + totalTeamPaidCents;
  const consolidatedRate = totalGoalCents > 0
    ? Math.min(100, Math.round((totalPaidCents / totalGoalCents) * 100))
    : 0;

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col gap-4 h-full">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Meta Financeira
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Inscrições + contribuições das equipes
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

      {/* ── PAINEL CONSOLIDADO ── */}
      <div className="rounded-[22px] p-5 text-white bg-gradient-to-br from-[#0d7647] via-[#0b6a3f] to-[#074b2b] shadow-md shadow-[#0d7647]/15 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="absolute -right-4 -top-8 w-28 h-28 rounded-full bg-white/[0.05] pointer-events-none" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <TrendingUp className="w-4 h-4 text-[#8ee0b3]" />
            <span>Total Arrecadado</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-xs text-white">
            {consolidatedRate}% da Meta
          </span>
        </div>

        <div className="relative z-10 mb-3">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCentsToBRL(totalPaidCents)}
          </span>
        </div>

        <div className="relative z-10">
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5 mb-2">
            <div
              style={{ width: `${consolidatedRate}%` }}
              className="bg-white h-full rounded-full transition-all duration-500 shadow-2xs"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/80 font-medium">
            <span>Meta: {formatCentsToBRL(totalGoalCents)}</span>
            <span>A receber: {formatCentsToBRL(totalPendingCents + totalTeamReceivableCents)}</span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO: INSCRITOS ── */}
      <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Inscritos ({totalRegistrations})
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0d7647]">
              {registrationRate}%
            </span>
            <button
              type="button"
              onClick={onOpenCashflow}
              className="text-[11px] font-bold text-[#0d7647] hover:underline cursor-pointer"
            >
              Ver extrato
            </button>
          </div>
        </div>

        {/* Progress bar inscritos */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${registrationRate}%` }}
            className="bg-[#0d7647] h-full rounded-full transition-all duration-500"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Pago: {formatCentsToBRL(totalCollectedCents)}</span>
          <span>Meta: {formatCentsToBRL(registrationGoal)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-[#e8f7ee]/70 border border-[#b6e3c9]/60 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold text-[#0d7647] uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d7647]" />
              <span>Quitados</span>
            </div>
            <span className="text-xs font-black text-slate-900 block">{paidCount}</span>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold text-amber-700 uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Parciais</span>
            </div>
            <span className="text-xs font-black text-slate-900 block">{partialCount}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold text-slate-600 uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Pendentes</span>
            </div>
            <span className="text-xs font-black text-slate-900 block">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO: EQUIPES ── */}
      <div className="border border-violet-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Equipes ({totalTeamMembers})
            </span>
          </div>
          <span className="text-[11px] font-bold text-violet-600">
            {teamRate}%
          </span>
        </div>

        {/* Progress bar equipes */}
        <div className="w-full bg-violet-100 h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${teamRate}%` }}
            className="bg-violet-500 h-full rounded-full transition-all duration-500"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Pago: {formatCentsToBRL(totalTeamPaidCents)}</span>
          <span>Meta: {formatCentsToBRL(totalTeamGoalCents)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-violet-50 border border-violet-200/60 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold text-violet-700 uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>Quitados</span>
            </div>
            <span className="text-xs font-black text-slate-900 block">{teamPaidCount}</span>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold text-amber-700 uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Parciais</span>
            </div>
            <span className="text-xs font-black text-slate-900 block">{teamPartialCount}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold text-slate-600 uppercase tracking-tight mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Pendentes</span>
            </div>
            <span className="text-xs font-black text-slate-900 block">{teamPendingCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
