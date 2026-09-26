import { formatCentsToBRL } from '@/shared/utils/currency';

/**
 * Peças compartilhadas por ReceivePaymentModal e ReceiveTeamPaymentModal:
 * o selo de status do pagamento e a mensagem de confirmação por WhatsApp.
 */

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

/** @param quitadoLabel Ex.: "Inscrição quitada" ou "Contribuição quitada". */
export function buildPaymentSuccessMessage(
  name: string,
  amountCents: number,
  outstandingAfter: number,
  quitadoLabel: string
): string {
  const valor = formatCentsToBRL(amountCents);
  if (outstandingAfter <= 0) {
    return (
      `Olá, ${name}! 🎉\n\n` +
      `Seu pagamento de *${valor}* foi recebido com sucesso.\n` +
      `✅ *${quitadoLabel}!* Obrigado!\n\n` +
      `_Universidade da Vida – Bereana_`
    );
  }
  const restante = formatCentsToBRL(outstandingAfter);
  return (
    `Olá, ${name}! ✅\n\n` +
    `Recebemos seu pagamento parcial de *${valor}*.\n` +
    `💰 Saldo restante: *${restante}*\n\n` +
    `Qualquer dúvida, fale conosco.\n` +
    `_Universidade da Vida – Bereana_`
  );
}

const STATUS_COLOR_MAP: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  paid: 'Pago',
  partial: 'Parcial',
  pending: 'Pendente',
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLOR_MAP[status] ?? STATUS_COLOR_MAP['pending'];
  const label = STATUS_LABEL_MAP[status] ?? 'Pendente';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}
