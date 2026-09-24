import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, MessageCircle, ExternalLink, QrCode } from 'lucide-react';
import type { WeekNumber } from '../types';

interface ShareDoorLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWeek: WeekNumber;
}

export function ShareDoorLinkModal({
  isOpen,
  onClose,
  activeWeek,
}: ShareDoorLinkModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const doorUrl = `${origin}/chamada/porta?semana=${activeWeek}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doorUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Segue o link para fazer a chamada na porta da igreja (Semana ${activeWeek} - Universidade da Vida):\n\n${doorUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-link-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f8ee] text-[#2c814b] flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 id="share-link-title" className="text-lg font-black text-slate-900 leading-tight">
              Chamada na Porta da Igreja
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Link para os colaboradores na recepção • Semana {activeWeek}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Envie este link para os voluntários na portaria. Ao abrir no celular, eles poderão
          pesquisar o aluno por nome e registrar presença ou falta com confirmação.
        </p>

        {/* Link Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-700 truncate select-all">
            {doorUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-2.5">
          {/* Send via WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-500/15 transition-all cursor-pointer text-center"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Enviar Link via WhatsApp</span>
          </a>

          {/* Open Directly */}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/chamada/porta?semana=${activeWeek}`);
            }}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Modo Porta Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
