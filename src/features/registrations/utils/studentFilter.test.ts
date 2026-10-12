import { describe, it, expect } from 'vitest';
import { filterStudents, sortStudentsByName } from './studentFilter';
import { initialRegistrationFilterState, type StudentRecord } from '../types';

const baseStudent = (over: Partial<StudentRecord>): StudentRecord => ({
  id: 'r1',
  personId: 'p1',
  num: 1,
  name: 'Ana Beatriz',
  gender: 'Feminino',
  birthDate: '2011-05-10',
  age: 15,
  maritalStatus: 'SOLTEIRO',
  phone: '11999990001',
  address: 'Rua A',
  shirtSize: 'P',
  pastor: 'Pr. Carlos',
  g12: 'Líder G12',
  leader: 'Líder 1',
  status: 'Pago',
  paymentMethod: 'PIX',
  amountCents: 15000,
  comorbidity: 'Não',
  medSchedule: 'Não',
  s1: false,
  s2: false,
  s3: false,
  s4: false,
  s5: false,
  s6: false,
  s7: false,
  s8: false,
  s9: false,
  ...over,
});

const mockStudents: StudentRecord[] = [
  baseStudent({
    id: '1',
    name: 'Ana Beatriz',
    gender: 'Feminino',
    age: 15,
  }),
  baseStudent({
    id: '2',
    name: 'Bruno Silva',
    gender: 'Masculino',
    age: 25,
    status: 'Pendente',
    leader: 'Líder 2',
    comorbidity: 'Asma',
  }),
  baseStudent({
    id: '3',
    name: 'Carlos Eduardo',
    gender: 'Masculino',
    age: 40,
    pastor: 'Pr. Roberto',
    status: 'Pendente',
    paymentMethod: '—',
    comorbidity: '—',
  }),
  baseStudent({
    id: '4',
    name: 'Daniela Souza',
    gender: 'Feminino',
    age: 55,
    pastor: 'Pr. Roberto',
    shirtSize: 'GG',
    comorbidity: 'Hipertensão',
  }),
];

describe('filterStudents - Idade personalizada (minAge e maxAge)', () => {
  it('retorna todos os alunos quando minAge e maxAge estão vazios', () => {
    const result = filterStudents(mockStudents, initialRegistrationFilterState);
    expect(result).toHaveLength(4);
  });

  it('filtra alunos apenas com minAge', () => {
    const filters = {
      ...initialRegistrationFilterState,
      minAge: '25',
    };
    const result = filterStudents(mockStudents, filters);
    expect(result.map((s) => s.name)).toEqual(['Bruno Silva', 'Carlos Eduardo', 'Daniela Souza']);
  });

  it('filtra alunos apenas com maxAge', () => {
    const filters = {
      ...initialRegistrationFilterState,
      maxAge: '25',
    };
    const result = filterStudents(mockStudents, filters);
    expect(result.map((s) => s.name)).toEqual(['Ana Beatriz', 'Bruno Silva']);
  });

  it('filtra alunos com intervalo de idade (minAge e maxAge)', () => {
    const filters = {
      ...initialRegistrationFilterState,
      minAge: '20',
      maxAge: '45',
    };
    const result = filterStudents(mockStudents, filters);
    expect(result.map((s) => s.name)).toEqual(['Bruno Silva', 'Carlos Eduardo']);
  });

  it('retorna vazio quando nenhuma idade coincide com o intervalo', () => {
    const filters = {
      ...initialRegistrationFilterState,
      minAge: '60',
      maxAge: '70',
    };
    const result = filterStudents(mockStudents, filters);
    expect(result).toHaveLength(0);
  });

  it('combina filtro de idade com outros filtros (ex: gênero)', () => {
    const filters = {
      ...initialRegistrationFilterState,
      minAge: '18',
      gender: 'Feminino' as const,
    };
    const result = filterStudents(mockStudents, filters);
    expect(result.map((s) => s.name)).toEqual(['Daniela Souza']);
  });
});

describe('sortStudentsByName', () => {
  it('ordena alunos alfabeticamente considerando pt-BR', () => {
    const unordered: StudentRecord[] = [
      mockStudents[3]!,
      mockStudents[0]!,
      mockStudents[2]!,
      mockStudents[1]!,
    ];
    const sorted = sortStudentsByName(unordered);
    expect(sorted.map((s) => s.name)).toEqual([
      'Ana Beatriz',
      'Bruno Silva',
      'Carlos Eduardo',
      'Daniela Souza',
    ]);
  });
});
