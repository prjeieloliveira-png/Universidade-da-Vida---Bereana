import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialMetricCards } from './FinancialMetricCards';

describe('FinancialMetricCards', () => {
  it('renderiza os 3 cards com valores e contagens corretas', () => {
    render(
      <FinancialMetricCards
        totalInCents={150000} // R$ 1.500,00
        countIn={10}
        totalOutCents={50000} // R$ 500,00
        countOut={3}
        netBalanceCents={100000} // R$ 1.000,00
      />
    );

    // Títulos dos cards
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText('Saldo')).toBeInTheDocument();

    // Contadores
    expect(screen.getByText('10 registros')).toBeInTheDocument();
    expect(screen.getByText('3 registros')).toBeInTheDocument();
    expect(screen.getByText(/Receitas − Despesas/i)).toBeInTheDocument();

    // Valores
    expect(screen.getByText(/1\.500,00/)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('500,00') && !content.includes('1.500'))).toBeInTheDocument();
    expect(screen.getByText(/1\.000,00/)).toBeInTheDocument();
  });

  it('exibe saldo negativo formatado corretamente', () => {
    render(
      <FinancialMetricCards
        totalInCents={10000} // R$ 100,00
        countIn={1}
        totalOutCents={30000} // R$ 300,00
        countOut={2}
        netBalanceCents={-20000} // -R$ 200,00
      />
    );

    expect(screen.getByText(/200,00/)).toBeInTheDocument();
  });
});
