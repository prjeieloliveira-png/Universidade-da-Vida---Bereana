import { useEffect, useState, type FormEvent } from 'react';
import { X, Users, Pencil } from 'lucide-react';
import type { TeamRoleRow } from '../types/teams';

interface TeamRoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** null = criando uma nova equipe; preenchido = renomeando uma existente */
  initialRole: TeamRoleRow | null;
  onCreate: (name: string) => Promise<unknown>;
  onRename: (input: { id: string; name: string }) => Promise<unknown>;
}

export function TeamRoleFormModal({
  isOpen,
  onClose,
  initialRole,
  onCreate,
  onRename,
}: TeamRoleFormModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditing = Boolean(initialRole);

  useEffect(() => {
    if (isOpen) {
      setName(initialRole?.name ?? '');
      setErrorMsg(null);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Informe o nome da equipe.');
      return;
    }

    setErrorMsg(null);
    try {
      setIsSubmitting(true);
      if (isEditing && initialRole) {
        await onRename({ id: initialRole.id, name: trimmed });
      } else {
        await onCreate(trimmed);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao salvar a equipe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xl max-w-sm w-full overflow-hidden my-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-600">
              {isEditing ? <Pencil className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Renomear Equipe' : 'Nova Equipe'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome da equipe
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Equipe de Recepção"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white text-slate-900 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer bg-[#0d7647] hover:bg-[#095a36] active:bg-[#064227] ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Equipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
