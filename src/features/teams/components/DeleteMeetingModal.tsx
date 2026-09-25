import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { countMeetingAttendances } from '../hooks/useTeamMeetings';
import type { TeamMeetingWithDetails } from '../types/teams';

interface DeleteMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: TeamMeetingWithDetails | null;
  onConfirmDelete: (meetingId: string) => Promise<unknown>;
}

export const DeleteMeetingModal: React.FC<DeleteMeetingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onConfirmDelete,
}) => {
  const [attendanceCount, setAttendanceCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (meeting) {
      setIsChecking(true);
      setErrorMsg(null);
      countMeetingAttendances(meeting.id)
        .then((count) => setAttendanceCount(count))
        .catch(() => setAttendanceCount(0))
        .finally(() => setIsChecking(false));
    }
  }, [meeting, isOpen]);

  if (!isOpen || !meeting) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(meeting.id);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao excluir reunião');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = meeting.meetingDate
    ? new Date(meeting.meetingDate + 'T00:00:00').toLocaleDateString('pt-BR')
    : meeting.meetingDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900">Excluir Reunião</h3>
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

        {/* Content */}
        <div className="p-5 space-y-3">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <p className="text-sm text-slate-700">
            Deseja realmente excluir a reunião de <strong>{formattedDate}</strong>
            {meeting.title ? ` (${meeting.title})` : ''}?
          </p>

          {isChecking ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span>Verificando presenças registradas...</span>
            </div>
          ) : attendanceCount && attendanceCount > 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Atenção: presenças registradas</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  Esta reunião possui <strong>{attendanceCount} presenças confirmadas</strong>. Ao
                  excluir, todo o histórico de chamada desta reunião será apagado permanentemente.
                </p>
              </div>
            </div>
          ) : null}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 min-h-[44px] rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isChecking}
              className="px-5 py-2 min-h-[44px] rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sim, Excluir Reunião</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
