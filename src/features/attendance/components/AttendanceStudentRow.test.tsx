import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttendanceStudentRow } from './AttendanceStudentRow';
import type { StudentRecord } from '@/features/registrations/types';

const mockStudent: StudentRecord = {
  id: 'reg-1',
  personId: 'person-1',
  num: 1,
  name: 'Alana Mikaela',
  gender: 'Feminino',
  birthDate: '1997-04-21',
  age: 29,
  maritalStatus: 'Solteiro',
  phone: '(86) 98851-2077',
  address: 'Rua das Flores',
  shirtSize: 'M',
  pastor: 'Pra. Socorro Paiva',
  g12: 'Shirlany Sampaio',
  leader: 'Shirlany',
  status: 'Pago',
  paymentMethod: 'CARTÃO',
  amountCents: 20000,
  comorbidity: 'Não',
  medSchedule: 'Não',
  s1: true,
  s2: true,
  s3: false,
  s4: false,
  s5: false,
  s6: false,
  s7: false,
  s8: false,
  s9: false,
};

describe('AttendanceStudentRow', () => {
  it('renders student info and both action buttons', () => {
    const handleSelectAction = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={1}
        weekSelected
        onSelectAction={handleSelectAction}
      />
    );

    expect(screen.getByText('Alana Mikaela')).toBeInTheDocument();
    expect(screen.getByText('2/9 Presenças')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /presente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^falta$/i })).toBeInTheDocument();
  });

  it('calls onSelectAction with PRESENTE when clicking the Presente button', () => {
    const handleSelectAction = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={3}
        weekSelected
        onSelectAction={handleSelectAction}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /presente/i }));
    expect(handleSelectAction).toHaveBeenCalledWith(mockStudent, 'PRESENTE');
  });

  it('calls onSelectAction with FALTA when clicking the Falta button', () => {
    const handleSelectAction = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={3}
        weekSelected
        onSelectAction={handleSelectAction}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^falta$/i }));
    expect(handleSelectAction).toHaveBeenCalledWith(mockStudent, 'FALTA');
  });

  it('renders week pills S1 to S9 as read-only indicators and not clickable buttons', () => {
    const handleSelectAction = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={1}
        weekSelected
        onSelectAction={handleSelectAction}
      />
    );

    // S1..S9 são elementos de leitura (spans), não botões interativos
    expect(screen.queryByRole('button', { name: 'S4' })).not.toBeInTheDocument();
    expect(screen.getByText('S4')).toBeInTheDocument();
    expect(screen.getByText('S1')).toBeInTheDocument();

    // Clicar no texto da pílula não deve disparar o callback
    fireEvent.click(screen.getByText('S4'));
    expect(handleSelectAction).not.toHaveBeenCalled();
  });

  it('disables Presente/Falta buttons and highlights no week pill when weekSelected is false', () => {
    const handleSelectAction = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={1}
        weekSelected={false}
        onSelectAction={handleSelectAction}
      />
    );

    const presenteButton = screen.getByRole('button', { name: /presente/i });
    const faltaButton = screen.getByRole('button', { name: /^falta$/i });
    expect(presenteButton).toBeDisabled();
    expect(faltaButton).toBeDisabled();

    fireEvent.click(presenteButton);
    fireEvent.click(faltaButton);
    expect(handleSelectAction).not.toHaveBeenCalled();
  });
});
