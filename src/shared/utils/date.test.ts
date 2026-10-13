import { describe, it, expect } from 'vitest';
import { calculateAge } from './date';

describe('calculateAge', () => {
  it('calcula a idade corretamente antes e depois do aniversário', () => {
    // Aluno nascido em 01/10/2010 (Kawan Silva Santos)
    const birthDate = '2010-10-01';

    // Antes do aniversário em 2026 (ex: 20/09/2026) -> 15 anos
    expect(calculateAge(birthDate, new Date(2026, 8, 20))).toBe(15);

    // No dia exato do aniversário (01/10/2026) -> 16 anos
    expect(calculateAge(birthDate, new Date(2026, 9, 1))).toBe(16);

    // Após o aniversário (ex: 13/10/2026) -> 16 anos
    expect(calculateAge(birthDate, new Date(2026, 9, 13))).toBe(16);
  });

  it('lida com aniversariantes no mesmo mês mas dias diferentes', () => {
    const birthDate = '2000-10-15';
    // Em 13/10/2026 (2 dias antes)
    expect(calculateAge(birthDate, new Date(2026, 9, 13))).toBe(25);
    // Em 15/10/2026 (no dia)
    expect(calculateAge(birthDate, new Date(2026, 9, 15))).toBe(26);
    // Em 16/10/2026 (dia seguinte)
    expect(calculateAge(birthDate, new Date(2026, 9, 16))).toBe(26);
  });

  it('retorna 0 para datas vazias ou nulas ou inválidas', () => {
    expect(calculateAge(null)).toBe(0);
    expect(calculateAge(undefined)).toBe(0);
    expect(calculateAge('')).toBe(0);
    expect(calculateAge('invalid-date')).toBe(0);
  });
});
