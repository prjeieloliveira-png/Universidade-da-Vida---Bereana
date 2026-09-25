import React, { useState } from 'react';
import { X, ArrowRightLeft, Loader2, AlertCircle } from 'lucide-react';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';

interface MoveTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberWithDetails | null;
  roles: TeamRoleRow[];
  onConfirmMove: (memberId: string, newTeamRoleId: string) => Promise<unknown>;
}

export const MoveTeamModal: React.FC<MoveTeamModalProps> = ({
  isOpen,
  onClose,
  member,
  roles,
  onConfirmMove,
}) => {
  const [targetRoleId, setTargetRoleId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (member) {
      const availableRoles = roles.filter((r) => r.id !== member.teamRoleId);
      setTargetRoleId(availableRoles[0]?.id || '');
      setErrorMsg(null);
    }
  }, [member, roles, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleId) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirmMove(member.id, targetRoleId);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao mover membro');
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
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900">Mover de Equipe</h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 mb-1">Membro:</p>
            <p className="text-sm font-bold text-slate-900">{member.person.fullName}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Equipe atual: <strong>{member.teamRole.name}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="target-role">
              Nova Equipe de Destino *
            </label>
            <select
              id="target-role"
              required
              value={targetRoleId}
              onChange={(e) => setTargetRoleId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all"
            >
              {roles
                .filter((r) => r.id !== member.teamRoleId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.sort_order}. {r.name}
                  </option>
                ))}
            </select>
          </div>

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
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 min-h-[44px] rounded-full text-xs font-bold bg-[#163242] hover:bg-[#20445a] text-white transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Confirmar Transferência</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
