import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { fetchCashSummary } from '../data/financialData';
import { FinancialSummaryCard } from '../components/FinancialSummaryCard';
import { PaymentsTab } from '../components/PaymentsTab';
import { CashFlowTab } from '../components/CashFlowTab';
import { AddPaymentModal } from '../components/AddPaymentModal';
import { LegacyImportBanner } from '../components/LegacyImportBanner';
import { SyncStudentsButton } from '../components/SyncStudentsButton';
import { Loader2, Plus, LayoutDashboard, CreditCard, ArrowLeftRight } from 'lucide-react';

type TabId = 'resumo' | 'pagamentos' | 'fluxo';

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'resumo', label: 'Resumo', icon: LayoutDashboard },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'fluxo', label: 'Fluxo', icon: ArrowLeftRight },
];

export function FinancialPage() {
  const { data: edition, isLoading: editionLoading } = useActiveEdition();
  const editionId = edition?.id ?? '';

  const [tab, setTab] = useState<TabId>('resumo');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  const { data: summary, isLoading: summaryLoading, isError } = useQuery({
    queryKey: ['cash-summary', editionId],
    queryFn: () => fetchCashSummary(editionId),
    enabled: !!editionId,
    staleTime: 30_000,
  });

  if (editionLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 animate-spin text-[#58bc75]" />
      </div>
    );
  }

  if (!edition) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        Nenhuma edição ativa encontrada. Configure uma edição no Supabase.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Financeiro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Financeiro
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão financeira da {edition.name}
          </p>
        </div>

        <button
          id="add-payment-btn"
          onClick={() => setIsAddPaymentOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Pagamento</span>
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === id
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Sync students from local → Supabase (shown when DB is empty) */}
      {editionId && <SyncStudentsButton editionId={editionId} />}

      {/* Legacy Import Banner: import payments for already-synced students */}
      {editionId && <LegacyImportBanner editionId={editionId} />}

      {/* Content */}
      {tab === 'resumo' ? (
        summaryLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-[#58bc75]" />
          </div>
        ) : isError || !summary ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {isError
              ? 'Falha ao carregar dados. Tente novamente.'
              : 'Nenhum dado financeiro encontrado para esta edição.'}
          </div>
        ) : (
          <FinancialSummaryCard summary={summary} />
        )
      ) : tab === 'pagamentos' ? (
        <PaymentsTab editionId={editionId} />
      ) : (
        <CashFlowTab editionId={editionId} />
      )}

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        editionId={editionId}
        onClose={() => setIsAddPaymentOpen(false)}
      />
    </div>
  );
}
