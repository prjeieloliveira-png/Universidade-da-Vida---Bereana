import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancialFilterBar } from './FinancialFilterBar';
import type { CashCategory } from '../types';

const mockCategories: CashCategory[] = [
  { id: '1', name: 'Inscrição', type: 'in' },
  { id: '2', name: 'Alimentação', type: 'out' },
  { id: '3', name: 'Sítio / Locação', type: 'out' },
];

describe('FinancialFilterBar', () => {
  it('renderiza os campos de busca, seletor de categorias e botões de filtro de tipo', () => {
    const onSearchChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onFlowTypeChange = vi.fn();
    const onStartDateChange = vi.fn();
    const onEndDateChange = vi.fn();

    render(
      <FinancialFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        selectedCategory="ALL"
        onCategoryChange={onCategoryChange}
        flowType="all"
        onFlowTypeChange={onFlowTypeChange}
        startDate=""
        onStartDateChange={onStartDateChange}
        endDate=""
        onEndDateChange={onEndDateChange}
        categories={mockCategories}
      />
    );

    // Campo de busca
    const searchInput = screen.getByPlaceholderText(/buscar transação/i);
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'Inscrição' } });
    expect(onSearchChange).toHaveBeenCalledWith('Inscrição');

    // Seletor de categorias
    expect(screen.getByText('Todas as Categorias')).toBeInTheDocument();
    expect(screen.getByText('Inscrição')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();

    // Filtros de fluxo
    const btnReceitas = screen.getByRole('button', { name: /Receitas/i });
    fireEvent.click(btnReceitas);
    expect(onFlowTypeChange).toHaveBeenCalledWith('in');

    const btnDespesas = screen.getByRole('button', { name: /Despesas/i });
    fireEvent.click(btnDespesas);
    expect(onFlowTypeChange).toHaveBeenCalledWith('out');
  });
});
