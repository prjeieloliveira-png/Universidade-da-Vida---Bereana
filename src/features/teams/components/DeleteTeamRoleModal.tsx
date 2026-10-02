import { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import type { TeamRoleRow } from '../types/teams';

interface DeleteTeamRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: TeamRoleRow | null;
  onConfirmDelete: (roleId: string) => Promise<unknown>;
}

export function DeleteTeamRoleModal({
  isOpen,
  onClose,
  role,
  onConfirmDelete,
}: DeleteTeamRoleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !role) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(role.id);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Ocorreu um erro ao excluir a equipe.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900">Excluir Equipe</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-11 h-11 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <p className="text-sm text-slate-700 leading-relaxed">
            Deseja realmente excluir permanentemente a equipe{' '}
            <strong className="text-slate-900">{role.name}</strong>?
          </p>

          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed text-[11px]">
              <p className="font-bold text-amber-900">Ação irreversível</p>
              <p>
                Só é possível excluir uma equipe que não tenha nenhum membro vinculado, em
                nenhuma turma. Se houver membros, mova-os ou remova-os primeiro.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
