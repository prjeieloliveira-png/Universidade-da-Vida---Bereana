import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/shared/utils/phone';

interface StudentWhatsAppButtonProps {
  name: string;
  phone: string | null | undefined;
  size?: 'sm' | 'md';
}

/**
 * Botão de contato rápido via WhatsApp para o participante inscrito.
 * Utiliza o primeiro nome do aluno para personalizar a mensagem.
 */
export function StudentWhatsAppButton({
  name,
  phone,
  size = 'sm',
}: StudentWhatsAppButtonProps) {
  const firstName = name.trim().split(' ')[0] || 'aluno(a)';
  const message = `Olá, ${firstName}! Aqui é da coordenação da Universidade da Vida.`;
  const link = getWhatsAppLink(phone, message);

  const containerClasses = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconClasses = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (!link) {
    return (
      <span
        className={`${containerClasses} rounded-full bg-slate-100 flex items-center justify-center text-slate-300 cursor-not-allowed opacity-40 shrink-0`}
        title="Telefone não informado ou inválido para WhatsApp"
        aria-label={`WhatsApp indisponível para ${name}`}
      >
        <MessageCircle className={iconClasses} />
      </span>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`${containerClasses} rounded-full bg-emerald-50 hover:bg-[#25D366] active:bg-[#128C7E] flex items-center justify-center text-emerald-600 hover:text-white transition-colors cursor-pointer shrink-0`}
      title={`Enviar mensagem para ${firstName} no WhatsApp`}
      aria-label={`Conversar com ${name} no WhatsApp`}
    >
      <MessageCircle className={iconClasses} />
    </a>
  );
}
