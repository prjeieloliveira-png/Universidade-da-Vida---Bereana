import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddTransactionModal } from './AddTransactionModal';
import type { CashCategory } from '../types';

const mockCategories: CashCategory[] = [
  { id: '1', name: 'Inscrição', type: 'in' },
  { id: '2', name: 'Oferta', type: 'in' },
  { id: '3', name: 'Alimentação', type: 'out' },
  { id: '4', name: 'Sítio / Locação', type: 'out' },
];

describe('AddTransactionModal', () => {
  it('renderiza modal de Nova Despesa com categorias de saída', () => {
    render(
      <AddTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        type="expense"
        editionId="ed-2026"
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Nova Despesa')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Sítio / Locação')).toBeInTheDocument();
    expect(screen.queryByText('Inscrição')).not.toBeInTheDocument();
  });

  it('submete os dados convertendo o valor em centavos', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <AddTransactionModal
        isOpen={true}
        onClose={onClose}
        type="expense"
        editionId="ed-2026"
        categories={mockCategories}
        onSuccess={onSuccess}
      />
    );

    // Preenche descrição
    const descInput = screen.getByPlaceholderText(/aluguel do sítio/i);
    fireEvent.change(descInput, { target: { value: 'Compra de Frutas' } });

    // Preenche valor: 150,50
    const amountInput = screen.getByPlaceholderText('0,00');
    fireEvent.change(amountInput, { target: { value: '150,50' } });

    // Submete
    const submitBtn = screen.getByRole('button', { name: /salvar despesa/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          description: 'Compra de Frutas',
          amount_cents: 15050,
          category: 'Alimentação',
        })
      );
    });

    expect(onClose).toHaveBeenCalled();
  });
});
