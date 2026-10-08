import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoidEntryDialog } from './VoidEntryDialog';
import type { CashFlowEntry } from '../types';

const entry: CashFlowEntry = {
  transaction_id: 'tx-1',
  date: '2026-10-08T12:00:00Z',
  source: 'manual',
  flow_type: 'in',
  amount_cents: 10000,
  payment_method: 'pix',
  category: 'Oferta',
  registration_id: null,
  edition_id: 'ed-1',
  person_name: null,
  description: 'Oferta do culto',
  recorded_by_name: null,
  last_edited_at: null,
  last_edited_by_name: null,
  notes: null,
  receipt_url: null,
};

describe('VoidEntryDialog', () => {
  it('não renderiza sem lançamento', () => {
    const { container } = render(<VoidEntryDialog entry={null} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('confirma o estorno com o motivo informado e fecha', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<VoidEntryDialog entry={entry} onClose={onClose} onConfirm={onConfirm} />);
    expect(screen.getByText('Oferta do culto')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: 'Duplicado' } });
    fireEvent.click(screen.getByRole('button', { name: /^estornar$/i }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(entry, 'Duplicado'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('usa o motivo padrão quando vazio e mostra o erro sem fechar', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('Permissão negada'));
    const onClose = vi.fn();
    render(<VoidEntryDialog entry={entry} onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /^estornar$/i }));
    expect(await screen.findByText('Permissão negada')).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledWith(entry, 'Estorno manual via painel');
    expect(onClose).not.toHaveBeenCalled();
  });
});
