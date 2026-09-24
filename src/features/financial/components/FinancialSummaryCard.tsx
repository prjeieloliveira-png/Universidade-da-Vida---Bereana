import type { CashSummary } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { TrendingUp, TrendingDown, Wallet, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FinancialSummaryCardProps {
  summary: CashSummary;
}

export function FinancialSummaryCard({ summary }: FinancialSummaryCardProps) {
  const paidPct = summary.total_registrations > 0
    ? Math.round((summary.paid_count / summary.total_registrations) * 100)
    : 0;

  const cards = [
    {
      label: 'Receitas',
      value: formatCentsToBRL(summary.total_in_cents),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Despesas',
      value: formatCentsToBRL(summary.total_out_cents),
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      label: 'Saldo Líquido',
      value: formatCentsToBRL(summary.net_balance_cents),
      icon: Wallet,
      color: summary.net_balance_cents >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bg: summary.net_balance_cents >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      border: summary.net_balance_cents >= 0 ? 'border-emerald-100' : 'border-rose-100',
    },
    {
      label: 'A Receber',
      value: formatCentsToBRL(summary.total_receivable_cents),
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-4 ${card.bg} ${card.border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
              </div>
              <p className={`text-lg font-black tracking-tight ${card.color}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Inscrições status bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Status de Inscrições</span>
          </div>
          <span className="text-xs text-slate-400">{summary.total_registrations} total</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex mb-3">
          {summary.paid_count > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(summary.paid_count / summary.total_registrations) * 100}%` }}
            />
          )}
          {summary.partial_count > 0 && (
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${(summary.partial_count / summary.total_registrations) * 100}%` }}
            />
          )}
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-slate-600 font-medium">{summary.paid_count} pagos</span>
            <span className="text-slate-400">({paidPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-600 font-medium">{summary.partial_count} parcial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium">{summary.pending_count} pendente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
