import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeeSettlementPanel } from './FeeSettlementPanel';
import * as data from '../data/financialData';

vi.mock('../data/financialData', () => ({
  setPaymentFee: vi.fn().mockResolvedValue(undefined),
  settlePaymentObligation: vi.fn().mockResolvedValue(undefined),
  unsettlePaymentObligation: vi.fn().mockResolvedValue(undefined),
}));

const base = {
  kind: 'registration' as const,
  id: 'reg-1',
  personName: 'Maria',
  feeCents: 20000,
  paidCents: 12000,
  waivedCents: 0,
  settledAt: null,
};

describe('FeeSettlementPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('salva uma nova taxa para a pessoa', async () => {
    const onChanged = vi.fn();
    render(<FeeSettlementPanel {...base} onChanged={onChanged} />);
    fireEvent.change(screen.getByLabelText(/valor da inscrição/i), { target: { value: '150,00' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar valor/i }));
    await waitFor(() => expect(data.setPaymentFee).toHaveBeenCalledWith('registration', 'reg-1', 15000));
    expect(onChanged).toHaveBeenCalled();
  });

  it('conclui a quitação após confirmar o abatimento', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onChanged = vi.fn();
    render(<FeeSettlementPanel {...base} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: /quitação concluída/i }));
    await waitFor(() => expect(data.settlePaymentObligation).toHaveBeenCalledWith('registration', 'reg-1'));
    expect(onChanged).toHaveBeenCalled();
  });

  it('não permite quitar quem ainda não pagou nada', () => {
    render(<FeeSettlementPanel {...base} paidCents={0} onChanged={vi.fn()} />);
    expect(screen.getByRole('button', { name: /quitação concluída/i })).toBeDisabled();
  });

  it('mostra o abatimento e permite desfazer a quitação', async () => {
    const onChanged = vi.fn();
    render(
      <FeeSettlementPanel
        {...base}
        waivedCents={8000}
        settledAt="2026-10-09T10:00:00Z"
        onChanged={onChanged}
      />
    );
    expect(screen.getByText(/abatimento de/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor da inscrição/i)).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /desfazer quitação/i }));
    await waitFor(() => expect(data.unsettlePaymentObligation).toHaveBeenCalledWith('registration', 'reg-1'));
  });

  it('exibe o motivo quando o banco recusa', async () => {
    vi.mocked(data.setPaymentFee).mockRejectedValueOnce(new Error('A taxa não pode ser menor que o valor já pago (12000)'));
    render(<FeeSettlementPanel {...base} onChanged={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/valor da inscrição/i), { target: { value: '50,00' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar valor/i }));
    expect(await screen.findByText(/não pode ser menor/i)).toBeInTheDocument();
  });
});
