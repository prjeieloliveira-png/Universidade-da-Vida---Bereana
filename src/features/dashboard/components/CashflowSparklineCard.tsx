import { ArrowUpRight, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface CashflowSparklineCardProps {
  totalBalanceCents?: number;
  onOpenFinancial?: () => void;
  onAddPayment?: () => void;
}

export function CashflowSparklineCard({
  totalBalanceCents = 420000,
  onOpenFinancial,
  onAddPayment,
}: CashflowSparklineCardProps) {
  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Saldo em Caixa
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Balanço líquido disponível
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFinancial}
          className="w-8 h-8 rounded-full border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Ver caixa completo"
          aria-label="Ver caixa"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Big Balance */}
      <div className="text-center my-2">
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
          Total em Caixa
        </span>
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {formatCentsToBRL(totalBalanceCents)}
        </span>
      </div>

      {/* Smooth Sparkline Wave (SVG) */}
      <div className="w-full h-16 my-2 relative">
        <svg
          viewBox="0 0 300 80"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="quixoticWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d7647" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0d7647" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d="M 0 50 Q 30 65, 60 45 T 120 20 T 180 35 T 240 15 T 300 30 L 300 80 L 0 80 Z"
            fill="url(#quixoticWaveGrad)"
          />

          {/* Line stroke */}
          <path
            d="M 0 50 Q 30 65, 60 45 T 120 20 T 180 35 T 240 15 T 300 30"
            fill="none"
            stroke="#0d7647"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Quixotic Action Buttons: Entrada ↑ and Saída ↓ */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onAddPayment}
          className="flex-1 py-2 px-3 rounded-full text-xs font-bold bg-[#0d7647] hover:bg-[#095a36] text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <span>Entrada</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenFinancial}
          className="flex-1 py-2 px-3 rounded-full text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <span>Saída</span>
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
