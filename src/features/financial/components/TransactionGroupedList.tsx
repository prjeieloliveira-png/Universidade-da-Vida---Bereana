import { useMemo } from 'react';
import {
  GraduationCap,
  Building2,
  Utensils,
  BookOpen,
  Shirt,
  Car,
  Heart,
  Music,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
} from 'lucide-react';
import type { CashFlowEntry } from '../types';
import { PAYMENT_METHOD_LABELS } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface TransactionGroupedListProps {
  entries: CashFlowEntry[];
  onVoid?: (entry: CashFlowEntry) => void;
  isLoading?: boolean;
  isVoiding?: boolean;
}

function getCategoryIcon(category: string, flowType: 'in' | 'out') {
  const norm = category.toLowerCase();
  if (norm.includes('inscrição') || norm.includes('inscricao')) {
    return { icon: GraduationCap, bg: 'bg-emerald-50 text-[#0d7647]' };
  }
  if (norm.includes('sítio') || norm.includes('sitio') || norm.includes('locação') || norm.includes('locacao')) {
    return { icon: Building2, bg: 'bg-amber-50 text-amber-700' };
  }
  if (norm.includes('alimentação') || norm.includes('alimentacao') || norm.includes('lanche')) {
    return { icon: Utensils, bg: 'bg-orange-50 text-orange-600' };
  }
  if (norm.includes('material') || norm.includes('apostila')) {
    return { icon: BookOpen, bg: 'bg-blue-50 text-blue-600' };
  }
  if (norm.includes('camisa') || norm.includes('camiseta')) {
    return { icon: Shirt, bg: 'bg-purple-50 text-purple-600' };
  }
  if (norm.includes('transporte') || norm.includes('uber') || norm.includes('combustível')) {
    return { icon: Car, bg: 'bg-red-50 text-red-600' };
  }
  if (norm.includes('oferta') || norm.includes('doação') || norm.includes('doacao')) {
    return { icon: Heart, bg: 'bg-pink-50 text-pink-600' };
  }
  if (norm.includes('som') || norm.includes('iluminação') || norm.includes('luz')) {
    return { icon: Music, bg: 'bg-indigo-50 text-indigo-600' };
  }

  if (flowType === 'in') {
    return { icon: ArrowDownLeft, bg: 'bg-emerald-50 text-[#0d7647]' };
  }
  return { icon: ArrowUpRight, bg: 'bg-rose-50 text-rose-600' };
}

function formatGroupDate(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const targetDate = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'HOJE';
  if (diffDays === 1) return 'ONTEM';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
    .format(targetDate)
    .toUpperCase();
}

export function TransactionGroupedList({
  entries,
  onVoid,
  isLoading,
  isVoiding,
}: TransactionGroupedListProps) {
  // Agrupar por data (YYYY-MM-DD)
  const grouped = useMemo(() => {
    const map = new Map<string, CashFlowEntry[]>();
    for (const entry of entries) {
      const dateKey = entry.date.slice(0, 10);
      const list = map.get(dateKey) ?? [];
      list.push(entry);
      map.set(dateKey, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-12 text-center text-slate-400 text-sm">
        Carregando transações financeiras...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700">Nenhuma transação encontrada</h4>
        <p className="text-xs text-slate-400 mt-1">
          Ajuste os filtros de busca ou realize um novo lançamento de receita ou despesa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([dateKey, dayEntries]) => {
        const totalIn = dayEntries
          .filter((e) => e.flow_type === 'in')
          .reduce((sum, e) => sum + e.amount_cents, 0);

        const totalOut = dayEntries
          .filter((e) => e.flow_type === 'out')
          .reduce((sum, e) => sum + e.amount_cents, 0);

        return (
          <div key={dateKey} className="space-y-2.5">
            {/* Cabeçalho da Data com Subtotais */}
            <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-400">
              <span className="tracking-wider">{formatGroupDate(dateKey)}</span>
              <div className="flex items-center gap-3">
                {totalIn > 0 && (
                  <span className="text-[#0d7647]">+{formatCentsToBRL(totalIn)}</span>
                )}
                {totalOut > 0 && (
                  <span className="text-rose-600">−{formatCentsToBRL(totalOut)}</span>
                )}
              </div>
            </div>

            {/* Lista de Transações daquele dia */}
            <div className="space-y-2">
              {dayEntries.map((entry) => {
                const isIn = entry.flow_type === 'in';
                const { icon: Icon, bg } = getCategoryIcon(entry.category, entry.flow_type);
                const methodLabel =
                  PAYMENT_METHOD_LABELS[entry.payment_method] ?? entry.payment_method;
                const title = entry.description || entry.person_name || entry.category;

                return (
                  <div
                    key={entry.transaction_id}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-[20px] p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Lado Esquerdo: Ícone da Categoria e Descrição */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${bg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          <span className="font-semibold text-slate-600">{entry.category}</span>
                          <span className="mx-1.5">•</span>
                          <span>{methodLabel}</span>
                        </p>
                      </div>
                    </div>

                    {/* Lado Direito: Valor com Sinal e Botão Excluir */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span
                        className={`text-sm sm:text-base font-extrabold tracking-tight ${
                          isIn ? 'text-[#0d7647]' : 'text-rose-600'
                        }`}
                      >
                        {isIn ? '+' : '−'}
                        {formatCentsToBRL(entry.amount_cents)}
                      </span>

                      {onVoid && (
                        <button
                          type="button"
                          disabled={isVoiding}
                          onClick={() => onVoid(entry)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isVoiding
                              ? 'opacity-40 cursor-not-allowed text-slate-300'
                              : 'hover:bg-rose-50 text-slate-300 hover:text-rose-600 cursor-pointer'
                          }`}
                          title="Estornar / Excluir lançamento"
                          aria-label="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
