import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface FinancialMetricCardsProps {
  totalInCents: number;
  countIn: number;
  totalOutCents: number;
  countOut: number;
  netBalanceCents: number;
}

export function FinancialMetricCards({
  totalInCents,
  countIn,
  totalOutCents,
  countOut,
  netBalanceCents,
}: FinancialMetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: RECEITAS */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0d7647]">
            Receitas
          </span>
          <div className="w-8 h-8 rounded-full bg-[#e8f7ee] text-[#0d7647] flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCentsToBRL(totalInCents)}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {countIn} {countIn === 1 ? 'registro' : 'registros'}
          </p>
        </div>
      </div>

      {/* Card 2: DESPESAS */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
            Despesas
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCentsToBRL(totalOutCents)}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {countOut} {countOut === 1 ? 'registro' : 'registros'}
          </p>
        </div>
      </div>

      {/* Card 3: SALDO */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0d7647]">
            Saldo
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0d7647] flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              netBalanceCents >= 0 ? 'text-[#0d7647]' : 'text-rose-600'
            }`}
          >
            {formatCentsToBRL(netBalanceCents)}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Receitas − Despesas
          </p>
        </div>
      </div>
    </div>
  );
}
