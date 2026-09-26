import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import {
  fetchCashFlow,
  fetchCategories,
  createTransaction,
  voidTransaction,
  createCategory,
  deleteCategory,
} from '../data/financialData';
import { FinancialHeader } from '../components/FinancialHeader';
import { FinancialMetricCards } from '../components/FinancialMetricCards';
import { FinancialFilterBar, FlowTypeFilter } from '../components/FinancialFilterBar';
import { TransactionGroupedList } from '../components/TransactionGroupedList';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { CategoryManagementModal } from '../components/CategoryManagementModal';
import { ReceivePaymentModal } from '../components/ReceivePaymentModal';
import type { CashFlowEntry, CreateTransactionInput } from '../types';

export function FinancialPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: edition } = useActiveEdition();
  const editionId = edition?.id ?? 'edition-2026';
  const { activeCohortId, cohorts, setActiveCohort, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

  // Modais
  const [modalType, setModalType] = useState<'revenue' | 'expense' | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);

  // Sincronizar abertura do modal de categorias via URL query param (?config=categorias)
  useEffect(() => {
    if (searchParams.get('config') === 'categorias') {
      setIsCategoryModalOpen(true);
    }
  }, [searchParams]);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [flowType, setFlowType] = useState<FlowTypeFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Queries
  const { data: rawEntries = [], isLoading } = useQuery({
    queryKey: ['cash-flow', editionId],
    queryFn: () => fetchCashFlow(editionId),
    staleTime: 15_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['cash-categories'],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });

  // Mutações
  const addTxMutation = useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
    },
  });

  const voidTxMutation = useMutation({
    mutationFn: (entry: CashFlowEntry) => voidTransaction(entry.transaction_id, 'Estorno manual via painel'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
    },
  });

  const addCatMutation = useMutation({
    mutationFn: ({ name, type }: { name: string; type: 'in' | 'out' }) => createCategory(name, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cash-categories'] }),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cash-categories'] }),
  });

  // Navegar entre turmas
  const handlePrevCohort = () => {
    const idx = cohorts.findIndex((c) => c.id === activeCohortId);
    if (idx > 0) {
      const prev = cohorts[idx - 1];
      if (prev) setActiveCohort(prev.id);
    }
  };

  const handleNextCohort = () => {
    const idx = cohorts.findIndex((c) => c.id === activeCohortId);
    if (idx < cohorts.length - 1) {
      const next = cohorts[idx + 1];
      if (next) setActiveCohort(next.id);
    }
  };

  // Filtragem
  const filteredEntries = useMemo(() => {
    return rawEntries.filter((e) => {
      if (flowType !== 'all' && e.flow_type !== flowType) return false;
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (e.description || '').toLowerCase().includes(q);
        const nameMatch = (e.person_name || '').toLowerCase().includes(q);
        const catMatch = e.category.toLowerCase().includes(q);
        if (!descMatch && !nameMatch && !catMatch) return false;
      }

      const dateStr = e.date.slice(0, 10);
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;

      return true;
    });
  }, [rawEntries, flowType, selectedCategory, searchQuery, startDate, endDate]);

  // Cálculos consolidados para os 3 cards
  const metrics = useMemo(() => {
    const inEntries = rawEntries.filter((e) => e.flow_type === 'in');
    const outEntries = rawEntries.filter((e) => e.flow_type === 'out');
    const totalInCents = inEntries.reduce((acc, e) => acc + e.amount_cents, 0);
    const totalOutCents = outEntries.reduce((acc, e) => acc + e.amount_cents, 0);
    return {
      totalInCents,
      countIn: inEntries.length,
      totalOutCents,
      countOut: outEntries.length,
      netBalanceCents: totalInCents - totalOutCents,
    };
  }, [rawEntries]);

  return (
    <div className="space-y-6">
      <FinancialHeader
        cohortName={activeCohort.name}
        onPrevCohort={handlePrevCohort}
        onNextCohort={handleNextCohort}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        onOpenAddRevenue={() => setModalType('revenue')}
        onOpenAddExpense={() => setModalType('expense')}
        onOpenReceivePayment={() => setIsReceivePaymentOpen(true)}
      />

      {/* 3 Metric Cards: RECEITAS | DESPESAS | SALDO */}
      <FinancialMetricCards
        totalInCents={metrics.totalInCents}
        countIn={metrics.countIn}
        totalOutCents={metrics.totalOutCents}
        countOut={metrics.countOut}
        netBalanceCents={metrics.netBalanceCents}
      />

      {/* Barra de Busca e Filtros */}
      <FinancialFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        flowType={flowType}
        onFlowTypeChange={setFlowType}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        categories={categories}
      />

      {/* Feed de Transações Agrupado por Data */}
      <TransactionGroupedList
        entries={filteredEntries}
        isLoading={isLoading}
        onVoid={(entry) => {
          if (window.confirm(`Deseja realmente estornar este lançamento de ${entry.category}?`)) {
            voidTxMutation.mutate(entry);
          }
        }}
      />

      {/* Modais */}
      {modalType && (
        <AddTransactionModal
          isOpen={true}
          type={modalType}
          editionId={editionId}
          categories={categories}
          onClose={() => setModalType(null)}
          onSuccess={async (input) => {
            await addTxMutation.mutateAsync(input);
          }}
        />
      )}

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          if (searchParams.get('config')) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('config');
            setSearchParams(nextParams, { replace: true });
          }
        }}
        categories={categories}
        onAddCategory={async (name, type) => {
          await addCatMutation.mutateAsync({ name, type });
        }}
        onDeleteCategory={async (id) => {
          await deleteCatMutation.mutateAsync(id);
        }}
      />

      <ReceivePaymentModal
        isOpen={isReceivePaymentOpen}
        editionId={editionId}
        onClose={() => setIsReceivePaymentOpen(false)}
      />
    </div>
  );
}
