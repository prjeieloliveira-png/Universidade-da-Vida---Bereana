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

  it('allows clicking direct week pill S4 to toggle week 4 attendance individually', () => {
    const handleToggle = vi.fn();
    render(
      <AttendanceStudentRow
        student={mockStudent}
        activeWeek={1}
        onToggle={handleToggle}
      />
    );

    const s4Button = screen.getByRole('button', { name: 'S4' });
    fireEvent.click(s4Button);
    expect(handleToggle).toHaveBeenCalledWith('reg-1', 4);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});


