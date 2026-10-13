/**
 * Utilitários para manipulação e cálculo de datas.
 */

/**
 * Calcula a idade em anos completos a partir de uma data de nascimento no formato 'YYYY-MM-DD'.
 * Por padrão, utiliza a data atual do sistema (`new Date()`).
 * Permite passar uma data de referência opcional para testes ou relatórios pontuais.
 */
export function calculateAge(
  birthDateStr: string | null | undefined,
  referenceDate: Date = new Date()
): number {
  if (!birthDateStr) return 0;
  const parts = birthDateStr.split('-');
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return 0;

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return 0;

  let age = referenceDate.getFullYear() - birthYear;
  const m = referenceDate.getMonth() - birthMonth;
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDay)) {
    age--;
  }

  return Math.max(0, age);
}
