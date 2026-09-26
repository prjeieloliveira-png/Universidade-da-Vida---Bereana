import { describe, expect, it } from 'vitest';
import { isPaidPaymentStatus } from './registrationsApi';

describe('isPaidPaymentStatus', () => {
  it('considera pago apenas o status "paid" da view', () => {
    expect(isPaidPaymentStatus('paid')).toBe(true);
    expect(isPaidPaymentStatus('PAID')).toBe(true);
  });

  it('trata parcial, pendente e ausente como não pagos', () => {
    expect(isPaidPaymentStatus('partial')).toBe(false);
    expect(isPaidPaymentStatus('pending')).toBe(false);
    expect(isPaidPaymentStatus(undefined)).toBe(false);
    expect(isPaidPaymentStatus(null)).toBe(false);
  });
});
