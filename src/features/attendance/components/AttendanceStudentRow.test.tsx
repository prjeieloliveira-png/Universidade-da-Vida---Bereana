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
  it('renders student info and present status in week 1', () => {
    const handleToggle = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={1}
        onToggle={handleToggle}
      />
    );

    expect(screen.getByText('Alana Mikaela')).toBeInTheDocument();
    expect(screen.getByText('Presente')).toBeInTheDocument();
    expect(screen.getByText('2/9 Presenças')).toBeInTheDocument();

  });

  it('renders absent status in week 3 and triggers toggle callback', () => {
    const handleToggle = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={3}
        onToggle={handleToggle}
      />
    );

    expect(screen.getByText('Falta')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /falta/i }));
    expect(handleToggle).toHaveBeenCalledWith('reg-1', 3);
  });

  it('renders week pills S1 to S9 as read-only indicators and not clickable buttons', () => {
    const handleToggle = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={1}
        onToggle={handleToggle}
      />
    );

    // S1..S9 são elementos de leitura (spans), não botões interativos
    expect(screen.queryByRole('button', { name: 'S4' })).not.toBeInTheDocument();
    expect(screen.getByText('S4')).toBeInTheDocument();
    expect(screen.getByText('S1')).toBeInTheDocument();

    // Clicar no texto da pílula não deve disparar o callback onToggle
    fireEvent.click(screen.getByText('S4'));
    expect(handleToggle).not.toHaveBeenCalled();
  });
});


