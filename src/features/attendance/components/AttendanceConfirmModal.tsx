import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import type { StudentRecord } from '@/features/registrations/types';
import type { WeekNumber } from '../types';

interface AttendanceConfirmModalProps {
  isOpen: boolean;
  student: StudentRecord | null;
  week: WeekNumber;
  action: 'PRESENTE' | 'FALTA' | null;
  onConfirm: (note?: string) => void;
  onClose: () => void;
}

export function AttendanceConfirmModal({
  isOpen,
  student,
  week,
  action,
  onConfirm,
  onClose,
}: AttendanceConfirmModalProps) {
  const [note, setNote] = useState('');

  // Limpa a observação ao abrir para um novo aluno/ação
  useEffect(() => {
    if (isOpen) setNote('');
  }, [isOpen, student?.id, action]);

  if (!isOpen || !student || !action) return null;

  const isPresent = action === 'PRESENTE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Fechar confirmação"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isPresent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isPresent ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <XCircle className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-lg font-black text-slate-900 leading-tight">
              {isPresent ? 'Confirmar Presença' : 'Confirmar Falta'}
            </h3>
            <span
              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                isPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              Aula • Semana {week}
            </span>
          </div>
        </div>

        {/* Student Details Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6">
          <p className="text-xs text-slate-400 font-medium">Aluno(a) selecionado(a):</p>
          <h4 className="text-base font-black text-slate-900 mt-0.5 leading-snug">
            {student.name}
          </h4>

          <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Pastor</span>
              <span className="font-semibold text-slate-700 truncate block">{student.pastor}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">G12 / Líder</span>
              <span className="font-semibold text-slate-700 truncate block">
                {student.g12 || student.leader || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Question */}
        <p className="text-xs text-slate-600 mb-4 text-center font-medium">
          Tem certeza de que deseja registrar{' '}
          <strong className={isPresent ? 'text-emerald-700' : 'text-rose-700'}>
            {isPresent ? 'PRESENÇA' : 'FALTA'}
          </strong>{' '}
          para este aluno hoje?
        </p>

        {/* Justificativa opcional, apenas para falta */}
        {!isPresent && (
          <div className="mb-6">
            <label htmlFor="attendance-note" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Justificativa <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="attendance-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Atestado médico, viagem, imprevisto..."
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-300 focus:outline-none text-slate-900 placeholder:text-slate-400 resize-none"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => onConfirm(isPresent ? undefined : note.trim() || undefined)}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm text-white shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isPresent
                ? 'bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#409a5b] shadow-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/20'
            }`}
          >
            {isPresent ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Sim, Confirmar Presença</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Sim, Confirmar Falta</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-5 rounded-2xl font-bold text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer text-center"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
