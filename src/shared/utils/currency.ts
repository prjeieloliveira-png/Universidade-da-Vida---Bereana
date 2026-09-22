/**
 * Utility functions to handle monetary values in integer cents according to AGENTS.md guidelines.
 */

export function formatCentsToBRL(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || isNaN(cents)) {
    return 'R$ 0,00';
  }
  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

export function parseBRLToCents(raw: string): number {
  if (!raw) return 0;
  // Remove R$, spaces and dots, convert comma to dot
  const clean = raw.replace(/[R$\s.]/g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}
