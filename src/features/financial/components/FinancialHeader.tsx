import { Wallet, Plus, Settings2, ChevronLeft, ChevronRight, ArrowDownCircle } from 'lucide-react';

interface FinancialHeaderProps {
  cohortName: string;
  onPrevCohort: () => void;
  onNextCohort: () => void;
  onOpenCategories: () => void;
  onOpenAddRevenue: () => void;
  onOpenAddExpense: () => void;
  onOpenReceivePayment: () => void;
}

export function FinancialHeader({
  cohortName,
  onPrevCohort,
  onNextCohort,
  onOpenCategories,
  onOpenAddRevenue,
  onOpenAddExpense,
  onOpenReceivePayment,
}: FinancialHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Icon */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#0d7647] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-xs text-slate-400 font-medium">Controle de receitas, despesas e fluxo de caixa da turma</p>
        </div>
      </div>

      {/* Cohort Switcher */}
      <div className="flex items-center gap-2 self-start md:self-center bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-2xs">
        <button
          type="button"
          onClick={onPrevCohort}
          className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          title="Turma anterior"
          aria-label="Turma anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs sm:text-sm font-extrabold text-slate-800 px-1">{cohortName}</span>
        <button
          type="button"
          onClick={onNextCohort}
          className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
          title="Próxima turma"
          aria-label="Próxima turma"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
        <button
          type="button"
          onClick={onOpenCategories}
          className="px-3.5 py-2.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          title="Gerenciar categorias nas configurações"
        >
          <Settings2 className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Categorias</span>
        </button>

        <button
          id="btn-receive-payment"
          type="button"
          onClick={onOpenReceivePayment}
          className="px-4 py-2.5 rounded-full text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-300/60"
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Receber Pagamento</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddRevenue}
          className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#0d7647] hover:bg-[#095a36] text-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Receita</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddExpense}
          className="px-4 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>
    </div>
  );
}
