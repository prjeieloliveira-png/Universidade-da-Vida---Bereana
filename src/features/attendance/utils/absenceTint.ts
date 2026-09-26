/**
 * Tom pastel conforme o número de faltas acumuladas — sinal visual discreto
 * de atenção. Usado só na tela de Chamada (não em Inscrições).
 * 2 faltas = amarelo, 3 = laranja, 4+ = vermelho.
 */
export function getAbsenceTintClasses(absenceCount: number): string {
  if (absenceCount >= 4) return 'bg-rose-50/70 border-rose-200/80 hover:border-rose-300';
  if (absenceCount === 3) return 'bg-orange-50/70 border-orange-200/80 hover:border-orange-300';
  if (absenceCount === 2) return 'bg-amber-50/70 border-amber-200/80 hover:border-amber-300';
  return '';
}
