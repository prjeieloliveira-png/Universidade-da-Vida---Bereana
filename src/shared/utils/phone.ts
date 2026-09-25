/**
 * Utilitários para tratamento, máscara e validação de números de telefone no padrão brasileiro.
 */

/**
 * Remove todos os caracteres não numéricos.
 */
export function unmaskPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Aplica a máscara brasileira de telefone:
 * - 10 dígitos: (XX) XXXX-XXXX (fixo)
 * - 11 dígitos: (XX) XXXXX-XXXX (celular)
 */
export function maskPhone(phone: string): string {
  const digits = unmaskPhone(phone).slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Valida se a string representa um telefone brasileiro válido.
 * DDD válido entre 11 e 99.
 * Comprimento de 10 ou 11 dígitos.
 * Celular (11 dígitos) deve iniciar o número local com 9.
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const digits = unmaskPhone(phone);

  if (digits.length !== 10 && digits.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (ex.: 11111111111)
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  // Para celular (11 dígitos), o nono dígito deve ser 9
  if (digits.length === 11 && digits[2] !== '9') {
    return false;
  }

  return true;
}

/**
 * Formata um número puramente numérico ou mascarado para exibição visual.
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = unmaskPhone(phone);
  if (!digits) return '—';
  return maskPhone(digits);
}

/**
 * Gera URL de mensagem no WhatsApp (wa.me/55...)
 * Aceita opcionalmente uma mensagem pré-formatada.
 */
export function getWhatsAppLink(
  phone: string | null | undefined,
  text?: string
): string | null {
  if (!phone) return null;
  let digits = unmaskPhone(phone);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  if (digits.length < 10 || digits.length > 11) return null;

  const baseUrl = `https://wa.me/55${digits}`;
  if (text && text.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(text.trim())}`;
  }
  return baseUrl;
}

/**
 * Gera URL para ligação telefônica nativa (tel:...)
 */
export function getTelLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = unmaskPhone(phone);
  if (digits.length < 8) return null;
  return `tel:${digits}`;
}
