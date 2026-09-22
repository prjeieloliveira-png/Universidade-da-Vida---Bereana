import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttendanceReportModal } from './AttendanceReportModal';
import type { StudentRecord } from '@/features/registrations/types';

const mockStudents: StudentRecord[] = [
  {
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
  },
  {
    id: 'reg-2',
    personId: 'person-2',
    num: 2,
    name: 'Carlos Eduardo',
    gender: 'Masculino',
    birthDate: '1995-02-10',
    age: 31,
    maritalStatus: 'Casado',
    phone: '(86) 99999-1111',
    address: 'Av Central',
    shirtSize: 'G',
    pastor: 'Pr. Jeiel Oliveira',
    g12: 'Marcos Sousa',
    leader: 'Marcos',
    status: 'Pago',
    paymentMethod: 'PIX',
    amountCents: 20000,
    comorbidity: 'Não',
    medSchedule: 'Não',
    s1: true,
    s2: true,
    s3: true,
    s4: true,
    s5: true,
    s6: true,
    s7: true,
    s8: true,
    s9: true,
  },
];


describe('AttendanceReportModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <AttendanceReportModal
        isOpen={false}
        onClose={vi.fn()}
        students={mockStudents}
      />
    );

    expect(screen.queryByText('Relatório de Frequência e Chamadas')).not.toBeInTheDocument();
  });

  it('renders report details, student rows and triggers print/csv', () => {
    const handleClose = vi.fn();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <AttendanceReportModal
        isOpen={true}
        onClose={handleClose}
        students={mockStudents}
        activeFiltersDesc="Pastor: Pra. Socorro Paiva"
      />
    );

    expect(screen.getByText('Relatório de Frequência e Chamadas')).toBeInTheDocument();
    expect(screen.getByText('Alana Mikaela')).toBeInTheDocument();
    expect(screen.getByText('Carlos Eduardo')).toBeInTheDocument();
    expect(screen.getByText(/Pastor: Pra. Socorro Paiva/)).toBeInTheDocument();

    // Test print button
    const printButton = screen.getByRole('button', { name: /imprimir/i });
    fireEvent.click(printButton);
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });
});
