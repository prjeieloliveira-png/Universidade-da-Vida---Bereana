import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PillBadge } from './PillBadge';

describe('PillBadge Component', () => {
  it('renders label correctly', () => {
    render(<PillBadge label="Quitado" variant="success" />);
    expect(screen.getByText('Quitado')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = render(<PillBadge label="Pendente" variant="warning" />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();

    rerender(<PillBadge label="Faltou" variant="danger" />);
    expect(screen.getByText('Faltou')).toBeInTheDocument();
  });
});
