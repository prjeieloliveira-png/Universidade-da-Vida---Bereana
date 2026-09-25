import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { MeetingRoleSelector } from './MeetingRoleSelector';
import type {
  TeamRoleRow,
  TeamMeetingWithDetails,
  CreateTeamMeetingInput,
  UpdateTeamMeetingInput,
} from '../types/teams';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: TeamRoleRow[];
  initialMeeting?: TeamMeetingWithDetails | null;
  onSaveCreate: (input: CreateTeamMeetingInput) => Promise<unknown>;
  onSaveUpdate: (input: UpdateTeamMeetingInput) => Promise<unknown>;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  roles,
  initialMeeting,
  onSaveCreate,
  onSaveUpdate,
}) => {
  const [meetingDate, setMeetingDate] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialMeeting) {
      setMeetingDate(initialMeeting.meetingDate);
      setTitle(initialMeeting.title || '');
      setNotes(initialMeeting.notes || '');
      setSelectedRoleIds(initialMeeting.convocadasRoleIds);
    } else {
      setMeetingDate(new Date().toISOString().split('T')[0]!);
      setTitle('');
      setNotes('');
      // Por padrão: todas as equipes marcadas!
      setSelectedRoleIds(roles.map((r) => r.id));
    }
    setErrorMsg(null);
  }, [initialMeeting, roles, isOpen]);

  if (!isOpen) return null;

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRoleIds(roles.map((r) => r.id));
  };

  const handleDeselectAll = () => {
    setSelectedRoleIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate) {
      setErrorMsg('A data da reunião é obrigatória.');
      return;
    }

    if (selectedRoleIds.length === 0) {
      setErrorMsg('Selecione pelo menos uma equipe convocada para a reunião.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (initialMeeting) {
        await onSaveUpdate({
          id: initialMeeting.id,
          meetingDate,
          title: title.trim() || undefined,
          notes: notes.trim() || undefined,
          roleIds: selectedRoleIds,
        });
      } else {
        await onSaveCreate({
          meetingDate,
          title: title.trim() || undefined,
          notes: notes.trim() || undefined,
          roleIds: selectedRoleIds,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar reunião');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#58bc75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {initialMeeting ? 'Editar Reunião' : 'Agendar Nova Reunião'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina a data, pauta e equipes convocadas
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Data da reunião */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="meeting-date">
              Data da Reunião *
            </label>
            <input
              id="meeting-date"
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-4 py-2.5 min-h-[44px] text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Título opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="meeting-title">
              Título / Assunto (opcional)
            </label>
            <input
              id="meeting-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Alinhamento Geral do Encontro, Treinamento..."
              className="w-full px-4 py-2.5 min-h-[44px] text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all"
            />
          </div>

          {/* Pauta / Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="meeting-notes">
              Pauta / Observações (opcional)
            </label>
            <textarea
              id="meeting-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Distribuição de crachás, escala dos intercessores..."
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Equipes Convocadas (Checkboxes, padrão todas) */}
          <MeetingRoleSelector
            roles={roles}
            selectedRoleIds={selectedRoleIds}
            onToggleRole={handleToggleRole}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] text-white transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialMeeting ? 'Salvar Reunião' : 'Agendar Reunião'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
