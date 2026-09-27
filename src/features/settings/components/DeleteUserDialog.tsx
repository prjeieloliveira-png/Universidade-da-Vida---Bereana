import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { AppUser } from '../types';

interface DeleteUserDialogProps {
  user: AppUser;
  onClose: () => void;
  onConfirm: () => Promise<unknown>;
}

export function DeleteUserDialog({ user, onClose, onConfirm }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    setErrorMsg(null);
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao excluir usuário.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
    >
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-rose-100 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 id="delete-user-title" className="text-base font-bold text-slate-900">
              Excluir usuário?
            </h3>
            <p className="text-sm text-slate-600 mt-0.5 break-words">{user.full_name}</p>
            <p className="text-xs text-slate-400 break-words">{user.email}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          O login será excluído permanentemente e a pessoa não vai mais conseguir acessar o sistema. Esta ação
          não pode ser desfeita.
        </p>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
