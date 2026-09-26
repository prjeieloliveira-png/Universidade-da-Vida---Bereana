import { describe, expect, it } from 'vitest';
import { getAbsenceTintClasses } from './absenceTint';

describe('getAbsenceTintClasses', () => {
  it('sem tom para menos de 2 faltas', () => {
    expect(getAbsenceTintClasses(0)).toBe('');
    expect(getAbsenceTintClasses(1)).toBe('');
  });

  it('amarelo para 2 faltas', () => {
    expect(getAbsenceTintClasses(2)).toContain('amber');
  });

  it('laranja para 3 faltas', () => {
    expect(getAbsenceTintClasses(3)).toContain('orange');
  });

  it('vermelho para 4 ou mais faltas', () => {
    expect(getAbsenceTintClasses(4)).toContain('rose');
    expect(getAbsenceTintClasses(9)).toContain('rose');
  });
});
