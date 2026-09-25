import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonsProgressCard } from './LessonsProgressCard';

describe('LessonsProgressCard Component', () => {
  it('renderiza o cabeçalho e todas as 9 semanas do curso', () => {
    render(<LessonsProgressCard />);

    expect(screen.getByText('Taxa de Frequência')).toBeInTheDocument();
    expect(screen.getByText('Presença real das 9 semanas')).toBeInTheDocument();

    // Valida que as 9 semanas S1..S9 estão presentes
    for (let w = 1; w <= 9; w++) {
      expect(screen.getAllByText(`S${w}`).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('exibe o badge de pico na Semana 2 com a porcentagem real de 70%', () => {
    render(<LessonsProgressCard />);

    // Semana 2 exibe diretamente a porcentagem real de 70% (37 de 53 presentes)
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('exibe a porcentagem da Semana 1 ao passar o mouse por cima', () => {
    render(<LessonsProgressCard />);

    const s1Label = screen.getByText('S1');
    const s1Container = s1Label.closest('div');
    expect(s1Container).not.toBeNull();

    fireEvent.mouseEnter(s1Container!);
    expect(screen.getByText('53%')).toBeInTheDocument();
    expect(screen.getByText(/S1: 53% \(28\/53 presentes\)/i)).toBeInTheDocument();

    fireEvent.mouseLeave(s1Container!);
  });

  it('permite alternar para a visão Geral e exibe o engajamento médio', () => {
    render(<LessonsProgressCard />);

    const geralButton = screen.getByRole('button', { name: /geral/i });
    fireEvent.click(geralButton);

    expect(screen.getByText('Engajamento Médio')).toBeInTheDocument();
    expect(screen.getByText('Alta Assiduidade')).toBeInTheDocument();
  });

  it('dispara onStartAttendance ao clicar em Fazer Chamada', () => {
    const handleStartAttendance = vi.fn();
    render(<LessonsProgressCard onStartAttendance={handleStartAttendance} />);

    const button = screen.getByRole('button', { name: /fazer chamada/i });
    fireEvent.click(button);

    expect(handleStartAttendance).toHaveBeenCalledTimes(1);
  });
});
