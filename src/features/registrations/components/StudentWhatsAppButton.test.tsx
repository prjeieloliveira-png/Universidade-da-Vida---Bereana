import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentWhatsAppButton } from './StudentWhatsAppButton';

describe('StudentWhatsAppButton Component', () => {
  it('renderiza o link de WhatsApp corretamente com mensagem personalizada', () => {
    render(
      <StudentWhatsAppButton
        name="Lucas Silva"
        phone="(11) 98765-4321"
        size="md"
      />
    );

    const link = screen.getByRole('link', { name: /conversar com lucas silva no whatsapp/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/5511987654321?text=Ol%C3%A1%2C%20Lucas!')
    );
  });

  it('interrompe a propagação do clique ao clicar no botão ativo', () => {
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <StudentWhatsAppButton
          name="Maria Oliveira"
          phone="(21) 99887-6655"
          size="sm"
        />
      </div>
    );

    const link = screen.getByRole('link', { name: /conversar com maria oliveira no whatsapp/i });
    fireEvent.click(link);

    expect(parentClick).not.toHaveBeenCalled();
  });

  it('renderiza estado desabilitado quando o telefone é nulo ou inválido', () => {
    render(
      <StudentWhatsAppButton
        name="João Sem Telefone"
        phone=""
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(/whatsapp indisponível para joão sem telefone/i)
    ).toBeInTheDocument();
  });
});
