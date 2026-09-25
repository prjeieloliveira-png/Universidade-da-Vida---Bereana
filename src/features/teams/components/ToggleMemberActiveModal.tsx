import React, { useState } from 'react';
import { X, UserX, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import type { TeamMemberWithDetails } from '../types/teams';

interface ToggleMemberActiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberWithDetails | null;
  onConfirmToggle: (memberId: string, nextActive: boolean) => Promise<unknown>;
}

export const ToggleMemberActiveModal: React.FC<ToggleMemberActiveModalProps> = ({
  isOpen,
  onClose,
  member,
  onConfirmToggle,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const isDeactivating = member.active;
  const actionTitle = isDeactivating ? 'Desativar Membro' : 'Reativar Membro';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirmToggle(member.id, !member.active);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao alterar o status do membro. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDeactivating ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {isDeactivating ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-black text-slate-900">{actionTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-sm text-slate-700 leading-relaxed">
            Deseja realmente {isDeactivating ? 'desativar' : 'reativar'}{' '}
            <strong className="text-slate-900">{member.person.fullName}</strong> na equipe{' '}
            <strong className="text-slate-900">{member.teamRole.name}</strong>?
          </p>

          {isDeactivating ? (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">O que acontece agora:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                <li>O voluntário deixará de aparecer na lista padrão de ativos.</li>
                <li>O histórico de presenças em reuniões anteriores é preservado.</li>
                <li>
                  Você pode exibi-lo a qualquer momento ativando &quot;Mostrar Inativos&quot;.
                </li>
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-800">
              O voluntário voltará a ficar ativo na equipe e poderá ser convocado para novas
              reuniões.
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 min-h-[44px] rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`px-5 py-2 min-h-[44px] rounded-full text-xs font-bold text-white transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2 ${
                isDeactivating
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isDeactivating ? 'Sim, Desativar' : 'Sim, Reativar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
