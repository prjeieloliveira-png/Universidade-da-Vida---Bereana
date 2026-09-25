import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AttendanceBadge, getAttendanceColorClasses } from './AttendanceBadge';

describe('AttendanceBadge', () => {
  describe('getAttendanceColorClasses', () => {
    it('deve retornar cinza neutro quando chamado = 0', () => {
      const colors = getAttendanceColorClasses(0, 0);
      expect(colors.bg).toContain('slate-100');
      expect(colors.text).toContain('slate-600');
    });

    it('deve retornar verde para presença >= 75%', () => {
      const colors75 = getAttendanceColorClasses(75, 4);
      expect(colors75.bg).toContain('emerald-50');
      expect(colors75.text).toContain('emerald-700');

      const colors100 = getAttendanceColorClasses(100, 4);
      expect(colors100.bg).toContain('emerald-50');
    });

    it('deve retornar âmbar para presença entre 50% e 74%', () => {
      const colors50 = getAttendanceColorClasses(50, 4);
      expect(colors50.bg).toContain('amber-50');
      expect(colors50.text).toContain('amber-700');

      const colors74 = getAttendanceColorClasses(74, 4);
      expect(colors74.bg).toContain('amber-50');
    });

    it('deve retornar vermelho para presença < 50%', () => {
      const colors49 = getAttendanceColorClasses(49, 4);
      expect(colors49.bg).toContain('rose-50');
      expect(colors49.text).toContain('rose-700');

      const colors0 = getAttendanceColorClasses(0, 4);
      expect(colors0.bg).toContain('rose-50');
    });
  });

  describe('Component Rendering', () => {
    it('deve renderizar a fração e a porcentagem corretamente', () => {
      render(<AttendanceBadge attended={3} called={4} />);
      expect(screen.getByText('3/4 – 75%')).toBeInTheDocument();
      const badge = screen.getByTestId('attendance-badge');
      expect(badge).toHaveClass('text-emerald-700');
    });

    it('deve renderizar 0/0 – 0% com estilo neutro quando não houver reuniões', () => {
      render(<AttendanceBadge attended={0} called={0} />);
      expect(screen.getByText('0/0 – 0%')).toBeInTheDocument();
      const badge = screen.getByTestId('attendance-badge');
      expect(badge).toHaveClass('text-slate-600');
    });

    it('deve renderizar 1/3 – 33% com estilo vermelho', () => {
      render(<AttendanceBadge attended={1} called={3} />);
      expect(screen.getByText('1/3 – 33%')).toBeInTheDocument();
      const badge = screen.getByTestId('attendance-badge');
      expect(badge).toHaveClass('text-rose-700');
    });
  });
});
